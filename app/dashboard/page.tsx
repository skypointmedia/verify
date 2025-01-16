// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

interface RequestData {
  id: string;
  businessName: string;
  status: string;
  pdfUrl?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestData[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/(auth)/sign-in");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      (async () => {
        const q = query(collection(db, "businessRequests"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const data: RequestData[] = [];
        snap.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as RequestData);
        });
        setRequests(data);
      })();
    }
  }, [user, loading]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!user) {
    return null; // or some fallback
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <Link
        href="/business-request"
        className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-6"
      >
        New Business Verification Request
      </Link>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Business Name</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">PDF</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="border p-2">{req.businessName}</td>
              <td className="border p-2">{req.status}</td>
              <td className="border p-2">
                {req.pdfUrl ? (
                  <a
                    href={req.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
