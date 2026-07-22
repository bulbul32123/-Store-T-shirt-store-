import "../../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { AdminSidebarProvider } from "@/context/AdminSidebarContext";
import { AdminNotificationProvider } from "@/context/AdminNotificationContext";

export const metadata = {
  title: "Payra - Admin Dashboard",
  description:
    "Find the perfect t-shirt for any occasion. Wide range of designs, colors, and sizes.",
};

export default function AdminDashboardLayout({ children }) {
 

  return (
    <div className="h-screen">
      <AdminNotificationProvider>
      <AdminSidebarProvider>
        <TooltipProvider>
          <AdminSidebarLayout>
            <div className="flex min-h-screen flex-col">
              <div className="flex-grow">{children}</div>
            </div>
          </AdminSidebarLayout>
        </TooltipProvider>
      </AdminSidebarProvider>
      </AdminNotificationProvider>
    </div>
  );
}