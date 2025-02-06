import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}









/**
 * Custom hook for fetching and managing chat messages with pagination and real-time updates
 * 
 * This hook:
 * - Fetches paginated messages from the API
 * - Handles cursor-based pagination
 * - Manages loading and error states
 * - Supports real-time updates via WebSocket connection
 * - Falls back to polling when socket disconnects
 *
 * @param queryKey - Unique identifier for the React Query cache
 * @param apiUrl - API endpoint for fetching messages
 * @param paramKey - Parameter key for the query ('channelId' or 'conversationId')
 * @param paramValue - Value for the paramKey
 * @returns Object containing:
 *  - data: Paginated message data
 *  - isLoading: Loading state for initial fetch
 *  - isFetching: Loading state for any fetch
 *  - hasNextPage: Whether more pages exist
 *  - fetchNextPage: Function to load next page
 *  - isFetchingNextPage: Loading state for next page
 */
export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();



  // fetchMessages is a function that fetches the messages from the server
  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    return res.json();
  };


  // useInfiniteQuery is a hook that fetches the messages from the server; 
  // it uses the fetchMessages function to fetch the messages from the server inside the queryFn which is passed to the hook
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: undefined,
    refetchInterval: isConnected ? false : 1000,
  });

  return {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
