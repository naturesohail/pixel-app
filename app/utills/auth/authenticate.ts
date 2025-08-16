import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function authenticate() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value;
  if (!token) throw new Error("Unauthorized");
  return jwt.verify(token, process.env.JWT_SECRET!);
}