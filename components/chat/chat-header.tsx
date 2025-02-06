import { Hash } from "lucide-react"; 
import { MobileToggle } from "../mobile-toggle";
import { UserAvatar } from "../user-avatar";
import { SocketIndicator } from "../socket-indicator";
import { ChatVideoButton } from "./chat-video-button";


interface ChatHeaderProps {
    serverId: string; 
    name: string; 
    type: "channel" | "conversation"; 
    imageUrl?: string; 
}



/**
 * ChatHeader component displays the header section of a chat interface.
 * It shows different elements based on whether it's a channel or conversation.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {string} props.serverId - The ID of the server the chat belongs to
 * @param {string} props.name - The name of the channel or conversation to display
 * @param {('channel'|'conversation')} props.type - The type of chat, either 'channel' or 'conversation'
 * @param {string} [props.imageUrl] - Optional URL for an image (used in conversations)
 * 
 * @returns {JSX.Element} A header component with menu icon, optional hash icon for channels, and chat name
 */
export const ChatHeader = ({ serverId, name, type, imageUrl }: ChatHeaderProps) => {
    return (
        <div className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
           <MobileToggle serverId={serverId} />
           {/* if the type is channel, show the hash icon */}
           {type === 'channel' && (
            <Hash className="size-5 text-zinc-500 dark:text-zinc-400 mr-2" />
           )}
           {/* if the type is conversation, show the user avatar */}
           {type === 'conversation' && ( 
            <UserAvatar src={imageUrl} className="size-8 md:size-8 mr-2" />
           )}
           <p className="font-semibold text-md text-black dark:text-white">
            {name} 
           </p>
           <div className="ml-auto flex items-center">
            {type === "conversation" && (
                <ChatVideoButton /> 
            )}
            <SocketIndicator />
           </div>
        </div>
    )
}