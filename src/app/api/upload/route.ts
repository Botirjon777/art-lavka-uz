import { NextRequest, NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const targetFolder = (formData.get("folder") as string) || "art-lavka/uploads";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Use the centralized upload utility (handles validation and compression)
    const result = await uploadToStorage(file, targetFolder);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to upload file" },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      url: result.url 
    });
    
  } catch (error: any) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
