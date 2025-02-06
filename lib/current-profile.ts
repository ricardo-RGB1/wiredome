import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";



// This helper function is used to get the current profile of the user
export const currentProfile = async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // get the profile from the database by matching the userId (from clerk) with the profile.userId 
  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  return profile;
};
