'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import adminApi from '../../lib/adminApi';

const SIZE_OPTIONS = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];

const emptyVariant = () => ({
  color: '',
  colorHex: '#7a1f2b',
  images: [],
  sizes: [{ size: 'Free Size', stock: 0 }],
});

export default function ProductForm({ initialData = null, productId = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    productCode: '',
    description: '',
    category: '',
    fabric: '',
    mrp: '',
    price: '',
    careInstructions: '',
    isFeatured: false,
    isNewArrival: false,
    isBestDeal: false,
  });
  const [variants, setVariants] = useState([emptyVariant()]);
  const [imageFiles, setImageFiles] = useState({}); // variantIndex -> File[]

  useEffect(() => {
    adminApi.get('/admin/categories').then(({ data }) => {
      if (data.success) setCategories(data.categories);
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        productCode: initialData.productCode || '',
        description: initialData.description || '',
        category: initialData.category?._id || initialData.category || '',
        fabric: initialData.fabric || '',
        mrp: initialData.mrp || '',
        price: initialData.price || '',
        careInstructions: initialData.careInstructions || '',
        isFeatured: initialData.isFeatured || false,
        isNewArrival: initialData.isNewArrival || false,
        isBestDeal: initialData.isBestDeal || false,
      });
      if (initialData.variants?.length) {
        setVariants(initialData.variants);
      }
    }
  }, [initialData]);

  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateSize = (vIndex, sIndex, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      const sizes = [...copy[vIndex].sizes];
      sizes[sIndex] = { ...sizes[sIndex], [field]: value };
      copy[vIndex] = { ...copy[vIndex], sizes };
      return copy;
    });
  };

  const addSizeRow = (vIndex) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].sizes.push({ size: 'M', stock: 0 });
      return copy;
    });
  };

  const removeSizeRow = (vIndex, sIndex) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex].sizes = copy[vIndex].sizes.filter((_, i) => i !== sIndex);
      return copy;
    });
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleImageSelect = (vIndex, files) => {
    setImageFiles((prev) => ({ ...prev, [vIndex]: Array.from(files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (variants.some((v) => !v.color.trim())) {
      toast.error('Each variant must have a color name');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('variants', JSON.stringify(variants));

      // Only attach files for the FIRST variant that has new uploads
      // (Cloudinary upload via multer attaches to variants[0].images on backend;
      // for multiple variants with separate images, admin can edit each variant's images one at a time)
      const firstVariantWithFiles = Object.keys(imageFiles)[0];
      if (firstVariantWithFiles !== undefined && imageFiles[firstVariantWithFiles]?.length) {
        imageFiles[firstVariantWithFiles].forEach((file) => formData.append('images', file));
      }

      let res;
      if (productId) {
        res = await adminApi.put(`/admin/products/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await adminApi.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        toast.success(productId ? 'Product updated' : 'Product created');
        router.push('/admin/products');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="card p-5 space-y-4">
        <h2 className="text-cream font-medium">Basic Details</h2>
        <div className="space-y-1">
          <label className="text-xs text-cream/70 font-medium">Product Title *</label>
          <input required placeholder="Product Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-cream/70 font-medium">Product Code / SKU *</label>
          <input required placeholder="Enter unique product code (e.g. CS001, CHS-0001)" value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-cream/70 font-medium">Description</label>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input placeholder="Fabric (e.g. Pure Silk)" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input required type="number" placeholder="MRP (₹)" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="input-field" />
          <input required type="number" placeholder="Selling Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
        </div>
        <textarea placeholder="Care Instructions" value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} className="input-field" rows={2} />

        <div className="flex gap-4 flex-wrap">
          {[
            { key: 'isFeatured', label: 'Featured' },
            { key: 'isNewArrival', label: 'New Arrival' },
            { key: 'isBestDeal', label: 'Best Deal' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-cream/80 text-sm">
              <input
                type="checkbox"
                checked={form[opt.key]}
                onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                className="accent-gold"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-cream font-medium">Color Variants</h2>
          <button type="button" onClick={addVariant} className="text-gold text-sm flex items-center gap-1">
            <FiPlus /> Add Color
          </button>
        </div>

        <div className="space-y-6">
          {variants.map((variant, vIndex) => (
            <div key={vIndex} className="border border-gold/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gold text-sm font-medium">Variant {vIndex + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-400">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  required
                  placeholder="Color name (e.g. Maroon)"
                  value={variant.color}
                  onChange={(e) => updateVariant(vIndex, 'color', e.target.value)}
                  className="input-field"
                />
                <input
                  type="color"
                  value={variant.colorHex}
                  onChange={(e) => updateVariant(vIndex, 'colorHex', e.target.value)}
                  className="h-12 rounded-lg border border-gold/30 bg-transparent"
                />
              </div>

              <div className="mb-3">
                <label className="flex items-center gap-2 text-cream/70 text-sm cursor-pointer border border-dashed border-gold/30 rounded-lg p-3 hover:border-gold transition">
                  <FiUpload />
                  {imageFiles[vIndex]?.length ? `${imageFiles[vIndex].length} image(s) selected` : 'Upload images for this color'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(vIndex, e.target.files)}
                  />
                </label>
                {variant.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {variant.images.map((img, i) => (
                      <img key={i} src={img.url} alt="" className="w-12 h-14 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cream/70 text-sm">Sizes & Stock</span>
                  <button type="button" onClick={() => addSizeRow(vIndex)} className="text-gold text-xs flex items-center gap-1">
                    <FiPlus size={12} /> Add Size
                  </button>
                </div>
                <div className="space-y-2">
                  {variant.sizes.map((s, sIndex) => (
                    <div key={sIndex} className="flex gap-2">
                      <select
                        value={s.size}
                        onChange={(e) => updateSize(vIndex, sIndex, 'size', e.target.value)}
                        className="input-field flex-1 py-2"
                      >
                        {SIZE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={s.stock}
                        onChange={(e) => updateSize(vIndex, sIndex, 'stock', Number(e.target.value))}
                        className="input-field w-28 py-2"
                      />
                      {variant.sizes.length > 1 && (
                        <button type="button" onClick={() => removeSizeRow(vIndex, sIndex)} className="text-red-400 px-2">
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
