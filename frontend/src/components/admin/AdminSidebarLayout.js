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
      <SidebarInset className="min-w-0 w-full flex flex-col overflow-hidden">
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white z-10 px-4 w-full">
          {/* Left Block: Contains the trigger and left-aligned components (like the Search input) */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />

            {/* 💡 IF YOUR SEARCH INPUT IS IN THE HEADER, PLACE IT HERE: */}
            {/* <SearchBar className="w-full max-w-md" /> */}
          </div>

          {/* Right Block: Kept distinct so it never overlaps text widgets */}
          <div className="flex items-center gap-2 2xsm:gap-3 bg-white shrink-0">
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 overflow-x-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
