'use client'; 

import { useEffect, useState } from 'react'; 
import { LiveKitRoom, VideoConference } from '@livekit/components-react'; 
import "@livekit/components-styles"; 
import { Channel } from '@prisma/client'; 
import { useUser } from '@clerk/nextjs'; 
import { Loader2 } from 'lucide-react';  



interface MediaRoomProps {
    chatId: string; 
    video: boolean; 
    audio: boolean; 
}


/**
 * MediaRoom Component
 * 
 * This component handles the video/audio conferencing functionality using LiveKit.
 * It manages the connection to LiveKit rooms and renders the video conference interface.
 *
 * The component works by:
 * 1. Taking props for the chat ID and which media types to enable (video/audio)
 * 2. Fetching a LiveKit access token when mounted or when user/room changes
 * 3. Displaying a loading state while getting the token
 * 4. Rendering the LiveKit video conference UI once connected
 *
 * @param {Object} props - Component props
 * @param {string} props.chatId - Unique identifier for the chat room
 * @param {boolean} props.video - Whether to enable video
 * @param {boolean} props.audio - Whether to enable audio
 *
 * Key behaviors:
 * - Uses Clerk for user authentication/information
 * - Makes API calls to /api/livekit endpoint to get access tokens
 * - Handles loading states with a spinner
 * - Configures LiveKit room with appropriate media settings
 */
export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
    const { user } = useUser();  
    const [token, setToken] = useState('');  

    // Fetch LiveKit access token when component mounts or dependencies change
    useEffect(() => {
        // Don't proceed if user name is not available
        if(!user?.firstName || !user?.lastName) return;  

        // Combine first and last name for LiveKit identity
        const name = `${user.firstName} ${user.lastName}`;  

        // Immediately invoked async function to fetch token
        (async () => {
            try {
                const resp = await fetch(`/api/livekit?room=${chatId}&username=${name}`);  
                const data = await resp.json(); 
                setToken(data.token); 
            } catch (error) {
                console.log(error); 
            }
        })();
    }, [user?.firstName, user?.lastName, chatId]);  

    // Show loading spinner while waiting for token
    if(token === '') {
        return (
            <div className='flex flex-col flex-1 justify-center items-center'>
                <Loader2 className="size-7 text-zinc-500 animate-spin my-4" />
                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Loading...
                </p>
            </div>
        )
    }

    // Render LiveKit video conference once token is available
    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            video={video}
            audio={audio}
        >
            <VideoConference />
        </LiveKitRoom>
    )
}