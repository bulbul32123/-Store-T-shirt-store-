import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Banner({ banner, title }) {
    return (
        <div className="relative w-full h-[600px] overflow-hidden mt-9 mb-10 rounded-xl">
            <h2 className={`text-4xl pb-4 font-extrabold text-black`}>{title}</h2>
            
            <Link href={`/products/shop?category=${banner?.cat}&color=all&brands=all&status=all&subcategory=all&pattern=all&material=all&fit=all&style=all&isInStock=all&price=all&size=all`} className="block w-full h-full relative">
                <Image
                    src={banner?.img}
                    alt="Banner"
                    fill
                    className="object-cover object-center rounded-xl"
                />
            </Link>
        </div >
    )
}
