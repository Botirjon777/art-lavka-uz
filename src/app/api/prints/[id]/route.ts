import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Print from "@/models/Print";

/**
 * Single print lookup — the v2 product page is addressable by print id, so a
 * cold load needs to resolve one print without pulling the whole catalogue.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid print id" },
        { status: 400 }
      );
    }

    await dbConnect();

    const print = await Print.findOne({ _id: id, active: true }).select(
      "name frontImage frontImagePreview backImage category translations active"
    );

    if (!print) {
      return NextResponse.json(
        { success: false, error: "Print not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: print },
      {
        headers: {
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=14400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching print:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch print" },
      { status: 500 }
    );
  }
}
