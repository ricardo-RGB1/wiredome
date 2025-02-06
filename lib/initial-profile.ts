import { currentUser  } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { redirect } from "next/navigation";


// This function is used to get the profile of the user from Clerk 
// and create a new profile in the database if it doesn't exist.
// It is used in the Setup page to get the profile of the user and create a new profile if it doesn't exist.
// It's in the lib folder because it's a utility function that is used in the Setup page.
export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // check if the profile exists in the database
  const profile = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  // if the profile exists, return the profile
  if (profile) {
    return profile;
  }

  // if the profile does not exist, create a new profile with the user's information from Clerk
  const newProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress, // this is the email address of the user from clerk
    },
  });

  return newProfile;
};
