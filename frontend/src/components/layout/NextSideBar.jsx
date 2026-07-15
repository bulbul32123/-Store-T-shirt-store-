import Link from "next/link";
import React from "react";
import NextSideBarBtn from "./NextSideBarBtn";

export default function NextSideBar({
  setIsSideBarOpenStates,
  isSideBarOpen,
  setOpenHamburger,
  data,
}) {
  return (
    <div
      className={`absolute ${isSideBarOpen ? "translate-x-0" : "translate-x-[30rem] opacity-0"} transition-all duration-500 ease top-0 h-full w-full bg-white z-20`}
    >
      <div className="flex flex-col mt-4 mb-2">
        <NextSideBarBtn
          setIsSideBarOpenStates={setIsSideBarOpenStates}
          setOpenHamburger={setOpenHamburger}
        />

        <div className="flex flex-col gap-4 my-8 pl-3 pr-3">
          <h4 className="font-bold text-2xl mb-2">{data?.title}</h4>
          {data?.lists?.map((link, index) => {
            const baseStyle =
              "font-medium text-lg flex items-center gap-3 hover:underline";
            const finalStyle = link.isDanger
              ? `${baseStyle} text-red-600 hover:text-red-700`
              : `${baseStyle} text-gray-500 hover:text-black`;

            if (link.onClick) {
              return (
                <button
                  key={index}
                  onClick={link.onClick}
                  className={finalStyle}
                >
                  {link.icon && link.icon}
                  {link.name}
                </button>
              );
            }

            return (
              <Link
                href={link.link || `/${link.name}`}
                key={index}
                onClick={() => setOpenHamburger(false)}
                className={finalStyle}
              >
                {link.icon && link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
      <hr />
    </div>
  );
}
