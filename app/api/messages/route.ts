import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Message } from "@prisma/client";

const MESSAGES_BATCH = 10;





/**
 * GET handler for fetching paginated messages from a channel
 * 
 * This handler:
 * - Validates the user is authenticated
 * - Checks for required channelId parameter
 * - Supports cursor-based pagination
 * - Fetches messages in batches with member and profile data
 * - Returns messages array and next cursor for pagination
 *
 * @param req - HTTP request object containing:
 *   - cursor (optional) - ID of last message from previous batch
 *   - channelId - ID of channel to fetch messages from
 * @returns JSON response with:
 *   - items: Array of messages with member/profile data
 *   - nextCursor: ID for fetching next batch, or null if no more
 * @throws
 *   - 401 if user not authenticated
 *   - 400 if channelId missing
 *   - 500 for server errors
 */
export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url); // get the search params from the url
    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }

    let messages: Message[] = []; // initialize an empty array of messages

    // if there is a cursor, fetch the messages from the database
    // Fetch paginated messages after the cursor
    // - Takes MESSAGES_BATCH number of messages
    // - Skips first message to avoid duplicate
    // - Orders by creation date descending (newest first)
    // - Uses cursor-based pagination
    // - Includes member and profile data
    // - what is a cursor? it is the id of the last message in the previous batch
    if (cursor) {
      messages = await prisma.message.findMany({
        take: MESSAGES_BATCH, // Number of messages to fetch
        skip: 1, // Skip cursor message to avoid duplicate
        where: {
          channelId: channelId as string, // Filter by channel ID
        },
        orderBy: {
          createdAt: "desc", // Newest messages first
        },
        cursor: {
          id: cursor, // Use message ID as pagination cursor
        },
        include: {
          member: {
            include: {
              profile: true, // Include nested profile data
            },
          },
        },
      });
    } else {
      // if there is no cursor, fetch the messages from the database
      messages = await prisma.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId: channelId as string,
        },
        include: {
          // include the member and the profile
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

    let nextCursor = null; // initialize the next cursor to null
    if (messages.length === MESSAGES_BATCH) {
      // if the number of messages is equal to the batch size, then there is a next cursor
      nextCursor = messages[MESSAGES_BATCH - 1].id; // the next cursor is the id of the last message in the batch
    }

    // return the messages and the next cursor
    return NextResponse.json({ 
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
