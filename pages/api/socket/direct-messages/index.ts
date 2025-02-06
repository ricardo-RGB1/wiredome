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
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get authenticated profile and request data
    const profile = await currentProfilePage(req);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    // Validate required fields
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
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
          // OR is a logical operator that returns true if at least one of the conditions is true
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Get the member record for the current user by checking which member's profileId
    // matches the authenticated user's profile.id. If memberOne matches, return
    // memberOne, otherwise return memberTwo.
    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
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
    const message = await prisma.directMessage.create({
      data: {
        content,
        fileUrl: fileUrl,
        conversationId: conversationId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Broadcast message to channel subscribers using the correct format
    const channelKey = `chat:${conversationId}:messages`; // Updated to match client format
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_ERROR]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
