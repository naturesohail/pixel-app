"use server";
import { NextResponse } from "next/server";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import industryModel from "@/app/lib/models/industryModel";
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
   
    await connectDB();

    const {
      name,
      email,
      phone,
      password,
      industry,
      website,
      businessDescription,
      companyName
    } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(industry)) {
      return NextResponse.json({ error: "Invalid industry ID" }, { status: 400 });
    }

    const industryExists = await industryModel.findById(industry);
    if (!industryExists) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    if (!companyName || !name || !email || !password || !phone || !industry || !website || !businessDescription) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existEmail = await User.findOne({ email });

    if (existEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }


    const existPhone = await User.findOne({ phone });

    if (existPhone) {
      return NextResponse.json(
        { error: "Phone already exists" },
        { status: 400 }
      );
    }

    const admin = await User.findOne({ isAdmin: true });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUser = await User.create({
      name,
      email,
      phone,
      industry,
      website,
      businessDescription,
      password: hashedPassword,
      companyName: companyName || "",
    });



    const userMailOptions = {
      from: `${process.env.APP_NAME}`,
      to: email,
      subject: "Your Account Has Been Created ",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Platform, ${name}!</h2>
          <p>Thank you for registering with us.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Company:</strong> ${companyName}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Website:</strong> ${website}</li>
            </ul>
          </div>
          
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777;">Best regards,<br>The ${process.env.APP_NAME} Team</p>
          </div>
        </div>
      `,
    };

    const adminMailOptions = {
      from: `"${process.env.APP_NAME}"`,
      to: admin.email,
      subject: "New User Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New User Registration</h2>
          <p>A new user has registered on the platform and requires verification.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">User Details:</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Company:</strong> ${companyName}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Website:</strong> ${website}</li>
              <li><strong>Industry:</strong> ${industryExists.name}</li>
              <li><strong>Business Description:</strong> ${businessDescription}</li>
              <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777;">This is an automated notification from ${process.env.APP_NAME}.</p>
          </div>
        </div>
      `,
    };


    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    try {
      await Promise.all([
        transporter.sendMail(userMailOptions),
        transporter.sendMail(adminMailOptions)

        
      ]);
      console.log("Emails sent successfully to user and admin", `${admin.email} and the user emailis ${email}`);
      console.log("Emails sent");
    } catch (err) {
      console.error("Email sending failed:", err);
    }

    const userResponse = createUser.toObject();
    delete userResponse.password;

    


    return NextResponse.json({
      message: "User created successfully. Verification required.",
      user: userResponse
    }, { status: 200 });


  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration Failed", }, { status: 500 });
  }
}