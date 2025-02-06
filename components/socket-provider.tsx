"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

/**
 * SocketContext is a React context that provides the socket connection
 * and its connection status to components within the application.
 * It allows components to access the socket instance and determine
 * whether they are currently connected to the server, facilitating
 * real-time communication features.
 */
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

/**
 * useSocket hook that allows components to access the socket context
 *
 * @returns SocketContextType - The context value containing the socket and connection status
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

/**
 * SocketProvider component that manages WebSocket connections for real-time communication
 *
 * Creates and manages a Socket.IO client connection to enable real-time features
 * throughout the application. It handles connection state and provides the socket
 * instance through context.
 *
 * The provider:
 * - Initializes a Socket.IO client connection to the server
 * - Manages connection state (connected/disconnected)
 * - Handles cleanup on unmount
 * - Provides socket and connection status via context
 *
 * @param children - Child components that will have access to the socket connection
 * @returns SocketContext.Provider wrapped around the children
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = ClientIO(process.env.NEXT_PUBLIC_SITE_URL!, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
