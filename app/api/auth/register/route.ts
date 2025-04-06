"use server"
import { NextResponse } from "next/server";
import User from "@/app/lib/models/userModel";
import connectDB from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { name, email,phone, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, Email, and Password are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "Email Already Exists" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const createUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword, 
            roles: "users"
        });

        return NextResponse.json({ createUser }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
