'use client';

import { useState } from 'react';
import Link from 'next/link';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: 'Express Your Style',
            subtitle: 'Quality T-Shirts for Everyone',
            description: 'Discover our collection of premium t-shirts with unique designs for all occasions.',
            image: '/images/hero/hero-1.jpg',
            cta: 'Shop Now',
            link: '/products',
            color: 'bg-blue-600'
        },
        {
            id: 2,
            title: 'Create Your Own Design',
            subtitle: 'Personalized T-Shirts',
            description: 'Design your own custom t-shirt with our easy-to-use online tool.',
            image: '/images/hero/hero-2.jpg',
            cta: 'Start Designing',
            link: '/customize',
            color: 'bg-purple-600'
        },
        {
            id: 3,
            title: 'New Collection',
            subtitle: 'Summer 2023',
            description: 'Check out our latest summer collection with fresh designs and vibrant colors.',
            image: '/images/hero/hero-3.jpg',
            cta: 'View Collection',
            link: '/products?collection=summer',
            color: 'bg-green-600'
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <section className="relative h-[600px] overflow-hidden">
            {/* Slides */}
            <div
                className="h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${slides.length * 100}%`, display: 'flex' }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="relative w-full h-full bg-cover bg-center flex items-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-xl text-white">
                                <span className={`inline-block ${slide.color} text-white px-4 py-1 rounded-full text-sm font-medium mb-4`}>
                                    {slide.subtitle}
                                </span>
                                <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                                <p className="text-xl mb-8">{slide.description}</p>
                                <Link
                                    href={slide.link}
                                    className={`${slide.color} hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition duration-300`}
                                >
                                    {slide.cta}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 text-white z-20 transition duration-300"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 text-white z-20 transition duration-300"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </section>
    );
};

export default Hero; 