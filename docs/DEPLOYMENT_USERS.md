# Deployment: Users, Service and Sandbox (staging)

The frontend is the public site. It serves **https://beta.gregorytaylorphotography.com** from the staging server, `srv1276312` (195.35.14.177, reached over Tailscale at 100.124.242.39), for testing. It calls the backend (admin) on **production** at https://admin.gregorytaylorphotography.com.

Staging is a **shared server**: podcaststudiohub, codeframe, auto-author, narrative and iris all run there. So this app gets its own non-root system user, a sandboxed systemd unit, and a loopback-only port behind nginx. It must not touch anything system-wide.

## At a glance

| | Value |
|---|---|
| OS user | `gt-frontend` (system user, shell `/usr/sbin/nologin`, home `/var/lib/gt-frontend`) |
| Code | `/opt/gregory-taylor-frontend`, owned by `gt-frontend`, following staging's `/opt/<app>` convention |
| Data | `/var/lib/gt-frontend/data`, holding `admin.db` and `auth.db` plus their `-wal`/`-shm` files |
| Service | `gregory-taylor-frontend.service` (systemd) |
| Listens on | `127.0.0.1:3000` (free on 2026-10-25; 3020 is taken; re-check with `ss -tlnp`) |
| Node | `/opt/node-v24.11.1/bin/node`, used **only** by this app's unit and deploy |
| Writable at runtime | `/var/lib/gt-frontend/data` and `.next/cache` |
| Env file | `/opt/gregory-taylor-frontend/.env.production.local`, owner `gt-frontend`, mode `600` |
| Next.js | **≥ 15.5.28**. 15.5.9, which the old copies ran, has unauthenticated RCEs in the image optimizer |

## Node on a shared server

Staging's system Node is v20.20.2. That's end-of-life, but other tenants depend on it. **Don't upgrade it, symlink over it, or put a new Node on the global PATH.** Any of those silently moves every other app to a different runtime on its next restart.

Unpack the official Node 24 tarball into `/opt/node-v24.11.1` (matching prod) and reference it by **absolute path** in the unit and the deploy script. Nothing else on the server will see it.

## SQLite databases: keep them out of the code folder

`lib/admin-db.js` and `lib/auth.js` default to `admin.db` and `auth.db` in the working folder. Two reasons to move them:
1. A deploy that replaces the code folder (`deploy.yml` uses `rsync --delete`) would **delete the databases**.
2. The sandbox makes the code folder read-only, so SQLite couldn't write there anyway.

Point both to the data folder in `.env.production.local`:

```
ADMIN_DB_PATH=/var/lib/gt-frontend/data/admin.db
BETTER_AUTH_DB_PATH=/var/lib/gt-frontend/data/auth.db
```

SQLite creates its `-wal` and `-shm` files next to each database, which is why the whole folder must be writable, not just the two files. Back up that folder; it's the only state this app keeps on disk.

## Create the user and the unit

```bash
useradd --system --user-group --home-dir /var/lib/gt-frontend --create-home \
        --shell /usr/sbin/nologin gt-frontend
install -d -o gt-frontend -g gt-frontend -m 700 /var/lib/gt-frontend/data
chown -R gt-frontend:gt-frontend /opt/gregory-taylor-frontend
chmod 600 /opt/gregory-taylor-frontend/.env.production.local
```

`/etc/systemd/system/gregory-taylor-frontend.service`:

```ini
[Unit]
Description=Gregory Taylor public site (beta.gregorytaylorphotography.com)
After=network.target

[Service]
Type=simple
User=gt-frontend
Group=gt-frontend
WorkingDirectory=/opt/gregory-taylor-frontend
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=HOME=/var/lib/gt-frontend
ExecStart=/opt/node-v24.11.1/bin/node /opt/gregory-taylor-frontend/node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5
MemoryMax=512M

NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LockPersonality=true
ReadWritePaths=/var/lib/gt-frontend/data /opt/gregory-taylor-frontend/.next/cache

[Install]
WantedBy=multi-user.target
```

This app has no ISR (no `revalidate` exports, and no `revalidate` or `force-cache` on fetches), so `.next/cache`, which holds the image optimizer's cache, is the only part of `.next` it needs to write. If ISR is added later, widen the path to `.next`.

**Enable the unit only after the first `next build`.** systemd refuses to start a unit whose `ReadWritePaths` doesn't exist, and `.next/cache` is created by the build.

**`better-sqlite3` is a native module.** Its install script fetches or compiles the binary. Newer npm 11 releases (prod's is one) skip dependency install scripts that aren't approved. If `npm ci` lists `better-sqlite3` among skipped scripts, approve it (`npm install-scripts approve better-sqlite3`, committed in `package.json`). Otherwise the app crashes the first time it opens a database.

## Environment that couples the two sites

| Variable | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://admin.gregorytaylorphotography.com` | `lib/api.js`, `lib/contentApi.js` and `lib/stripe.js` call the backend through it. The `/api` → `localhost:4010` rewrite in `next.config.mjs` only applies in **development**, so in production this is the only link between the two apps |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://beta.gregorytaylorphotography.com` | Auth cookies and callbacks are bound to this origin |
| `NEXT_PUBLIC_*` (all of them) | Set **before `next build`** | Next.js inlines them into the bundle. Changing one later needs a rebuild, not a restart |

The backend must list `https://beta.gregorytaylorphotography.com` in its `CORS_ALLOWED_ORIGINS`, or every browser call from this site to it fails.

**Content from the database.** Pages render HTML and image URLs that the backend serves from MongoDB. Anything saved with an absolute host (`localhost:4010`, the staging IP, an old domain) is shown as stored. Before testing beta, search the content for hard-coded hosts and rewrite them to the final origin, or to relative paths.

## nginx and TLS (staging)

Staging has **no** site, certificate or app for `beta.gregorytaylorphotography.com` today, which is why it returns staging's default certificate and looks "offline".
1. Add a site whose `server_name` is `beta.gregorytaylorphotography.com`, with `proxy_pass http://127.0.0.1:3000`. Use the literal IP: `localhost` also resolves to `::1`.
2. `nginx -t && systemctl reload nginx`.
3. Run `certbot --nginx -d beta.gregorytaylorphotography.com`. DNS already points here.

## Deploying

SSH into staging is limited to Tailscale and one home subnet, so GitHub-hosted runners can't reach it and `deploy.yml`'s rsync step can't work. Use the local-deploy pattern from frankbria-com's `scripts/deploy.sh`, aimed at staging (`ssh -i ~/.ssh/new-fleet-keys/staging-hostinger root@100.124.242.39`):
1. Ship `main` as a `git bundle`.
2. Run git, `npm ci` and `next build` **as the app user**: `runuser -u gt-frontend -- env HOME=/var/lib/gt-frontend PATH=/opt/node-v24.11.1/bin:/usr/bin:/bin …`.
3. Keep `.next.previous`, then `systemctl restart gregory-taylor-frontend`.
4. Health-check `http://127.0.0.1:3000/`, and restore `.next.previous` if it fails.

Staging's fail2ban bans bursts of SSH connections, so make the deploy use as few `ssh` sessions as possible: one for the bundle, one for the rest.

## Checks after deploy

```bash
systemctl is-active gregory-taylor-frontend
ps -o user= -p "$(systemctl show -p MainPID --value gregory-taylor-frontend)"   # gt-frontend
ss -tlnp 'sport = :3000'                                                         # 127.0.0.1 only
ls -l /var/lib/gt-frontend/data                                                  # admin.db, auth.db (+ -wal/-shm)
journalctl -u gregory-taylor-frontend -p warning --no-pager | tail               # no EROFS/EACCES/SQLITE_READONLY
curl -sI https://beta.gregorytaylorphotography.com/ | head -1
```
