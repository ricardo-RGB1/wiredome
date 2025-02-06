import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();


// This is a middleware function that will be used to authenticate the user 
const handleAuth = async () => { 
  const {userId} = await auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId: userId }; // This will return an object with the userId as a key and the userId as the value 
};


export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  messageFile: f(["image", "pdf"]) 
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
