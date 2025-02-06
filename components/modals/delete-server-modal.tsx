"use client";

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
// The Delete Server Modal is the modal that the user sees when they want to delete a server.
// *******************
export const DeleteServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // check if the modal is open and the type is "deleteServer"
  const isModalOpen = isOpen && type === "deleteServer";

  // get the server data from the data object, with a default of undefined
  const { server } = data || {};

  // Create the function to handle the delete server
  const handleDeleteServer = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/servers/${server?.id}`);
      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Delete server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete{" "}
            <span className="font-bold text-emerald-600">{server?.name}</span>?
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
              onClick={handleDeleteServer}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
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
