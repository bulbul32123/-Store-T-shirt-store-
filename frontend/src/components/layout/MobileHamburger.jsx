"use client";
import CartNotificationPopover from "@/components/navbar/CartNotificationPopover";
import WatchlistNotificationPopover from "@/components/navbar/WatchlistNotificationPopover";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CgMenuRight } from "react-icons/cg";
import {
  FaBoxOpen,
  FaHeadphones,
  FaHeart,
  FaShoppingCart,
  FaSignOutAlt,
  FaUserAstronaut,
} from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { MdKeyboardArrowRight } from "react-icons/md";
import NotificationBell from "./NotificationBell";

import { shopList, status } from "@/constants/constants";
import BtnClose from "./BtnClose";
import MobileHamburgerLinks from "./MobileHamburgerLinks";
import MobileSearchBox from "./MobileSearchBox";
import NextSideBar from "./NextSideBar";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWatchlist } from "@/context/WatchlistContext";

import { productsApi } from "@/lib/productsApi";

export default function MobileHamburger() {
  const [openHamburger, setOpenHamburger] = useState(false);
  const [isSideBarOpenStates, setIsSideBarOpenStates] = useState({
    openProfile: false,
    openCategory: false,
    openBrand: false,
    openFeatured: false,
    openShopAll: false,
    openStatus: false,
  });

  const [categoriesData, setCategoriesData] = useState({
    title: "Categories",
    lists: [],
  });

  const {
    isAuthenticated,
    user,
    loading: isLoading,
    logout,
    hasRole,
  } = useAuth();
  const { syncNow: syncCartNow } = useCart();
  const { syncNow: syncWatchlistNow } = useWatchlist();

  const isAdmin = hasRole("admin");

  useEffect(() => {
    const fetchRealCategories = async () => {
      try {
        const categories = await productsApi.getCategories();
        // Map the API categories into the formatting expected by NextSideBar
        const formattedLists = categories.map((cat) => ({
          name: cat.name,
          // If your category routes require an ID or slug, you can customize this:
          link: `/products?category=${cat._id}`,
        }));

        setCategoriesData({
          title: "Categories",
          lists: formattedLists,
        });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchRealCategories();
  }, []);

  const handleLogout = async () => {
    setOpenHamburger(false);
    setIsSideBarOpenStates((prev) => ({ ...prev, openProfile: false }));
    try {
      await Promise.all([syncCartNow(), syncWatchlistNow()]);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getProfileSidebarData = () => {
    const lists = [];

    if (isAdmin) {
      lists.push({
        name: "Admin Dashboard",
        link: "/admin/dashboard",
        icon: <GrUserAdmin className="text-gray-500" />,
      });
    }

    lists.push(
      {
        name: "Profile",
        link: "/profile/account",
        icon: <FaUserAstronaut className="text-gray-500" />,
      },
      {
        name: "Orders",
        link: "/orders",
        icon: <FaBoxOpen className="text-gray-500" />,
      },
      {
        name: "Watchlist",
        link: "/watchlist",
        icon: <FaHeart className="text-gray-500" />,
      },
      {
        name: "Cart",
        link: "/cart",
        icon: <FaShoppingCart className="text-gray-500" />,
      },
      {
        name: "Customer help",
        onClick: () => {
          setOpenHamburger(false);
          setIsSideBarOpenStates((prev) => ({ ...prev, openProfile: false }));
          window.dispatchEvent(
            new CustomEvent("open-support-chat", {
              detail: { chatId: null },
            }),
          );
        },
        icon: <FaHeadphones className="text-gray-500" />,
      },
      {
        name: "Logout",
        onClick: handleLogout,
        icon: <FaSignOutAlt className="text-red-500" />,
        isDanger: true,
      },
    );

    return {
      title: `${user?.name || "User"}'s Account`,
      lists,
    };
  };

  const profileData = getProfileSidebarData();

  return (
    <div>
      <div className="flex gap-2 items-center w-full bg-white">
        <div className="flex items-center text-gray-400 justify-end gap-2">
          <NotificationBell />
          <CartNotificationPopover />
          <WatchlistNotificationPopover />
        </div>
        <MobileSearchBox />
        <span className="h-5 w-[1px] bg-neutral-200 block" />
        <button
          onClick={() => setOpenHamburger((prv) => !prv)}
          className="p-3 rounded-full bg-primary hover:bg-black text-white hover:text-white transitions"
        >
          <CgMenuRight size={23} />
        </button>
      </div>
      {openHamburger && (
        <>
          <div
            className="fixed w-full top-0 inset-0 z-[199] bg-black/[0.4]"
            onClick={() => setOpenHamburger(false)}
          ></div>
          <div
            className={`fixed h-full top-0 right-0 z-[200] bg-white text-black p-3 ${openHamburger ? "-translate-x-[0rem]" : "translate-x-[100rem]"} transition-all duration-200 ease-linear`}
          >
            <div className="relative flex h-full w-80 flex-col py-4 pb-8">
              <div className="flex flex-col px-4">
                <div className="w-full bg-white pr-3 flex justify-between">
                  <div className=""></div>
                  <BtnClose setClose={setOpenHamburger} />
                </div>
                <div className="w-full flex mt-5">
                  <div className="flex text-xl flex-col gap-5 w-full">
                    {isLoading ? (
                      <div className="flex items-center gap-2 pb-4">
                        <div className="w-4 h-4 border-t-transparent border-b-transparent border-r-transparent border-l-black animate-spin rounded-full border-2"></div>
                      </div>
                    ) : isAuthenticated ? (
                      <button
                        onClick={() =>
                          setIsSideBarOpenStates((prev) => ({
                            ...prev,
                            openProfile: true,
                          }))
                        }
                        className="group flex items-center justify-between w-full hover:underline py-1"
                      >
                        <div className="flex items-center gap-3">
                          {user?.profilePicture?.url ? (
                            <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center">
                              <img
                                src={user.profilePicture.url}
                                alt={user?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <FaUserAstronaut size={23} />
                          )}
                          <p className={`${isAdmin && "text-primary"}`}>
                            Hi, {user?.name || "User"}
                          </p>
                        </div>
                        <span>
                          <MdKeyboardArrowRight
                            size={25}
                            className="text-neutral-400 opacity-20 group-hover:text-black group-hover:opacity-100 transition-all duration-200"
                          />
                        </span>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3 pb-4">
                        <Link
                          href="/auth/register"
                          onClick={() => setOpenHamburger(false)}
                          className="text-base font-medium hover:underline flex items-center gap-2"
                        >
                          Sign Up
                        </Link>
                        <Link
                          href="/auth/login"
                          onClick={() => setOpenHamburger(false)}
                          className="text-base font-medium hover:underline flex items-center gap-2"
                        >
                          Log In
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setIsSideBarOpenStates((prev) => ({
                          ...prev,
                          openCategory: true,
                        }))
                      }
                      className="group flex items-center justify-between w-full hover:underline py-1"
                    >
                      <p className="">Categories</p>
                      <span>
                        <MdKeyboardArrowRight
                          size={25}
                          className="text-neutral-400 opacity-20 group-hover:text-black group-hover:opacity-100 transition-all duration-200"
                        />
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSideBarOpenStates((prev) => ({
                          ...prev,
                          openShopAll: true,
                        }));
                      }}
                      className="group flex items-center justify-between w-full hover:underline py-1"
                    >
                      <p className="">Shop All</p>
                      <span>
                        <MdKeyboardArrowRight
                          size={25}
                          className="text-neutral-400 opacity-20 group-hover:text-black group-hover:opacity-100 transition-all duration-200"
                        />
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSideBarOpenStates((prev) => ({
                          ...prev,
                          openStatus: true,
                        }));
                      }}
                      className="group flex items-center justify-between w-full hover:underline py-1"
                    >
                      <p className="">Status</p>
                      <span>
                        <MdKeyboardArrowRight
                          size={25}
                          className="text-neutral-400 opacity-20 group-hover:text-black group-hover:opacity-100 transition-all duration-200"
                        />
                      </span>
                    </button>

                    <MobileHamburgerLinks setOpenHamburger={setOpenHamburger} />
                  </div>
                </div>
              </div>

              <NextSideBar
                data={profileData}
                setIsSideBarOpenStates={setIsSideBarOpenStates}
                isSideBarOpen={isSideBarOpenStates.openProfile}
                setOpenHamburger={setOpenHamburger}
              />

              <NextSideBar
                data={categoriesData}
                setIsSideBarOpenStates={setIsSideBarOpenStates}
                isSideBarOpen={isSideBarOpenStates.openCategory}
                setOpenHamburger={setOpenHamburger}
              />

              <NextSideBar
                data={shopList}
                setIsSideBarOpenStates={setIsSideBarOpenStates}
                isSideBarOpen={isSideBarOpenStates.openShopAll}
                setOpenHamburger={setOpenHamburger}
              />

              <NextSideBar
                data={status}
                setIsSideBarOpenStates={setIsSideBarOpenStates}
                isSideBarOpen={isSideBarOpenStates.openStatus}
                setOpenHamburger={setOpenHamburger}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
