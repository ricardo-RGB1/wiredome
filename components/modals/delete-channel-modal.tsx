"use client";

import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// *******************
// The Delete Channel Modal is the modal that the user sees when they want to delete a channel.
// *******************
export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  // check if the modal is open and the type is "deleteChannel"
  const isModalOpen = isOpen && type === "deleteChannel";

  // get the server data from the data object, with a default of undefined
  const { server, channel } = data || {};

  // Create the function to handle the delete channel
  const handleDeleteChannel = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        }
      }, { skipNull: true });

      await axios.delete(url);
      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Delete channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete{" "}
            <span className="font-bold text-emerald-600">{channel?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-white px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              onClick={onClose} 
              disabled={isLoading}
              variant="ghost"
              className="border border-zinc-200"
            > 
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteChannel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? ( // If the button is loading, show the loader
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
