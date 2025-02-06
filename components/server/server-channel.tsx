'use client'; 


import { cn } from "@/lib/utils";
import {Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Mic, Trash, Video, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import React from "react";

 
const iconMap = {
    [ChannelType.TEXT]: Hash, 
    [ChannelType.AUDIO]: Mic, 
    [ChannelType.VIDEO]: Video, 
}


interface ServerChannelProps {
    channel: Channel; 
    server: Server; 
    role?: MemberRole; 
}


export const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {

    const params = useParams();  
    const router = useRouter(); 
    const { onOpen } = useModal(); 
  
    // Remember: "type" is of type: ChannelType 
    const Icon = iconMap[channel.type]; 


    // Navigate to the channel page
    const onClick = () => {
        router.push(`/servers/${params?.serverId}/channels/${channel.id}`); 
    }

    
    // Handles opening modals for channel actions (edit/delete)
    // Prevents event bubbling to avoid triggering channel navigation
    // and opens the appropriate modal with channel/server context
    const onAction = (e: React.MouseEvent, action: ModalType) => {
        e.stopPropagation(); 
        onOpen(action, { channel, server }); // Pass the channel and server to the modal
    }


    
    // Returns a button component that represents a channel in the server's channel list.
    // The button includes:
    // - Channel type icon (Hash for text, Mic for audio, Video for video)
    // - Channel name that highlights when active
    // - Edit/Delete buttons for non-general channels when user has permissions
    // - Lock icon for the general channel
    // The button handles navigation to the channel when clicked and has hover/active states
    return (
       <button
        // Handles navigation to the channel page when clicked
        onClick={onClick}
        // Applies conditional styling based on whether channel is active
        className={cn(
            "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
            params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
       >
        {/* Channel type icon (Hash, Mic, or Video) */}
        <Icon className="flex-shrink-0 size-5 text-zinc-500 dark:text-zinc-400" />

        {/* Channel name with conditional styling for active state */}
        <p className={cn("line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition", 
            params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}>
            {channel.name}
        </p>

        {/* Edit/Delete buttons shown for non-general channels when user is not a guest */}
        {channel.name !== "general" && role !== MemberRole.GUEST && (
            <div className="ml-auto flex items-center gap-x-2">
                <ActionTooltip label="Edit">  
                    <Edit
                    onClick={(e) => onAction(e, "editChannel")}
                    className="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"/>
                </ActionTooltip>
                <ActionTooltip label="Delete">  
                    <Trash
                    onClick={(e) => onAction(e, "deleteChannel")}
                    className="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"/>
                </ActionTooltip>
            </div>
        )}

        {/* Lock icon shown only for general channel */}
        {channel.name === "general" && (
            <Lock className="ml-auto opacity-0 group-hover:opacity-100 size-4 text-muted-foreground" />
        )}
       </button>
    )
}