import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChannelType } from "@prisma/client";
import { MediaRoom } from "@/components/media-room";
interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}


/**
 * ChannelIdPage component displays a channel's chat interface with different features based on channel type.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.serverId - ID of the server the channel belongs to
 * @param {string} props.params.channelId - ID of the current channel
 * 
 * @returns {Promise<JSX.Element>} Renders either:
 * - Text channel: Chat header, messages, and input
 * - Audio channel: Media room with audio only
 * - Video channel: Media room with video only
 * - RedirectToSignIn if user is not authenticated
 * - Redirects to home if channel not found or user is not a member
 */
const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  // Get current user profile
  const profile = await currentProfile();

  // Redirect to sign in if no profile found
  if (!profile) {
    return <RedirectToSignIn />;
  }

  // Fetch the channel data
  const channel = await prisma.channel.findUnique({
    where: {
      id: params.channelId,
      serverId: params.serverId,
    },
  });

  // Check if user is a member of this server
  const member = await prisma.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  // Redirect if channel not found or user is not a member
  if (!channel || !member) {
    redirect("/");
  }

  // Render the chat interface
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        serverId={channel.serverId}
        name={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
        <ChatMessages   
            name={channel.name}   
            member={member}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages" // the api url will be used in the chat messages component to fetch messages from the server
            socketUrl="/api/socket/messages"
            socketQuery={{ channelId: channel.id, serverId: channel.serverId }}
            paramKey="channelId"
            paramValue={channel.id} 
          />
    
        <ChatInput
          // the api url will be used in the chat input component to send messages to the server
          apiUrl={`/api/socket/messages`}
          // the query will be used in the chat input component to send messages to the server
          query={{ channelId: channel.id, serverId: channel.serverId }}
          name={channel.name} // the name of the channel
          type="channel" // the type of the chat
        />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom
          chatId={channel.id}
          video={false}
          audio={true}
        />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom
          chatId={channel.id}
          video={true}
          audio={false}
        />
      )}
    </div>
  );
};

export default ChannelIdPage;
