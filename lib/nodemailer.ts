// lib/nodemailer.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: "Gmail", // Replace with your email provider if different
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD, // For Gmail, use an App Password
  },
});

export const sendEmail = async (options: EmailOptions) => {
  const mailOptions = {
    from: process.env.EMAIL_ACCOUNT,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
