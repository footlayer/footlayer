import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '../../../components/admin/admin-sidebar';

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const isAdmin = cookies().get('admin_session')?.value === 'true';
  if (!isAdmin) {
    redirect('/admin/login');
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <AdminSidebar />
          </aside>
          <main className="lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


