import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe("sk_test_51R7u7XFWt2YrxyZwTMNvSl4gAgizA6e01XBp4sQGhLFId0qKAH1QdI2jFhlaFtHU9sMuPNHh8XvhB7DDQlfCnYiw00GsRA8POr", {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: Request, { params }:  any ) {
  try {
    const { session_id } =  await params;


    if (!session_id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
