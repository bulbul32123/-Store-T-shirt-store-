'use client';

import Link from 'next/link';

const Categories = () => {
    const categories = [
        {
            id: 1,
            name: 'Men',
            image: '/images/categories/men.jpg',
            link: '/products?category=Men'
        },
        {
            id: 2,
            name: 'Women',
            image: '/images/categories/women.jpg',
            link: '/products?category=Women'
        },
        {
            id: 3,
            name: 'Kids',
            image: '/images/categories/kids.jpg',
            link: '/products?category=Kids'
        },
        {
            id: 4,
            name: 'Unisex',
            image: '/images/categories/unisex.jpg',
            link: '/products?category=Unisex'
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={category.link}
                            className="group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="relative h-80 overflow-hidden">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                                    <p className="text-white mt-2 flex items-center">
                                        Shop Now
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-2"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories; 