// lib/stripe.ts
import Stripe from 'stripe';

// You should have STRIPE_SECRET_KEY in .env.local
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});
