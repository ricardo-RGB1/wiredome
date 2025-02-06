import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";





/**
 * Updates the invite code for a server
 * 
 * @param req - The HTTP request object
 * @param params - Object containing the serverId parameter
 * @param params.serverId - The unique identifier of the server to update
 * @returns A JSON response containing the updated server data, or an error response
 *
 * This endpoint:
 * 1. Verifies the user is authenticated with a valid profile
 * 2. Validates the serverId parameter is present
 * 3. Updates the server's invite code with a new UUID if the user owns the server
 * 4. Returns the updated server object
 */
export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }  
) {
    try {
       const profile = await currentProfile(); 

       if (!profile) {
        return new NextResponse("Unauthorized", { status: 401 }); 
       }
       
       if(!params.serverId) {
        return new NextResponse("Server ID Missing", { status: 400 });
       }

       // update the server with the new invite code
      const server = await prisma.server.update({
        where: {
            id: params.serverId,
            profileId: profile.id,
        },
        data: {
            inviteCode: uuidv4(),
        },
      }); 

      return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_INVITE_CODE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
