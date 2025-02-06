
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePage } from "@/lib/current-profile-pages";
import { prisma } from "@/lib/db";
import { MemberRole } from "@prisma/client";



/**
 * API handler for updating and deleting messages in a channel
 * 
 * @param req - Next.js API request object containing:
 *   - query params: messageId, serverId, channelId
 *   - body: content (for PATCH requests)
 *   - method: PATCH or DELETE
 * @param res - Next.js API response object with Socket.IO capabilities
 * @returns Response with updated/deleted message or error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    // Only allow PATCH (edit) and DELETE methods
    if (req.method !== "PATCH" && req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Get authenticated user profile
        const profile = await currentProfilePage(req);  
        
        // Extract params from URL query string
        const { messageId, serverId, channelId } = req.query;
        
        // Get message content from request body (for PATCH)
        const { content } = req.body;
        
        // Validate required data is present
        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!serverId) {
            return res.status(400).json({ error: "Server ID is required" });
        } 

        if (!channelId) {
            return res.status(400).json({ error: "Channel ID is required" });
        } 

        // Find server and verify user membership
        const server = await prisma.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: { 
                        profileId: profile.id, // User must be a member
                    }
                }
            },
            include: {
                members: true, // Include members for role checking
            }
        })

        if (!server) {
            return res.status(404).json({ error: "Server not found" }); 
        } 

        // Verify channel exists and belongs to server
        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            }
        })

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        // Get user's member record from server
        const member = server.members.find((member) => member.profileId === profile.id);

        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        } 

        // Find message and include member/profile data
        let message = await prisma.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    }
                }
            }
        })

        // Verify message exists and isn't already deleted
        if (!message || message.deleted) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Check user permissions
        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Handle DELETE request
        if(req.method === "DELETE") {
            // Soft delete - update message content and mark as deleted
            message = await prisma.message.update({
                where: {
                    id: messageId as string,
                },
                data: {
                    fileUrl: null, // Remove file attachment
                    content: "This message has been deleted.",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        // Handle PATCH request
        if(req.method === "PATCH") {
            // Only message owner can edit
            if(!isMessageOwner) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            // Update message content
            message = await prisma.message.update({
                where: {
                    id: messageId as string,
                },
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        }

        // Emit socket event to update clients
        const updateKey = `chat:${channelId}:messages:update`;
        res?.socket?.server?.io?.emit(updateKey, message);

        // Return updated message
        return res.status(200).json(message);

    } catch (error) {
        console.log("[MESSAGE_ID_ERROR]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}