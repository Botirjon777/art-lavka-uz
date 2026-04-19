import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Promotion from "@/models/Promotion";

export async function GET() {
  try {
    await dbConnect();
    
    const now = new Date();
    
    // Fetch active promotions within the date range
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(promotions))
    });
  } catch (error: any) {
    console.error("Error in promotions API:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch promotions"
    }, { status: 500 });
  }
}
