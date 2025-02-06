"use client";

import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerWithMembersWithProfiles } from "@/types";
import { UserAvatar } from "../user-avatar";
import {
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  ShieldQuestion,
  Shield,
  Check,
  Gavel,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemberRole } from "@prisma/client";

//import all the necessary dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

// *******************
// Create the roleIconMap options for the role icons
// *******************
const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="size-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="size-4 ml-2 text-rose-500" />,
};

// *******************
// The Members Modal is the modal that the user sees when they want to manage their server members.
// *******************
export const MembersModal = () => {
  const router = useRouter();
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const [loadingId, setLoadingId] = useState<string | null>("");

  // check if the modal is open and the type is "members"
  const isModalOpen = isOpen && type === "members";

  // get the server data from the data object
  const { server } = (data as { server: ServerWithMembersWithProfiles }) || {};

  // Function to handle booting a member
  const handleBootMember = async (memberId: string) => {
    try {
      setLoadingId(memberId); // Set the loading ID to the member ID to indicate that the role change is in progress
      // Construct the URL for the API request with query parameters
      const url = qs.stringifyUrl(
        {
          url: `/api/members/${memberId}`,
          query: {
            serverId: server?.id,
          },
        },
        { skipNull: true }
      ); // skip null values in the query string
      // Send the DELETE request to remove the member from the server
      const response = await axios.delete(url);
      // Refresh the router to reflect the changes in the UI
      router.refresh();
      // Reopen the members modal with the updated server data
      onOpen("members", { server: response.data });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(""); // Clear the loading ID after the role change process is complete
    }
  };

  // This function handles the role change for a member in the server.
  // It sends a PATCH request to the backend API with the new role and refreshes the modal with the updated server data.
  const handleRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId); // Set the loading ID to the member ID to indicate that the role change is in progress
      // Construct the URL for the API request with query parameters
      const url = qs.stringifyUrl(
        {
          url: `/api/members/${memberId}`,
          query: {
            serverId: server?.id,
          },
        },
        { skipNull: true }
      );

      // Send the PATCH request to update the member's role
      const response = await axios.patch(url, { role });
      // Refresh the router to reflect the changes in the UI
      router.refresh();
      // Reopen the members modal with the updated server data
      onOpen("members", { server: response.data });
    } catch (error) {
      console.error(error); // Log any errors that occur during the role change process
    } finally {
      setLoadingId(""); // Clear the loading ID after the role change process is complete
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Manage your server members
          </DialogTitle>
          <DialogDescription>
            <span className="text-center text-zinc-500">
              {server?.members?.length} members
            </span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar src={member.profile.imageUrl} />
              <div className="flex flex-col gap-y-1">
                <div className="text-sm font-semibold flex items-center">
                  {member.profile.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-sm text-zinc-500">{member.profile.email}</p>
              </div>
              {/* If the server profile id is not the same as the member profile id, and the loading id is not the same as the member id, then show the action buttons. Do not show the action buttons for the admin or the owner of the server. */}
              {server?.profileId !== member.profileId &&
                loadingId !== member.id && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="size-5 text-muted-foreground hover:text-muted-foreground/80 transition" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center">
                            <ShieldQuestion className="size-4 mr-2" />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(member.id, "GUEST")
                                }
                              >
                                <Shield className="size-4 mr-2" />
                                Guest
                                {member.role === "GUEST" && (
                                  <Check className="size-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(member.id, "MODERATOR")
                                }
                              >
                                <ShieldCheck className="size-4 mr-2" />
                                Moderator
                                {member.role === "MODERATOR" && (
                                  <Check className="size-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBootMember(member.id)}
                        >
                          <Gavel className="size-4 mr-2" />
                          <span>Kick Member</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              {/* Add a loading icon if the loading id is the same as the member id. This is to show that the action is in progress. */}
              {loadingId === member.id && (
                <Loader2 className="size-4 mr-2 animate-spin text-zinc-500 ml-auto" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
