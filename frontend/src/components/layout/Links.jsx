'use client'
import {motion } from 'framer-motion'
import Link from 'next/link'


export default function Links({index, href, text}) {
    return (
        <>
            <motion.li
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="font-medium  border-b-[2px] border-[#f7f5f5] hover:border-black pb-1 list-none"
            >
            <Link href={`${href}`} className="">{text}</Link>
            </motion.li>
        </>
    )
}
