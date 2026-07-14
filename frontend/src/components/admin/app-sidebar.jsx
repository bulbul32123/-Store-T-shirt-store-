"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaUserAstronaut } from "react-icons/fa";
import {
  FiHome,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMessageCircle,
  FiTag,
  FiGrid,
} from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiHome },
  { href: "/admin/products", label: "Products", icon: FiBox },
  { href: "/admin/categories", label: "Categories", icon: FiGrid },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: FiUsers },
  { href: "/admin/coupons", label: "Coupons", icon: FiTag },
  { href: "/admin/reviews", label: "Reviews", icon: FiTag },
  { href: "/admin/support", label: "Customer Support", icon: FiMessageCircle },
  { href: "/admin/reports", label: "Reports", icon: FiBarChart2 },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
];

export function AppSidebar(props) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Sidebar {...props} className="bg-white!">
      <SidebarHeader className="border-b bg-white">
        <Link href="/admin/dashboard" className="flexCenter gap-1 ">
          <Image src="/Logo.svg" alt="logo" width={80} height={80} />{" "}
          <h2 className="text-[20.5px] font-bold px-2 py-2">Admin</h2>
        </Link>
      </SidebarHeader>

      <SidebarContent className="pl-2 bg-white">
        <SidebarMenu className={"gap-1"}>
          {sidebarLinks.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href} className="first:mt-2 ">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="py-6 px-4 rounded-r"
                >
                  <Link href={item.href} className="text-[17px]">
                    <Icon className="h-11 w-11" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t bg-white">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
            {user?.profilePicture?.url ? (
              <Image
                src={user.profilePicture.url}
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <FaUserAstronaut className="h-6 w-6" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name || "Admin"}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}