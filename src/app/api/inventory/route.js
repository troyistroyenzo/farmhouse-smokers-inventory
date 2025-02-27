// app/api/inventory/route.js
import { getInventoryData } from '@/app/lib/googleSheetService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const inventoryData = await getInventoryData();
    return NextResponse.json({ data: inventoryData });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}