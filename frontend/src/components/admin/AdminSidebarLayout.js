import { AppSidebar } from "@/components/admin/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import NotificationDropdown from "./header/NotificationDropdown"
import UserDropdown from "./header/UserDropdown"

export default function AdminSidebarLayout({children}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white z-10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 2xsm:gap-3 bg-white">
                    <NotificationDropdown />
                  <UserDropdown />
        
                </div>
        </header>
        <main>
         {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
