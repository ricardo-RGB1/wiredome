import { initialProfile } from "@/lib/initial-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { InitialModal } from "@/components/modals/initial-modal";



// The Setup page is the first page that the user sees when they sign up or sign in.
// It is used to create a server for the user if they don't have one.
//  1. Call the initialProfile function to get the profile of the user.
//  2. Check if the server exists for the profile.
//  3. If the server exists, redirect to the server page.
//  4. If the server does not exist, redirect to the create server page.
const SetupPage = async () => {
    // 1. Call the initialProfile function to get the profile of the user.
    const profile = await initialProfile();

    // 2. Check if the server exists for the profile.
    const server = await prisma.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    // 3. If the server exists, redirect to the server page.
    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    // 4. If the server does not exist, redirect to the create server page.
    return ( 
        <div>
            <InitialModal />
        </div>
      );
}
 
export default SetupPage; 