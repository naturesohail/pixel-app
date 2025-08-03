import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const getSession = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value;
  
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return { user: decoded };
  } catch (error) {
    return null;
  }
};