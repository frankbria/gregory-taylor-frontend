# UX & UI Issues - Frontend

> **Priority: P1-P2 - Improve user experience and polish**
>
> These issues affect usability, visual design, and overall user experience but don't block core functionality.

---

## Issue: Add loading skeletons for image grids

**Labels:** `ux`, `performance`, `visual`
**Priority:** P1
**Estimated Effort:** 2 hours

### Summary

Gallery pages and category pages show blank space while images load, creating an abrupt, unprofessional loading experience. Users don't know if content is loading or if there's an error.

### Current Behavior

**`app/gallery/page.js` and `app/gallery/[slug]/page.js`:**
- Images pop in suddenly when loaded
- No indication that content is loading
- Can cause layout shift as images render

### Proposed Solution

Create a reusable skeleton component:

```javascript
// components/ImageGridSkeleton.jsx
export default function ImageGridSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg aspect-[3/2]"></div>
          <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
        </div>
      ))}
    </div>
  )
}
```

Use in gallery pages:

```javascript
// app/gallery/[slug]/page.js
'use client'

import { useState, useEffect } from 'react'
import ImageGridSkeleton from '@/components/ImageGridSkeleton'

export default function CategoryPage({ params }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    setLoading(true)
    try {
      // Fetch photos...
      setPhotos(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <ImageGridSkeleton count={12} />
      </div>
    )
  }

  // Render actual photos...
}
```

### Acceptance Criteria

- [ ] Loading skeleton component created
- [ ] Skeleton matches layout of actual content
- [ ] Applied to: gallery index, category pages, photo slider
- [ ] Smooth transition from skeleton to content
- [ ] No layout shift when content loads
- [ ] Skeleton count matches expected items (or reasonable default)

### Testing

1. Navigate to gallery page → See skeleton while loading
2. Test on slow network (DevTools throttling) → Skeleton visible longer
3. Verify no flicker or layout jump when content appears
4. Test on mobile and desktop

---

## Issue: Add empty state handling for galleries and categories

**Labels:** `ux`, `edge-cases`
**Priority:** P1
**Estimated Effort:** 2 hours

### Summary

If a category has no photos or API returns empty array, pages show blank content with no message. Users may think the page is broken.

### Current Behavior

**`app/gallery/[slug]/page.js`:**
```javascript
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {photos.map((photo) => (
    // Render photo
  ))}
</div>
```

If `photos.length === 0`, renders empty `<div>` with no feedback.

### Proposed Solution

```javascript
// app/gallery/[slug]/page.js
if (loading) {
  return <ImageGridSkeleton />
}

if (photos.length === 0) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
      <div className="bg-gray-100 rounded-lg p-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-600 mb-4">
          No photos in this category yet.
        </p>
        <a
          href="/gallery"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Browse All Categories
        </a>
      </div>
    </div>
  )
}

// Render photos grid...
```

**Empty cart state** (already exists but could be enhanced):

```javascript
// app/cart/page.js - enhance existing empty state
if (cart.length === 0) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <svg className="w-24 h-24 mx-auto text-gray-300 mb-6">
        {/* Shopping cart icon */}
      </svg>
      <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
      <p className="text-gray-600 mb-6">
        Start adding photos to your cart to see them here!
      </p>
      <a href="/gallery" className="...">
        Browse Gallery
      </a>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Empty state for category with no photos
- [ ] Empty state for cart (enhance existing)
- [ ] Empty state for orders page when user has no orders
- [ ] Empty state for search results (when implemented)
- [ ] Each empty state has: icon, message, call-to-action
- [ ] Consistent styling across empty states

### Testing

1. Create category with no photos → See empty state
2. View cart with no items → See empty state
3. User with no orders → See empty state
4. Empty states have working CTA links

---

## Issue: Improve error messages with actionable guidance

**Labels:** `ux`, `error-handling`
**Priority:** P1
**Estimated Effort:** 3 hours

### Summary

Error messages are generic toast notifications that don't give users actionable steps to resolve issues. Errors like "Failed to fetch photos" don't tell users what to do next.

### Current Implementation

**`lib/api.js`:**
```javascript
catch (error) {
  handleApiError(error, 'Failed to fetch photos')
  throw error
}
```

Toast shows: "Failed to fetch photos" - not helpful.

### Proposed Solution

**Create error message mapping:**

```javascript
// lib/errorMessages.js
export const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to reach the server. Please check your internet connection and try again.',
    action: 'Retry',
  },
  PHOTO_NOT_FOUND: {
    title: 'Photo Not Found',
    message: 'This photo may have been removed or is temporarily unavailable.',
    action: 'Browse Gallery',
  },
  CHECKOUT_FAILED: {
    title: 'Checkout Failed',
    message: 'We couldn\'t process your checkout. Please try again or contact support.',
    action: 'Try Again',
  },
  INVALID_CART: {
    title: 'Cart Error',
    message: 'Some items in your cart are no longer available. Please review and try again.',
    action: 'Review Cart',
  },
  CONTACT_FORM_ERROR: {
    title: 'Message Not Sent',
    message: 'We couldn\'t send your message. Please try again or email us directly at contact@gregtaylorphotography.com',
    action: 'Retry',
  },
}

export function getErrorMessage(errorType, fallback) {
  return ERROR_MESSAGES[errorType] || {
    title: 'Something Went Wrong',
    message: fallback || 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  }
}
```

**Enhanced error display component:**

```javascript
// components/ErrorAlert.jsx
export default function ErrorAlert({ error, onRetry, onDismiss }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              {error.action || 'Try Again'}
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-3 text-red-400 hover:text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
```

**Use in pages:**

```javascript
// app/cart/page.js
const [error, setError] = useState(null)

const handleCheckout = async () => {
  try {
    setError(null)
    await createCheckoutSession(cart, userId)
  } catch (err) {
    setError(getErrorMessage('CHECKOUT_FAILED'))
  }
}

return (
  <div>
    {error && (
      <ErrorAlert
        error={error}
        onRetry={handleCheckout}
        onDismiss={() => setError(null)}
      />
    )}
    {/* Rest of cart UI */}
  </div>
)
```

### Acceptance Criteria

- [ ] Error messages provide context about what went wrong
- [ ] Users given actionable next steps
- [ ] Contact information provided for support-worthy errors
- [ ] Retry buttons where appropriate
- [ ] Consistent error UI across all pages
- [ ] Toast notifications still used for minor feedback
- [ ] Full-page error component for critical failures

### Testing

1. Disconnect network → See connection error with actionable message
2. Add invalid item to cart → See cart error with guidance
3. Checkout failure → See checkout error with support contact
4. API 404 → See "not found" error with browse gallery link

---

## Issue: Add keyboard navigation to photo slider

**Labels:** `accessibility`, `ux`
**Priority:** P2
**Estimated Effort:** 1 hour

### Summary

The photo slider on the home page only supports mouse/touch navigation. Keyboard users cannot navigate slides without tabbing through all content.

### Current Implementation

**`components/PhotoSlider.jsx`:**
- Only has click handlers for prev/next buttons
- No keyboard shortcuts
- Auto-rotation can't be paused by keyboard users

### Proposed Solution

```javascript
// components/PhotoSlider.jsx
'use client'

import { useState, useEffect, useRef } from 'react'

export default function PhotoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sliderRef = useRef(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sliderRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case ' ': // Spacebar
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
        case 'Home':
          e.preventDefault()
          setCurrentIndex(0)
          break
        case 'End':
          e.preventDefault()
          setCurrentIndex(photos.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [photos.length])

  // Auto-rotation with pause support
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [photos.length, isPaused])

  return (
    <div
      ref={sliderRef}
      className="relative w-full"
      role="region"
      aria-label="Photo carousel"
      aria-live="polite"
      tabIndex={0}
    >
      {/* Current slide */}
      <div className="relative h-[70vh] min-h-[500px]">
        <Image
          src={photos[currentIndex]?.displayUrl}
          alt={photos[currentIndex]?.title || 'Featured photograph'}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Previous button */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Play/Pause button */}
      <button
        onClick={() => setIsPaused(prev => !prev)}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/75 text-white px-4 py-2 rounded"
        aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
      >
        {isPaused ? 'Play' : 'Pause'}
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {photos.length}
      </div>
    </div>
  )
}
```

### Acceptance Criteria

- [ ] Arrow keys navigate slides
- [ ] Spacebar pauses/resumes auto-rotation
- [ ] Home/End keys jump to first/last slide
- [ ] Focus visible on slider when keyboard navigating
- [ ] Screen reader announces slide changes
- [ ] Play/pause button for accessibility
- [ ] Keyboard shortcuts don't interfere with page scrolling

### Testing

1. Tab to slider → Focus visible
2. Press Right Arrow → Next slide
3. Press Left Arrow → Previous slide
4. Press Spacebar → Slideshow pauses
5. Press Home → First slide
6. Test with screen reader → Announces slide changes

---

## Issue: Add image loading fallbacks and error states

**Labels:** `ux`, `resilience`
**Priority:** P2
**Estimated Effort:** 2 hours

### Summary

When images fail to load (Cloudinary down, broken URLs, network errors), pages show broken image icons with no fallback or retry option.

### Current Behavior

If Cloudinary is unreachable or image URL is invalid:
- Broken image icon displayed
- No error message
- No retry mechanism
- User doesn't know if issue is temporary or permanent

### Proposed Solution

**Create image component with fallback:**

```javascript
// components/ImageWithFallback.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  onLoadError,
  className = '',
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  const handleError = () => {
    console.error(`Failed to load image: ${src}`)
    setError(true)
    setImgSrc(fallbackSrc)
    onLoadError?.()
  }

  return (
    <div className="relative">
      <Image
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={className}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-600">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Use in CloudinaryImage:**

```javascript
// components/CloudinaryImage.jsx
import ImageWithFallback from './ImageWithFallback'

export default function CloudinaryImage({ src, alt, ... }) {
  // ... existing logic ...

  return (
    <div className="relative w-full" style={{ paddingTop: `${paddingTop}%` }}>
      <ImageWithFallback
        src={src}
        alt={alt}
        fill
        fallbackSrc="/placeholder-photo.jpg"
        onLoadError={() => {
          // Optional: Report to error tracking service
          console.error('Cloudinary image failed to load:', src)
        }}
        loader={isCloudinary ? cloudinaryLoader : undefined}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        className={className}
        style={{ objectFit: effectiveObjectFit }}
        {...rest}
      />
    </div>
  )
}
```

**Create placeholder images:**

Create simple placeholder images:
- `/public/placeholder-photo.jpg` - Gray rectangle with camera icon
- `/public/placeholder-category.jpg` - Gray with gallery icon
- `/public/placeholder-profile.jpg` - Gray with person icon

### Acceptance Criteria

- [ ] Images show placeholder when load fails
- [ ] Error logged to console (and optional error tracking)
- [ ] Placeholder images created for different contexts
- [ ] Graceful degradation (user can still use site)
- [ ] Retry mechanism for transient failures (optional)
- [ ] Applied to: photos, categories, profile images

### Testing

1. Break Cloudinary URL → See placeholder
2. Test with slow/unreliable network
3. Verify placeholder matches aspect ratio
4. Check console for error logs

---

## Issue: Improve button styles consistency

**Labels:** `ui`, `design-system`
**Priority:** P2
**Estimated Effort:** 3 hours

### Summary

Buttons have inconsistent styling across pages. Some use inline Tailwind, others have slight variations in padding, colors, and hover states.

### Current State

**Cart page button:**
```javascript
<button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300">
  Proceed to Checkout
</button>
```

**Contact page button:**
```javascript
<button className="w-full bg-black text-white font-semibold py-3 px-6 rounded hover:bg-gray-800 transition">
  Send Message
</button>
```

**About page button:**
```javascript
<Link href="/contact" className="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition">
  Get in Touch
</Link>
```

All slightly different!

### Proposed Solution

**Create button component:**

```javascript
// components/Button.jsx
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
```

**Update pages to use component:**

```javascript
// app/cart/page.js
import Button from '@/components/Button'

<Button
  variant="gradient"
  fullWidth
  loading={isProcessing}
  onClick={handleCheckout}
>
  Proceed to Checkout
</Button>
```

```javascript
// app/contact/page.js
<Button
  type="submit"
  fullWidth
  loading={isSubmitting}
  disabled={!isValid}
>
  Send Message
</Button>
```

### Acceptance Criteria

- [ ] Button component created with variants
- [ ] All buttons across site updated to use component
- [ ] Consistent sizing (sm, md, lg)
- [ ] Consistent hover/active states
- [ ] Loading state built-in
- [ ] Disabled state properly styled
- [ ] Focus states accessible (visible outline)

### Testing

1. Navigate all pages → Verify button consistency
2. Test all button states: default, hover, active, disabled, loading
3. Keyboard navigation → Focus visible
4. Verify WCAG contrast ratios

---

## Issue: Add print-friendly styles for receipts

**Labels:** `ux`, `feature`
**Priority:** P2
**Estimated Effort:** 2 hours

### Summary

When users try to print order receipts from the orders page, the header, footer, and navigation print along with the order details, creating messy printouts.

### Proposed Solution

Add print stylesheet:

```css
/* app/globals.css */
@media print {
  /* Hide non-essential elements */
  header,
  footer,
  nav,
  .no-print {
    display: none !important;
  }

  /* Optimize for print */
  body {
    font-size: 12pt;
    color: black;
    background: white;
  }

  /* Page breaks */
  .order-card {
    page-break-inside: avoid;
    page-break-after: always;
  }

  /* Remove shadows, backgrounds */
  * {
    box-shadow: none !important;
    background: white !important;
  }

  /* Keep essential borders */
  .border {
    border-color: #ccc !important;
  }

  /* Links should show URL */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #555;
  }

  /* Hide action buttons */
  button {
    display: none !important;
  }
}
```

**Add print button to order details:**

```javascript
// app/orders/page.js or app/orders/[id]/page.js
<div className="flex gap-2 no-print">
  <button
    onClick={() => window.print()}
    className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
    Print Receipt
  </button>
  <button
    onClick={downloadPDF}
    className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Download PDF
  </button>
</div>
```

### Acceptance Criteria

- [ ] Print styles hide header, footer, navigation
- [ ] Print view shows only order details
- [ ] Page breaks prevent splitting orders across pages
- [ ] Black text on white background for readability
- [ ] Print button triggers browser print dialog
- [ ] Optional: PDF download button

### Testing

1. Open order page → Click print → Preview shows clean receipt
2. Print multiple orders → Each on separate page
3. Test in Chrome, Firefox, Safari
4. Verify no broken layouts in print preview

---

## Summary Table

| Issue | Priority | Estimated Effort |
|-------|----------|------------------|
| Loading skeletons | P1 | 2 hours |
| Empty state handling | P1 | 2 hours |
| Improved error messages | P1 | 3 hours |
| Keyboard navigation | P2 | 1 hour |
| Image fallbacks | P2 | 2 hours |
| Button consistency | P2 | 3 hours |
| Print-friendly styles | P2 | 2 hours |

**Total estimated effort:** ~15 hours (2 days for one developer)

**Priority Breakdown:**
- **P1 (Important):** 7 hours - Improves core UX
- **P2 (Nice to Have):** 8 hours - Polish and edge cases
