"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PageHeading from "@/components/PageHeading";
import VerificationRecordsAdminTable from "./components/VerificationRecordsAdminTable";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not admin, redirect them
    if (!loading && (!user || !isAdmin)) {
      router.push("/sign-in");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <p className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">Loading...</p>
    );
  }

  // If user is not an admin, you can return null or a custom "unauthorized" message/component
  if (!user || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PageHeading pageHeading="Admin Dashboard" />
      <VerificationRecordsAdminTable />
    </div>
  );
}
