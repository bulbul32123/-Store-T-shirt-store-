import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NotificationDropdown from "./header/NotificationDropdown";
import UserDropdown from "./header/UserDropdown";

export default function AdminSidebarLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* 
        1. Added 'h-screen' to lock the layout height to the viewport.
        2. 'overflow-hidden' prevents the entire wrapper from scrolling.
      */}
      <SidebarInset className="min-w-0 w-full flex flex-col h-screen overflow-hidden">
        {/* Header stays sticky at the top of this fixed container */}
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white z-10 px-4 w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
          </div>

          <div className="flex items-center gap-2 2xsm:gap-3 bg-white shrink-0">
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </header>

        {/* 
          3. Added 'overflow-y-auto' so only the main content scrolls 
             independently while the header remains perfectly fixed.
        */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
