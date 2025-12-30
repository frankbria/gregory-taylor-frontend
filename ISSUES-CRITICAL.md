# Critical Issues - Frontend

> **Priority: P0-P1 - Must fix before production launch**
>
> These issues represent critical functional and security problems in the frontend.

---

## Issue: Implement contact form API endpoint

**Labels:** `critical`, `feature`, `backend-integration`
**Priority:** P0
**Estimated Effort:** 4 hours

### Summary

The contact form appears functional but the `/api/contact` route is not implemented. Form submissions are currently simulated with a 1.5-second delay and no actual email is sent.

### Current Implementation

**`app/contact/page.js` (lines 47-58):**
```javascript
// Here you would implement the actual API call to send the email
// For example:
// const response = await fetch('/api/contact', {
//   method: 'POST',
//   ...
// })

// Simulate API call for now
await new Promise(resolve => setTimeout(resolve, 1500))
```

**Impact:**
- Users cannot actually contact the photographer
- Form appears to work but sends nothing
- No lead capture or customer inquiries possible

### Proposed Solution

**Step 1: Install email package**

```bash
npm install nodemailer
# OR
npm install @sendgrid/mail
# OR use Resend, Postmark, etc.
```

**Step 2: Create API route**

```javascript
// app/api/contact/route.js
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req) {
  try {
    const { name, email, message, recaptchaToken, photographyAnswer } = await req.json()

    // Verify reCAPTCHA (see separate security issue)
    // ... reCAPTCHA verification code ...

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify photography answer
    const correctAnswers = [
      'aperture', 'shutter speed', 'iso',
      'shutter', 'f-stop', 'exposure'
    ]
    if (!correctAnswers.some(ans => photographyAnswer.toLowerCase().includes(ans))) {
      return NextResponse.json(
        { error: 'Incorrect answer to photography question' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email to photographer
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    })

    // Optional: Send confirmation email to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Thank you for contacting Greg Taylor Photography',
      html: `
        <h2>Thank you for your message!</h2>
        <p>Hi ${name},</p>
        <p>I've received your message and will get back to you within 24-48 hours.</p>
        <p>Best regards,<br>Greg Taylor</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
```

**Step 3: Add environment variables**

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@gregtaylorphotography.com
CONTACT_EMAIL=greg@gregtaylorphotography.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

**Step 4: Update frontend to call real endpoint**

```javascript
// app/contact/page.js
const onSubmit = async (data) => {
  setIsSubmitting(true)
  setSubmitStatus(null)

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send message')
    }

    setSubmitStatus('success')
    reset()
  } catch (error) {
    console.error('Form submission error:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}
```

### Acceptance Criteria

- [ ] `/api/contact` route created
- [ ] Email service configured (SMTP or service provider)
- [ ] Form submissions send email to photographer
- [ ] User receives confirmation email
- [ ] reCAPTCHA validation implemented
- [ ] Photography answer validation works
- [ ] Error handling with user-friendly messages
- [ ] Environment variables documented in .env.example

### Testing

1. Fill out contact form with valid data → Email received
2. Submit with invalid email → Error message shown
3. Submit without reCAPTCHA → Rejected
4. Submit with wrong photography answer → Rejected
5. Check spam folder for confirmation email

---

## Issue: Fix room preview templates (only 1 of 4 works)

**Labels:** `critical`, `bug`, `cloudinary`
**Priority:** P0
**Estimated Effort:** 3 hours

### Summary

The room preview feature on individual photo pages only works for one template. Templates 2-4 are missing the `t_name` property, causing preview generation to fail.

### Current Implementation

**`components/RoomPreviews.jsx` (lines 4-31):**
```javascript
const templates = [
  {
    id: 1,
    name: 'Living Room',
    thumbnail: '/room-previews/living-room.jpg',
    t_name: 't_living-room-1', // ✅ HAS t_name
    overlay: { x: 0, y: 0, w: 800 },
  },
  {
    id: 2,
    name: 'Office',
    thumbnail: '/room-previews/office.jpg',
    // ❌ MISSING t_name
    overlay: { x: 0, y: 0, w: 600 },
  },
  {
    id: 3,
    name: 'Gallery Wall',
    thumbnail: '/room-previews/gallery-wall.jpg',
    // ❌ MISSING t_name
    overlay: { x: 0, y: 0, w: 400 },
  },
  {
    id: 4,
    name: 'Bedroom',
    thumbnail: '/room-previews/bedroom.jpg',
    // ❌ MISSING t_name
    overlay: { x: 0, y: 0, w: 500 },
  },
]
```

**Problem:** Only template 1 generates valid Cloudinary URLs. The others fail silently or show broken images.

### Impact

- Feature appears broken to users
- Users can't visualize photos in different room settings
- May reduce purchase confidence

### Proposed Solutions

**Option 1: Create Cloudinary transformations for all templates**

1. Go to Cloudinary Dashboard → Transformations
2. Create named transformations:
   - `t_office-1`
   - `t_gallery-wall-1`
   - `t_bedroom-1`
3. Configure each to composite photo onto room template image
4. Update code:
   ```javascript
   const templates = [
     // ... template 1 ...
     {
       id: 2,
       name: 'Office',
       thumbnail: '/room-previews/office.jpg',
       t_name: 't_office-1', // ✅ ADDED
       overlay: { x: 0, y: 0, w: 600 },
     },
     // ... etc
   ]
   ```

**Option 2: Remove broken templates until Cloudinary setup complete**

If transformations aren't ready, temporarily show only working template:

```javascript
const templates = [
  {
    id: 1,
    name: 'Living Room',
    thumbnail: '/room-previews/living-room.jpg',
    t_name: 't_living-room-1',
    overlay: { x: 0, y: 0, w: 800 },
  },
  // Remove templates 2-4 until transformations are created
]
```

Update UI to indicate more templates "coming soon".

**Option 3: Use client-side canvas compositing**

Generate previews in browser using Canvas API:

```javascript
async function generateRoomPreview(photoUrl, templateUrl, overlay) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Load template image
  const template = await loadImage(templateUrl)
  canvas.width = template.width
  canvas.height = template.height
  ctx.drawImage(template, 0, 0)

  // Load photo
  const photo = await loadImage(photoUrl)

  // Calculate dimensions to fit overlay area
  const scale = Math.min(overlay.w / photo.width, overlay.h / photo.height)
  const scaledWidth = photo.width * scale
  const scaledHeight = photo.height * scale

  // Draw photo on template
  ctx.drawImage(
    photo,
    overlay.x,
    overlay.y,
    scaledWidth,
    scaledHeight
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}
```

### Acceptance Criteria

- [ ] All 4 room templates generate valid preview URLs
- [ ] Previews display correctly without broken images
- [ ] Loading states shown while previews generate
- [ ] Error handling if preview generation fails
- [ ] Mobile-responsive preview display

### Testing

1. Open individual photo page
2. Click through all 4 room preview thumbnails
3. Verify each shows photo composited on room template
4. Test with different aspect ratio photos (square, panoramic, etc.)
5. Check performance (preview generation time)

---

## Issue: Implement orders page (currently stub)

**Labels:** `critical`, `feature`
**Priority:** P0
**Estimated Effort:** 6 hours

### Summary

The `/orders` page exists but only shows "Coming Soon" message. Users who purchase prints cannot view their order history.

### Current Implementation

**`app/orders/page.js`:**
```javascript
export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-6">My Orders (Coming Soon)</h1>
      <p className="text-gray-600">
        This feature will be available in the near future.
      </p>
    </div>
  )
}
```

**Impact:**
- Users cannot track order status
- No order history or invoices available
- Support burden increased (users can't self-serve order info)
- No proof of purchase visible to customers

### Proposed Solution

**Step 1: Create API endpoint to fetch user orders**

Backend needs to expose customer order lookup (currently all order endpoints are admin-only).

**Step 2: Implement orders page**

```javascript
// app/orders/page.js
'use client'

import { useEffect, useState } from 'react'
import { useAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { getUserOrders } = useAPI()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setOrders([])
        return
      }

      const data = await getUserOrders(userId)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <p>Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-6">My Orders</h1>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <a
            href="/gallery"
            className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Browse Gallery
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-6 shadow-sm">
            {/* Order header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Order #{order._id.slice(-8)}
                </h2>
                <p className="text-gray-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(order.totalAmount)}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    order.status === 'fulfilled'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order items */}
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 border-t pt-3">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {item.size} • {item.frame} • {item.format}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {order.status === 'fulfilled' && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => window.print()}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Print Receipt
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Add API method**

```javascript
// lib/api.js
export function useAPI() {
  // ... existing methods ...

  const getUserOrders = async (userId) => {
    const res = await fetch(`${apiBase}/api/orders?userId=${userId}`)
    if (!res.ok) throw new Error('Failed to fetch orders')
    return res.json()
  }

  return {
    // ... existing returns ...
    getUserOrders,
  }
}
```

**Step 4: Update header to remove TODO comment**

```javascript
// components/Header.jsx
{/* Remove TODO comment on line 24 */}
<Link href="/orders" className="...">
  Orders
</Link>
```

### Acceptance Criteria

- [ ] Orders page fetches and displays user's order history
- [ ] Orders sorted by date (newest first)
- [ ] Each order shows: ID, date, total, status, items
- [ ] Empty state when no orders exist
- [ ] Loading state while fetching
- [ ] Error handling if API call fails
- [ ] Order status badges with color coding
- [ ] Print receipt functionality
- [ ] Mobile-responsive design

### Testing

1. User with no orders → See empty state with link to gallery
2. User with 1+ orders → See order list
3. Click print receipt → Browser print dialog opens
4. Test with multiple items per order
5. Test with different order statuses
6. Verify dates formatted correctly

---

## Issue: Add mobile navigation menu

**Labels:** `critical`, `ux`, `responsive`
**Priority:** P0
**Estimated Effort:** 3 hours

### Summary

The header navigation has no hamburger menu for mobile devices. On small screens, navigation links are either hidden or overflow, making the site unusable on mobile.

### Current Implementation

**`components/Header.jsx`:**
```javascript
<nav className="flex items-center space-x-8">
  <Link href="/" className="hover:text-gray-700">Home</Link>
  <Link href="/gallery" className="hover:text-gray-700">Gallery</Link>
  <Link href="/about" className="hover:text-gray-700">About</Link>
  <Link href="/contact" className="hover:text-gray-700">Contact</Link>
</nav>
```

**Problem:** No mobile-specific navigation. Links are hidden or inaccessible on screens < 768px.

### Proposed Solution

```javascript
// components/Header.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cartCount } = useCart()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            GREG TAYLOR PHOTOGRAPHY
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <Link href="/gallery" className="hover:text-gray-700">Gallery</Link>
            <Link href="/about" className="hover:text-gray-700">About</Link>
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
            <Link href="/orders" className="hover:text-gray-700">Orders</Link>
          </nav>

          {/* Cart & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/gallery"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/orders"
                className="px-4 py-2 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
              <Link
                href="/cart"
                className="px-4 py-2 hover:bg-gray-100 rounded flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-600 text-white text-sm rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
```

### Acceptance Criteria

- [ ] Hamburger menu icon visible on mobile (<768px)
- [ ] Menu toggles open/close when clicked
- [ ] All navigation links accessible in mobile menu
- [ ] Cart count visible in mobile menu
- [ ] Menu closes when link is clicked
- [ ] Menu closes when clicking outside (optional enhancement)
- [ ] Smooth transitions when opening/closing
- [ ] Accessible (keyboard navigation, ARIA labels)

### Testing

1. Resize browser to mobile width → See hamburger icon
2. Click hamburger → Menu opens
3. Click link → Navigate to page and menu closes
4. Click hamburger again → Menu closes
5. Test on actual mobile devices (iOS, Android)
6. Test with screen reader

---

## Issue: Fix header cart icon positioning (breaks on mobile)

**Labels:** `bug`, `responsive`, `ui`
**Priority:** P1
**Estimated Effort:** 1 hour

### Summary

The cart icon in the header uses `absolute right-60` positioning, which breaks on smaller screens and doesn't scale responsively.

### Current Implementation

**`components/Header.jsx` (line 27):**
```javascript
<Link href="/cart" className="relative absolute right-60">
  {/* Cart icon */}
</Link>
```

**Problem:** `right-60` (240px from right) pushes icon off-screen on mobile devices.

### Proposed Solution

Remove absolute positioning and use flexbox:

```javascript
// Combine with mobile menu fix above
<div className="flex items-center gap-4">
  <Link href="/cart" className="relative">
    {/* Cart icon */}
  </Link>
</div>
```

This is addressed in the mobile navigation issue above.

### Acceptance Criteria

- [ ] Cart icon visible at all screen sizes
- [ ] Icon positioned consistently with other header elements
- [ ] Cart count badge stays aligned with icon
- [ ] No horizontal overflow on mobile

### Testing

1. Test on screens 320px, 375px, 768px, 1024px, 1920px wide
2. Verify icon doesn't overlap logo or nav links
3. Check cart count badge positioning

---

## Issue: Add client-side price validation (prevent manipulation)

**Labels:** `security`, `critical`, `validation`
**Priority:** P0
**Estimated Effort:** See backend issue

### Summary

Cart prices are calculated entirely on the frontend and sent to backend without server-side validation. Users can manipulate localStorage to create orders with arbitrary prices.

### Impact

- **Severity:** Critical
- Users could purchase items for $0 or manipulate prices
- Revenue loss

### Solution

This is primarily a **backend issue** (server must recalculate prices), but frontend should also:

1. Display prices for UX
2. Show warning if prices seem manipulated
3. Re-fetch current prices before checkout

See corresponding backend issue for full implementation.

### Frontend Changes Needed

```javascript
// app/cart/page.js - Before checkout
const handleCheckout = async () => {
  // Re-validate prices before submitting
  const validatedCart = await validateCartPrices(cart)

  if (!validatedCart.valid) {
    toast.error('Cart prices have changed. Please review before checkout.')
    // Update cart with current prices
    setCart(validatedCart.items)
    return
  }

  await createCheckoutSession(cart, userId)
}
```

---

## Issue: Add reCAPTCHA server-side validation

**Labels:** `security`, `forms`
**Priority:** P1
**Estimated Effort:** 1 hour

### Summary

Contact form displays reCAPTCHA with a test key, but when `/api/contact` is implemented, it must verify the token server-side.

### Current State

**`app/contact/page.js` (line 163):**
```javascript
<ReCAPTCHA
  sitekey="6LeIxAcTAAAAAA..." // Test key - needs replacement
  onChange={(value) => setValue('recaptchaToken', value)}
/>
```

### Solution

1. Get production reCAPTCHA keys from https://www.google.com/recaptcha/admin
2. Replace test key with `process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
3. Backend must verify token (see backend contact form issue)

---

## Summary Table

| Issue | Priority | Estimated Effort | Dependencies |
|-------|----------|------------------|--------------|
| Implement contact form API | P0 | 4 hours | Backend |
| Fix room preview templates | P0 | 3 hours | Cloudinary setup |
| Implement orders page | P0 | 6 hours | Backend API |
| Add mobile navigation | P0 | 3 hours | None |
| Fix cart icon positioning | P1 | 1 hour | Mobile nav |
| Price validation | P0 | — | Backend issue |
| reCAPTCHA validation | P1 | 1 hour | Backend API |

**Total estimated effort:** ~18 hours (2-3 days for one developer)

**Note:** Several issues depend on backend API changes and should be coordinated.
