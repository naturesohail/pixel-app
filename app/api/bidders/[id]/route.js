
import User from "../../../lib/models/userModel";

import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import nodemailer from 'nodemailer';



export async function PATCH(request, { params }) {
  const { id } = await params;
  await connectDB();
  
  try {
    const { isActive } = await request.json();
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (isActive && !user.isActive) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.MAIL_PORT || '465'),
          secure: true, 
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        });

        
        
        const verificationMailOptions = {
          from: `"${process.env.APP_NAME || 'Platform'}" <${process.env.MAIL_USER}>`,
          to: user.email,
          subject: "Your Account Has Been Verified",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Account Verified - Welcome to Our Platform, ${user.name}!</h2>
              <p>We're pleased to inform you that your account has been successfully verified by our administration team.</p>
              
              <div style="background-color: #f0f8f0; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your account is now active!</h3>
                <p>You can now log in to access all features of our platform.</p>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Visit our login page</li>
                <li>Enter your email and password</li>
                <li>Start exploring all the features we offer</li>
              </ol>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #777;">Best regards,<br>The ${process.env.APP_NAME || 'Platform'} Team</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(verificationMailOptions);
        console.log("Verification email sent to:", user.email);
        
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
    }
    
    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("Update user status error:", err);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  const { id } =await params;
  await connectDB();
  
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}