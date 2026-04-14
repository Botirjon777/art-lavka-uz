import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Publication from "@/models/Publication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // 1. Increment clicks atomically
    const publication = await Publication.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!publication) {
      // If not found, redirect to home instead of 404 to be safe
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Redirect to target URL
    // Ensure targetUrl is absolute or relative to the site
    let destination = publication.targetUrl;
    if (!destination.startsWith("http") && !destination.startsWith("/")) {
      destination = "/" + destination;
    }

    const redirectUrl = destination.startsWith("http") 
      ? destination 
      : new URL(destination, request.url).toString();

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
