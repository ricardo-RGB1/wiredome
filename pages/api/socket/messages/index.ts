import { NextApiRequest } from "next"; 
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePage } from "@/lib/current-profile-pages";
import { prisma } from "@/lib/db"; 


/**
 * API handler for creating new messages in a channel
 * 
 * @param req - Next.js API request object containing message data
 * @param res - Next.js API response object with Socket.IO capabilities
 * @returns Response with created message or error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    // Only allow POST requests
    if(req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" }); 
    } 

    try {
        // Get authenticated profile and request data
        const profile = await currentProfilePage(req); 
        const { content, fileUrl } = req.body;
        const { serverId, channelId } = req.query;

        // Validate required fields
        if(!profile) {
            return res.status(401).json({ error: "Unauthorized" }); 
        }

        if(!serverId) {
            return res.status(400).json({ error: "Server ID is required" }); 
        }

        if(!channelId) {
            return res.status(400).json({ error: "Channel ID is required" }); 
        }

        if(!content) {
            return res.status(400).json({ error: "Content is required" }); 
        }

        // Find server and verify member access
        const server = await prisma.server.findUnique({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id,
                    }, 
                }, 
            }, 
            include: {
                members: true,
            }, 
        }); 

        if(!server) {
            return res.status(404).json({ error: "Server not found" }); 
        } 

        // Verify channel exists in server
        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            }
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        // Get member record
        const member = server.members.find((member) => member.profileId == profile.id); 

        if(!member) { 
            return res.status(404).json({ error: "Member not found" });
        }

        
        /**
         * Create a new message in the database with:
         * - Message content and optional file URL
         * - Channel and member relationships
         * - Included member profile data for response
         * 
         * @param content - The text content of the message
         * @param fileUrl - Optional URL to an attached file
         * @param channelId - ID of the channel the message belongs to
         * @param memberId - ID of the member who created the message
         * @returns Created message with member and profile data
         */
        const message = await prisma.message.create({
            data: {
                content,
                fileUrl: fileUrl,
                channelId: channelId as string,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        });

        // Broadcast message to channel subscribers
        const channelKey = `chat:${channelId}:messages`; 
        res?.socket?.server?.io?.emit(channelKey, message);

        return res.status(200).json(message);

    } catch (error) {
        console.log("[MESSAGES_ERROR]", error); 
        return res.status(500).json({ error: "Internal Error" }); 
    }
}
