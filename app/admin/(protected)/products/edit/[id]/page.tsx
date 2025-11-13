'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import { Plus, X } from 'lucide-react';

type CategoryOption = { id: string; name: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', categoryId: '', sizes: [] as string[], colors: [] as string[], imageUrl: '', featured: false, inStock: true,
  });
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadOk, setUploadOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/admin/categories', { cache: 'no-store' }),
          fetch(`/api/admin/products/${productId}`, { cache: 'no-store' })
        ]);
        const cats = await catRes.json();
        const prod = await prodRes.json();
        setCategories((cats.categories || []).map((c: any) => ({ id: c.id, name: c.name })));
        const p = prod.product;
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          categoryId: p.categoryId,
          sizes: p.sizes || [],
          colors: p.colors || [],
          imageUrl: p.imageUrl,
          featured: p.featured,
          inStock: p.inStock,
        });
        setAllPreviews((p.images || []) as string[]);
        setPreviewUrl(p.imageUrl);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setUploadError(null);
      setUploadOk(false);
      if (!f.type.startsWith('image/')) { setUploadError('Please select a valid image file.'); return; }
      if (f.size > 5 * 1024 * 1024) { setUploadError('Image must be 5MB or smaller.'); return; }
      setImageFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid: File[] = [];
    const previews: string[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { alert('Please select image files only.'); return; }
      if (f.size > 5 * 1024 * 1024) { alert('Each image must be 5MB or smaller.'); return; }
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    setUploadFiles(valid);
    setPreviewUrl(previews[0] || previewUrl);
    setAllPreviews(previews.length ? previews : allPreviews);
  };

  const removePreviewAt = (index: number) => {
    const newPreviews = allPreviews.slice();
    newPreviews.splice(index, 1);
    setAllPreviews(newPreviews);
    if (index === 0) setPreviewUrl(newPreviews[0] || null);
  };

  const uploadToCloudinary = async () => {
    if (!imageFile) return null;
    setUploading(true);
    setUploadError(null);
    setUploadOk(false);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
      if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', uploadPreset);
      const res = await fetch(url, { method: 'POST', body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { throw new Error((json?.error?.message as string) || 'Upload failed'); }
      const secureUrl = json.secure_url as string | undefined;
      if (!secureUrl) throw new Error('No image URL returned by Cloudinary');
      setUploadOk(true);
      return secureUrl;
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryToCloudinary = async () => {
    if (!uploadFiles.length) return allPreviews.filter((src) => src.startsWith('http')) as string[];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');
    const urls: string[] = [];
    for (const file of uploadFiles) {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);
      const res = await fetch(url, { method: 'POST', body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.secure_url) throw new Error('Gallery upload failed');
      urls.push(json.secure_url as string);
    }
    const existing = allPreviews.filter((src) => src.startsWith('http')) as string[];
    return [...existing, ...urls];
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      let images: string[] = [];
      
      if (imageFile && uploadFiles.length > 0) {
        // Upload all files including primary image
        images = await uploadGalleryToCloudinary();
        if (images.length === 0) throw new Error('Image upload failed');
        imageUrl = images[0]; // First image becomes primary
      } else if (imageFile) {
        // Upload single primary image
        const uploaded = await uploadToCloudinary();
        if (!uploaded) throw new Error('Image upload failed');
        imageUrl = uploaded;
        // Keep existing gallery images
        images = allPreviews.filter((src) => src.startsWith('http')) as string[];
      } else if (uploadFiles.length > 0) {
        // Upload only gallery images (not primary)
        images = await uploadGalleryToCloudinary();
      } else {
        // Keep existing images
        images = allPreviews.filter((src) => src.startsWith('http')) as string[];
      }
      
      const payload = { ...form, price: Number(form.price), imageUrl, images };
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const fieldErrors = (j?.errors && typeof j.errors === 'object') ? j.errors : null;
        if (fieldErrors) {
          const msg = Object.values(fieldErrors).join('\n');
          throw new Error(msg);
        }
        throw new Error(j?.error || 'Failed to update product');
      }
      router.push('/admin/products');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) { alert('Failed to delete'); return; }
    router.push('/admin/products');
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <Button variant="outline" onClick={del}>Delete</Button>
      </div>

      <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
              value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
            <input type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
              value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
              value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
              value={form.categoryId} onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))} required>
              <option value="" disabled>Select category</option>
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
            <div className="flex gap-2">
              <input className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="e.g. 39"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) { setForm(prev => ({ ...prev, sizes: [...prev.sizes, sizeInput.trim()] })); setSizeInput(''); } } }} />
              <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => { if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) { setForm(prev => ({ ...prev, sizes: [...prev.sizes, sizeInput.trim()] })); setSizeInput(''); } }}>Add</Button>
            </div>
            {form.sizes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.sizes.map((s, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    {s}
                    <button type="button" className="ml-2 text-amber-700 hover:text-amber-900" onClick={() => setForm(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
            <div className="flex gap-2">
              <input className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="e.g. Brown"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (colorInput.trim() && !form.colors.includes(colorInput.trim())) { setForm(prev => ({ ...prev, colors: [...prev.colors, colorInput.trim()] })); setColorInput(''); } } }} />
              <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => { if (colorInput.trim() && !form.colors.includes(colorInput.trim())) { setForm(prev => ({ ...prev, colors: [...prev.colors, colorInput.trim()] })); setColorInput(''); } }}>Add</Button>
            </div>
            {form.colors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.colors.map((c, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    {c}
                    <button type="button" className="ml-2 text-amber-700 hover:text-amber-900" onClick={() => setForm(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md bg-white hover:border-amber-500 cursor-pointer transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="hidden" />
                <div className="flex flex-col items-center text-gray-500">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs mt-1">Add</span>
                </div>
              </label>
              {allPreviews.map((src, i) => (
                <div key={i} className="relative h-24 bg-gray-50 rounded-md overflow-hidden border">
                  <Image src={src} alt={`Preview ${i+1}`} fill className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded">Primary</span>
                  )}
                  <button type="button" onClick={() => removePreviewAt(i)} className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Or Image URL</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
              value={form.imageUrl} onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))} />
            {previewUrl && (
              <div className="mt-4 relative w-full h-56 bg-gray-50 rounded-md overflow-hidden">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
            {uploadError && (<div className="mt-2 text-sm text-red-600">{uploadError}</div>)}
            {uploading && (<Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-800">Uploading...</Badge>)}
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))} />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.inStock} onChange={(e) => setForm(prev => ({ ...prev, inStock: e.target.checked }))} />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}


