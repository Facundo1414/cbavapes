"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/admin/login';
  return (
    <div className="min-h-screen flex bg-gray-100">
      {!hideSidebar && <Sidebar />}
  <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
