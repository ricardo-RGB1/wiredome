import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";


// *******************
// This route handles the role change for a member in a server.
// *******************
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    // get the current user
    const profile = await currentProfile();
    // get the server id from the request
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();
    // get the server id from the search params
    const serverId = searchParams.get("serverId");
    // check if the user is a member of the server
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // check if the server id is missing
    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }
    // check if the member id is missing
    if (!params.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    // This section updates the role of a member in a server
    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId, // This line specifies the member ID to update
              profileId: {
                not: profile.id, // This line ensures the current user is not the member being updated
              },
            },
            data: { role }, // This line updates the role of the member
          },
        },
      },
      include: { // include the members in the server
        members: { 
          include: { // the members will include the profile of the member and the role of the member 
            profile: true, // This line includes the member's profile in the response
          },
          orderBy: {
            role: "asc", // This line orders the members by their role in ascending order
          },
        },
      },
    });

    // return the updated server
    return NextResponse.json(server);
  } catch (error) {
    console.error("MEMBER_ID_PATCH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


// *******************
// This route handles the DELETION of a member from a server.
// *******************
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    // get the current user
    const profile = await currentProfile();

    // get the server id from the request
    const { searchParams } = new URL(req.url);

    // get the server id value from the search params
    const serverId = searchParams.get("serverId");

    // check if the user is a member of the server
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // check if the server id is missing
    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    // check if the member id is missing
    if (!params.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    // This section deletes a member from a server
    const server = await prisma.server.update({
      where: { // This line specifies the server to update
        id: serverId,
        profileId: profile.id,
      },
      data: { // This line specifies the data to update
        members: {
          deleteMany: { // This line specifies the members to delete
            id: params.memberId, // This line specifies the member ID to delete
            profileId: {
              not: profile.id, // This line ensures the current user is not the member being deleted
            }, // on the backend, we are checking if the member is not the current user
          },
        },
      },
      include: { // This line includes the members in the server
        members: { 
          include: { 
            profile: true, 
          },
          orderBy: {
            role: "asc", // This line orders the members by their role in ascending order
          },
        },
      },
    });

    // return the updated server
    return NextResponse.json(server);

  } catch (error) {
    console.error("MEMBER_ID_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}