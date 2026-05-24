'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/features/shared/components/Sidebar';
import Navbar from '@/features/shared/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    const res = await fetch('/api/auth/signout', { method: 'POST' });
    if (res.ok) {
      router.refresh();
      router.push('/login');
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200 font-sans">
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} onSignOut={handleSignOut} />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-5xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}