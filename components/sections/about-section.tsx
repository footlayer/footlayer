
'use client';

import { motion } from 'framer-motion';
import { Award, Users, ShieldCheck, Truck } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Handcrafted with finest leather and traditional techniques'
  },
  {
    icon: Users,
    title: 'Expert Craftsmen',
    description: 'Made by skilled artisans with decades of experience'
  },
  {
    icon: ShieldCheck,
    title: 'Authentic Designs',
    description: 'Traditional patterns and contemporary styles combined'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick and secure delivery across Pakistan'
  }
];

export function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Foot Layer?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We combine traditional craftsmanship with modern comfort to create footwear 
            that stands the test of time. Each piece tells a story of heritage and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6 group-hover:bg-amber-200 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-amber-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">500+</div>
            <div className="text-gray-600">Happy Customers</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">20+</div>
            <div className="text-gray-600">Unique Styles</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">15+</div>
            <div className="text-gray-600">Years Experience</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
