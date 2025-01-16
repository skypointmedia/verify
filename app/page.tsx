// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to VerifyMyBiz</h1>
      <p className="mb-6">
        We provide verification letters for your business loan applications.
      </p>

      <Link href="/sign-in" className="bg-blue-600 text-white px-4 py-2 rounded">
        Sign In
      </Link>
      <span className="mx-2">or</span>
      <Link href="/sign-up" className="bg-green-600 text-white px-4 py-2 rounded">
        Create an Account
      </Link>
    </div>
  );
}
