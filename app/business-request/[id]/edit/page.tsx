// app/business-request/[id]/edit/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PaheHeading from "@/components/PageHeading";
import { ChevronDownIcon } from "@heroicons/react/24/solid"; // Updated for Heroicons v2

interface BusinessRequest {
  id: string;
  businessName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  legalStructure: string;
  ein: string;
  businessRegistrationNumber: string;
  stateOfRegistration: string;
  ownerFullName: string;
  status: string;
  createdAt: any;
}

export default function EditBusinessRequestPage() {
  const { user, loading: authLoading, isAdmin } = useAuth(); // Assuming isAdmin is available in AuthContext
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [businessRequest, setBusinessRequest] = useState<BusinessRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/sign-in"); // Redirect to login if not authenticated
      return;
    }

    const fetchBusinessRequest = async () => {
      try {
        const docRef = doc(db, "businessRequests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId !== user.uid && !isAdmin) {
            setError("You do not have permission to edit this request.");
          } else {
            const request: BusinessRequest = {
              id: docSnap.id,
              businessName: data.businessName,
              street: data.address.street,
              city: data.address.city,
              state: data.address.state,
              zip: data.address.zip,
              country: data.address.country,
              legalStructure: data.legalStructure,
              ein: data.ein,
              businessRegistrationNumber: data.businessRegistrationNumber,
              stateOfRegistration: data.stateOfRegistration,
              ownerFullName: data.ownerFullName,
              status: data.status,
              createdAt: data.createdAt,
            };
            setBusinessRequest(request);
            // Initialize form fields
            setBusinessName(request.businessName);
            setStreet(request.street);
            setCity(request.city);
            setState(request.state);
            setZip(request.zip);
            setCountry(request.country);
            setLegalStructure(request.legalStructure);
            setEin(request.ein);
            setBusinessRegNumber(request.businessRegistrationNumber);
            setStateRegistered(request.stateOfRegistration);
            setOwnerFullName(request.ownerFullName);
          }
        } else {
          setError("Business verification request not found.");
        }
      } catch (err) {
        console.error("Error fetching business request:", err);
        setError("Failed to load the business request. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessRequest();
  }, [user, isAdmin, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const docRef = doc(db, "businessRequests", id);
      await updateDoc(docRef, {
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
        // Do not update 'status' as it's admin-controlled
      });
      setSuccess("Business verification request updated successfully.");
      // Optionally, redirect back to the detail page after a delay
      setTimeout(() => {
        router.push(`/business-request/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating business request:", err);
      setError("Failed to update the business request. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!businessRequest) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PaheHeading pageHeading="Verification Request Details" />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{businessRequest.businessName} Business Verification Request</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Modify the details of your business verification request.</p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {/* Business Information */}
              <div className="space-y-6">
                {/* Business Name */}
                <div>
                  <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
                    Business Name *
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
                <div>
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
                      {/* Replace with actual US states or fetch dynamically */}
                      <option>Alabama</option>
                      <option>Alaska</option>
                      <option>Arizona</option>
                      <option>Arkansas</option>
                      <option>California</option>
                      {/* Add all other states */}
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
                <div>
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
                      <option>Sole Proprietorship</option>
                      <option>Partnership</option>
                      <option>LLC</option>
                      <option>Corporation</option>
                      {/* Add more legal structures as needed */}
                    </select>
                    <ChevronDownIcon
                      className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* EIN */}
                <div>
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
                <div>
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
                <div>
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
                      {/* Replace with actual US states or fetch dynamically */}
                      <option>Alabama</option>
                      <option>Alaska</option>
                      <option>Arizona</option>
                      <option>Arkansas</option>
                      <option>California</option>
                      {/* Add all other states */}
                    </select>
                    <ChevronDownIcon
                      className="absolute inset-y-0 right-0 mr-3 flex items-center pointer-events-none h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Owner's Full Name */}
                <div>
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
            </div>

            {/* Submit Button and Success/Error Messages */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              {error && (
                <div className="mb-4 text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="mb-4 text-sm text-green-600">{success}</div>
              )}
              <button
                type="submit"
                disabled={updating}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  updating ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {updating ? "Updating..." : "Update Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
