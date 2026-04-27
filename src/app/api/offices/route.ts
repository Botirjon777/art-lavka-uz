import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Office from "@/models/Office";

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    await dbConnect();
    const offices = await Office.find({ isActive: true }).sort({ region: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, data: offices });
  } catch (error: any) {
    console.error("Error in public offices API:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch offices" }, { status: 500 });
  }
}
