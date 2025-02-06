"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "../emoji-picker";
import { useRouter } from "next/navigation";


// *******************
// This is the interface for the props that are passed to the ChatInput component
// *******************
interface ChatInputProps {
  apiUrl: string; 
  query: Record<string, any>; // for the query params
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1),
});

type FormSchema = z.infer<typeof formSchema>;



/**
 * ChatInput component for handling message input in channels or conversations
 *
 * @param apiUrl - The API endpoint URL to send messages to
 * @param query - Query parameters to include with the API request
 * @param name - Name of the channel or conversation
 * @param type - Type of chat, either "conversation" or "channel"
 */
export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const router = useRouter();
  const { onOpen } = useModal(); 
  // Initialize form with validation schema and default empty content
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  // Track loading state during form submission
  const isLoading = form.formState.isSubmitting;

  /**
   * Handle form submission
   * Posts the message content to the API and resets the form
   */
  const onSubmit = async (values: FormSchema) => {
    try {
      // Send the message content to the API
      await axios.post(apiUrl, values, { params: query }); 
      form.reset();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() => onOpen("messageFile", { apiUrl, query })}
                    className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                  <Plus className="size-6 text-white dark:text-[#313338]" />
                  </button>
                  <Input
                    disabled={isLoading}
                    className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) => field.onChange(`${field.value} ${emoji}`)} // the emoji is added to the message
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        /> 
      </form>
    </Form>
  );
};
