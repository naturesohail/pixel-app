import { NextResponse } from 'next/server';
import AuctionNotificationService from '../../services/auctionNotificationService';

export async function GET() {

  try {
    const service = new AuctionNotificationService();
    await service.processEndedAuctions();
    await service.processScheduledNotifications();

    return NextResponse.json({ success: true, message: "Cron executed" });
  }
   
  catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
