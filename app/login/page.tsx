'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userCredential.user.uid, email: userCredential.user.email }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('No structural authorization profiles assigned to this individual account.');
      }
    } catch (err) {
      setError('Invalid identification processing parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-6 text-center tracking-tight">Portal Authentication Access</h2>
        {error && <div className="p-3 mb-4 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200/20 rounded-lg">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Node Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 text-sm border rounded-xl bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Credential Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 text-sm border rounded-xl bg-transparent border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Verifying Identity...' : 'Secure Gate Authorization'}
          </button>
        </form>
      </div>
    </main>
  );
}