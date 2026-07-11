import { navConfig } from "@/config/navConfig";
import Link from "next/link";
import SearchBar from "./SearchBar";

import CartNotificationPopover from "@/components/navbar/CartNotificationPopover";
import WatchlistNotificationPopover from "@/components/navbar/WatchlistNotificationPopover";
import { products } from "@/lib/data/products";
import Image from "next/image";
import MobileHamburger from "./MobileHamburger";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const data = products;
  return (
    <div className="w-full h-16" aria-label="Main navigation">
      <div className="flexBetween w-full gap-3 py-3">
        {/* Logo */}
        <div className="flex items-end md:w-[50%] max-md:pr-4 gap-1">
          <Link href={navConfig.logo.href}>
            <Image src={"/Logo.svg"} alt="logo" width={100} height={100} />
          </Link>
        </div>
        {/* Search Bar */}
        <div className="w-full max-md:hidden h-full relative">
          <SearchBar
            data={data}
            placeholder={navConfig.search.placeholder}
            aria-label={navConfig.search.ariaLabel}
          />
        </div>

        {/* Navigation Icons */}
        <div className="md:w-[50%] md:inline hidden">
          <div className="flex items-center text-gray-400 justify-end gap-4">
            <NotificationBell />
            <CartNotificationPopover />
            <WatchlistNotificationPopover />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden inline text-gray-400 hover:text-gray-500 transition-colors">
          <MobileHamburger />
        </div>
      </div>
    </div>
  );
}
