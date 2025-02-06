import { useSocket } from "@/components/socket-provider";
import { Member, Profile } from "@prisma/client";
import { Message } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
// The common props for the chat socket
type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

// This is a type that combines the Message, Member, and Profile types
// It is used to store the messages in the query client
type MessageWithMemberWithProfile = Message & {
  member: Member & { profile: Profile };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  /**
   * useEffect hook that manages real-time message updates and additions via WebSocket
   *
   * This effect sets up two socket event listeners:
   * 1. updateKey listener - Handles updates to existing messages
   * 2. addKey listener - Handles new message additions
   *
   * For message updates (updateKey):
   * - Receives updated message data via socket
   * - Updates the matching message in the React Query cache
   * - Preserves pagination structure while updating specific message
   * - Handles cases where cache may be empty
   *
   * For new messages (addKey):
   * - Receives new message data via socket
   * - Adds message to beginning of first page in cache
   * - Creates new cache structure if none exists
   * - Maintains existing pagination while prepending new message
   *
   * Cleanup:
   * - Removes socket event listeners when component unmounts
   * - Ensures no memory leaks or duplicate listeners
   *
   * Dependencies:
   * - queryClient: Used to update cached data
   * - addKey: Socket event name for new messages
   * - queryKey: Key for accessing the query cache
   * - socket: Socket.io client instance
   * - updateKey: Socket event name for message updates
   */
  useEffect(() => {
    if (!socket) return;

    // Listen for message updates on the socket using the provided updateKey
    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      // Update the query data in the query client cache
      queryClient.setQueryData([queryKey], (oldData: any) => {
        // If there is no existing data or pages, return unchanged
        if (!oldData || !oldData.pages || oldData.pages.length === 0)
          return oldData;

        // Map through each page in the infinite query data
        const newData = oldData.pages.map((page: any) => {
          return {
            // Preserve existing page properties
            ...page,
            // Map through items array to find and update matching message
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              // If this item matches the updated message ID
              if (item.id === message.id) {
                // Replace it with the new message data
                return message;
              }
              // Otherwise return item unchanged
              return item;
            }),
          };
        });

        // Return updated data structure with new pages array
        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    // Listen for new messages on the socket using the provided addKey
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        // If there's no existing data, create initial structure
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        // Ensure the first page and items array exists
        if (!newData[0] || !newData[0].items) {
          newData[0] = {
            items: [message],
          };
        } else {
          newData[0] = {
            ...newData[0],
            items: [message, ...newData[0].items],
          };
        }

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    // Cleanup function to remove socket event listeners when component unmounts
    // This prevents memory leaks and duplicate listeners if the component remounts
    return () => {
      socket.off(addKey); // Remove listener for new messages
      socket.off(updateKey); // Remove listener for message updates
    };

    // Dependencies ensure the effect re-runs if any of these values change:
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
