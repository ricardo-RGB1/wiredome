import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

import { ResponsiveWrapper } from "@/components/responsive-wrapper";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {


  const mobileLayout = (
    <div className="h-full">
      <NavigationSidebar />
      <main className="h-full">{children}</main>
    </div>
  );

  const desktopLayout = (
    <div className="h-full">
      <NavigationSidebar />
      <main className="h-full pl-[72px]">{children}</main>
    </div>
  );

  return (
    <ResponsiveWrapper
      mobileContent={mobileLayout}
      desktopContent={desktopLayout}
    />
  );
};

export default MainLayout;
