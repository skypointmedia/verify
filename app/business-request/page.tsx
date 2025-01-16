"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const BUSINESS_TYPES = ["LLC", "Sole Proprietor", "C-Corp", "S-Corp", "Non-Profit", "Partnership"];
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

export default function BusinessRequestPage() {
  return (
    <div className="max-w-md mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">New Business Verification Request</h1>
      <Elements stripe={stripePromise}>
        <BusinessRequestForm />
      </Elements>
    </div>
  );
}

function BusinessRequestForm() {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [stateRegistered, setStateRegistered] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setLoading(true);

    try {
      // Fetch the client secret from the server
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 15000 }), // $150 in cents
      });

      const { clientSecret, error } = await response.json();
      if (error || !clientSecret) throw new Error("Failed to create PaymentIntent.");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("CardElement not found.");

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      if (confirmError || !paymentIntent) throw confirmError;

      if (paymentIntent.status === "succeeded") {
        await addDoc(collection(db, "businessRequests"), {
          userId: user.uid,
          businessOwnerFirstName: ownerFirstName,
          businessOwnerLastName: ownerLastName,
          businessName,
          businessType,
          businessAddress,
          city,
          state,
          zip,
          stateRegistered,
          status: "pending",
          createdAt: serverTimestamp(),
        });

        alert("Your request has been successfully submitted!");
        router.push("/dashboard");
      } else {
        alert("Payment did not succeed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert((err as Error).message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Business Owner First Name</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={ownerFirstName}
          onChange={(e) => setOwnerFirstName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Business Owner Last Name</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={ownerLastName}
          onChange={(e) => setOwnerLastName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Business Registered Name</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Business Type</label>
        <select
          className="border p-2 w-full"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          required
        >
          <option value="" disabled>Select type</option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Business Address</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">City</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">State</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">ZIP Code</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">State Where Business Was Registered</label>
        <select
          className="border p-2 w-full"
          value={stateRegistered}
          onChange={(e) => setStateRegistered(e.target.value)}
          required
        >
          <option value="" disabled>Select state</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="border p-2 rounded">
        <CardElement />
      </div>

      <button
        disabled={!stripe || loading}
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Pay $150 & Submit"}
      </button>
    </form>
  );
}
