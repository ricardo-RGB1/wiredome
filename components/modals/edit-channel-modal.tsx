"use client";

// *******************
// Importing necessary libraries and components
// *******************

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChannelType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import qs from "query-string";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useParams } from "next/navigation";
import { useEffect } from "react";

// define the form schema/validation rules
const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required" })
    .refine((data) => data !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
  // nativeEnum is a zod function that allows us to use the ChannelType enum
});

// *******************
// The Edit Channel Modal is the modal that the user sees when they want to edit a channel.
// *******************
export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const params = useParams();
  // check if the modal is open and the type is "createChannel"
  const isModalOpen = isOpen && type === "editChannel";

  // Only destructure data if the modal is open
  const { channelType, channel, server } = isModalOpen
    ? data
    : { channelType: undefined, channel: undefined, server: undefined };

  // Then use zodResolver to convert it for React Hook Form
  // "these values should match exactly what my form schema defines"!
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: ChannelType.TEXT,
    },
  });

  // This useEffect hook updates the form's values based on the channel data.
  // If channel data exists, it sets the form's "name" and "type" fields accordingly.
  // Otherwise, it defaults to empty string for name and ChannelType.TEXT for type.
  useEffect(() => {
    form.setValue("name", channel?.name || "");
    form.setValue("type", channel?.type || ChannelType.TEXT);
  }, [channel, form]);

  // Extract the loading state from the form state
  const isLoading = form.formState.isSubmitting;

  /**
   * Handles the form submission for creating a new channel.
   *
   * @param values - The form values as defined by the formSchema.
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Construct the URL for the API call with serverId as a query parameter
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      // Post the form values to the constructed URL
      await axios.patch(url, values);
      // Reset the form state
      form.reset();
      // Refresh the router to reflect any changes
      router.refresh();
      // Close the modal
      onClose();
    } catch (error) {
      // Log any errors that occur during the submission process
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Edit channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="primary">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
