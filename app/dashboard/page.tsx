"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Timestamp } from "firebase/firestore"; // Import Timestamp type
import PageHeading from "@/components/PageHeading";

interface RequestData {
  id: string;
  businessName: string;
  status: string;
  pdfUrl?: string;
  createdAt: Timestamp; // Firestore Timestamp
  ownerFullName: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);

  // Fetch requests from Firestore
  useEffect(() => {
    if (!loading && user) {
      (async () => {
        try {
          const q = query(
            collection(db, "businessRequests"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          const data: RequestData[] = [];
          snap.forEach((docSnap) => {
            const docData = docSnap.data();
            data.push({
              id: docSnap.id,
              businessName: docData.businessName,
              status: docData.status,
              pdfUrl: docData.pdfUrl,
              createdAt: docData.createdAt, // Firestore Timestamp
              ownerFullName: docData.ownerFullName,
            } as RequestData);
          });
          setRequests(data);
        } catch (error) {
          console.error("Error fetching requests:", error);
          setError("Failed to load business verification requests.");
        }
      })();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Or some fallback UI
  }

  return (
    <>
    
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <PageHeading pageHeading="Dashboard" />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Your Business Verification Requests</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all your business verification requests, view statuses, and download related documents.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/business-request"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            New Business Verification Request
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-8 flow-root">
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {requests.length > 0 ? (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      Business Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Owner Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date Created
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className="even:bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => router.push(`/business-request/${req.id}`)}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {req.businessName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {req.ownerFullName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {req.createdAt.toDate().toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">You have no business verification requests.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
