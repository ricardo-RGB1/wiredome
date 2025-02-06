import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
    params: {
        serverId: string; 
    }
}




/**
 * ServerIdPage component is responsible for handling the server page logic.
 * It performs the following tasks:
 * 1. Retrieves the current user's profile.
 * 2. Redirects to the sign-in page if the user is not authenticated.
 * 3. Queries the database to find the server by ID where the user is a member.
 * 4. Includes only the "general" channel in the query results.
 * 5. Redirects the user to the "general" channel if it exists.
 * 6. Displays a fallback message if no "general" channel is found.
 * 
 * @param {ServerIdPageProps} params - The parameters containing the server ID.
 * @returns {JSX.Element | Promise<void>} - A JSX element or a redirect action.
 */
const ServerIdPage = async ({ params }: ServerIdPageProps) => {
    // Retrieve the current user's profile to verify authentication
    const profile = await currentProfile(); 

    // If no profile is found, redirect the user to the sign-in page
    if (!profile) {
        return <RedirectToSignIn />; 
    } 

    // Query the database to find the server where the user is a member
    // and include only the "general" channel in the results
    const server = await prisma.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id // Ensures the user is a member of the server
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general" // Filters to include only the "general" channel
                },
                orderBy: {
                    createdAt: 'asc' // Orders channels by creation date
                }
            }
        }
    });

    // If the server and its "general" channel exist, redirect to the channel
    if (server?.channels?.[0]) {
        return redirect(`/servers/${params.serverId}/channels/${server.channels[0].id}`);
    }

    // If no "general" channel is found, display a fallback message
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">No general channel found.</p>
            <p className="text-xs text-muted-foreground">Please contact a server admin.</p>
        </div>
    );
};

export default ServerIdPage;
 