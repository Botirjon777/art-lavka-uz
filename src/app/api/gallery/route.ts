import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export const dynamic = "force-dynamic";
export const revalidate = 7200;

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [gallery, total] = await Promise.all([
      Gallery.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Gallery.countDocuments({}),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        success: true,
        data: gallery,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=14400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery",
      },
      { status: 500 },
    );
  }
}
