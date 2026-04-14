import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    
    // Default categories for backward compatibility
    const defaultCategories = [
      { id: "women", label: "Женский", status: "active" },
      { id: "men", label: "Мужской", status: "soon" },
      { id: "kids", label: "Детский", status: "soon" },
    ];

    if (!settings) {
      settings = await Settings.create({
        categories: defaultCategories,
      });
    } else if (!settings.categories || settings.categories.length === 0) {
      // Migrate from old categoryStatuses if it existed
      if (settings.categoryStatuses) {
        const migrated: any[] = [];
        const oldMap = settings.categoryStatuses as Map<string, string>;
        
        // Use default label mappings if possible
        const labelMap: Record<string, string> = {
          women: "Женский",
          men: "Мужской",
          kids: "Детский",
        };

        if (oldMap instanceof Map) {
           oldMap.forEach((status, id) => {
             migrated.push({ id, label: labelMap[id] || id, status });
           });
        }
        
        settings.categories = migrated.length > 0 ? migrated : defaultCategories;
      } else {
        settings.categories = defaultCategories;
      }
      await settings.save();
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
      // Basic update
      settings.categories = body.categories;
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
