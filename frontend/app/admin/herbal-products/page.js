'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import ProductForm from '../../../components/admin/ProductForm';
import adminApi from '../../../lib/adminApi';

function HerbalContent() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/products', { params: { search, type: 'Herbal' } });
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      toast.error('Failed to load herbal products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete Herbal Product "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast.success('Herbal product deleted successfully');
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

  const handleStartEdit = (product) => {
    setEditId(product._id);
    setEditProduct(product);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-cream font-semibold">
            {editId ? 'Edit Herbal Product' : 'Add New Herbal Product'}
          </h1>
          <button 
            onClick={() => { setShowForm(false); setEditId(null); setEditProduct(null); load(); }} 
            className="btn-secondary text-xs px-4 py-2"
          >
            Back to List
          </button>
        </div>
        <div className="card p-6">
          <ProductForm 
            type="Herbal" 
            productId={editId} 
            initialData={editProduct} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl text-cream font-semibold">Herbal Products</h1>
          <p className="text-cream/50 text-xs mt-1">Manage health, beauty, and organic wellness items</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search herbal products..."
          className="input-field pl-9 py-2"
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto border border-gold/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-cream/60 text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Weight</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-cream/50"><FiLoader className="animate-spin text-gold inline mr-2" />Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-cream/50">No herbal products found</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-b border-gold/10">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-12 rounded bg-maroon overflow-hidden flex-shrink-0">
                      {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-cream font-medium">{p.title}</span>
                      {p.productCode && <span className="text-[10px] text-gold/60 mt-0.5 font-mono">Code: {p.productCode}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-cream/70">{p.category?.name || '—'}</td>
                  <td className="p-4 text-cream/70">{p.weight || '—'}</td>
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
                    <div className="flex gap-3 text-lg">
                      <button onClick={() => handleStartEdit(p)} className="text-gold hover:text-gold-light"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(p._id, p.title)} className="text-cream/60 hover:text-red-400"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-cream/50 py-6">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-cream/50 py-6">No products found</p>
        ) : (
          products.map((p) => (
            <div key={p._id} className="card p-4 flex flex-col gap-3.5 border border-gold/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded bg-maroon overflow-hidden flex-shrink-0 shadow-md">
                  {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-semibold truncate text-sm">{p.title}</h3>
                  {p.productCode && <span className="text-[10px] text-gold/60 font-mono block mt-0.5">Code: {p.productCode}</span>}
                  <p className="text-xs text-cream/50 mt-1">Category: {p.category?.name || '—'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-gold/10 text-xs">
                <div>
                  <span className="text-cream/50 block">Price</span>
                  <span className="text-gold font-bold text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-cream/50 block">Stock</span>
                  <span className="text-cream font-semibold">{p.totalStock}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-cream/50 block mb-1">Status</span>
                  <button
                    onClick={() => handleToggleActive(p._id)}
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2.5 border-t border-gold/5">
                <button 
                  onClick={() => handleStartEdit(p)} 
                  className="text-gold hover:text-gold-light flex items-center gap-1.5 text-xs px-3.5 py-2 border border-gold/30 rounded-lg hover:bg-gold/5 transition"
                >
                  <FiEdit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(p._id, p.title)} 
                  className="text-cream/60 hover:text-red-400 flex items-center gap-1.5 text-xs px-3.5 py-2 border border-gold/10 rounded-lg hover:bg-red-500/5 transition"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminHerbalProductsPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-[#1A0307]/5 pt-4">
          <HerbalContent />
        </main>
      </div>
    </AdminGuard>
  );
}
