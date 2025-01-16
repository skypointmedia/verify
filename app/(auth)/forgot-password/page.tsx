// app/(auth)/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError((err as Error).message);
      console.error("Reset error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleReset} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Reset Your Password</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {msg && <p className="text-green-600 mb-2">{msg}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Send Reset Email
        </button>

        <div className="mt-4 text-sm">
          <Link href="/sign-in" className="text-blue-600 underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
