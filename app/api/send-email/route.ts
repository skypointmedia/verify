// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await sendEmail({ to, subject, text, html });

    return NextResponse.json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error in send-email API:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
