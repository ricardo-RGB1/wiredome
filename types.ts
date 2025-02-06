import { Server, Member, Profile } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

/**
 * Represents a Server with its associated Members and their Profiles
 * 
 * Extends the base Server type and adds:
 * - members: Array of Member objects, each enriched with their associated Profile
 * 
 * This type is used when we need full server data including member details,
 * such as in the server sidebar where we display member information.
 */
export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[]; // members is an array of Member objects, each enriched with their associated Profile
};



/**
 * Represents the NextApiResponse type with an added socket property
 * 
 * This type is used to extend the NextApiResponse type to include a socket property
 * which is a Socket object that has a server property that has an io property
 * which is a SocketIOServer object
 */
 export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & { // socket is a Socket object
    server: NetServer & { // server is a NetServer object
      io: SocketIOServer; // io is a SocketIOServer object
    }
  }
 }