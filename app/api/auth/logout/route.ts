"use server";

import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    const expiredCookie = serialize("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Logout successful" }), {
      status: 200,
      headers: {
        "Set-Cookie": expiredCookie,
      },
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
