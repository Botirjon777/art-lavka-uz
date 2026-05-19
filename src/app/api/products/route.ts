import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

// Cache for 2 hours
export const revalidate = 7200;

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ active: true })
      .sort({ createdAt: -1 })
      .select("name translations image model category colors sizes stock active isDefault sizeTable oldPrice promoPrice price weight");

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
