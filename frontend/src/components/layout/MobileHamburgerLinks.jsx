'use client'
import Link from 'next/link'
import React from 'react'
import ShoppingCartIcon from './ShoppingCartIcon'
import FavouriteIcon from './FavouriteIcon'

export default function MobileHamburgerLinks({ setOpenHamburger }) {
    return (
        <>
            <Link href='/' onClick={() => setOpenHamburger(false)} className='flex gap-2 items-center hover:underline '>
                <p className=''>Shop All</p>
            </Link>
            <Link href='/' onClick={() => setOpenHamburger(false)} className='flex gap-2 items-center hover:underline '>
                <p className=''>New Arrives</p>
            </Link>
            <Link href='/' onClick={() => setOpenHamburger(false)} className='flex gap-2 items-center hover:underline '>
                <p className=''>Special Offers</p>
            </Link>
            <hr className='mb-3' />
            <Link href='/favourites' onClick={() => setOpenHamburger(false)} className='flex gap-2 items-center hover:underline'>
                <FavouriteIcon />
                <p className=''>Favourites </p>
            </Link>
            <Link href='/cart' onClick={() => setOpenHamburger(false)} className='flex items-center  justify-start gap-2 hover:underline'>
                <ShoppingCartIcon />
                <p className=''>Cart</p>
            </Link>
        </>
    )
}
