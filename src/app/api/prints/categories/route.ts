import { NextResponse } from "next/server";
import { getPrintCategories } from "@/features/admin/prints/actions/categories";

export async function GET() {
  try {
    const categories = await getPrintCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("[API] Error fetching print categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
