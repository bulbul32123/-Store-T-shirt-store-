'use client'
import React from 'react'
import { IoClose } from 'react-icons/io5'
import { MdKeyboardArrowRight } from 'react-icons/md'

export default function NextSideBarBtn({ setOpenHamburger, setIsSideBarOpenStates }) {
    return (
        <div className="w-full bg-white flex justify-between items-center pr-6 z-20">
            <button className='flex ' onClick={() => setIsSideBarOpenStates(prev => ({
                ...prev,
                openProfile: false,
                openCategory: false,
                openBrand: false,
                openStatus:false,
                openFeatured: false,
                openShopAll: false,
            }))} ><MdKeyboardArrowRight size={25} className='rotate-180' />Back</button>
            <button onClick={() => {
                setOpenHamburger(false), setIsSideBarOpenStates(prev => ({
                    ...prev,
                    openProfile: false,
                    openBrand: false,
                    openStatus:false,
                    openFeatured: false,
                    openShopAll: false,
                    openCategory: false
                }))
            }} className='p-2 rounded-full bg-white hover:bg-slate-200 transition-all duration-200 ease-in-out'><IoClose size={20} /></button>
        </div>
    )
}
