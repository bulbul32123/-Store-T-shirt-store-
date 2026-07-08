'use client'
import React, { useEffect, useRef, useState } from 'react'
import { IoSearchSharp } from 'react-icons/io5'
import { useRouter } from 'next/navigation';
import SearchResults from './SearchResults';

export default function SearchBar({ data, placeholder }) {
    const router = useRouter()
    const [isSearchResultOpen, setIsSearchResultOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([]);
    const searchRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchResultOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [data])
    const navigateToSearchPage = (e) => {
        if (e.key === 'Enter' && searchValue.length > 0) {
            router.push(`/search?query=${searchValue}`)
            setIsSearchResultOpen(false)
        }
    }
    const SendToSearchPage = () => {
        if (searchValue.length > 0) {
            router.push(`/search?query=${searchValue}`)
            setIsSearchResultOpen(false)
        }
    }
    const getFilterData = () => {
        if (searchValue.length > 0) {
            let temp = data?.filter((item) => item?.name?.toLowerCase()?.includes(searchValue.toLowerCase()))
            setDatas(temp)
        }
        else {
            setDatas([])
        }
    }
    useEffect(() => {
        getFilterData()
    }, [searchValue])

    return (
        <>
            <div className={`relative h-full w-full bg-white ${searchValue.length && isSearchResultOpen > 0 ? 'z-[50]' : 'z-[0]'}`} ref={searchRef}>
                <input type="text" placeholder={placeholder} onFocus={() => setIsSearchResultOpen(true)} onChange={(e) => setSearchValue(e.target.value)} value={searchValue} onKeyUp={(e) => navigateToSearchPage(e)} className='w-full border border-gray-300 outline-none focus-within:border-[#28AE5F] transition-all duration-200 focus-within:border py-2 rounded-lg pl-10' />

                <button onClick={SendToSearchPage} className='absolute rounded-lg py-1.5 text-gray-500 text-sm font-light transitions hover:bg-[#28AE5F] hover:text-white bg-gray-100 px-4 md:px-6 top-[5px] right-2'>Search</button>
                <span className='absolute rounded-lg p-2 text-gray-500  transitions hover:bg-[#28AE5F] hover:text-white bg-gray-100  top-[4px] left-1.5'><IoSearchSharp size={18} /></span>
                <div className={`absolute left-0 w-full  border rounded-md ${searchValue.length && isSearchResultOpen > 0 ? 'top-12 opacity-1 z-[10] max-lg:h-80 h-96 bg-white ' : 'top-16 h-0 border-none '} transition-all duration-300 ease-in-out overflow-x-hidden`}>
                    {isSearchResultOpen && <SearchResults searchQuery={searchValue} data={datas} />}
                </div>
            </div>
        </>
    )
}