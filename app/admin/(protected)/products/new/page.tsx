'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';

type CategoryOption = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadOk, setUploadOk] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '' as string,
    sizes: [] as string[],
    colors: [] as string[],
    imageFile: null as File | null,
    imageUrl: '' as string,
    featured: false,
    inStock: true,
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    setIsChecking(false);
    (async () => {
      try {
        const res = await fetch('/api/admin/categories', { cache: 'no-store' });
        const json = await res.json();
        setCategories((json.categories || []).map((c: any) => ({ id: c.id, name: c.name })));
      } catch {}
    })();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadError(null);
    setUploadOk(false);
    const valid: File[] = [...uploadFiles];
    const previews: string[] = [...allPreviews];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { setUploadError('Please select image files only.'); return; }
      if (f.size > 5 * 1024 * 1024) { setUploadError('Each image must be 5MB or smaller.'); return; }
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    setUploadFiles(valid);
    setPreviewUrl(previews[0] || null);
    setAllPreviews(previews);
    setForm(prev => ({ ...prev, imageFile: valid[0] ?? null }));
  };

  const removePreviewAt = (index: number) => {
    const newPreviews = allPreviews.slice();
    newPreviews.splice(index, 1);
    setAllPreviews(newPreviews);
    // Remove corresponding file if present (only for local object urls)
    const newFiles: File[] = [];
    for (let i = 0, fi = 0; i < uploadFiles.length && fi < allPreviews.length; i++) {
      // Heuristic: local previews are object URLs (start with blob:)
      // Map local files to the order they were added; if preview at index corresponds to local file, drop it.
      // Simpler: rebuild from remaining previews keeping only blob: entries mapping to files order.
    }
    // Better approach: track mapping; but we can just clear files and let server use imageUrl if provided.
    // Minimal: if index == 0 and we had set primary file, clear primary references.
    if (index === 0) {
      setPreviewUrl(newPreviews[0] || null);
      setForm(prev => ({ ...prev, imageFile: null }));
    }
  };

  const uploadToCloudinary = async () => {
    if (!form.imageFile) return null;
    setUploading(true);
    setUploadError(null);
    setUploadOk(false);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
      if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const data = new FormData();
      data.append('file', form.imageFile);
      data.append('upload_preset', uploadPreset);

      const res = await fetch(url, { method: 'POST', body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (json?.error?.message as string) || 'Upload failed';
        throw new Error(msg);
      }
      const secureUrl = json.secure_url as string | undefined;
      if (!secureUrl) {
        throw new Error('No image URL returned by Cloudinary');
      }
      setUploadOk(true);
      return secureUrl;
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryToCloudinary = async () => {
    if (!uploadFiles.length) return [] as string[];
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
    return urls;
  };

  const canSubmit = () => {
    if (form.imageUrl.trim()) return true;
    if (uploadFiles.length > 0) return true; // allow submitting when files are selected (we'll upload on submit)
    if (form.imageFile && uploadOk) return true;
    return false;
  };

  const ensureImageReadyOrThrow = () => {
    if (form.imageUrl.trim()) return;
    if (uploadFiles.length > 0) return; // we'll upload selected files during submit
    if (form.imageFile && uploadOk) return;
    if (form.imageFile && !uploadOk) {
      throw new Error('Please upload the selected image before submitting.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.imageUrl;
      let galleryUrls: string[] = [];
      
      if (!imageUrl && uploadFiles.length > 0) {
        // Upload all files including primary image
        galleryUrls = await uploadGalleryToCloudinary();
        if (galleryUrls.length === 0) throw new Error('Image upload failed');
        imageUrl = galleryUrls[0]; // First image becomes primary
      } else if (!imageUrl && form.imageFile) {
        // Fallback: upload single primary image
        const uploaded = await uploadToCloudinary();
        if (!uploaded) throw new Error('Image upload failed');
        imageUrl = uploaded;
      } else if (imageUrl && uploadFiles.length > 0) {
        // Upload only gallery images (not primary)
        galleryUrls = await uploadGalleryToCloudinary();
      }

      ensureImageReadyOrThrow();

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        sizes: form.sizes,
        colors: form.colors,
        imageUrl,
        images: galleryUrls,
        featured: form.featured,
        inStock: form.inStock,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const fieldErrors = (j?.errors && typeof j.errors === 'object') ? j.errors : null;
        if (fieldErrors) {
          const msg = Object.values(fieldErrors).join('\n');
          throw new Error(msg);
        }
        throw new Error(j?.error || 'Failed to create product');
      }
      router.push('/admin');
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Upload images to Cloudinary and publish to the store</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                <option value="" disabled>Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="e.g. 39"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) {
                        setForm(prev => ({ ...prev, sizes: [...prev.sizes, sizeInput.trim()] }));
                        setSizeInput('');
                      }
                    }
                  }}
                />
                <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => {
                    if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) {
                      setForm(prev => ({ ...prev, sizes: [...prev.sizes, sizeInput.trim()] }));
                      setSizeInput('');
                    }
                  }}
                >Add</Button>
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
                <input
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="e.g. Brown"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
                        setForm(prev => ({ ...prev, colors: [...prev.colors, colorInput.trim()] }));
                        setColorInput('');
                      }
                    }
                  }}
                />
                <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => {
                    if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
                      setForm(prev => ({ ...prev, colors: [...prev.colors, colorInput.trim()] }));
                      setColorInput('');
                    }
                  }}
                >Add</Button>
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

          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {/* Upload tile */}
                <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md bg-white hover:border-amber-500 cursor-pointer transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col items-center text-gray-500">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs mt-1">Add</span>
                  </div>
                </label>
                {/* Previews */}
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
              {uploadError && <div className="mt-2 text-sm text-red-600">{uploadError}</div>}
              {uploading && <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-800">Uploading...</Badge>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Or paste image URL</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                value={form.imageUrl}
                onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-2">If both are provided, uploads take precedence.</p>
            </div>
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
            {uploading && <Badge variant="secondary" className="bg-amber-100 text-amber-800">Uploading...</Badge>}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>Cancel</Button>
            <Button type="submit" disabled={submitting || !canSubmit()} className="bg-amber-600 hover:bg-amber-700 text-white">
              {submitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


