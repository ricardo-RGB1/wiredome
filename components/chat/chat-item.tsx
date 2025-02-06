"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Member, Profile, MemberRole } from "@prisma/client";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Edit, Trash, ShieldCheck, ShieldAlert, FileIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useRouter, useParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-emerald-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
} as const;

// form schema for the edit message form
const formSchema = z.object({
  content: z.string().min(1),
});










export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const { onOpen } = useModal(); 
  const router = useRouter();
  const params = useParams();


  // Function to handle the click event on the member's avatar
  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  }
    
  


  // Define the type for the form schema based on the validation schema
  type FormSchema = z.infer<typeof formSchema>;

  // Initialize the form using the useForm hook with Zod validation
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema), // Set the resolver for form validation
    defaultValues: {
      content: "", // Set the default value for the content field
    },
  });

  // Add ref for the input field
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);


  const isLoading = form.formState.isSubmitting; // check if the form is submitting


  /**
   * Handles the submission of edited message content
   * @param data - Form data containing the updated message content
   * 
   * 1. Constructs the API URL with message ID and query params
   * 2. Makes PATCH request to update the message
   * 3. Resets form and exits editing mode on success
   * 4. Logs any errors that occur during update
   */
  const handleSubmit = async (data: FormSchema) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`, 
        query: socketQuery,
      }, { skipNull: true });

      await axios.patch(url, data); // make the PATCH request to update the message
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };



  
  /**
   * Effect hook that manages form state and editing interactions:
   *
   * 1. Resets the form with the new content value when content changes
   * 2. When editing mode is activated:
   *    - Focuses and selects the input text
   *    - Sets up an escape key listener to cancel editing
   *    - Cleans up the event listener when editing ends
   */
  useEffect(() => {
    form.reset({
      content: content,
    });

    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);

      // Add keyboard event listener for Escape key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsEditing(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      // Clean up event listener when component unmounts or editing stops
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [content, isEditing]);

  const fileType = fileUrl?.split(".").pop(); // get the file type from the file url

  const isAdmin = currentMember.role === MemberRole.ADMIN; // check if the current member is an admin
  const isModerator = currentMember.role === MemberRole.MODERATOR; // check if the current member is a moderator
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {/* Render the content of the message; there can be an image or a pdf or simply text */}
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary size-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="size-10 fill-emerald-200 stroke-emerald-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-emerald-500 dark:text-emerald-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          {/* If there is no file url and the message is not being edited, render the message */}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {/* If the message was updated, render the ui that tells the user this was edited */}
              {isUpdated && (
                <span className="text-xs mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}

          {/* If the message is not a file and the user is editing it, render the Input component from the form */}
          {!fileUrl && isEditing && (
            <Form {...form}>
              {/* Form for editing message content */}
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content" // Field name for the message content
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edit message"
                            {...field}
                            ref={inputRef}
                            onBlur={() => setIsEditing(false)} // Set the isEditing state to false when the input field loses focus
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-xs mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>

      {/* Message action buttons (edit/delete) that appear on hover:
        All users can edit the message if there is no file url
        Only admins and moderators can delete the message
       */}
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {/* Edit button - only shown if user has edit permissions */}
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)} // Set the isEditing state to true when the edit button is clicked
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          {/* Delete button - shown if user has delete permissions */}
          <ActionTooltip label="Delete">
            <Trash onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${id}`, query: socketQuery})} className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
