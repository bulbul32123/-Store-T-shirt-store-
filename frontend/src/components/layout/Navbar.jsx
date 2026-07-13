import CartNotificationPopover from "@/components/navbar/CartNotificationPopover";
import WatchlistNotificationPopover from "@/components/navbar/WatchlistNotificationPopover";
import { navConfig } from "@/config/navConfig";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import MobileHamburger from "./MobileHamburger";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";

export default function Navbar() {


  return (
    <div className="w-full h-16" aria-label="Main navigation">
      <div className="flexBetween w-full gap-3 py-3">
        {/* Logo */}
        <div className="flex items-end md:w-[50%] max-md:pr-4 gap-1">
          <Link href={navConfig.logo.href}>
            <Image src="/Logo.svg" alt="logo" width={100} height={100} />
          </Link>
        </div>

        {/* Search */}
        <div className="w-full max-md:hidden h-full relative">
          <SearchBar
            placeholder={navConfig.search.placeholder}
            aria-label={navConfig.search.ariaLabel}
          />
        </div>

        {/* Right */}
        <div className="md:w-[50%] md:inline hidden">
          <div className="flex items-center text-gray-400 justify-end gap-4">
            <NotificationBell />
            <CartNotificationPopover />
            <WatchlistNotificationPopover />
          </div>
        </div>

        <div className="md:hidden inline text-gray-400 hover:text-gray-500 transition-colors">
          <MobileHamburger />
        </div>
      </div>
    </div>
  );
}
