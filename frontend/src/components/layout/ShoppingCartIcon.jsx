'use client'
import React from 'react'
import { IoBagOutline } from "react-icons/io5";

export default function ShoppingCartIcon({ itemCount }) {
    return (
      <>
        <div className={`relative`}>
          <span className="relative flexCenter max-md:p-3 max-md:rounded-full max-md:bg-primary max-md:hover:bg-black max-md:text-white max-md:hover:text-white transitions">
            <IoBagOutline size={27} className='max-h-6 max-w-6'/>
            <span className="absolute text-xs top-2">{itemCount}</span>
          </span>
        </div>
      </>
    );
}
