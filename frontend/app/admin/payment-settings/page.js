'use client';

import { useEffect, useState } from 'react';
import { FiSave, FiUpload, FiLoader, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import adminApi from '../../../lib/adminApi';

function SettingsContent() {
  const [ownerName, setOwnerName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [merchantDisplayName, setMerchantDisplayName] = useState('');
  const [enableUpiPayments, setEnableUpiPayments] = useState(true);
  const [enableQrPayments, setEnableQrPayments] = useState(true);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [existingQrUrl, setExistingQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get('/admin/payments/settings')
      .then(({ data }) => {
        if (data.success && data.settings) {
          setOwnerName(data.settings.ownerName || '');
          setUpiId(data.settings.upiId || '');
          setMobileNumber(data.settings.mobileNumber || '');
          setMerchantDisplayName(data.settings.merchantDisplayName || '');
          setEnableUpiPayments(data.settings.enableUpiPayments !== false);
          setEnableQrPayments(data.settings.enableQrPayments !== false);
          setExistingQrUrl(data.settings.qrCode || '');
        }
      })
      .catch(() => {
        toast.error('Failed to load payment settings');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerName || !upiId || !mobileNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('ownerName', ownerName.trim());
      formData.append('upiId', upiId.trim());
      formData.append('mobileNumber', mobileNumber.trim());
      formData.append('merchantDisplayName', merchantDisplayName.trim());
      formData.append('enableUpiPayments', enableUpiPayments.toString());
      formData.append('enableQrPayments', enableQrPayments.toString());
      if (qrCodeFile) {
        formData.append('qrCode', qrCodeFile);
      }

      const { data } = await adminApi.put('/admin/payments/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        toast.success(data.message || 'Payment settings updated successfully');
        if (data.settings?.qrCode) {
          setExistingQrUrl(data.settings.qrCode);
        }
        setQrCodeFile(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FiLoader className="animate-spin text-gold text-4xl mb-4" />
        <p className="text-cream/60">Loading settings configurations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Payment Settings</h1>
      
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h2 className="text-gold font-serif text-lg font-medium border-b border-gold/15 pb-2 mb-4">UPI Configuration (Zero Transaction Fees)</h2>
        
        <div>
          <label className="text-cream/70 text-xs block mb-1.5 font-medium">Owner Name *</label>
          <input
            required
            type="text"
            placeholder="e.g. Thanush Mohan"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-cream/70 text-xs block mb-1.5 font-medium">Merchant UPI ID *</label>
            <input
              required
              type="text"
              placeholder="e.g. merchant@ybl"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="text-cream/70 text-xs block mb-1.5 font-medium">Mobile Number linked to UPI *</label>
            <input
              required
              type="text"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="text-cream/70 text-xs block mb-1.5 font-medium">Merchant Display Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Charithra Silks"
            value={merchantDisplayName}
            onChange={(e) => setMerchantDisplayName(e.target.value)}
            className="input-field"
          />
          <p className="text-[10px] text-cream/40 mt-1">If blank, the Owner Name will be shown to users.</p>
        </div>

        <div>
          <label className="text-cream/70 text-xs block mb-1.5 font-medium">Upload Backup QR Code Image</label>
          <div className="flex gap-4 items-center">
            {existingQrUrl && (
              <div className="w-24 h-24 rounded-lg bg-white p-1 border border-gold/25 flex-shrink-0 flex items-center justify-center">
                <img src={existingQrUrl} alt="Existing QR" className="w-full h-full object-contain" />
              </div>
            )}
            <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gold/30 rounded-lg p-5 cursor-pointer bg-maroon-dark/20 hover:bg-maroon-dark/40 transition">
              <FiUpload className="text-gold text-xl mb-1.5" />
              <span className="text-cream text-xs text-center font-medium">
                {qrCodeFile ? qrCodeFile.name : 'Select QR code image file'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrCodeFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gold/15 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableUpi"
              checked={enableUpiPayments}
              onChange={(e) => setEnableUpiPayments(e.target.checked)}
              className="w-4 h-4 rounded border-gold/30 bg-maroon-dark text-gold focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="enableUpi" className="text-cream text-sm cursor-pointer select-none">
              Enable "Pay with UPI Apps" option at checkout
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableQr"
              checked={enableQrPayments}
              onChange={(e) => setEnableQrPayments(e.target.checked)}
              className="w-4 h-4 rounded border-gold/30 bg-maroon-dark text-gold focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="enableQr" className="text-cream text-sm cursor-pointer select-none">
              Enable "Scan & Pay QR Code" option at checkout
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-6"
        >
          {saving ? (
            <>
              <FiLoader className="animate-spin text-maroon-dark text-lg" />
              <span>Saving Configurations...</span>
            </>
          ) : (
            <>
              <FiSave />
              <span>Save Payment Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminPaymentSettingsPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1">
          <SettingsContent />
        </main>
      </div>
    </AdminGuard>
  );
}
