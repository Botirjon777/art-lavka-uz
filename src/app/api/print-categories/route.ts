import { NextResponse } from "next/server";
import { getPrintCategories } from "@/features/admin/prints/actions/categories";

// Categories rarely change - cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    const categories = await getPrintCategories();
    return NextResponse.json(
      { success: true, data: categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
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
