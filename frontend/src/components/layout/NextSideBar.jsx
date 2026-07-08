import Link from 'next/link'
import React from 'react'
import NextSideBarBtn from './NextSideBarBtn'


export default function NextSideBar({ setIsSideBarOpenStates, isSideBarOpen, setOpenHamburger, data }) {
    return (
        <div className={`absolute ${isSideBarOpen ? "translate-x-0" : "translate-x-[30rem] opacity-0"} transition-all duration-500 ease top-0 h-full w-full bg-white z-20`}>
            <div className="flex flex-col mt-4 mb-2">
                <NextSideBarBtn setIsSideBarOpenStates={setIsSideBarOpenStates} setOpenHamburger={setOpenHamburger} />

                <div className="flex flex-col gap-4 my-8 pl-3">
                    <h4 className='font-bold text-2xl mb-2'>{data.title}</h4>
                    {data?.lists?.map((link, index) => (
                        <Link href={`/${link?.name}`} key={index} className='text-gray-500 font-medium text-lg hover:underline hover:text-black'>{link?.name}</Link>
                    ))

                    }
                </div>
            </div>
            <hr />
        </div>
    )
}
