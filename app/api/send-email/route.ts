// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/nodemailer";
import { admin } from "@/lib/admin"; // Ensure Firebase Admin SDK is initialized

export async function POST(request: Request) {
  try {
    // Extract the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if the user is an admin
    if (!decodedToken.admin) {
      return NextResponse.json({ error: "Forbidden: Requires admin privileges" }, { status: 403 });
    }

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
