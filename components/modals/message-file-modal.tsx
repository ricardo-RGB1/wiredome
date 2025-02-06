"use client";

// *******************
// Importing necessary libraries and components
// *******************
import qs from "query-string";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUpload } from "../file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

// *******************
// The Initial Modal is the first modal that the user sees when they sign up or sign in.
// It is used to create a server for the user if they don't have one.
// *******************
export const MessageFileModal = () => {
  const router = useRouter();
  const { isOpen, onClose, type, data } = useModal();
  const { apiUrl, query } = data; // the apiUrl and query are passed in the data prop

  const isModalOpen = isOpen && type === "messageFile"; // check if the modal is open and the type is messageFile

  // define the form schema/validation rules
  const formSchema = z.object({
    fileUrl: z.string().min(1, { message: "File is required" }),
  });

  // Then use zodResolver to convert it for React Hook Form
  // "these values should match exactly what my form schema defines"!
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  // Extract the loading state from the form state
  const isLoading = form.formState.isSubmitting;



  const handleClose = () => {
    form.reset();
    onClose();
  };

  
  /**
   * Handles form submission for uploading a file message
   *
   * @param values - Form values containing fileUrl from the upload
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Build the full API URL with query parameters
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      // Post the file as a message, using fileUrl as the content
      await axios.post(url, {
        ...values, // the values are the form values
        content: values.fileUrl, // the content is the fileUrl
      });

     
      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl font-bold text-center">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Add an attachment to your message
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl" // this must match the name in the form schema
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value} // the value is the fileUrl
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant="primary">
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
