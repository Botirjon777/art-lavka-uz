import { NextResponse } from "next/server";
import { getPrintCategories } from "@/features/admin/prints/actions/categories";

// Cache for 2 hours
export const revalidate = 7200;

export async function GET() {
  try {
    const categories = await getPrintCategories();
    return NextResponse.json(
      { success: true, data: categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=14400",
        },
      }
    );
  } catch (error: any) {
    console.error("[API] Error fetching print categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
