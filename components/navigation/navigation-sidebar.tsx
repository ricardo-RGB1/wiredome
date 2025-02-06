import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationSidebarItem } from "./nav-sidebar-item";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { ResponsiveWrapper } from "../responsive-wrapper";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const NavigationSidebar = async () => {
  const profile = await currentProfile();

  // if no profile, redirect to home; protect route
  if (!profile) {
    return redirect("/");
  }

  // get servers for profile to pass in to NavigationSidebarItem
  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  // no mobile layout for now
  const mobileLayout = null;

  // Desktop layout
  const desktopLayout = (
    <div className="w-[72px] z-50 flex-col fixed inset-y-0">
      <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8]  py-3">
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <ScrollArea className="flex-1 w-full">
          {/* map over servers and render NavigationSidebarItem for each */}
          {servers.map((server) => (
            <div key={server.id} className="mb-4">
              <NavigationSidebarItem
                id={server.id}
                name={server.name}
                imageUrl={server.imageUrl}
              />
            </div>
          ))}
        </ScrollArea>
        <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
          <ModeToggle />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-[48px] w-[48px]",
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveWrapper
      mobileContent={mobileLayout}
      desktopContent={desktopLayout}
    />
  );
};
