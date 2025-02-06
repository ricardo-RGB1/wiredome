

import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// ********************
// This API endpoint is used to update the server information when the user edits their server
// ********************
export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }


        const server = await prisma.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id, // this is to ensure that the user is the owner of the server
            },
            data: {
                name: name,
                imageUrl: imageUrl,
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


// ********************
// This API endpoint is used to delete a server
// ********************
export async function DELETE(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }


        const server = await prisma.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id, // this is to ensure that the user is the owner of the server
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}