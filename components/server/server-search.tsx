"use client";


import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CommandInput,
  CommandDialog,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from "../ui/command";

/**
 * Interface for ServerSearch component props.
 *
 * This interface defines the shape of the data expected by the ServerSearch component.
 *
 * @typedef {Object} ServerSearchProps
 * @property {Array} data - An array of objects containing label, type, and data.
 * @property {string} data.label - The label for the data.
 * @property {"channel" | "member"} data.type - The type of data, either "channel" or "member".
 * @property {Array|undefined} data.data - An array of objects containing icon, name, and id, or undefined.
 * @property {React.ReactNode} data.data.icon - The icon for the data.
 * @property {string} data.data.name - The name of the data.
 * @property {string} data.data.id - The id of the data.
 */
interface ServerSearchProps {
  data: {
    label: string;
    type: "channel" | "member";
    data:
      | {
          icon: React.ReactNode;
          name: string;
          id: string;
        }[]
      | undefined;
  }[];
}

// ********************
// This component is used to search for channels or members in a server
// ********************
export const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false); // this is the state for the command dialog
  const router = useRouter();
  const params = useParams(); 

  // ********************
  // This is the useEffect hook that is used to listen for the keyboard shortcut
  // ********************
  useEffect(() => {
    const down = (e: KeyboardEvent) => { 
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open); // toggle the open state
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);


  // This function handles the onClick event for the search button
  const onClick = ({ id, type }: { id: string; type: "channel" | "member" }) => {
    setOpen(false); // This line closes the command dialog

    // This block checks if the type is "member" and navigates to the conversation page if true
    if (type === "member") {
      return router.push(`/servers/${params.serverId}/conversations/${id}`);
    }

    // This block checks if the type is "channel" and navigates to the channel page if true
    if (type === "channel") {
      return router.push(`/servers/${params.serverId}/channels/${id}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="size-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>
            <p className="text-center text-muted-foreground">
              No results found
            </p>
          </CommandEmpty>
          {/* This is the map function that is used to render the data */}
          {data.map(({ label, type, data }) => {
            if (!data?.length) return null;

            return ( // This is the command group that is used to render the data
              <CommandGroup key={label} heading={label}>
                {data.map(({ icon, name, id }) => (
                  <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                    {icon}
                    <span>{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup> 
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
