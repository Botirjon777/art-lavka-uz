import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

// Cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    await dbConnect();

    const gallery = await Gallery.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery",
      },
      { status: 500 }
    );
  }
}
