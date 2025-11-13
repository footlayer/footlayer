
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const categories = [
  {
    name: 'Loafers & Pumpy Shoes',
    description: 'Premium leather loafers for business and formal occasions',
    image: 'https://media.sperry.com/v3/product/gcpennywoven_mm/236-001-050/gcpennywoven_mm_brown_236-001-050_main_sq_wt_4800x4800.jpg',
    href: '/products?category=LOAFERS',
    color: 'from-amber-600 to-amber-700'
  },
  {
    name: 'Peshawari Chappals',
    description: 'Traditional handcrafted Pakistani leather chappals',
    image: 'https://yubaric.com/wp-content/uploads/2023/06/13-1.jpg',
    href: '/products?category=PESHAWARI',
    color: 'from-emerald-600 to-emerald-700'
  },
  {
    name: 'Casual Sandals',
    description: 'Comfortable sandals for everyday wear and leisure',
    image: 'https://media.istockphoto.com/id/934521142/photo/men-sandals-on-white-background.jpg?s=612x612&w=0&k=20&c=psf1sM1a3EdFajRxNJLT41N8zcERuN5TcdC4QJjjPmE=',
    href: '/products?category=SANDALS',
    color: 'from-blue-600 to-blue-700'
  },
  {
    name: 'Saudi Chappals',
    description: 'Traditional Middle Eastern footwear for cultural occasions',
    image: 'https://silk-official.com/cdn/shop/files/2530_MATT_White.jpg?v=1742983156&width=1200',
    href: '/products?category=SAUDI',
    color: 'from-purple-600 to-purple-700'
  }
];

export function CategoryShowcase() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of traditional and modern footwear
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <Link href={category.href}>
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`} />
                </div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm sm:text-base opacity-90 mb-4">
                    {category.description}
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="self-start bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
