import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/userModel";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Password reset email sent if account exists" },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(resetTokenExpiry);
    await user.save();
    

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,      
      port: parseInt(process.env.MAIL_PORT || "465"), 
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    await transporter.sendMail({
      from: `"Pixel App Support" <${process.env.MAIL_FROM}>`, 
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
          <div style="background: linear-gradient(to right, #4f46e5, #6366f1); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Pixel App</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #4f46e5;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password for your Pixel App account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #4f46e5; 
                        color: white; text-decoration: none; border-radius: 6px; font-weight: bold;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p>This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, 
               please ignore this email or contact support.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 14px; color: #666;">
              <p>Need help? Contact our support team at <a href="mailto:support@pixelapp.com" style="color: #4f46e5;">support@pixelapp.com</a></p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { 
        message: "Failed to send reset email. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}