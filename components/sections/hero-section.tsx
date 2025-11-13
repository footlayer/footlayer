'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';

const carouselImages = [
  {
    id: 1,
    src: 'https://media.sperry.com/v3/product/gcpennywoven_mm/236-001-050/gcpennywoven_mm_brown_236-001-050_main_sq_wt_4800x4800.jpg',
    alt: 'Premium Leather Loafer',
    title: 'Premium Loafers',
    subtitle: 'Business & Formal'
  },
  {
    id: 2,
    src: 'https://www.shutterstock.com/image-photo/stylish-peshawari-sandel-isolated-on-600nw-2651332199.jpg',
    alt: 'Peshawari Chappals',
    title: 'Peshawari Chappals',
    subtitle: 'Traditional Craftsmanship'
  },
  {
    id: 3,
    src: 'https://media.istockphoto.com/id/934521142/photo/men-sandals-on-white-background.jpg?s=612x612&w=0&k=20&c=psf1sM1a3EdFajRxNJLT41N8zcERuN5TcdC4QJjjPmE=',
    alt: 'Casual Sandals',
    title: 'Casual Sandals',
    subtitle: 'Everyday Comfort'
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <section className="relative h-[88vh] min-h-[600px] overflow-hidden bg-white">
      {/* Carousel Container */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image Container with white sides */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                <Image
                  src={carouselImages[currentSlide].src}
                  alt={carouselImages[currentSlide].alt}
                  fill
                  className="object-contain w-full h-full"
                  style={{
                    objectPosition: 'center center'
                  }}
                  priority={currentSlide === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                />
              </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-amber-800/60 to-amber-600/40" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex items-center justify-center lg:justify-start">
          <div className="w-full px-4 sm:px-6 lg:pl-20 lg:pr-8 lg:max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 sm:space-y-8 text-center lg:text-left"
              >
                <div className="space-y-3 sm:space-y-4">
                  <motion.h1 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] sm:leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    {carouselImages[currentSlide].title}
                  </motion.h1>
                  
                  <motion.div 
                    className="flex items-center justify-center lg:justify-start space-x-3 sm:space-x-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-300">
                      {carouselImages[currentSlide].subtitle}
                    </span>
                    <div className="h-0.5 sm:h-1 w-12 sm:w-20 bg-amber-300"></div>
                  </motion.div>
                </div>

                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-amber-100 max-w-3xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Discover our exquisite collection of handcrafted footwear, where traditional 
                  craftsmanship meets contemporary style.
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-6 text-sm sm:text-base lg:text-lg text-amber-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-300 text-amber-300" />
                      ))}
                    </div>
                    <span className="font-semibold">4.9/5</span>
                  </div>
                  <div className="hidden sm:block h-4 sm:h-6 w-px bg-amber-200"></div>
                  <span className="font-semibold">500+ Happy Customers</span>
                </motion.div>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 sm:pt-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <Link href="/products">
                    <Button 
                      size="lg" 
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:shadow-amber-600/25 transition-all duration-300 w-full sm:w-auto"
                    >
                      Shop Collection
                      <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </Link>
                 
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-amber-600/20 backdrop-blur-sm hover:bg-amber-600/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-amber-600/20 backdrop-blur-sm hover:bg-amber-600/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-amber-300 scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Floating Stats - Hidden on mobile, visible on larger screens */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="hidden lg:block absolute top-16 right-8 z-30 bg-amber-600/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/30"
        >
          <div className="text-center">
            <div className="text-2xl font-black text-amber-300">20+</div>
            <div className="text-xs text-amber-100 font-medium">Styles</div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="hidden lg:block absolute bottom-24 left-8 z-30 bg-amber-600/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/30"
        >
          <div className="text-center">
            <div className="text-2xl font-black text-amber-300">100%</div>
            <div className="text-xs text-amber-100 font-medium">Leather</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}