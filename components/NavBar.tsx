// components/NavBar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function NavBar() {
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      {/* Left Side: Branding/Home */}
      <div>
        <Link href="/" className="font-bold text-xl">
          VerifyMyBiz
        </Link>
      </div>

      {/* Right Side: Links */}
      <div className="space-x-4">
        {/* If user is signed in */}
        {user && (
          <>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-gray-300">
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
            >
              Sign Out
            </button>
          </>
        )}

        {/* If user is NOT signed in */}
        {!user && (
          <>
            <Link href="/sign-in" className="hover:text-gray-300">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-gray-300">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
