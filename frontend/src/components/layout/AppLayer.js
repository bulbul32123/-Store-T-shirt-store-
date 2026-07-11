"use client"
import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Nav from './Nav';

export default function AppLayer({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    useEffect(() => {
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        const now = Date.now();
        const lastActivity = localStorage.getItem('site_last_activity');
        const sessionStart = localStorage.getItem('site_session_start');

        if (!sessionStart || !lastActivity || now - Number(lastActivity) > SESSION_TIMEOUT) {
            localStorage.setItem('site_session_start', String(now));
            // Reset popup history
            localStorage.removeItem('cart_popup_last_shown');
            localStorage.removeItem('watchlist_popup_last_shown');
        }

        localStorage.setItem('site_last_activity', String(now));

        // Throttle updates to localStorage on activity to avoid performance overhead
        let lastSaved = Date.now();
        const updateActivity = () => {
            const current = Date.now();
            if (current - lastSaved > 10000) { // 10 seconds throttle
                localStorage.setItem('site_last_activity', String(current));
                lastSaved = current;
            }
        };

        window.addEventListener('click', updateActivity);
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);

        return () => {
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
        };
    }, []);
    
    return (
        <div>
          
            <header className="md:inline hidden py-3">
            <Header />
          </header>
           <div className="mx-auto w-full xl:max-w-[1500px] pl-5 pr-5 md:pl-10 md:pr-10 relative">
            <Navbar />
          </div>
          <div className="">
            <Nav />
          </div>
            <main className="mx-auto h-full w-full xl:max-w-[1500px]  relative overflow-x-hidden">{children}</main>
             <Footer />
        </div>
    )
}
