import "../globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "T-Shirt Store - Admin Dashboard",
    description: "Find the perfect t-shirt for any occasion. Wide range of designs, colors, and sizes.",
};

export default function AdminDashboardLayout({ children }) {
    return (
        <div >
            <SidebarProvider>
                <AdminLayout>
                    <div className="flex flex-col min-h-screen">
                        <div className="flex-grow">{children}</div>
                    </div>
                </AdminLayout>
            </SidebarProvider>
        </div>
    );
}
