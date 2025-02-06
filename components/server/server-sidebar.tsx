import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./server-search";
import {
  Hash,
  Video,
  Headphones,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}





// ********************
// This is a map of icons for the different channel types
// ********************
const iconMap = {
  [ChannelType.TEXT]: <Hash className="size-4 mr-2" />,
  [ChannelType.AUDIO]: <Headphones className="size-4 mr-2" />,
  [ChannelType.VIDEO]: <Video className="size-4 mr-2" />,
};
// example of how to use the iconMap
// const icon = iconMap[ChannelType.TEXT];



// ********************
// This is a map fo the role icons
// ********************
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="size-4 mr-2 text-emerald-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="size-4 mr-2 text-rose-500" />,
};
// example of how to use the roleIconMap
// const icon = roleIconMap[MemberRole.MODERATOR];







/**
 * ServerSidebar component displays the sidebar of a specific server
 * including channels and members
 *
 * @param serverId - The unique identifier of the server to display
 * @returns A sidebar component specific to the server
 */
export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  // Get the current user's profile
  const profile = await currentProfile();

  // Redirect to home if no profile found
  if (!profile) {
    return redirect("/");
  }

  // Fetch the server data including channels and members
  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc", // Sort channels by creation date
        },
      },
      members: {
        include: {
          profile: true, // Include member profile data
        },
        orderBy: {
          role: "asc", // Sort members by role
        },
      },
    },
  });

  // Redirect if server not found
  if (!server) {
    return redirect("/");
  }

  // ********************
  // This is the code that separates the channels by type
  // ********************
  // textChannels will filter the channels by type TEXT and return an array of channels that are of type TEXT
  const textChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  // Get all members except current user
  const members = server.members.filter(
    (member) => member.profileId !== profile.id
  );

  // Get current user's role in the server
  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Audio Channels",
                type: "channel",
                data: audioChannels.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels.map((channel) => ({
                  icon: iconMap[channel.type],
                  name: channel.name,
                  id: channel.id,
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members.map((member) => ({
                  icon: roleIconMap[member.role],
                  name: member.profile.name,
                  id: member.id,
                })),
              },
            ]}
          />
        </div>
        <Separator className="h-[2px] bg-zinc-200 dark:bg-zinc-700 rounded-md mx-6" />
        
        {!!textChannels.length && ( // if there are text channels, then we will display them in the scroll area
          <div className="mb-2">
            <ServerSection
              label="Text Channels"
              role={role as MemberRole}
              sectionType="channels"
              channelType={ChannelType.TEXT}
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role as MemberRole}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {/* This code will display the audio channels if there are any */}
        {!!audioChannels.length && (
          <div className="mb-2">
            <ServerSection
              label="Voice Channels"
              role={role as MemberRole}
              sectionType="channels"
              channelType={ChannelType.AUDIO}
            /> 
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                channel={channel} 
                role={role as MemberRole}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels.length && ( // if there are video channels, then we will display them in the scroll area
          <div className="mb-2">
            <ServerSection
              label="Video Channels"
              role={role as MemberRole}
              sectionType="channels"
              channelType={ChannelType.VIDEO}   
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel} 
                  role={role as MemberRole}
                  server={server}
              />
              ))}
            </div>
          </div>
        )}
        {/* This code will display the members if there are any */}
        {!!members.length && (
          <div className="mb-2">
            <ServerSection
              label="Members"
              role={role as MemberRole}
              sectionType="members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember
                  key={member.id}
                  member={member}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}


      </ScrollArea>
    </div>
  );
};
