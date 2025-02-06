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
// The Leave Server Modal is the modal that the user sees when they want to leave a server.
// *******************
export const LeaveServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // check if the modal is open and the type is "leaveServer"
  const isModalOpen = isOpen && type === "leaveServer";

  // get the server data from the data object, with a default of undefined
  const { server } = data || {};

  // Create the function to handle the leave server
  const handleLeaveServer = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/servers/${server?.id}/leave`);
      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Failed to leave server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Leave server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to leave{" "}
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
              variant="primary"
              disabled={isLoading}
              onClick={handleLeaveServer}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Leave"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
