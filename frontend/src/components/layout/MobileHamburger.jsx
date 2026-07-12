'use client'
import React, { useState } from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

import { CgMenuRight } from "react-icons/cg";
import { FaUserAstronaut } from "react-icons/fa";
import MobileSearchBox from './MobileSearchBox';
import UserImg from './UserImg';
import NextSideBar from './NextSideBar';
import { categoryLists, profileLists } from '@/utils/categoryLists';
import { brandLists, featured } from '@/constants/constants';
import BtnClose from './BtnClose';
import MobileHamburgerLinks from './MobileHamburgerLinks';


export default function MobileHamburger() {
    const [openHamburger, setOpenHamburger] = useState(false);
    const [isSideBarOpenStates, setIsSideBarOpenStates] = useState({
        openProfile: false,
        openCategory: false,
        openBrand: false,
        openFeatured: false,
        openShopAll: false,
    });
    const userImg = false
    return (
        <div>
            <div className="flex gap-2 items-center w-full">
                <MobileSearchBox />
                <button onClick={() => setOpenHamburger((prv) => !prv)} className='p-3 rounded-full bg-gray-100 hover:bg-green-500 hover:text-white transitions'>
                    <CgMenuRight size={23} />
                </button>
            </div>
            {
                openHamburger && (
                    <>
                        <div className="fixed w-full top-0 inset-0 z-10 bg-black/[0.4]" onClick={() => setOpenHamburger(false)}></div>
                        <div className={`fixed h-full top-0 z-[200] bg-white text-black p-3 ${openHamburger ? '-translate-x-[8.5rem]' : 'translate-x-[100rem]'} transition-all duration-200 ease-linear`}>
                            <div className="relative flex h-full w-72 flex-col py-4 pb-8">
                                <div className="flex flex-col px-4">
                                    <div className="w-full bg-white flex justify-between">
                                        <div className=""></div>
                                        <BtnClose setClose={setOpenHamburger} />
                                    </div>
                                    <div className="w-full flex mt-5">
                                        <div className="flex text-xl flex-col gap-5 w-full" >

                                            <button onClick={() =>
                                                setIsSideBarOpenStates(prev => ({
                                                    ...prev,
                                                    openProfile: true
                                                }))
                                            } className='flexBetween gap-2 hover:underline pb-4'>
                                                <div className="flex items-center gap-3">
                                                    {userImg ? <UserImg /> : <FaUserAstronaut size={23} />}
                                                    <p className=''>Hi, Bulbul</p>
                                                </div>
                                                <span><MdKeyboardArrowRight size={25} /></span>
                                            </button>


                                            <button onClick={() => {
                                                setIsSideBarOpenStates(prev => ({
                                                    ...prev,
                                                    openFeatured: true
                                                }))
                                            }} className='flexBetween gap-2 hover:underline '>
                                                <p className=''>Featured</p>
                                                <span><MdKeyboardArrowRight size={25} /></span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setIsSideBarOpenStates(prev => ({
                                                        ...prev,
                                                        openCategory: true
                                                    }))
                                                }
                                                className='flexBetween gap-2 hover:underline '
                                            >
                                                <p className=''>Categories</p>
                                                <span><MdKeyboardArrowRight size={25} /></span>
                                            </button>

                                            <button onClick={() => {
                                                setIsSideBarOpenStates(prev => ({
                                                    ...prev,
                                                    openBrand: true
                                                }))
                                            }} className='flexBetween gap-2 hover:underline '>
                                                <p className=''>Shop by Brands</p>
                                                <span><MdKeyboardArrowRight size={25} /></span>
                                            </button>


                                            <MobileHamburgerLinks setOpenHamburger={setOpenHamburger} />
                                        </div>
                                    </div>
                                </div>
                                <NextSideBar data={profileLists} setIsSideBarOpenStates={setIsSideBarOpenStates} isSideBarOpen={isSideBarOpenStates.openProfile} setOpenHamburger={setOpenHamburger} />

                                <NextSideBar data={categoryLists} setIsSideBarOpenStates={setIsSideBarOpenStates} isSideBarOpen={isSideBarOpenStates.openCategory} setOpenHamburger={setOpenHamburger} />

                                <NextSideBar data={brandLists} setIsSideBarOpenStates={setIsSideBarOpenStates} isSideBarOpen={isSideBarOpenStates.openBrand} setOpenHamburger={setOpenHamburger} />

                                <NextSideBar data={featured} setIsSideBarOpenStates={setIsSideBarOpenStates} isSideBarOpen={isSideBarOpenStates.openFeatured} setOpenHamburger={setOpenHamburger} />

                            </div>
                        </div>
                    </>
                )
            }
        </div>
    )
}


