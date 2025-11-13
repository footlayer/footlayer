'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Layers,
  Megaphone,
  Warehouse,
} from 'lucide-react';
import { Button } from '../ui/button';

const items = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/products/new', label: 'Add Product', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="pb-4 mb-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">Admin</h2>
        <p className="text-sm text-gray-600">Manage your store</p>
      </div>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
          return (
            <Link key={href} href={href} className="block">
              <div
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                  active ? 'bg-amber-50 border-amber-200 text-amber-800' : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-amber-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-2">
        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={() => router.push('/admin/products/new')}>
          Add Product
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}


