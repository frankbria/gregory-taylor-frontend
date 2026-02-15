# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photography e-commerce frontend built with Next.js 15, featuring Stripe payment integration, shopping cart functionality, and gallery displays. Works in conjunction with a backend API (assumed to run on localhost:4010 in development).

**Backend Repository**: The administrative backend is located at [https://github.com/frankbria/gregory-taylor-backend](https://github.com/frankbria/gregory-taylor-backend)

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report (80% threshold)
```

**Test Configuration**: Jest with React Testing Library. Coverage thresholds enforced at 80% for branches, functions, lines, and statements. Tests located alongside source files in `__tests__/` directories.

## Architecture

### API Communication Pattern

The app uses a dual-approach API pattern with both hooks and standalone functions:

**Primary Pattern (useAPI hook)**:
- `lib/api.js` exports `useAPI()` hook that provides API methods with integrated error handling via `ErrorContext`
- Public/catalog API calls (categories, photos, orders) use `NEXT_PUBLIC_API_BASE` environment variable
- Admin API calls (pages, settings, layout) use relative URLs — served by local Next.js API routes backed by SQLite
- Error handling automatically displays toast notifications via `react-hot-toast`

**Legacy Pattern (standalone exports)**:
- Same file exports standalone async functions (`getCategories()`, `getPhotosByCategory()`, etc.) for backward compatibility
- Used in Server Components or where hooks aren't available

**API Proxy**: In development, unmatched `/api/*` requests are proxied to `http://localhost:4010/api/*` via `next.config.mjs` fallback rewrites. Local API routes (auth, admin) take precedence over the proxy.

### State Management

**CartContext** (`lib/CartContext.js`):
- Global shopping cart state using React Context
- Persisted to localStorage
- Methods: `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `getTotalPrice()`
- Provides `cartCount` for header badge

**ErrorContext** (`lib/ErrorContext.js`):
- Centralized API error handling with toast notifications
- Used by `useAPI()` hook to automatically display errors
- Methods: `handleApiError()`, `clearError()`, `clearAllErrors()`
- Maintains error history with timestamps

### Payment Flow

1. User adds items to cart → stored in `CartContext` + localStorage
2. Checkout initiated → `lib/stripe.js` `createCheckoutSession()` calls frontend `/api/checkout` route
3. Frontend route (`app/api/checkout/route.js`) creates Stripe session AND persists order to backend API
4. User redirected to Stripe Checkout → returns to `/cart/success` or `/cart/cancel`

**Important**: The checkout route handler does TWO things:
- Creates Stripe checkout session
- Immediately creates order record in backend database (with `stripeSessionId`, items, etc.)

### Image Handling

**Cloudinary Integration**:
- Custom loader in `lib/cloudinaryLoader.js`
- Environment variable: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Automatic optimization via `getOptimizedImageUrl()` helper (auto format, quality, responsive sizing)
- Next.js Image component configured for `res.cloudinary.com` in `next.config.mjs`

### Component Organization

- `/components`: Shared UI components (Header, Footer, PhotoSlider, etc.)
- `/app`: Next.js App Router pages and API routes
  - `/app/api/checkout`: Server-side Stripe integration
  - `/app/gallery/[slug]`: Dynamic category pages
  - `/app/image/[slug]`: Individual photo detail pages
  - `/app/cart`: Shopping cart, success/cancel pages

## Environment Variables

Required variables (create `.env.local`):

```bash
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:4010  # Backend API base URL

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# reCAPTCHA (contact form)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

**Test Environment**: Jest automatically sets mock values in `jest.setup.js`

## Key Technical Considerations

### Server vs Client Components

- API routes are Server Components (can use `STRIPE_SECRET_KEY`)
- Pages using `useAPI()`, `useCart()`, or `useError()` must be Client Components (`'use client'`)
- The `lib/api.js` file provides both hook and non-hook exports to support both patterns

### API Route Important Detail

The `app/api/checkout/route.js` is marked with `export const dynamic = 'force-dynamic'` to prevent route caching. This ensures each checkout request creates a fresh Stripe session.

### Styling

- Tailwind CSS 4.x with PostCSS
- Custom CSS variables in `app/globals.css` for theme (supports dark mode via `prefers-color-scheme`)
- Geist font family loaded via `next/font/google`

### Testing Stripe

Tests mock Stripe completely (see `jest.setup.js` and `lib/__tests__/stripe.test.js`). No real Stripe API calls in tests.

## Admin Panel & Layout Configuration

### Authentication (`/admin/login`)
- BetterAuth integration via `lib/AuthContext.js`
- Auth guard in `app/admin/layout.js` redirects unauthenticated users
- `useAuth()` hook provides `session`, `user`, `isAuthenticated`, `signOut()`

### Admin Dashboard (`/admin`)
- Quick-access cards to Content, Images, and Layout sections
- `ContentProvider` wraps all admin pages for shared state

### Content Editor (`/admin/content`)
- WYSIWYG editing with TipTap rich text editor
- Page list with edit/delete operations
- Per-page editing at `/admin/content/[pageId]`

### Image Settings (`/admin/images`)
- Global image defaults (quality, sharpen, blur, format)
- Per-photo override settings via modal form
- Live Cloudinary preview of transformations

### Layout Editor (`/admin/layout-settings`)
Visual tool for configuring site layout and component Tailwind classes.

**Global Settings** (collapsible section):
- Visibility toggles (show/hide header, footer)
- Grid columns configuration (1-12)
- Color scheme (light/dark)
- Navigation item management (add/remove/edit)

**Component Styling** (main section):
- Component tree showing site hierarchy (Header, Hero, Gallery Grid, Photo Detail, Footer)
- Tabbed Tailwind class editor: Spacing, Sizing, Layout, Colors, Typography, Effects
- Color-coded class tags with dismiss capability
- Save/Revert/Preview/Export/Import toolbar
- Dirty state tracking with unsaved changes warning

**State Architecture**:
- `ContentContext` manages persisted layout settings (read/write to local SQLite via admin API routes)
- `LayoutContext` manages transient editing state (selected component, modified classes, dirty tracking)
- Component styles stored as `componentStyles` key in layout settings JSON:
  ```json
  { "componentStyles": { "header": ["bg-black", "py-4"], "hero": ["text-center"] } }
  ```

**API Endpoints** (via `lib/contentApi.js`):
- `GET /api/admin/settings/layout` - Fetch all layout settings
- `PUT /api/admin/settings/layout` - Update layout settings (including componentStyles)

### Dev Inspector
- `DevInspectorWrapper` in root layout (development mode only)
- `InspectorContext` for element inspection state
- `ElementInspector` overlay + `InspectorToggle` button

### Admin State Management
- `ContentContext` (`lib/ContentContext.js`): Pages, image settings, layout settings, photo settings
- `LayoutContext` (`lib/LayoutContext.js`): Component selection, class editing, dirty tracking
- `AuthContext` (`lib/AuthContext.js`): Session, user, authentication status

### Admin Components
- `components/AdminHeader.jsx` - Top bar with logo, back link, user info
- `components/admin/AdminNav.jsx` - Sidebar navigation
- `components/admin/ComponentTree.jsx` - Hierarchical site section tree
- `components/admin/TailwindClassEditor.jsx` - Tabbed Tailwind class controls
- `components/admin/ClassTagList.jsx` - Color-coded dismissible class tags
- `components/admin/LayoutEditorToolbar.jsx` - Save/Revert/Preview/Export/Import
- `components/admin/ImageSettingsForm.jsx` - Per-photo image settings modal
- `components/admin/CloudinaryPreview.jsx` - Live image transformation preview
- `components/TipTapEditor.jsx` - Rich text WYSIWYG editor

## Common Workflows

### Adding a New Gallery Category
1. Backend creates category → returns slug
2. Frontend automatically fetches via `getCategories()`
3. No frontend changes needed (dynamic routing via `app/gallery/[slug]`)

### Running Single Test File
```bash
npm test -- app/cart/__tests__/page.test.js
npm test -- --testNamePattern="checkout"  # Run tests matching pattern
```

### Debugging API Issues
- Check Network tab: proxied requests should go to `localhost:4010` in dev (admin routes stay local)
- Verify `NEXT_PUBLIC_API_BASE` is set correctly
- Check ErrorContext state via React DevTools
- Toast notifications will show API errors automatically
