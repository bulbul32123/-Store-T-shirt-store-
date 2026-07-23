"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GrSearch } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import SearchResults from "./SearchResults";

export default function MobileSearchBox() {
  const router = useRouter();
  const [searchBtn, setSearchBtn] = useState(false);
  const [products, setProducts] = useState([]);
  const [datas, setDatas] = useState([]);
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
        console.error("Error fetching products for mobile search:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
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
  }, [searchValue, products]);

  const sendToSearchPage = () => {
    if (!searchValue.trim()) return;

    router.push(`/search?query=${encodeURIComponent(searchValue.trim())}`);
    setDatas([]);
    setSearchValue("");
    setSearchBtn(false);
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      sendToSearchPage();
    }
  };

  return (
    <div ref={searchRef}>
      <button
        className="p-3 rounded-full bg-primary hover:bg-black text-white hover:text-white transitions"
        onClick={() => setSearchBtn(true)}
      >
        <GrSearch size={22} />
      </button>

      <div
        className={`absolute top-0 left-0 w-full min-h-screen h-full bg-white z-[300] transition-transform duration-200 ease-out ${searchBtn ? "translate-x-0" : "translate-x-[200rem]"} py-5 px-5`}
      >
        <div className="flex justify-between items-center pt-3 pb-5 padding-sm">
          <div className="relative flex justify-center items-center w-[80%] md:w-[70%] mr-4">
            <span className="absolute rounded-full p-2 text-gray-500 transitions hover:bg-[#ffb800] hover:text-white bg-gray-100 top-[4px] left-1.5">
              <IoSearchSharp size={18} />
            </span>

            <input
              type="text"
              placeholder="Search here...."
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
              onKeyUp={handleKeyUp}
              className="w-full border border-gray-300 outline-none focus-within:border-[#ffb800] transition-all duration-200 focus-within:border py-2 rounded-3xl pl-11 pr-10"
            />

            {searchValue?.length > 0 && (
              <button
                className="absolute right-3"
                onClick={() => setSearchValue("")}
              >
                <IoMdClose size={20} className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {searchValue.trim().length > 0 && (
              <button
                className="text-primary font-semibold text-sm mr-2"
                onClick={sendToSearchPage}
              >
                Search
              </button>
            )}
            <button
              className="text-black font-medium text-sm"
              onClick={() => {
                setSearchBtn(false);
                setSearchValue("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[75vh] mt-2">
          {searchValue.trim().length > 0 ? (
            <div>
              <span className="text-gray-400 text-xs font-semibold block mb-2 pl-2">
                Search results:
              </span>
              <SearchResults searchQuery={searchValue} data={datas} />
            </div>
          ) : (
            <div className="h-full w-full bg-white py-4 pl-2 transition-all duration-200 ease-out">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 italic">
                  Type above to find products instantly...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
