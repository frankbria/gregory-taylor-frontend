// frontend/app/api/checkout/route.js

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { items, userId } = await request.json();

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.title },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity || 1,
    }));

    const origin = request.headers.get('origin') || '';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart/cancel`,
      metadata: { userId: userId || '' },
    });

    // Persist order in backend
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent,
        items,
        totalAmount: items.reduce((sum, i) => sum + i.unitPrice * (i.quantity||1), 0),
        currency: 'usd',
        userId,
      }),
    });

    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 