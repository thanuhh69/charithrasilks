'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiCalendar, FiLink, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function BannersContent() {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.get('/admin/banners');
      if (data.success) setBanners(data.banners || []);
    } catch (err) {
      toast.error('Failed to load banners');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setLink('');
    setStartDate('');
    setEndDate('');
    setSortOrder('0');
    setIsActive(true);
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (b) => {
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setLink(b.link || '');
    
    // Format dates to fit date-picker inputs (YYYY-MM-DDTHH:MM)
    if (b.startDate) {
      setStartDate(new Date(b.startDate).toISOString().slice(0, 16));
    } else {
      setStartDate('');
    }
    if (b.endDate) {
      setEndDate(new Date(b.endDate).toISOString().slice(0, 16));
    } else {
      setEndDate('');
    }

    setSortOrder(b.sortOrder ? b.sortOrder.toString() : '0');
    setIsActive(b.isActive);
    setEditId(b._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('link', link);
      formData.append('startDate', startDate || '');
      formData.append('endDate', endDate || '');
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive.toString());
      if (imageFile) formData.append('image', imageFile);

      if (editId) {
        await adminApi.put(`/admin/banners/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Banner updated successfully');
      } else {
        if (!imageFile) {
          toast.error('Banner image file is required');
          setSaving(false);
          return;
        }
        await adminApi.post('/admin/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Banner created successfully');
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, bTitle) => {
    if (!confirm(`Delete banner "${bTitle || 'Unnamed'}"?`)) return;
    try {
      await adminApi.delete(`/admin/banners/${id}`);
      toast.success('Banner deleted successfully');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete banner');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-cream font-semibold">Home Banners</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Banner
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4 max-w-lg">
          <h2 className="font-serif text-gold text-lg font-medium">
            {editId ? 'Edit Banner' : 'Create Banner'}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-cream/70 text-xs block mb-1">Banner Title</label>
              <input
                placeholder="e.g. Festival Collection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-cream/70 text-xs block mb-1">Banner Subtitle / Discount text</label>
              <input
                placeholder="e.g. Upto 50% OFF"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-cream/70 text-xs block mb-1">Redirect URL</label>
              <div className="relative">
                <input
                  placeholder="e.g. /category/pattu"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="input-field pl-9"
                />
                <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream/70 text-xs block mb-1">Start Date (Optional)</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field pl-9 text-xs"
                  />
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                </div>
              </div>
              <div>
                <label className="text-cream/70 text-xs block mb-1">End Date (Optional)</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field pl-9 text-xs"
                  />
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label className="text-cream/70 text-xs block mb-1">Sort Order</label>
                <div className="relative">
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input-field pl-9"
                  />
                  <FiSliders className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gold/30 bg-maroon-dark text-gold focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="isActive" className="text-cream text-sm cursor-pointer select-none">
                  Active immediately
                </label>
              </div>
            </div>

            <div>
              <label className="text-cream/70 text-xs block mb-1">Banner Image</label>
              <label className="flex flex-col items-center justify-center border border-dashed border-gold/30 rounded-lg p-5 cursor-pointer bg-maroon/10 hover:bg-maroon/20 transition">
                <FiUpload className="text-gold text-2xl mb-2" />
                <span className="text-cream text-xs text-center font-medium">
                  {imageFile ? imageFile.name : 'Select Banner Image (1600x600 recommended)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={resetForm} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-20 bg-maroon-dark/20 rounded-2xl border border-dashed border-gold/20">
          <p className="text-cream/50 text-sm">No banners created yet. Click "Add Banner" to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b._id} className="card overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-[21/9] bg-maroon/40 relative overflow-hidden">
                  {b.image && (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium shadow-md ${
                        b.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {(b.startDate || b.endDate) && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-cream font-semibold text-base">
                        {b.title || 'Untitled Banner'}
                      </h3>
                      <p className="text-gold text-xs font-medium">{b.subtitle}</p>
                    </div>
                    <span className="text-cream/40 text-xs">Sort: {b.sortOrder}</span>
                  </div>
                  {b.link && (
                    <p className="text-[10px] text-cream/50 break-all font-mono">
                      Link: {b.link}
                    </p>
                  )}
                  {(b.startDate || b.endDate) && (
                    <div className="text-[10px] text-cream/40 space-y-0.5 border-t border-gold/10 pt-2 mt-2">
                      {b.startDate && (
                        <p>Start: {new Date(b.startDate).toLocaleString('en-IN')}</p>
                      )}
                      {b.endDate && (
                        <p>End: {new Date(b.endDate).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gold/10 flex justify-end gap-3 bg-maroon-dark/10">
                <button
                  onClick={() => handleEdit(b)}
                  className="flex items-center gap-1.5 text-gold text-xs font-semibold hover:opacity-85 transition"
                >
                  <FiEdit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(b._id, b.title)}
                  className="flex items-center gap-1.5 text-red-400 text-xs font-semibold hover:opacity-85 transition"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBannersPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1">
          <BannersContent />
        </main>
      </div>
    </AdminGuard>
  );
}
