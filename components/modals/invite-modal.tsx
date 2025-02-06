"use client";

import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";

// *******************
// The Invite Modal is the modal that the user sees when they want to invite people to their server.
// *******************
export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const origin = useOrigin();
  // check if the modal is open and the type is "invite"
  const isModalOpen = isOpen && type === "invite";

  // get the server data from the data object, with a default of undefined
  const { server } = data || {};

  // create the invite link
  const inviteLink = `${origin}/invite/${server?.inviteCode}`;

  // function to copy the invite link to the clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  // A funciton to generate a new invite link
  const generateNewInviteLink = async () => {
    try {
      setIsLoading(true);
      setIsRotating(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );

      onOpen("invite", { server: response.data });
    } catch (error) {
      console.error("Failed to generate new invite link:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRotating(false), 200);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Invite people to your server
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading} // disable the input if the invite link is being generated
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteLink}
            />
            <div className="relative">
              {isCopied && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded">
                  Copied!
                </div>
              )}
              <Button disabled={isLoading} size="icon" onClick={copyInviteLink}>
                {isCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            disabled={isLoading}
            className="text-xs text-zinc-500 mt-4"
            size="sm"
            variant="link"
            onClick={generateNewInviteLink}
          >
            Generate a new link
            <RefreshCw
              className={cn(
                "size-4 ml-2 transition-transform duration-200",
                isRotating && "rotate-[360deg]"
              )}
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
