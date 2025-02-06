
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
        const { directMessageId, conversationId } = req.query; 
        

        // Get message content from request body (for PATCH)
        const { content } = req.body;
        
        // Validate required data is present
        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!conversationId) {
            return res.status(400).json({ error: "Conversation ID is required" });
        } 


        /**
         * Find the conversation and verify the current user is a participant
         * 
         * Queries the conversation by ID and checks that either memberOne or memberTwo 
         * matches the authenticated profile ID. Includes the full profile data for
         * both members.
         * 
         * @param conversationId - ID of the conversation to find
         * @param profile.id - ID of the authenticated user's profile
         * @returns Conversation with memberOne and memberTwo profile data if found
         */
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        profile: true
                    }
                },
                memberTwo: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        
  

        // Get the member record for the current user by checking which member's profileId
        // matches the authenticated user's profile.id. If memberOne matches, return
        // memberOne, otherwise return memberTwo.
        const member = conversation.memberOne.profileId === profile.id ? 
            conversation.memberOne : conversation.memberTwo;


        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        } 

        
        /**
         * Find the direct message and verify permissions
         * 
         * Queries the direct message by ID and conversation ID, including the 
         * member and profile data. Checks that the message exists and isn't deleted.
         * Verifies the current user has permission to modify the message.
         * 
         * @param directMessageId - ID of the message to find
         * @param conversationId - ID of the conversation containing the message
         * @param member - The authenticated member making the request
         * @returns DirectMessage with member and profile data if found and authorized
         */
        let directMessage = await prisma.directMessage.findFirst({
            where: {
                id: directMessageId as string,
                conversationId: conversationId as string,
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
        if (!directMessage || directMessage.deleted) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Check user permissions
        const isMessageOwner = directMessage.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) {
            return res.status(401).json({ error: "Unauthorized" });
        }



        // Handle DELETE request
        if(req.method === "DELETE") {
            // Soft delete - update message content and mark as deleted
            directMessage = await prisma.directMessage.update({
                where: {
                    id: directMessageId as string,
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
            directMessage = await prisma.directMessage.update({
                where: {
                    id: directMessageId as string,
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
        const updateKey = `chat:${conversation.id}:messages:update`;
        res?.socket?.server?.io?.emit(updateKey, directMessage);

        // Return updated message
        return res.status(200).json(directMessage);

    } catch (error) {
        console.log("[MESSAGE_ID_ERROR]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}