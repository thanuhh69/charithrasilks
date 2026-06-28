'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiLink, FiSliders, FiEye, FiLoader, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function InstagramContent() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.get('/admin/instagram');
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      toast.error('Failed to load Instagram gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setLink('');
    setCaption('');
    setSortOrder('0');
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setLink(p.link || '');
    setCaption(p.caption || '');
    setSortOrder(p.sortOrder ? p.sortOrder.toString() : '0');
    setIsActive(p.isActive !== false);
    setImagePreview(p.image || '');
    setEditId(p._id);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link) {
      toast.error('Instagram post URL link is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('link', link.trim());
      formData.append('caption', caption.trim());
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editId) {
        await adminApi.put(`/admin/instagram/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Instagram post updated successfully');
      } else {
        if (!imageFile) {
          toast.error('An image file is required');
          setSaving(false);
          return;
        }
        await adminApi.post('/admin/instagram', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Instagram post created successfully');
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Instagram post?')) return;
    try {
      await adminApi.delete(`/admin/instagram/${id}`);
      toast.success('Instagram post deleted');
      await load();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  // Re-ordering logic: quick move up/down that calls API to update sort order
  const handleMove = async (index, direction) => {
    const newPosts = [...posts];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newPosts.length) return;

    // Swap elements locally
    const temp = newPosts[index];
    newPosts[index] = newPosts[swapIndex];
    newPosts[swapIndex] = temp;

    // Update state immediately for snap UI response
    setPosts(newPosts);

    try {
      // Call update API for both swapped items to persist the order
      await Promise.all([
        adminApi.put(`/admin/instagram/${newPosts[index]._id}`, { sortOrder: index }),
        adminApi.put(`/admin/instagram/${newPosts[swapIndex]._id}`, { sortOrder: swapIndex })
      ]);
      toast.success('Display order updated');
    } catch (err) {
      toast.error('Could not save new order to database');
      load(); // Reload original state
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FiLoader className="animate-spin text-gold text-4xl mb-4" />
        <p className="text-cream/60">Loading Instagram gallery...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl text-cream font-semibold">Instagram Gallery</h1>
          <p className="text-cream/50 text-xs mt-1">Manage thumbnails and links displayed in the homepage gallery</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Post
          </button>
        )}
      </div>

      {showForm && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h2 className="font-serif text-gold text-lg font-medium border-b border-gold/15 pb-2 mb-3">
              {editId ? 'Edit Instagram Post' : 'Add Instagram Post'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-cream/70 text-xs block mb-1">Instagram Post URL Link *</label>
                <div className="relative">
                  <input
                    required
                    type="url"
                    placeholder="https://www.instagram.com/p/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="input-field pl-9"
                  />
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60" />
                </div>
              </div>

              <div>
                <label className="text-cream/70 text-xs block mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Elegant Silk Sarees Collection"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
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
                    className="w-4 h-4 rounded border-gold/30 bg-maroon-dark text-gold focus:ring-0"
                  />
                  <label htmlFor="isActive" className="text-cream text-sm cursor-pointer select-none">
                    Active on Storefront
                  </label>
                </div>
              </div>

              <div>
                <label className="text-cream/70 text-xs block mb-1">Select Media / Video Thumbnail *</label>
                <label className="flex flex-col items-center justify-center border border-dashed border-gold/30 rounded-lg p-5 cursor-pointer bg-maroon/10 hover:bg-maroon/20 transition">
                  <FiUpload className="text-gold text-2xl mb-2" />
                  <span className="text-cream text-xs text-center font-medium">
                    {imageFile ? imageFile.name : 'Select Square Image (1:1 aspect ratio)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={resetForm} className="btn-secondary flex-1 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-sm">
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="card p-6">
            <h3 className="font-serif text-gold text-sm font-medium uppercase tracking-wider mb-4">Storefront Live Preview</h3>
            <div className="flex justify-center">
              <div className="w-56 aspect-square rounded-[20px] overflow-hidden bg-maroon border border-gold/15 shadow-lg relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <FiEye className="text-gold/30 text-4xl mb-2" />
                    <span className="text-xs text-cream/40">Select an image to see live preview</span>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                    <FiInstagram className="text-white text-3xl drop-shadow" />
                  </div>
                )}
              </div>
            </div>
            {caption && <p className="text-center text-cream/70 text-xs mt-3 italic">"{caption}"</p>}
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-maroon-dark/20 rounded-2xl border border-dashed border-gold/20">
          <p className="text-cream/50 text-sm">No Instagram posts linked yet. Click "Add Post" to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <div key={post._id} className="card flex flex-col justify-between overflow-hidden border border-gold/15">
              <div>
                {/* Image Preview */}
                <div className="aspect-square bg-maroon/40 relative overflow-hidden border-b border-gold/15">
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold shadow-md ${
                        post.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {post.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-3 space-y-1">
                  <p className="text-xs text-gold font-semibold truncate">Order: {post.sortOrder}</p>
                  <p className="text-[10px] text-cream/70 line-clamp-2 min-h-6">{post.caption || 'No caption'}</p>
                  <a href={post.link} target="_blank" rel="noreferrer" className="text-[9px] text-gold hover:underline block truncate mt-1.5 font-mono">
                    {post.link}
                  </a>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="p-3 border-t border-gold/10 flex justify-between bg-maroon-dark/10 text-xs">
                {/* Order arrangement */}
                <div className="flex gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                    className="p-1 text-gold hover:bg-gold/10 rounded disabled:opacity-30"
                    title="Move Up"
                  >
                    <FiArrowUp size={13} />
                  </button>
                  <button
                    disabled={index === posts.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="p-1 text-gold hover:bg-gold/10 rounded disabled:opacity-30"
                    title="Move Down"
                  >
                    <FiArrowDown size={13} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-gold hover:text-gold-light font-semibold flex items-center gap-1"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-400 hover:text-red-350 font-semibold flex items-center gap-1"
                  >
                    <FiTrash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminInstagramPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1">
          <InstagramContent />
        </main>
      </div>
    </AdminGuard>
  );
}
