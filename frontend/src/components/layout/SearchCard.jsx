import Image from 'next/image';
import Link from 'next/link'
import React from 'react'
import PriceComponent from './PriceComponent';

export default function SearchCard({ item }) {
    const p = item
    console.log(item);

    return (
        <>
            <Link href={`/product/${p?.slug}`} className="w-full flex gap-2 h-20 bg-gray-50 rounded-md hover:bg-gray-100 p-[2px]">
                <div className="w-16 sm:w-28">
                    <Image src={p?.images[0]} className='h-full w-16 sm:w-28 object-cover object-center rounded-sm' alt={p?.name} height={100} width={100} />
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className='text-[10px]  sm:text-lg text-nowrap overflow-hidden'>{p?.name.length > 27 ? (p?.name)?.slice(0, 27) + '...' : p?.name}</h1>
                    <PriceComponent product={p} />
                    <div className="flex items-center text-sm text-yellow-500 mb-1">
                        {'★'.repeat(Math.floor(p.rating))} <span className="ml-1 text-gray-500">{p.rating}/5</span>
                    </div>
                </div>
            </Link>
        </>
    )
}
