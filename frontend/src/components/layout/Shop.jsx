'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from "react-icons/io";

export default function Shop({ megaMenuContent }) {
  const [isOpenShopAllDropdown, setIsOpenShopAllDropdown] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsOpenShopAllDropdown(true)}
      onMouseLeave={() => setIsOpenShopAllDropdown(false)}
      className=""
    >
      <motion.button initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.01 }} className="font-medium flex items-center border-b-[2px] border-[#f7f5f5] hover:border-black pb-1">
        Shop All <IoIosArrowDown className={`transition-all duration-200 ease-in-out ${isOpenShopAllDropdown ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* AnimatePresence helps handle exit animations */}
      <AnimatePresence>
        {isOpenShopAllDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-3 z-50 w-screen"
          >
            {megaMenuContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
