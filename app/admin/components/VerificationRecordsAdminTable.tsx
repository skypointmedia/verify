// app/admin/components/VerificationRecordsAdminTable.tsx

"use client";

import React, { useEffect, useState } from "react";
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

// Heroicons (outline variants)
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  ArrowUpOnSquareIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface RequestData {
  id: string;
  userId: string;
  businessName: string;
  ownerFullName: string;
  legalStructure: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  ein: string;
  businessRegistrationNumber: string;
  stateOfRegistration: string;
  status: string;
  pdfUrl?: string;
  createdAt?: any;
}

// Mapping of State (spelled out) → Business Lookup URL
const stateLookupURLs: Record<string, string> = {
  // ... [Your existing state lookup URLs]
};

export default function VerificationRecordsAdminTable() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, "businessRequests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: RequestData[] = [];
      snap.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<RequestData, "id">) });
      });
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch business requests.");
    }
  };

  const handleStatusChange = async (req: RequestData, newStatus: string) => {
    // If trying to set status to "Verified" but there's no PDF, block.
    if (newStatus === "verified" && !req.pdfUrl) {
      alert("You must upload a Verification Letter PDF before marking as Verified.");
      return;
    }

    const confirmMsg = `Are you sure you want to set the status to "${newStatus}" for: "${req.businessName}"?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const docRef = doc(db, "businessRequests", req.id);
      await updateDoc(docRef, { status: newStatus });

      // Optionally send email to the user
      const requestDoc = await getDoc(docRef);
      const userId = requestDoc.data()?.userId;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        const userEmail = userDoc.data()?.email;
        const userFullName = userDoc.data()?.ownerFullName || "User";
        const userFirstName = userFullName.split(" ")[0];

        if (userEmail) {
          // Admin user ID token
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
          }
        }
      }

      alert(`Status updated to "${ (newStatus) }".`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status.");
      alert("Failed to update request status. Please try again.");
    }
  };

  const handleFileChange = async (requestId: string, file: File | null) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [requestId]: true }));
    setError(null);

    try {
      // 1. Upload PDF to Firebase Storage
      const fileRef = ref(storage, `verificationLetters/${requestId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // 2. Update Firestore document with PDF URL and set status to 'Verified'
      const docRef = doc(db, "businessRequests", requestId);
      await updateDoc(docRef, {
        pdfUrl: downloadURL,
        status: "verified",
      });

      // 3. Optionally send email to user to notify about the new letter
      const requestDoc = await getDoc(docRef);
      const userId = requestDoc.data()?.userId;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        const userEmail = userDoc.data()?.email;
        const userFullName = userDoc.data()?.ownerFullName || "User";
        const userFirstName = userFullName.split(" ")[0];

        if (userEmail) {
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
              subject: `Your Business Verification PDF is Available`,
              text: `Hello ${userFirstName},\n\nA new verification PDF has been uploaded for your business: ${requestDoc.data()?.businessName}.\n\nDownload here: ${downloadURL}\n\nThank you.`,
            }),
          });

          const emailData = await emailResponse.json();
          if (!emailResponse.ok) {
            console.error("Email API Error:", emailData.error);
            alert("PDF uploaded, but failed to send email notification.");
          }
        }
      }

      alert(`PDF uploaded for "${requestDoc.data()?.businessName}". Status set to "Verified".`);
      fetchRequests();
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError("Failed to upload PDF. Please try again.");
      alert("Failed to upload PDF. Please try again.");
    }

    setUploading((prev) => ({ ...prev, [requestId]: false }));
  };

  const getLookupUrl = (stateName: string) => {
    // Return the corresponding lookup URL or default to Google
    return stateLookupURLs[stateName] || "https://www.google.com";
  };

  return (
    <div className="overflow-x-auto mt-6">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="min-w-full table-auto bg-white shadow-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Business Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Owner Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Business Type
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              State of Registration
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Letter
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-800">{req.businessName}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{req.ownerFullName}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{req.legalStructure}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{req.stateOfRegistration}</td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {/* Status Dropdown */}
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={req.status}
                  onChange={(e) => handleStatusChange(req, e.target.value)}
                >
                  <option value="more information needed">More information needed</option>
                  <option value="in progress">In Progress</option>
                  <option value="archived">Archived</option>
                  <option value="verified">Verified</option>
                </select>
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {req.pdfUrl ? (
                  <a
                    href={req.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download Now
                  </a>
                ) : (
                  "Unavailable"
                )}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                <div className="flex space-x-3 items-center">
                  {/* State Business Lookup */}
                  <a
                    href={getLookupUrl(req.stateOfRegistration)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                    title="State Business Lookup"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </a>

                  {/* View Business Request Detail */}
                  <a
                    href={`/business-request/${req.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                    title="View Request Detail"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </a>

                  {/* Create Verification Letter (placeholder) */}
                  <button
                    onClick={() => {
                      // Placeholder: Implement actual navigation or functionality
                      alert("This will navigate to another route (Coming soon).");
                    }}
                    className="text-gray-600 hover:text-gray-900"
                    title="Create Verification Letter"
                  >
                    <DocumentIcon className="w-5 h-5" />
                  </button>

                  {/* Upload Verification Letter */}
                  <label
                    htmlFor={`file-upload-${req.id}`}
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                    title="Upload Verification Letter"
                  >
                    <ArrowUpOnSquareIcon className="w-5 h-5" />
                  </label>
                  <input
                    id={`file-upload-${req.id}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
