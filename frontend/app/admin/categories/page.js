'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await adminApi.get('/admin/categories');
    if (data.success) setCategories(data.categories);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setDescription(cat.description || '');
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      if (editId) {
        await adminApi.put(`/admin/categories/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        await adminApi.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await adminApi.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-cream font-semibold">Categories</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3 max-w-md">
          <input required placeholder="Category Name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={2} />
          <label className="flex items-center gap-2 text-cream/70 text-sm cursor-pointer border border-dashed border-gold/30 rounded-lg p-3">
            <FiUpload />
            {imageFile ? imageFile.name : 'Upload category image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="card overflow-hidden">
            <div className="aspect-square bg-maroon relative">
              {cat.image && <img src={cat.image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="p-3">
              <p className="text-cream font-medium text-sm">{cat.name}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-gold"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(cat._id, cat.name)} className="text-red-400"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><CategoriesContent /></main>
      </div>
    </AdminGuard>
  );
}
