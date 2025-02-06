import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ResponsiveWrapper } from "@/components/responsive-wrapper";
import { ServerSidebar } from "@/components/server/server-sidebar";



const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {


  const profile = await currentProfile();
  const serverId = params.serverId;


  // if no profile, redirect to home; protect route
  if (!profile) {
    return <RedirectToSignIn />;
  }

  // get server by id and check if profile is a member of the server
  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  }); // this check is to ensure that the user is a member of the server before accessing the server page

  if (!server) {
    return redirect("/");
  }

  // Mobile view (no sidebar)
  const mobileLayout = (
    <div className="h-full">
      <main className="h-full">{children}</main>
    </div>
  );

  // Desktop view (with sidebar)
  const desktopLayout = (
    <div className="h-full">
      <div className="w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full pl-60">{children}</main>
    </div>
  );

  return (
    <ResponsiveWrapper
      mobileContent={mobileLayout}
      desktopContent={desktopLayout}
    />
  );
};

export default ServerIdLayout;
