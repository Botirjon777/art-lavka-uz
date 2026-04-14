import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({
        categoryStatuses: {
          women: "active",
          men: "soon",
          kids: "soon",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.categoryStatuses = body.categoryStatuses;
      await settings.save();
    } else {
      settings = await Settings.create(body);
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
