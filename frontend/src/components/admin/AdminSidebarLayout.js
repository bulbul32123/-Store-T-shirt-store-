import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NotificationDropdown from "./header/NotificationDropdown";
import UserDropdown from "./header/UserDropdown";
import Link from "next/link";

export default function AdminSidebarLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 w-full flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white z-10 px-4 w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0" />
          </div>

          <div className="flex items-center gap-2 2xsm:gap-3 bg-white shrink-0 ">
            <Link href={'/'} className="underline leading-3">View Store</Link>
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </header>
        <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
