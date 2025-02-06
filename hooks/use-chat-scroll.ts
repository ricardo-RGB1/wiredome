import { useEffect, useState } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    shouldLoadMore: boolean;
    loadMore: () => void;
    count: number;
}






/**
 * Custom hook to handle chat scrolling behavior
 * 
 * This hook manages two key chat scroll features:
 * 1. Infinite scroll loading of older messages when scrolling to top
 * 2. Auto-scrolling to bottom for new messages
 *
 * @param chatRef - Reference to main chat container div
 * @param bottomRef - Reference to bottom marker div for auto-scrolling
 * @param shouldLoadMore - Boolean indicating if more messages can be loaded
 * @param loadMore - Function to load more messages
 * @param count - Number of messages (used to trigger auto-scroll)
 */
export const useChatScroll = ({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count,
}: ChatScrollProps) => {
    // State to track if the component has been initialized
    const [hasInitialized, setHasInitialized] = useState(false); 



    /**
     * Effect hook to handle infinite scroll loading of chat messages
     * 
     * This effect:
     * - Adds scroll event listener to chat container div
     * - Checks if user has scrolled to top of container
     * - Triggers loading of more messages when at top
     * - Cleans up event listener on unmount
     */
    useEffect(() => {
        const topDiv = chatRef?.current; 

        const handleScroll = () => {
            const scrollTop = topDiv?.scrollTop; 

            if (scrollTop === 0 && shouldLoadMore) {
                loadMore(); 
            }
        }; 

        topDiv?.addEventListener("scroll", handleScroll); 

        return () => {
            topDiv?.removeEventListener("scroll", handleScroll); 
        }
    }, [shouldLoadMore, loadMore, chatRef])
    



    /**
     * Effect hook to handle automatic scrolling behavior in the chat
     * 
     * This effect manages when the chat should automatically scroll to the bottom,
     * which happens in two scenarios:
     * 1. On initial load of the chat (when hasInitialized is false)
     * 2. When the user is already near the bottom and new messages arrive
     * 
     * The logic:
     * - Gets references to the bottom marker div and main chat container
     * - Determines if auto-scroll should occur via shouldAutoScroll():
     *   - Returns true on first load to show newest messages
     *   - Calculates distance from bottom of chat
     *   - Returns true if within 100px of bottom
     * - Uses setTimeout to ensure smooth scrolling after content updates
     * - Scrolls to bottom marker with smooth animation
     * 
     * Dependencies:
     * - bottomRef: Reference to bottom marker div
     * - chatRef: Reference to main chat container
     * - count: Number of messages (triggers scroll on new messages)
     * - hasInitialized: Tracks if first load has occurred
     */
    useEffect(() => {
        const bottomDiv = bottomRef?.current 
        const topDiv = chatRef.current; 

        const shouldAutoScroll = () => {
            if(!hasInitialized && bottomDiv) {
                setHasInitialized(true); 
                return true; 
            }

            if(!topDiv) return false;  

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight; 
            return distanceFromBottom <= 100;  
        }

        if(shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth"
                })
            }, 100); 
        }
    }, [bottomRef, chatRef, count, hasInitialized])

}