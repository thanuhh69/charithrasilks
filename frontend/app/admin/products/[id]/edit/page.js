'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminGuard from '../../../../../components/admin/AdminGuard';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import ProductForm from '../../../../../components/admin/ProductForm';
import adminApi from '../../../../../lib/adminApi';

function EditProductContent() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get(`/admin/products/${id}`).then(({ data }) => {
      if (data.success) setProduct(data.product);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-cream/50">Loading...</p>;
  if (!product) return <p className="text-cream/50">Product not found</p>;

  return (
    <>
      <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Edit Product</h1>
      <ProductForm initialData={product} productId={id} />
    </>
  );
}

export default function EditProductPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <EditProductContent />
        </main>
      </div>
    </AdminGuard>
  );
}
