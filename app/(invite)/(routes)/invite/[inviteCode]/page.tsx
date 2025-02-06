import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

interface InvitePageProps {
    params: {
        inviteCode: string;
    }
}



/**
 * Page component that handles server invites
 * When a user visits this page with an invite code:
 * 1. Checks if user is authenticated, redirects to sign in if not
 * 2. Validates the invite code
 * 3. Checks if user is already a member of the server
 * 4. Adds user as a new member if they aren't already
 * 5. Redirects to the server page
 * @param params - Object containing the inviteCode from the URL
 * @returns Redirects to appropriate page based on conditions
 */
const InvitePage = async ({ params }: InvitePageProps) => {

    // Get the current profile of the user (the person who is invited)
    const profile = await currentProfile(); 

    if (!profile) {
        return <RedirectToSignIn />
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    // Check if the person is ALREADY in the server by checking the invite code and the members table
    const existingMember = await prisma.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // If the person is already in the server, redirect them to the server
    if (existingMember) {
        return redirect(`/servers/${existingMember.id}`);
    }

    // If the person is not in the server, add them to the server
    // Update the server table to add the person to the server 
    // Create a new member in the members table
    const server = await prisma.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: {
                    profileId: profile.id
                }
            }
        } 
    })

    // If there is a server, redirect the person to the server
    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    // If there is no server, redirect the person to the home page
    return redirect("/");
 
}
 
export default InvitePage;