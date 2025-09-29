import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">T-Shirt Store</h3>
                        <p className="text-gray-400 mb-4">
                            Quality t-shirts for everyone. Express yourself with our wide range of designs and styles.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FaFacebook size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FaTwitter size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FaInstagram size={20} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <FaYoutube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/customize" className="text-gray-400 hover:text-white transition-colors">
                                    Customize
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                                    Shipping & Returns
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/size-guide" className="text-gray-400 hover:text-white transition-colors">
                                    Size Guide
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <FiMapPin className="text-gray-400 mr-3 mt-1" />
                                <span className="text-gray-400">
                                    123 T-Shirt Street, Fashion District, New York, NY 10001
                                </span>
                            </li>
                            <li className="flex items-center">
                                <FiPhone className="text-gray-400 mr-3" />
                                <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors">
                                    (123) 456-7890
                                </a>
                            </li>
                            <li className="flex items-center">
                                <FiMail className="text-gray-400 mr-3" />
                                <a href="mailto:info@tshirtstore.com" className="text-gray-400 hover:text-white transition-colors">
                                    info@tshirtstore.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-10 pt-6 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">
                            © {currentYear} T-Shirt Store. All rights reserved.
                        </p>
                        <div className="flex space-x-2">
                            <img src="/images/payment/visa.svg" alt="Visa" className="h-8" />
                            <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8" />
                            <img src="/images/payment/amex.svg" alt="American Express" className="h-8" />
                            <img src="/images/payment/paypal.svg" alt="PayPal" className="h-8" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 