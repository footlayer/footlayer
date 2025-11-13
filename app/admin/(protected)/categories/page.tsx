'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';

interface Category { id: string; name: string; slug: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch('/api/admin/categories', { cache: 'no-store' });
    const json = await res.json();
    setCategories(json.categories || []);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) throw new Error('Failed to create category');
      setName(''); setSlug('');
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      </div>

      <form onSubmit={create} className="bg-white rounded-lg shadow-sm border p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="e.g. Loafers"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          required
        />
        <input
          placeholder="e.g. loafers (lowercase, hyphens)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          required
        />
        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">{loading ? 'Creating...' : 'Create'}</Button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.slug}</td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


