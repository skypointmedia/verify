// app/business-request/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ChevronDownIcon } from "@heroicons/react/24/solid"; // Updated import for v2
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/20/solid"; // Updated imports for v2
import { RadioGroup } from "@headlessui/react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const LEGAL_STRUCTURES = ["Sole Proprietorship", "Partnership", "LLC", "Corporation"];
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
   const { user, loading } = useAuth();
   const router = useRouter();
 
   // Redirect to sign-in if not authenticated
   useEffect(() => {
     if (!loading && !user) {
       router.push("/sign-in");
     }
   }, [loading, user, router]); 
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Business Verification Request</h1>
        <Elements stripe={stripePromise}>
          <BusinessRequestForm />
        </Elements>
      </div>
    </div>
  );
}

function BusinessRequestForm() {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");
  const [legalStructure, setLegalStructure] = useState("");
  const [ein, setEin] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [stateRegistered, setStateRegistered] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setLoading(true);

    try {
      // Create Payment Intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 150 }), // $150 in cents
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
        // Save to Firestore
        await addDoc(collection(db, "businessRequests"), {
          userId: user.uid,
          businessName,
          address: {
            street,
            city,
            state,
            zip,
            country,
          },
          legalStructure,
          ein,
          businessRegistrationNumber: businessRegNumber,
          stateOfRegistration: stateRegistered,
          ownerFullName,
          status: "In Progress",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {/* Legal Business Name */}
          <div className="sm:col-span-2">
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
              Legal Business Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="business-name"
                name="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="sm:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="street"
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="123 Main St."
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State *
            </label>
            <div className="mt-1 relative">
              <select
                id="state"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>
                  Select state
                </option>
                {US_STATES.map((stateOption) => (
                  <option key={stateOption} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* ZIP/Postal Code */}
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP / Postal Code *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="zip"
                name="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country *
            </label>
            <div className="mt-1 relative">
              <select
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>Mexico</option>
                {/* Add more countries as needed */}
              </select>
              <ChevronDownIcon
                className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Legal Structure */}
          <div className="sm:col-span-2">
            <label htmlFor="legal-structure" className="block text-sm font-medium text-gray-700">
              Legal Structure *
            </label>
            <div className="mt-1 relative">
              <select
                id="legal-structure"
                name="legal-structure"
                value={legalStructure}
                onChange={(e) => setLegalStructure(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>
                  Select legal structure
                </option>
                {LEGAL_STRUCTURES.map((structure) => (
                  <option key={structure} value={structure}>
                    {structure}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* EIN */}
          <div className="sm:col-span-2">
            <label htmlFor="ein" className="block text-sm font-medium text-gray-700">
              Employer Identification Number (EIN) *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="ein"
                name="ein"
                value={ein}
                onChange={(e) => setEin(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="12-3456789"
              />
            </div>
          </div>

          {/* Business Registration Number */}
          <div className="sm:col-span-2">
            <label htmlFor="business-reg-number" className="block text-sm font-medium text-gray-700">
              Business Registration Number *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="business-reg-number"
                name="business-reg-number"
                value={businessRegNumber}
                onChange={(e) => setBusinessRegNumber(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="ABC123456"
              />
            </div>
          </div>

          {/* State of Registration */}
          <div className="sm:col-span-2">
            <label htmlFor="state-registered" className="block text-sm font-medium text-gray-700">
              State of Registration *
            </label>
            <div className="mt-1 relative">
              <select
                id="state-registered"
                name="state-registered"
                value={stateRegistered}
                onChange={(e) => setStateRegistered(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="" disabled>
                  Select state
                </option>
                {US_STATES.map((stateOption) => (
                  <option key={stateOption} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business Owner Information</h2>
        <div className="mt-4">
          <label htmlFor="owner-full-name" className="block text-sm font-medium text-gray-700">
            Owner’s Full Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="owner-full-name"
              name="owner-full-name"
              value={ownerFullName}
              onChange={(e) => setOwnerFullName(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
        <div className="mt-4">
          <div className="border p-4 rounded-md">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {loading ? "Processing..." : "Pay $150 & Submit"}
        </button>
      </div>
    </form>
  );
}
