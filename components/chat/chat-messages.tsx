"use client";

import { format } from "date-fns";
import { useChatQuery } from "@/hooks/use-chat-query";
import { ChatWelcome } from "./chat-welcome";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef } from "react";
import { Member, Message, Profile } from "@prisma/client";
import { ChatItem } from "./chat-item";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

interface ChatMessagesProps {
  name: string;
  member: any;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, any>;
  paramKey: string;
  paramValue: string;
  type: "channel" | "conversation";
}

const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

// This type is used to ensure that the messages have a member and a profile
type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

/**
 * ChatMessages component handles displaying messages in a chat interface
 *
 * This component:
 * - Fetches and displays messages using the useChatQuery hook
 * - Shows loading states while messages are being retrieved
 * - Handles error states when messages can't be loaded
 * - Supports infinite scrolling pagination
 * - Displays welcome message when chat is empty
 *
 * @param name - Name of the channel or conversation
 * @param member - Current member object with user details
 * @param chatId - Unique identifier for the chat
 * @param apiUrl - API endpoint for fetching messages
 * @param socketUrl - WebSocket endpoint for real-time updates
 * @param socketQuery - Query parameters for WebSocket connection
 * @param paramKey - Key used in API requests ('channelId' or 'conversationId')
 * @param paramValue - Value associated with paramKey
 * @param type - Type of chat ('channel' or 'conversation')
 */
export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  /**
   * Socket event keys for real-time chat updates
   *
   * queryKey - Unique identifier for the chat's query cache
   * addKey - Socket event name for new message notifications
   * updateKey - Socket event name for message update notifications
   *
   * These keys are constructed using the chatId to ensure events
   * are scoped to the specific chat channel/conversation.
   */
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  // Refs for scrolling functionality:
  // chatRef - References the main chat container for infinite scroll
  // bottomRef - References the bottom of the chat for auto-scrolling to newest messages
  const chatRef = useRef<HTMLDivElement>(null!);
  const bottomRef = useRef<HTMLDivElement>(null!);

  // Import the useChatQuery hook which handles:
  // - Pagination
  // - Real-time updates via WebSocket
  // - Loading states
  const { data, status, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey: paramKey as "channelId" | "conversationId",
      paramValue,
    });

  useChatSocket({
    queryKey,
    addKey,
    updateKey,
  });

  // This hook is used to scroll to the bottom of the chat when new messages are received
  useChatScroll({
    chatRef,
    bottomRef,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage, // shouldLoadMore is a boolean that determines if more messages can be loaded
    loadMore: fetchNextPage, // loadMore is a function that loads more messages
    count: data?.pages?.[0]?.items?.length ?? 0, // count is the number of messages in the first page
  });

  // Show loading spinner while initially fetching messages
  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="size-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  // Show error state if no messages could be loaded
  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="size-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          An error occurred while fetching messages. Please try again later.
        </p>
      </div>
    );
  }

  /**
   * Renders the chat messages interface with:
   * - Scrollable container for messages (chatRef)
   * - Welcome message at the top
   * - Messages displayed in reverse chronological order
   * - Infinite scroll pagination support (hasNextPage, fetchNextPage, isFetchingNextPage)
   *
   * The messages are rendered in a flex-col-reverse layout to enable:
   * - Proper scrolling behavior
   * - Most recent messages at the bottom
   * - Correct infinite scroll loading of older messages
   *
   * Each message is rendered using ChatItem component with:
   * - Message content and metadata
   * - Member/profile information
   * - Timestamps and update status
   * - Socket connection details for real-time updates
   *
   * @returns JSX element containing the chat messages interface
   */
  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {/* Show load more button if there are more messages to fetch */}
      {hasNextPage && (
        <div className="flex justify-center">
          {/* Show loading spinner while fetching next page */}
          {isFetchingNextPage ? (
            <Loader2 className="size-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      {/* Messages container with reverse column layout for proper scrolling */}
      <div className="flex flex-col-reverse mt-auto">
        {/* Map through message pages from infinite query */}
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group?.items?.map((message: MessageWithMemberWithProfile) => (
              <ChatItem
                key={message.id}
                id={message.id}
                content={message.content}
                member={message.member}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                currentMember={member}
                isUpdated={message.updatedAt !== message.createdAt}
                socketUrl={socketUrl}
                socketQuery={socketQuery}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />{" "}
      {/* This div is used to scroll to the bottom of the chat */}
    </div>
  );
};
