'use client'
import React from 'react'
import { IoClose } from 'react-icons/io5'

export default function BtnClose({ setClose }) {
    return (
        <button onClick={() => setClose(false)} className='p-2 bg-[#FFB800] rounded-full bg-white hover:bg-slate-200 transition-all duration-200 ease-in-out'><IoClose size={20} /></button>
    )
}
