'use client'; 

import qs from 'query-string';  
import { usePathname, useRouter, useSearchParams } from 'next/navigation';  
import { Icon, Video, VideoOff } from 'lucide-react';  


import { ActionTooltip } from '@/components/action-tooltip';  

/**
 * ChatVideoButton component provides video call functionality in chat conversations.
 * It toggles between starting and ending a video call by manipulating URL parameters.
 * 
 * @component
 * @returns {JSX.Element} A button that toggles video call state with a tooltip
 */
export const ChatVideoButton = () => {
    const searchParams = useSearchParams(); 
    const pathname = usePathname();  
    const router = useRouter();  

    // Check if video call is active via URL parameter
    const isVideo = searchParams?.get("video"); 
    const Icon = isVideo ? VideoOff : Video;  // if the video is already active, show the video off icon, otherwise show the video icon
    const tooltipLabel = isVideo ? "End Video Call" : "Start Video Call";  

    /**
     * Handles the video button click by updating the URL parameters
     * Adds or removes the video parameter to toggle video call state
     */
    const onClick = () => {
        const url = qs.stringifyUrl({
            url: pathname || "", 
            query: { // if the video is already active, remove it, otherwise add it
                video: isVideo ? undefined : true, 
            }, 
        }, { skipNull: true }); 

        router.push(url); 
    }

    return (
        <ActionTooltip side='bottom' label={tooltipLabel}>
            <button onClick={onClick} className="hover:opacity-75 transition mr-4">
                <Icon className="size-6 text-zinc-500 dark:text-zinc-400" />
            </button>
        </ActionTooltip>
    )

}