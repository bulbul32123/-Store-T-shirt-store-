"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import SearchResults from "./SearchResults";

export default function SearchBar({ placeholder }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [datas, setDatas] = useState([]);
  const [isSearchResultOpen, setIsSearchResultOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        );

        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchResultOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [products]);

const navigateToSearchPage = (e) => {
  if (e.key === "Enter") {
    SendToSearchPage();
  }
};
  const SendToSearchPage = () => {
    if (!searchValue.trim()) return;

    router.push(`/search?query=${encodeURIComponent(searchValue.trim())}`);

    setDatas([]);
    setIsSearchResultOpen(false);
  };
  const getFilterData = () => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      setDatas([]);
      return;
    }

    const filtered = products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.name?.toLowerCase() || "";

      return name.includes(query) || category.includes(query);
    });

    setDatas(filtered.slice(0, 8));
  };
  useEffect(() => {
    getFilterData();
  }, [searchValue, products]);
  return (
    <>
      <div
        className={`relative h-full w-full bg-white ${
          searchValue.length > 0 && isSearchResultOpen ? "z-[50]" : "z-[0]"
        }`}
        ref={searchRef}
      >
        <input
          type="text"
          placeholder={placeholder}
          onFocus={() => setIsSearchResultOpen(true)}
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          onKeyUp={(e) => navigateToSearchPage(e)}
          className="w-full border border-gray-300 outline-none focus-within:border-[#ffb800] transition-all duration-200 focus-within:border py-2 rounded-lg pl-10"
        />

        <button
          onClick={SendToSearchPage}
          className="absolute rounded-lg py-1.5 text-gray-500 text-sm font-light transitions hover:bg-[#ffb800] hover:text-white bg-gray-100 px-4 md:px-6 top-[5px] right-2"
        >
          Search
        </button>
        <span className="absolute rounded-lg p-2 text-gray-500  transitions hover:bg-[#ffb800] hover:text-white bg-gray-100  top-[4px] left-1.5">
          <IoSearchSharp size={18} />
        </span>
        <div
          className={`absolute left-0 w-full border rounded-md ${
            searchValue.length > 0 && isSearchResultOpen
              ? "top-12 opacity-100 z-[10] max-lg:h-80 h-96 bg-white"
              : "top-16 h-0 border-none opacity-0"
          } transition-all duration-300 ease-in-out overflow-x-hidden`}
        >
          {isSearchResultOpen && (
            <SearchResults searchQuery={searchValue} data={datas} />
          )}
        </div>
      </div>
    </>
  );
}
