import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";

/**
 * POST handler for creating a new channel in a server
 * @param req - The incoming request object containing channel details
 * @returns NextResponse with the created channel or error message
 */
export async function POST(req: Request) {
  try {
    // Get the current user's profile
    const profile = await currentProfile();
    
    // Extract channel name and type from request body
    const { name, type } = await req.json();
    
    // Get serverId from URL search params
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    // Check if user is authenticated
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate serverId exists
    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // Prevent creation of "general" channel since it's reserved
    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    // Find server and verify user has admin/moderator permissions
    const server = await prisma.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR] 
            }
          }
        }
      }
    });

    // Return error if server not found or user lacks permission
    if (!server) {
      return new NextResponse("Server not found", { status: 404 }); 
    }

    // Create the new channel
    const channel = await prisma.channel.create({
      data: {
        name,
        type,
        serverId,
        profileId: profile.id,
      }
    });

    // Return the created channel
    return NextResponse.json(channel);

  } catch (error) {
    // Log any errors and return 500 response
    console.log("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
