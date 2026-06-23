'use client';

import AdminGuard from '../../../../components/admin/AdminGuard';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProductForm from '../../../../components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <h1 className="font-serif text-2xl text-cream font-semibold mb-6">Add New Product</h1>
          <ProductForm />
        </main>
      </div>
    </AdminGuard>
  );
}
