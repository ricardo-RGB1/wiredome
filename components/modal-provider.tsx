"use client";
// This means that this is not a React server component; but both React server and client components can be used for server side rendering; Using use client means that this is a React client component

import { useEffect, useState } from "react";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { EditServerModal } from "./modals/edit-server-modal";
import { InviteModal } from "./modals/invite-modal";
import { MembersModal } from "./modals/members-modal";
import { CreateChannelModal } from "./modals/create-channel-modal";
import { LeaveServerModal } from "./modals/leave-server-modal";
import { DeleteServerModal } from "./modals/delete-server-modal";
import { DeleteChannelModal } from "./modals/delete-channel-modal";
import { EditChannelModal } from "./modals/edit-channel-modal";
import { MessageFileModal } from "./modals/message-file-modal";
import { DeleteMessageModal } from "./modals/delete-message-modal";




export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  } // Prevents the modal from being rendered on the server side

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal /> 
      <DeleteMessageModal />
    </>
  );
};



