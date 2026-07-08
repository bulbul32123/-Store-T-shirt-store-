'use client'
import Link from 'next/link';
import UserProfile from './userProfile/UserProfile';
// 1. Import your custom useAuth hook
import { useAuth } from '@/context/AuthContext'; // Adjust this path based on where your AuthContext file is located

export default function Header() {
  // 2. Consume the real authentication values from Context
  const { isAuthenticated, user, loading: isLoading } = useAuth();

  return (
    <div className=" bg-[#f7f5f5]">
      <div className="py-2 2xl:py-3 flex justify-between padding-sm max-md:hidden mx-auto h-full w-full  2xl:max-w-[1500px] pl-5 pr-5 md:pl-10 md:pr-10">
        <h5 className='2xl:text-lg 2xl:font-bold'>**Only available in Dhaka**</h5>
        <div className="flexCenter gap-2 text-[#111111]">
          {isLoading ? (
            <div className="flexCenter gap-2 text-[#111111]">
              <div className="w-4 h-4 border-t-transparent border-b-transparent border-r-transparent border-l-black animate-spin rounded-full border-2"></div>
            </div>
          ) : (
            isAuthenticated ? (
              <UserProfile user={user} />
            ) : (
              <>
                <li className="list-none flex pt-1 justify-center items-center">
                  <div className="mr-2 h-3 border-[#111111] "></div>
                  <Link className="md:text-xs 2xl:text-lg 2xl:font-bold md:font-medium" href='/auth/register'>Sign Up</Link>
                </li>
                <li className="list-none flex pt-1 justify-center items-center">
                  <div className="border-l-[1px] mr-2 h-3 border-[#111111] "></div>
                  <Link className="text-xs 2xl:text-lg 2xl:font-bold md:font-medium" href='/auth/login'>Log In</Link>
                </li>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}