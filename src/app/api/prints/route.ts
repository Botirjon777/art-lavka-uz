import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Print from "@/models/Print";

// Cache for 2 hours
export const revalidate = 7200;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { active: true };
    if (category && category !== "all") {
      query.category = category;
    }

    // Fetch prints with pagination - only select fields needed for UI
    const [prints, total] = await Promise.all([
      Print.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name frontImage frontImagePreview backImage category translations active"),
      Print.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: prints,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching prints:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch prints",
      },
      { status: 500 },
    );
  }
}
