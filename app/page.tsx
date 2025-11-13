
import { Suspense } from 'react';
import { HeroSection } from '../components/sections/hero-section';
import { FeaturedProducts } from '../components/sections/featured-products';
import { CategoryShowcase } from '../components/sections/category-showcase';
import { AboutSection } from '../components/sections/about-section';
import { Loading } from '../components/ui/loading';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <Suspense fallback={<Loading text="Loading featured products..." />}>
        <FeaturedProducts />
      </Suspense>
      
      <CategoryShowcase />
      
      <AboutSection />
    </div>
  );
}
