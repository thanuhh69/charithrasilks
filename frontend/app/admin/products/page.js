'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await adminApi.get('/admin/products', { params: { search } });
    if (data.success) setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete product');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await adminApi.patch(`/admin/products/${id}/toggle-active`);
      load();
    } catch (err) {
      toast.error('Could not update product status');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="font-serif text-2xl text-cream font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="relative mb-6 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-10"
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-cream/60 text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-cream/50">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-cream/50">No products found</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-b border-gold/10">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-12 rounded bg-maroon overflow-hidden flex-shrink-0">
                      {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-cream">{p.title}</span>
                  </td>
                  <td className="p-4 text-cream/70">{p.category?.name || '—'}</td>
                  <td className="p-4 text-gold font-medium">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-cream/70">{p.totalStock}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(p._id)}
                      className={`text-xs font-semibold px-2 py-1 rounded ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p._id}/edit`} className="text-gold hover:text-gold-light"><FiEdit2 /></Link>
                      <button onClick={() => handleDelete(p._id, p.title)} className="text-cream/60 hover:text-red-400"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><ProductsContent /></main>
      </div>
    </AdminGuard>
  );
}
