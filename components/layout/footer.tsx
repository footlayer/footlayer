
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-amber-700 to-amber-800 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="relative h-16 w-16 bg-white rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Foot Layer"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'contrast(1.3) brightness(0.9) saturate(1.2)'
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white leading-tight">
                  FOOT LAYER
                </span>
                <span className="text-sm text-amber-100 font-medium">Premium Footwear</span>
              </div>
            </Link>
            <p className="text-amber-100 max-w-md mb-8 text-lg leading-relaxed">
              Your trusted destination for premium footwear. From traditional Peshawari chappals to modern loafers, 
              we bring you quality craftsmanship and authentic designs.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-amber-100 hover:text-white transition-colors transform hover:scale-110">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-amber-100 hover:text-white transition-colors transform hover:scale-110">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-amber-100 hover:text-white transition-colors transform hover:scale-110">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-amber-100 hover:text-white transition-colors text-lg font-medium">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=LOAFERS" className="text-amber-100 hover:text-white transition-colors text-lg font-medium">
                  Loafers
                </Link>
              </li>
              <li>
                <Link href="/products?category=PESHAWARI" className="text-amber-100 hover:text-white transition-colors text-lg font-medium">
                  Peshawari Chappals
                </Link>
              </li>
              <li>
                <Link href="/products?category=SANDALS" className="text-amber-100 hover:text-white transition-colors text-lg font-medium">
                  Sandals
                </Link>
              </li>
              <li>
                <Link href="/products?category=SAUDI" className="text-amber-100 hover:text-white transition-colors text-lg font-medium">
                  Saudi Chappals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <a 
                href="https://wa.me/923110047164" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-100 text-lg font-medium">03110047164</span>
              </a>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-100 text-lg font-medium">info@footlayer.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-lg mt-1">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-100 text-lg font-medium">
                  Lahore, Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-400/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-amber-100 text-lg font-medium">
              &copy; 2025 Foot Layer. All rights reserved.
            </p>
            <p className="text-amber-200 text-base">
              Developed by devdonics.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
