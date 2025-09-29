"use client"
import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { usePathname } from 'next/navigation';

export default function AppLayer({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    
    return (
        <div>
            {!isAdmin && <Header />}
            <main className="flex-grow">{children}</main>
            {!isAdmin && <Footer />}
        </div>
    )
}
