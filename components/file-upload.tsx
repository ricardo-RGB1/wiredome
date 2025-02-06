"use client";
import { File, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/utils/uploadthing";

interface FileUploadProps {
  endpoint: "serverImage" | "messageFile";
  value: string;
  onChange: (url?: string) => void;
}

// If the file is an image, we will display it, otherwise we will display the upload dropzone
export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  // This will get the file extension from the value
  const fileType = value?.split(".").pop()?.toLowerCase();


  // If the file is an image, we will display it
  if (value && fileType !== "pdf") {
    return (
      <div className="relative size-20">
        <Image fill src={value} alt="Upload" className="rounded-full" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 rounded-full text-white bg-rose-500 hover:bg-rose-600 transition-all duration-150 ease-in-out"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  
  // If the file is a pdf, we will display the upload dropzone and the file icon
  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <File className="size-10 text-emerald-500" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-emerald-500 hover:underline dark:text-emerald-400"
        >
          {value}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadProgress={(p) => console.log(p)}
      />
    </div>
  );
};
