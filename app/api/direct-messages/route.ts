import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DirectMessage } from "@prisma/client";

const MESSAGES_BATCH = 10;




/**
 * GET handler for fetching direct messages in a conversation with pagination support
 * 
 * @param req - The incoming request containing query parameters:
 *   - cursor: ID of the last message from previous batch for pagination
 *   - conversationId: ID of the conversation to fetch messages from
 * 
 * @returns NextResponse containing:
 *   - items: Array of DirectMessage objects with member and profile data
 *   - nextCursor: ID of last message in current batch if more messages exist
 * 
 * @throws
 *   - 401 if user is not authenticated
 *   - 400 if conversationId is missing
 *   - 500 for internal server errors
 */
export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID is required", { status: 400 });
    }

    let messages: DirectMessage[] = [];

    // Fetch messages with cursor-based pagination
    if (cursor) {
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1, // Skip cursor message to avoid duplication
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: "desc", // Most recent first
        },
        cursor: {
          id: cursor,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else {
      // Initial fetch without cursor
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Set up cursor for next batch if needed
    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}