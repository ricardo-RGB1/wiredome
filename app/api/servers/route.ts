import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

// THIS IS THE API ROUTE FOR CREATING A NEW SERVER
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, imageUrl } = body;


    const profile = await currentProfile();
  

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // create a new server in the database
    const server = await prisma.server.create({
      data: {
        name,
        imageUrl,
        profileId: profile.id,
        inviteCode: uuidv4(), // generate a unique invite code for the server
        channels: {
          // create a default channel for the server
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          // create a default member for the server and set the role to admin
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });

    return NextResponse.json(server); // return the server as a json response
  } catch (error) {
    console.log(
      "[SERVERS_POST]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return new NextResponse("Internal Error", { status: 500 });
  }
}
