# AGENTS.md - AI Agent Instructions for Element Inspector

This document provides instructions for AI coding agents (Claude Code, etc.) on how to interpret and act on element inspector data from this Next.js photography site.

## Element Inspector Overview

The development-mode element inspector allows the site owner to hover over UI elements and generate AI-ready prompts. When you receive a prompt from the inspector, it will follow one of these formats:

### Standard Element Prompt

```
Element ID: header-1
Component: Header at components/Header.jsx
Current classes: 'bg-black text-white py-6'

Instruction: [User's instruction]
```

### Cloudinary Image Prompt

```
Element ID: cloudinaryimage-5
Component: CloudinaryImage at components/CloudinaryImage.jsx

Cloudinary Settings:
  Source: https://res.cloudinary.com/.../photo.jpg
  Quality: auto
  Format: auto
  Width: 800

Instruction: [User's instruction]
```

## How to Interpret Element IDs

Element IDs follow the pattern `{componentname}-{number}`:
- `header-1` → The Header component (`components/Header.jsx`)
- `footer-2` → The Footer component (`components/Footer.jsx`)
- `cloudinaryimage-3` → A CloudinaryImage instance (`components/CloudinaryImage.jsx`)
- `photoslider-4` → The PhotoSlider carousel (`components/PhotoSlider.jsx`)
- `categorygrid-5` → The CategoryGrid gallery (`components/CategoryGrid.jsx`)
- `roompreviews-6` → The RoomPreviews component (`components/RoomPreviews.jsx`)

## Component File Locations

| Component | File | Purpose |
|-----------|------|---------|
| Header | `components/Header.jsx` | Site navigation and title bar |
| Footer | `components/Footer.jsx` | Social links, bio, contact |
| CloudinaryImage | `components/CloudinaryImage.jsx` | Optimized image display with Cloudinary |
| PhotoSlider | `components/PhotoSlider.jsx` | Hero image carousel on homepage |
| CategoryGrid | `components/CategoryGrid.jsx` | Gallery category grid |
| RoomPreviews | `components/RoomPreviews.jsx` | Room preview with photo overlay |

## Styling Guidelines

This project uses **Tailwind CSS 4.x**. When modifying styles:

### Common Layout Changes
- **Centering**: Use `mx-auto`, `text-center`, `flex justify-center items-center`
- **Spacing**: Use `p-{n}`, `m-{n}`, `gap-{n}`, `space-y-{n}`, `space-x-{n}`
- **Sizing**: Use `w-{value}`, `h-{value}`, `max-w-{value}`
- **Responsive**: Prefix with `sm:`, `md:`, `lg:`, `xl:` for breakpoints

### Example Modifications

**"Make the header title larger"**:
```jsx
// In components/Header.jsx, change:
<h1 className="text-4xl font-serif tracking-wide">
// To:
<h1 className="text-5xl font-serif tracking-wide">
```

**"Center this paragraph more"**:
```jsx
// Add text-center and mx-auto classes
<p className="text-center mx-auto max-w-2xl">
```

**"Add more space between items"**:
```jsx
// Increase gap value
<div className="flex gap-6"> → <div className="flex gap-10">
```

## Cloudinary Image Adjustments

Images use Cloudinary CDN with URL-based transformations. The loader is at `lib/cloudinaryLoader.js`.

### Current Transformation Format
```
https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_{quality},w_{width}/{image_path}
```

### Adjusting Image Quality (Reducing "Fuzziness")
To make an image sharper/clearer:
1. Set explicit quality (higher = clearer, larger file): `q_80`, `q_90`, `q_100`
2. Add sharpening: `e_sharpen:100` (0-100 scale)
3. Increase delivered width: `w_1200` instead of `w_800`

To modify how CloudinaryImage handles quality, edit `lib/cloudinaryLoader.js`:
```javascript
// Current: uses auto quality
`f_auto,q_${quality || 'auto'},w_${width}`

// For explicit quality control, pass quality prop to CloudinaryImage component
```

### Example: Making a Photo Clearer
```jsx
// The CloudinaryImage component at components/CloudinaryImage.jsx
// To increase quality for a specific image, modify the cloudinaryLoader.js
// or pass quality via the component's src URL transformation
```

## Important Notes

1. **Development Only**: The inspector only works in `NODE_ENV=development`. There is zero code trace in production.
2. **Toggle**: Press `Ctrl+Shift+D` to toggle the inspector on/off, or click the floating button in the bottom-right corner.
3. **Server Components**: Some pages use Server Components. Client-side modifications should be in files marked with `'use client'`.
4. **API Proxy**: In development, `/api/*` requests proxy to `http://localhost:4000/api/*`.
5. **Testing**: Run `npm test` to verify changes don't break existing functionality.
