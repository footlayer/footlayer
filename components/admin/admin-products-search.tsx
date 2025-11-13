'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  initialQuery: string;
}

export function AdminProductsSearch({ initialQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  // Keep input in sync if URL changes from outside
  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    setValue(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounced URL update for realtime search
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      // Always reset to page 1 when query changes
      params.set('page', '1');
      params.set('limit', '9');
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname, router]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search products..."
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
    />
  );
}


