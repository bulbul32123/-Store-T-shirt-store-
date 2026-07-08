import Link from 'next/link'
import { FaFacebookF, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa'
import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="bg-gray-50 text-gray-800 mt-24">
            {/* Subscribe Banner */}
            <div className="bg-black text-white py-12 px-6 sm:px-12 rounded-xl mx-4 sm:mx-8 lg:mx-24 relative -top-16 z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:text-left">
                        Stay Up To Date About Our Latest Offers
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="rounded-full px-5 py-3 w-full focus:outline-none text-black"
                        />
                        <button className="rounded-full px-6 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pt-8 border-t border-gray-200">
                    {/* Brand Info */}
                    <div className="col-span-2 sm:col-span-1">
                        <h3 className="text-2xl font-extrabold">Payra</h3>
                        <p className="text-sm mt-2 text-gray-600">We bring you the latest fashion and performance gear with a modern vibe.</p>
                        <div className="flex gap-3 mt-4">
                            <FaTwitter className="hover:text-black cursor-pointer" />
                            <FaFacebookF className="hover:text-black cursor-pointer" />
                            <FaInstagram className="hover:text-black cursor-pointer" />
                            <FaGithub className="hover:text-black cursor-pointer" />
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#">About</Link></li>
                            <li><Link href="#">Features</Link></li>
                            <li><Link href="#">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Help</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#">Support</Link></li>
                            <li><Link href="#">Delivery Info</Link></li>
                            <li><Link href="#">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#">Blog</Link></li>
                            <li><Link href="#">Guides</Link></li>
                            <li><Link href="#">Community</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-12 border-t pt-6 border-gray-200 text-sm text-gray-500">
                    <p>© 2025 Payra. All rights reserved.</p>
                    <div className="flex gap-3 mt-4 sm:mt-0">
                        <Image src="/bkash-logo.jpg" alt="bkash" width={40} height={24} />
                        <Image src="/rocket-logo.jpeg" alt="Rocket" width={40} height={24} />
                        <Image src="/cod-logo.jpg" alt="Chash on Delivery" width={40} height={24} />
                    </div>
                </div>
            </div>
        </footer>
    )
}
