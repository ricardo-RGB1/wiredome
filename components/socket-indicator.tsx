'use client'; 

import { useSocket } from "@/components/socket-provider"; 
import { Badge } from "@/components/ui/badge";  

export const SocketIndicator = () => {
    const { isConnected } = useSocket();  // get the isConnected state from the socket provider

    if(!isConnected) {
        return (
            <Badge variant="outline" className="bg-yellow-600 text-white border-none">
                Fallback: Polling every 1s
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="bg-emerald-600 text-white border-none">
            Live: Real-time updates
        </Badge>
    )
}