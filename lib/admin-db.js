const Database = require('better-sqlite3')
const path = require('path')

let _db = null

function getDb() {
  if (!_db) {
    const dbPath = process.env.ADMIN_DB_PATH || path.join(process.cwd(), 'admin.db')
    _db = new Database(dbPath)

    if (dbPath !== ':memory:') {
      _db.pragma('journal_mode = WAL')
    }

    _db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS photo_image_settings (
        photoId TEXT PRIMARY KEY,
        settings TEXT NOT NULL,
        updatedAt TEXT DEFAULT (datetime('now'))
      );
    `)
  }
  return _db
}

// Pages helpers
const getAllPages = () => getDb().prepare('SELECT * FROM pages').all()

const getPage = (id) => getDb().prepare('SELECT * FROM pages WHERE id = ?').get(id)

const upsertPage = (id, title, content) =>
  getDb().prepare(`
    INSERT INTO pages (id, title, content, updatedAt)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      updatedAt = datetime('now')
  `).run(id, title, content)

// Settings helpers
const getSetting = (key) =>
  getDb().prepare('SELECT * FROM settings WHERE key = ?').get(key)

const upsertSetting = (key, value) =>
  getDb().prepare(`
    INSERT INTO settings (key, value, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = datetime('now')
  `).run(key, value)

// Photo settings helpers
const getPhotoSettings = (photoId) =>
  getDb().prepare('SELECT * FROM photo_image_settings WHERE photoId = ?').get(photoId)

const upsertPhotoSettings = (photoId, settings) =>
  getDb().prepare(`
    INSERT INTO photo_image_settings (photoId, settings, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(photoId) DO UPDATE SET
      settings = excluded.settings,
      updatedAt = datetime('now')
  `).run(photoId, settings)

module.exports = {
  get db() { return getDb() },
  getAllPages,
  getPage,
  upsertPage,
  getSetting,
  upsertSetting,
  getPhotoSettings,
  upsertPhotoSettings,
}
