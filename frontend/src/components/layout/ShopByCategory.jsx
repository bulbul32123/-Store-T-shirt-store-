'use client'
import {motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

export default function ShopByCategory({ categoryLists }) {
    return (
        <div>
            <p
                className="font-medium text-gray-900">Shop By Categories</p>
            <ul
                className="mt-6 space-y-6 sm:mt-4 sm:space-y-4 ">
                {categoryLists.lists.map((item, index) => (
                    <motion.li className="flex" key={index} initial={{y: index * 4 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4 }}
                    >
                        <Link href={`/products?category=${item?.name}&brand=${item?.name}&color=all&feature=all&condition=all&sort_by=desc`}
                            className="hover:text-gray-800">{item.name} </Link>
                    </motion.li>
                ))
                }
            </ul>
        </div>
    )
}
