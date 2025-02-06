 import { Server as NetServer } from "http"; 
 import { NextApiRequest } from "next";  
 import { Server as ServerIO } from "socket.io";  
 import { NextApiResponseServerIo } from "@/types";


 // This is the configuration for the socket.io server
  export const config = {
    api: { 
        bodyParser: false, // we don't want to parse the body of the request
    }
  }



  // This is the handler for the socket.io server 
  /**
   * Socket.IO handler function that initializes and manages the WebSocket server
   * 
   * This handler does the following:
   * 1. Checks if a Socket.IO server instance already exists
   * 2. If not, creates a new Socket.IO server attached to the HTTP server
   * 3. Configures the Socket.IO server with the specified path
   * 4. Stores the Socket.IO instance on the server object for reuse
   * 
   * @param req - The incoming HTTP request
   * @param res - The server response object with Socket.IO types
   */
  const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    // Check if Socket.IO server is already initialized
    if (!res.socket.server.io) {
        // Define the WebSocket endpoint path
        const path = '/api/socket/io';
        
        // Get the underlying HTTP server instance
        const httpServer: NetServer = res.socket.server as any;
        
        // Create new Socket.IO server instance
        const io = new ServerIO(httpServer, {
            path: path, // Set the WebSocket endpoint path
            addTrailingSlash: false, // Don't add trailing slash to Socket.IO path
        }); 

        // Store Socket.IO instance on server object for reuse
        res.socket.server.io = io;
    }

    // End the HTTP response as we're only initializing WebSocket
    res.end();
  }

  export default ioHandler; 