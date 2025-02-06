import { Hash } from "lucide-react";

interface ChatWelcomeProps {
  type: "channel" | "conversation";
  name: string;
}





/**
 * ChatWelcome component displays a welcome message for channels or conversations
 * 
 * This component shows different welcome messages and UI elements depending on whether
 * it's being rendered for a channel or direct conversation:
 * 
 * For channels:
 * - Shows a large hash icon in a circular background
 * - Displays "Welcome to #channelName" 
 * - Shows "This is the start of the #channelName channel"
 *
 * For conversations:
 * - Shows just the user's name
 * - Displays "This is the start of your conversation with userName"
 *
 * @component
 * @param {Object} props - Component props
 * @param {'channel'|'conversation'} props.type - The type of chat this welcome is for
 * @param {string} props.name - Name of the channel or conversation partner
 */
export const ChatWelcome = ({ type, name }: ChatWelcomeProps) => {
  return (
    <div className="space-y-2 px-4 mb-4">
      {type === "channel" && (
        <div className="h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center">
          <Hash className="h-12 w-12 text-white" />
        </div>
      )}
      <p className="text-xl md:text-3xl font-bold">
        {type === "channel" ? "Welcome to #" : ""} 
        {name}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {type === "channel"
          ? `This is the start of the #${name} channel.`
          : `This is the start of your conversation with ${name}`}
      </p>
    </div>
  );
};
