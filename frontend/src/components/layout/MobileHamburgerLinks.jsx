"use client";
import Link from "next/link";
import FavouriteIcon from "./FavouriteIcon";
import ShoppingCartIcon from "./ShoppingCartIcon";

export default function MobileHamburgerLinks({ setOpenHamburger }) {
  return (
    <>
      <Link
        href="/products?status=newDrop"
        onClick={() => setOpenHamburger(false)}
        className="flex gap-2 items-center hover:underline "
      >
        <p className="">New Arrives</p>
      </Link>
      <Link
        href="/products?minRating=4"
        onClick={() => setOpenHamburger(false)}
        className="flex gap-2 items-center hover:underline "
      >
        <p className="">Top Rating</p>
      </Link>
      <Link
        href="/products?sale=true"
        onClick={() => setOpenHamburger(false)}
        className="flex gap-2 items-center hover:underline "
      >
        <p className="">Special Offers</p>
      </Link>{" "}
      
 
    </>
  );
}
