import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ServerSidebar } from "./server/server-sidebar";




export const MobileToggle = async ({ serverId }: { serverId: string }) => {



  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <ServerSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
};
