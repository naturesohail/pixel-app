import { NextRequest, NextResponse } from 'next/server';
import Settings from '@/app/lib/models/settingsModel';
import connectDB from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
 
    await connectDB();
    
    const settings = await Settings.findOne();
    
    return NextResponse.json({
      stripePK: settings?.stripePK || '',
      stripeSK: settings?.stripeSK || ''
    });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {

    await connectDB();
    
    const { stripePK, stripeSK } = await req.json();
    
    await Settings.findOneAndUpdate(
      {}, 
      { stripePK, stripeSK },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}