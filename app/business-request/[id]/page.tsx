// app/business-request/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"; // Correct import for Heroicons v2
import PageHeading from "@/components/PageHeading";

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
  pdfUrl?: string; // URL to the verification letter PDF
}

export default function BusinessRequestDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [businessRequest, setBusinessRequest] = useState<BusinessRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  
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
          if (data.userId !== user.uid) {
            setError("You do not have permission to view this request.");
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
              pdfUrl: data.pdfUrl, // Ensure this field exists
            };
            setBusinessRequest(request);
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
  }, [user, id, router]);

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
      <PageHeading pageHeading="Verification Request Details" />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{businessRequest.businessName} Business Verification Request</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about your business verification request.
          </p>
        </div>

        {/* Details */}
        <div className="border-t border-gray-200">
          <dl>
            {/* Business Name */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Business Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.businessName}</dd>
            </div>

            {/* Address */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {businessRequest.street}, {businessRequest.city}, {businessRequest.state} {businessRequest.zip}, {businessRequest.country}
              </dd>
            </div>

            {/* Legal Structure */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Legal Structure</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.legalStructure}</dd>
            </div>

            {/* EIN */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employer Identification Number (EIN)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.ein}</dd>
            </div>

            {/* Business Registration Number */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Business Registration Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.businessRegistrationNumber}</dd>
            </div>

            {/* State of Registration */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">State of Registration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.stateOfRegistration}</dd>
            </div>

            {/* Owner’s Full Name */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Owner’s Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{businessRequest.ownerFullName}</dd>
            </div>

            {/* Status */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    businessRequest.status === "in progress"
                      ? "bg-green-100 text-green-800"
                      : businessRequest.status === "more information needed"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {businessRequest.status.charAt(0).toUpperCase() + businessRequest.status.slice(1)}
                </span>
              </dd>
            </div>

            {/* Verification Letter (Only if status is 'complete') */}
            {businessRequest.status === "verified" && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Verification Letter</dt>
                <dd className="mt-1 text-sm text-indigo-600 sm:mt-0 sm:col-span-2">
                  {businessRequest.pdfUrl ? (
                    <a
                      href={businessRequest.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center underline"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                      Download Now
                    </a>
                  ) : (
                    "Not available."
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Edit Button (Hidden if status is 'verified') */}
        {businessRequest.status !== "verified" && (
          <div className="px-4 py-4 sm:px-6 text-right">
            <Link
              href={`/business-request/${businessRequest.id}/edit`}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
