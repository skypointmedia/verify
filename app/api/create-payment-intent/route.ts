// app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // Your lib/stripe.ts

export async function POST(request: Request) {
  try {
    // Parse the JSON body to get payment details (optional)
    const { amount } = await request.json();

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 15000, // 15000 cents = $150
      currency: "usd",
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json({ error: "Failed to create PaymentIntent" }, { status: 500 });
  }
}
