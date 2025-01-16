// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface RequestData {
  id: string;
  userId: string;
  businessOwnerFirstName: string;
  businessOwnerLastName: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
  stateRegistered: string;
  status: string;
  pdfUrl?: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<{ [key: string]: File | null }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is not admin, redirect them
    if (!loading && (!user || !isAdmin)) {
      router.push("/sign-in");
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, loading]);

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, "businessRequests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: RequestData[] = [];
      snap.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as RequestData);
      });
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch business requests.");
    }
  };

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    try {
      const docRef = doc(db, "businessRequests", reqId);
      await updateDoc(docRef, { status: newStatus });

      // Fetch user email from the user document
      const requestDoc = await getDoc(docRef);
      const userId = requestDoc.data()?.userId;
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userEmail = userDoc.data()?.email;
      const userFirstName = userDoc.data()?.businessOwnerFirstName || "User";

      if (userEmail) {
        // Send email via API route with Authorization header
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Admin user not authenticated.");
        }
        const idToken = await currentUser.getIdToken();

        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            to: userEmail,
            subject: `Your Business Verification Request Status Updated`,
            text: `Hello ${userFirstName},\n\nYour business verification request has been updated to: ${newStatus}.\n\nThank you.`,
          }),
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Email API Error:", emailData.error);
          alert("Status updated, but failed to send email notification.");
        } else {
          console.log("Email sent:", emailData.message);
        }
      }

      alert(`Request "${reqId}" status updated to "${newStatus}".`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status.");
      alert("Failed to update request status. Please try again.");
    }
  };

  const handlePdfUpload = async (request: RequestData) => {
    const file = selectedPdf[request.id];
    if (!file) {
      alert("Please select a PDF file to upload.");
      return;
    }

    setUploading((prev) => ({ ...prev, [request.id]: true }));
    setError(null);

    try {
      // 1. Upload PDF to Firebase Storage
      const fileRef = ref(storage, `verificationLetters/${request.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // 2. Update Firestore document with PDF URL and status
      const docRef = doc(db, "businessRequests", request.id);
      await updateDoc(docRef, {
        pdfUrl: downloadURL,
        status: "completed",
      });

      // 3. Fetch user email from the user document
      const userDocRef = doc(db, "users", request.userId);
      const userDoc = await getDoc(userDocRef);
      const userEmail = userDoc.data()?.email;
      const userFirstName = userDoc.data()?.businessOwnerFirstName || "User";

      if (userEmail) {
        // 4. Get the admin's ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("Admin user not authenticated.");
        }
        const idToken = await currentUser.getIdToken();

        // 5. Send email via API route with Authorization header
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            to: userEmail,
            subject: `Your Business Verification is Complete`,
            text: `Hello ${userFirstName},\n\nYour business verification request has been completed. You can download your verification PDF here: ${downloadURL}.\n\nThank you.`,
          }),
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Email API Error:", emailData.error);
          alert("PDF uploaded, but failed to send email notification.");
        } else {
          console.log("Email sent:", emailData.message);
        }
      }

      alert(`PDF uploaded and request "${request.businessName}" marked as completed.`);
      fetchRequests();
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError("Failed to upload PDF. Please try again.");
      alert("Failed to upload PDF. Please try again.");
    }

    setUploading((prev) => ({ ...prev, [request.id]: false }));
  };

  const handleFileChange = (requestId: string, file: File | null) => {
    setSelectedPdf((prev) => ({ ...prev, [requestId]: file }));
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user || !isAdmin) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Business Name</th>
              <th className="border p-2">Owner</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">PDF</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="border p-2">{req.businessName}</td>
                <td className="border p-2">
                  {req.businessOwnerFirstName} {req.businessOwnerLastName}
                </td>
                <td className="border p-2">{req.businessType}</td>
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
                <td className="border p-2">
                  {/* Status Buttons */}
                  <div className="space-x-2 mb-2">
                    {req.status !== "completed" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req.id, "More information needed")}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          More Info
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, "pending")}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Set Pending
                        </button>
                      </>
                    )}
                  </div>

                  {/* PDF Upload */}
                  {req.status !== "completed" && (
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                        className="mb-2"
                      />
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                        onClick={() => handlePdfUpload(req)}
                        disabled={uploading[req.id]}
                      >
                        {uploading[req.id] ? "Uploading..." : "Upload PDF & Complete"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
