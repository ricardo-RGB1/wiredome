import { create } from "zustand";
import { Server, ChannelType, Channel } from "@prisma/client";

// The type of the modal that is being opened
export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage";
  


// A sepatarte interface for the data that is passed to the modal
interface ModalData { 
  server?: Server;
  channel?: Channel;
  channelType?: ChannelType; 
  apiUrl?: string;  // the api url that will be used to create the server or channel
  query?: Record<string, any>;  // the query that will be used to create the server or channel
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void; // pass the type and data to the modal
  onClose: () => void;
}

// This is the hook that will be used to open and close the modal
export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: {},
  onOpen: (type, data) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
