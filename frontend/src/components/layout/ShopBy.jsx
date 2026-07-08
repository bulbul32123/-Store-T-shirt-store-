'use client'
import {motion } from 'framer-motion'
import Link from 'next/link'

export default function ShopBy({ shopList }) {
    return (
        <div>
            <p
                className="font-medium text-gray-900">Shop By </p>
            <ul
                className="mt-6 space-y-6 sm:mt-4 sm:space-y-4 ">
                {shopList.lists.map((item, index) => (
                    <motion.li className="flex" key={index}  initial={{y: index * 4 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4 }}>
                        <Link href={`/products?category=${item?.category}&brand=${item?.brand}&color=all&feature=all&condition=all&sort_by=desc`}
                            className="hover:text-gray-800">{item.name} </Link>
                    </motion.li>
                ))
                }
            </ul>
        </div>
    )
}
