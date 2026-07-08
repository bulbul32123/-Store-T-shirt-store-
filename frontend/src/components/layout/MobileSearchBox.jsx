
import React, { useState } from 'react'
import { GrSearch } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { IoSearchSharp } from 'react-icons/io5'
import ProductCard from '@/components/home/carousel/productCarousel/ProductCard';

export default function MobileSearchBox() {
    const [searchBtn, setSearchBtn] = useState(false);
    const [inputValue, setInputValue] = useState("");

    return (
        <div>
            <button className='p-3 rounded-full bg-gray-100 hover:bg-green-500 hover:text-white transitions' onClick={() => setSearchBtn(true)}><GrSearch size={22} /></button>

            <div className={`absolute top-0  left-0 w-full h-full bg-white z-[11] transition-transform duration-200 ease-out ${searchBtn ? "translate-x-0" : "translate-x-[200rem]"} py-5 px-5`}>
                <div className="flex justify-between items-center pt-3 pb-5 padding-sm">
                    <div className="relative flex justify-center items-center w-[80%] md:w-[70%] mr-4">
                        <span className='absolute rounded-full p-2 text-gray-500  transitions hover:bg-[#28AE5F] hover:text-white bg-gray-100  top-[4px] left-1.5'><IoSearchSharp size={18} /></span>
                        <input type="text" placeholder='Search here....' onChange={(e) => setInputValue(e.target.value)} value={inputValue} className='w-full border border-gray-300 outline-none focus-within:border-[#28AE5F] transition-all duration-200 focus-within:border py-2 rounded-3xl pl-11' />
                        {inputValue?.length > 0 && (
                            <button className="absolute right-0 pr-4" onClick={() => setInputValue('')}>
                                <IoMdClose size={20} color="black" />
                            </button>
                        )}
                    </div>
                    <div>
                        <button className="text-black font-medium" onClick={() => setSearchBtn(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
                <div>
                    {inputValue.length > 1 ? (
                        <div className="transition-all  duration-200 ease-out">
                            <span>Search result:</span>
                            <ProductCard />
                        </div>
                    ) : (
                        <div className="h-full w-full bg-white py-4 pl-2 transition-all  duration-200 ease-out">
                            <span className=' text-black font-bold block'>New Products:</span>
                            <div className="flex gap-1 flex-wrap py-3">

                                {
                                    // Fetch New Products and show them in the card
                                    // <ProductCard />
                                }
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>
        </div>
    )
}
