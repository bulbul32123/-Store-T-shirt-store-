'use client'
import React from 'react'
import { IoBagOutline } from "react-icons/io5";

export default function ShoppingCartIcon({ itemCount }) {
    return (
        <>
            <div className={`relative`}>
                <span className='relative flexCenter'>
                    <IoBagOutline size={27} />
                    <span className='absolute text-xs top-2'>{itemCount}</span>
                </span>
            </div>
        </>
    )
}
