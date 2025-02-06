import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = params; // Get the serverId from the params

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) { // If the serverId is not provided, return an error
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    // Delete the member from the server and decrement member count
    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile.id // Prevent server owner from leaving
        },
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id // Delete the member from the server
          }
        }
      }
    });

    return NextResponse.json(server);

  } catch (error) {
    console.log("[SERVER_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

