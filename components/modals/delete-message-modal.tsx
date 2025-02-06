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



// *******************
// The Delete Channel Modal is the modal that the user sees when they want to delete a channel.
// *******************
export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);



  // check if the modal is open and the type is "deleteMessage"
  const isModalOpen = isOpen && type === "deleteMessage";

  // get the server data from the data object, with a default of undefined
  const { apiUrl, query } = data || {};

  // Create the function to handle the delete message
  const handleDeleteMessage = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: apiUrl || "", // the api url that will be used to delete the message
        query, // the query that will be used to delete the message
      })

      await axios.delete(url);
      onClose();
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
            Delete message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message?
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
              onClick={handleDeleteMessage}
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
