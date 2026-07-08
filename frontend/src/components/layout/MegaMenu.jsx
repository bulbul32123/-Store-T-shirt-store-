import { products, shopList, featured } from '@/constants/constants'
import { categoryLists } from '@/utils/categoryLists'
import Link from 'next/link'
import MegaMenuFeatured from './MegaMenuFeatured';
import ShopBy from './ShopBy';
import ShopByCategory from './ShopByCategory';

export default function MegaMenu() {

    return (
        <div>
            <header className="absolute w-full left-0 top-[3rem] z-30">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="lg:ml-8 lg:self-stretch">
                                <div className="flex h-full space-x-8">
                                    <div className="flex">
                                        <div className=" absolute inset-x-0 py-5 bg-white top-full text-sm text-gray-500">
                                            <div className="absolute inset-0 top-1/2 shadow" >
                                            </div>

                                            <div className="relative bg-white">
                                                <div className="mx-auto max-w-7xl px-8">

                                                    <div className="py-5 w-full">

                                                        <div className="flex justify-center items-start flex-wrap gap-8 md:gap-12 w-full gap-y-10 text-sm">
                                                            <MegaMenuFeatured featured={featured} />
                                                            <ShopBy shopList={shopList} />
                                                         
                                                           <ShopByCategory categoryLists={categoryLists}/>

                                                            <div className="max-lg:hidden flex ">
                                                                {products.slice(0, 1)?.map((item) => (
                                                                    <Link href={`/products/${item?.name}`} className="group relative text-base sm:text-sm max-sm:mt-3" key={item?.id}>
                                                                        <div
                                                                            className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                                                            <img src={item?.img}
                                                                                alt={item?.name}
                                                                                className="object-cover object-center h-60  w-60" />
                                                                        </div>
                                                                        <h2 className="mt-1 ml-1 block font-medium text-gray-900">{item?.name}</h2>
                                                                        <span className="mt-2 font-base py-1.5 bg-black px-3 text-white rounded-full absolute top-3 left-3">
                                                                            New Arrivals
                                                                        </span>
                                                                        <button className="mt-1 absolute bottom-10 left-3 py-1 px-2 border border-black rounded-sm">Shop now</button>
                                                                    </Link>
                                                                ))
                                                                }
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </nav>
            </header>
        </div>
    )
}
