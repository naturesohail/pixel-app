import { NextResponse } from 'next/server';
import Bid from '@/app/lib/models/bidModel';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/userModel';

export async function GET(request: Request) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    let query = {};
    if (status !== 'all') {
      query = { status };
    }

    const bids = await Bid.find(query)
      .populate('userId', 'name email', User)
      .sort({ createdAt: -1 });

    return NextResponse.json(bids);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}