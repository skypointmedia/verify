import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "VerifyMyBiz",
  description: "Business Verification Letters Made Simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
