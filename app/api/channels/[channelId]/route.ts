import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import {  MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";





export async function DELETE(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }


    
    // Update server by deleting the specified channel
    // Only ADMIN and MODERATOR roles can delete channels
    // The "general" channel cannot be deleted
    const server = await prisma.server.update({
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
      },
      data: {
        channels: {
            delete: {
                id: params.channelId,
                name: {
                    not: "general", // Prevent deletion of general channel
                }
            }
        }
      },
    });


    return NextResponse.json(server); // Return the updated server to the client
    // return new NextResponse(null, { status: 204 }); // Return a 204 status code to indicate success

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



// EDIT CHANNEL ROUTE *******************
export async function PATCH(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await request.json();


    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }


    if(name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    

    
    // Update server by deleting the specified channel
    // Only ADMIN and MODERATOR roles can delete channels
    // The "general" channel cannot be deleted
    const server = await prisma.server.update({
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
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              }
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });


    return NextResponse.json(server); // Return the updated server to the client
    // return new NextResponse(null, { status: 204 }); // Return a 204 status code to indicate success

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
