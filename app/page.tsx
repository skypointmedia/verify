// app/page.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
  <>
    <>
     <section className="max-w-6xl mx-auto py-20 px-5 my-8">
      <h2 className="text-3xl font-bold text-center mb-6">Self-Employment Business Verification Letters</h2>
      <p className="text-lg mb-6 text-center">We specialize in fast, reliable, and affordable self-employment business verification letters tailored to meet the needs of self-employed professionals.</p>
  
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">IRS-Recognized</h3>
          <p>With our PTIN number from the IRS, we are fully authorized to issue official verification letters.</p>
        </div>
  
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Fast Turnaround</h3>
          <p>Receive your personalized verification letter within 24-48 hours, so you never miss a deadline.</p>
        </div>
  
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Affordable Pricing</h3>
          <p>Get the documentation you need without breaking the bank. Our services are competitively priced.</p>
        </div>
      </div>
    </section>
  

    <section className="bg-gray-200 py-20 my-8">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <h2 className="text-3xl font-bold mb-6">About VerifyMy.Biz</h2>
        <p className="text-lg mb-6">At VerifyMy.Biz, our mission is to help self-employed professionals prove their business status with ease. With years of experience and an IRS-recognized PTIN number, we provide accurate and timely verification letters that meet the needs of banks, landlords, and other institutions.</p>
      </div>
    </section>
  

    <section className="max-w-6xl mx-auto py-20 px-5 my-8">
      <h2 className="text-3xl font-bold text-center mb-6">Success Stories</h2>
  
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Emily Roberts</h3>
          <p>Successfully secured a mortgage with our verification letter.</p>
        </div>
  
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">James Miller</h3>
          <p>Leased their dream apartment by proving self-employment status.</p>
        </div>
  
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Sophia Harris</h3>
          <p>Secured a business loan using our official documentation.</p>
        </div>
      </div>
    </section>
  
  
    <section className="bg-gray-200 py-20 my-8">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
  
        <div className="space-y-6">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">What is a self-employment business verification letter?</h3>
            <p className="text-center">A document verifying your self-employment status, income, and business operations, often required for loans, leases, and other transactions.</p>
          </div>
  
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">How quickly can I get my verification letter?</h3>
            <p className="text-center">We offer fast turnaround times, and you can receive your letter within 24-48 hours.</p>
          </div>
  
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">What information is included in the letter?</h3>
            <p className="text-center">The letter includes your name, business name, income details, and confirmation of your self-employment status, along with any other required details.</p>
          </div>
        </div>
      </div>
    </section>
  

    <section className="py-20 my-8">
      <div className="max-w-6xl mx-auto px-5">
        <ContactForm />
      </div>
    </section>
    </>  
  </>
  );
}
