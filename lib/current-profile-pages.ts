import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { NextApiRequest } from "next";


// This function is used to get the current profile of the user
export const currentProfilePage = async (req: NextApiRequest) => {
  // get the userId from the request 
  const { userId } = await getAuth(req);

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
  