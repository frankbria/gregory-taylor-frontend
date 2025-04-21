'use client'

import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
// In a real application, this would be an environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export async function createCheckoutSession(cartItems) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || ''
    // Call backend API to create a Stripe Checkout Session
    const response = await fetch(`${base}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    })
    if (!response.ok) throw new Error('Failed to create checkout session')
    const session = await response.json()
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function redirectToCheckout(sessionId) {
  try {
    const stripe = await stripePromise
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize')
    }
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    })
    
    if (error) {
      throw error
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    return { success: false, error }
  }
}