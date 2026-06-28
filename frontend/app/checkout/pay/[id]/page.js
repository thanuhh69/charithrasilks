'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheckCircle, FiLock, FiDownload, FiUpload, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthGuard from '../../../../components/AuthGuard';
import Header from '../../../../components/Header';
import api from '../../../../lib/api';

function PayContent() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appOpening, setAppOpening] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get('/payment-settings')
        ]);
        if (orderRes.data.success && settingsRes.data.success) {
          setOrder(orderRes.data.order);
          setSettings(settingsRes.data.settings);
        }
      } catch (err) {
        toast.error('Failed to load payment details');
      } {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FiLoader className="animate-spin text-gold text-4xl mb-4" />
        <p className="text-cream/60">Loading payment page...</p>
      </div>
    );
  }

  if (!order || !settings) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto my-10">
        <FiAlertCircle className="text-red-400 text-5xl mx-auto mb-4" />
        <h2 className="text-cream font-medium text-lg mb-2">Order Not Found</h2>
        <p className="text-cream/50 text-sm mb-6">We could not retrieve the payment details for this order.</p>
        <button onClick={() => router.push('/orders')} className="btn-primary w-full">Go to My Orders</button>
      </div>
    );
  }

  // Generate UPI payment URL
  const displayName = settings.merchantDisplayName || settings.ownerName;
  const upiUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(displayName)}&am=${order.totalAmount}&cu=INR&tn=${order.orderNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&margin=10`;

  const handleOpenUpiApp = () => {
    setAppOpening(true);
    // Trigger intent
    window.location.href = upiUrl;
    setTimeout(() => {
      setAppOpening(false);
    }, 3000);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      toast.error('Please enter a valid 12-digit UTR/Transaction ID');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('utrNumber', utrNumber.trim());
      if (file) {
        formData.append('screenshot', file);
      }

      const { data } = await api.put(`/orders/${id}/submit-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setSuccess(true);
        toast.success('Payment submitted successfully!');
        setTimeout(() => {
          router.push(`/order-success/${order._id}`);
        }, 3500);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto my-10">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-green-400 text-4xl animate-bounce" />
        </div>
        <h1 className="font-serif text-2xl text-cream font-bold mb-3">Submission Successful!</h1>
        <p className="text-cream/80 text-sm mb-4">Your payment details have been submitted.</p>
        <p className="text-cream/50 text-xs mb-8">Our team will verify it shortly. Redirecting to receipt page...</p>
        <div className="flex justify-center">
          <FiLoader className="animate-spin text-gold text-2xl" />
        </div>
      </div>
    );
  }

  const isQrMode = order.paymentMethod === 'UPI_QR';

  return (
    <div className="max-w-xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600/20 border border-green-500 flex items-center justify-center text-green-400 text-xs font-semibold"><FiCheckCircle /></div>
          <span className="text-xs text-cream/50">Address</span>
          <div className="w-6 h-px bg-green-600/30" />
          <div className="w-6 h-6 rounded-full bg-green-600/20 border border-green-500 flex items-center justify-center text-green-400 text-xs font-semibold"><FiCheckCircle /></div>
          <span className="text-xs text-cream/50">Payment</span>
          <div className="w-6 h-px bg-gold/30" />
          <div className="w-6 h-6 rounded-full bg-gold text-maroon-dark flex items-center justify-center text-xs font-bold">3</div>
          <span className="text-xs text-cream font-medium">Verify</span>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="text-center pb-6 border-b border-gold/15 mb-6">
          <p className="text-cream/50 text-xs tracking-widest uppercase mb-1">TOTAL AMOUNT TO PAY</p>
          <h2 className="text-gold font-bold text-3xl font-serif">₹{order.totalAmount.toLocaleString('en-IN')}</h2>
          <p className="text-cream/60 text-xs mt-2">Order ID: #{order.orderNumber}</p>
        </div>

        {isQrMode ? (
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-cream font-serif text-lg font-medium mb-1">Scan to Pay</h3>
            <p className="text-cream/50 text-xs text-center mb-5 px-6">
              Scan this QR using Google Pay, PhonePe, Paytm, or any UPI enabled banking app.
            </p>

            <div className="p-3 bg-white rounded-xl mb-4 shadow-lg border border-gold/30 relative">
              <img src={qrCodeUrl} alt="UPI Payment QR Code" className="w-[200px] h-[200px]" />
            </div>

            <a 
              href={qrCodeUrl}
              download={`charithra-silks-order-${order.orderNumber}.png`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-gold text-xs font-medium hover:underline"
            >
              <FiDownload size={14} /> Download QR Code
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-cream font-serif text-lg font-medium mb-1">Pay with UPI Apps</h3>
            <p className="text-cream/50 text-xs text-center mb-6 px-6">
              Tap the button below to launch your installed UPI applications (GPay, PhonePe, Paytm, etc.) to complete transaction.
            </p>

            <button
              onClick={handleOpenUpiApp}
              disabled={appOpening}
              className="btn-primary w-full py-4 relative flex items-center justify-center gap-2 mb-6"
            >
              {appOpening ? (
                <>
                  <FiLoader className="animate-spin text-maroon-dark text-lg" />
                  <span>Opening UPI App...</span>
                </>
              ) : (
                <span>Pay ₹{order.totalAmount.toLocaleString('en-IN')} via UPI</span>
              )}
            </button>

            {/* Popular UPI Apps Icons */}
            <div className="w-full">
              <p className="text-center text-cream/40 text-[10px] uppercase tracking-wider mb-3">Supported UPI Apps</p>
              <div className="flex justify-center items-center gap-3.5">
                <div className="bg-white/95 px-3 py-2 rounded-lg border border-gold/15 h-11 w-16 flex items-center justify-center shadow-md">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-5 w-auto object-contain" />
                </div>
                <div className="bg-white/95 px-3 py-2 rounded-lg border border-gold/15 h-11 w-16 flex items-center justify-center shadow-md">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6 w-auto object-contain" />
                </div>
                <div className="bg-white/95 px-3 py-2 rounded-lg border border-gold/15 h-11 w-16 flex items-center justify-center shadow-md">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-5 w-auto object-contain" />
                </div>
                <div className="bg-white/95 px-3 py-2 rounded-lg border border-gold/15 h-11 w-16 flex items-center justify-center shadow-md">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/65/BHIM_logo.svg" alt="BHIM" className="h-5.5 w-auto object-contain" />
                </div>
              </div>
            </div>
            
            {/* Desktop message */}
            <div className="w-full mt-4 p-3 bg-gold/10 border border-gold/20 rounded-lg text-center">
              <p className="text-gold text-xs">
                ⚠️ UPI App launches are optimized for mobile. On desktop? You can select "Scan QR Code" or copy UPI ID: <strong>{settings.upiId}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gold/15 pt-6 mt-6">
          <h3 className="text-cream font-serif text-lg font-medium mb-4">Submit Payment Proof</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">UTR / Transaction ID (12 Digits) *</label>
              <input
                required
                type="text"
                placeholder="Enter 12-digit UPI UTR number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                className="input-field font-mono"
              />
              <p className="text-[10px] text-cream/40 mt-1">Can be found in your UPI app payment receipt details.</p>
            </div>

            <div>
              <label className="input-label">Payment Screenshot (Optional but Recommended)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-gold/30 rounded-lg p-5 cursor-pointer bg-maroon-dark/30 hover:bg-maroon-dark/50 transition flex flex-col items-center justify-center"
              >
                <FiUpload className="text-gold text-2xl mb-2" />
                <span className="text-cream text-xs text-center font-medium">
                  {file ? file.name : 'Choose file or drag here'}
                </span>
                <span className="text-cream/40 text-[10px] mt-1">PNG, JPG, or JPEG up to 5MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {previewUrl && (
                <div className="mt-3 relative w-32 h-40 rounded-lg border border-gold/20 overflow-hidden bg-maroon">
                  <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 mt-4"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin text-maroon-dark text-lg mr-2" />
                  <span>Submitting Details...</span>
                </>
              ) : (
                <span>Submit Payment Details</span>
              )}
            </button>

            <p className="text-center text-cream/40 text-[10px] flex items-center justify-center gap-1.5 mt-3">
              <FiLock /> Secure payment verification. We do not store banking credentials.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <div className="min-h-screen pb-10">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/orders')} className="text-gold text-xl"><FiArrowLeft /></button>
            <h1 className="font-serif text-xl text-cream font-medium">Verify UPI Payment</h1>
          </div>
          <PayContent />
        </main>
      </div>
    </AuthGuard>
  );
}
