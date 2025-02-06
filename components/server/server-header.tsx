"use client";

import { MemberRole } from "@prisma/client";
import { ServerWithMembersWithProfiles } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "../ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  UserPlus,
  Users,
  Plus,
} from "lucide-react";

import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const { onOpen } = useModal();

  // check if the user is an admin or a moderator so they can edit the server:
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  const dropdownItemClass =
    "px-3 py-2 text-sm cursor-pointer hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition rounded-md p-3";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
          {server.name}
          <ChevronDown className="size-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("invite", { server })}
            className={dropdownItemClass}
          >
            Invite People
            <UserPlus className="size-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={`${dropdownItemClass} [&>svg]:ml-auto [&>svg:last-child]:hidden`}
            >
              Server Settings
              <Settings className="size-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="ml-2">
                <DropdownMenuItem
                  onClick={() => onOpen("editServer", { server })}
                  className={dropdownItemClass}
                >
                  Edit Server
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onOpen("deleteServer", { server })}
                  className={`${dropdownItemClass} text-rose-500 dark:text-rose-500`}
                >
                  Delete Server
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("members", { server })}
            className={dropdownItemClass}
          >
            Manage Members
            <Users className="size-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            onClick={() => onOpen("createChannel", { server })}
            className={dropdownItemClass}
          >
            Create Channel
            <PlusCircle className="size-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && <DropdownMenuSeparator />}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("createServer")}
            className={`${dropdownItemClass} text-sky-600 dark:text-sky-400 bg-sky-100/50 dark:bg-sky-400/10`}
          >
            Create Server
            <Plus className="size-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {/* if not admin, show leave server */}
        {!isAdmin && (
          <DropdownMenuItem
            className={dropdownItemClass}
            onClick={() => onOpen("leaveServer", { server })}
          >
            Leave Server
            <LogOut className="size-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
