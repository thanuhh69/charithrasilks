'use client';

import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function CustomersContent() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await adminApi.get('/admin/customers', { params: { search } });
    if (data.success) setCustomers(data.customers);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggleBlock = async (id) => {
    try {
      await adminApi.put(`/admin/customers/${id}/toggle-block`);
      toast.success('Customer status updated');
      load();
    } catch (err) {
      toast.error('Could not update customer');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Customers</h1>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search customers..." 
          className="input-field-icon w-full" 
        />
        <FiSearch className="input-icon" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-cream/60 text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-cream/50">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-cream/50">No customers found</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="border-b border-gold/10">
                  <td className="p-4 text-cream">{c.name || 'Unnamed'}</td>
                  <td className="p-4 text-cream/70">{c.email || c.mobile || '—'}</td>
                  <td className="p-4 text-cream/60">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${c.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleToggleBlock(c._id)} className="text-gold text-sm">
                      {c.isBlocked ? 'Unblock' : 'Block'}
                    </button>
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
        ) : customers.length === 0 ? (
          <p className="text-center text-cream/50 py-6">No customers found</p>
        ) : (
          customers.map((c) => (
            <div key={c._id} className="card p-4 flex flex-col gap-3.5 border border-gold/15">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-cream font-semibold text-sm">{c.name || 'Unnamed'}</h3>
                  <span className="text-cream/50 text-[11px] block mt-0.5">{c.email || c.mobile || '—'}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${c.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {c.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2.5 border-t border-gold/10 text-xs">
                <div>
                  <span className="text-cream/50 block">Joined on</span>
                  <span className="text-cream/80 block mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <button 
                  onClick={() => handleToggleBlock(c._id)} 
                  className="text-gold font-semibold border border-gold/30 px-3.5 py-2 rounded-lg text-xs hover:bg-gold/5 transition"
                >
                  {c.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1"><CustomersContent /></main>
      </div>
    </AdminGuard>
  );
}
