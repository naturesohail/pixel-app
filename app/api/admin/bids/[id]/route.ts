import { NextResponse } from 'next/server';
import Bid from '@/app/lib/models/bidModel';
import dbConnect from '@/app/lib/db';

export async function PUT(request: Request, { params }: { params:any }) {
  await dbConnect();
  
  const { status } = await request.json();

  try {
    const bid = await Bid.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bid);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update bid' },
      { status: 500 }
    );
  }
}