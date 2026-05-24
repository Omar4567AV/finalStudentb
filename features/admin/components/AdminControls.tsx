'use client';

import React, { useState } from 'react';

export default function AdminControls() {
  const [sid, setSid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: sid, name, email, major }),
    });
    setLoading(false);
    if (res.ok) {
      setSid(''); setName(''); setEmail(''); setMajor('');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold mb-4">Provision Student Registry Account</h3>
      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Student ID" value={sid} onChange={(e) => setSid(e.target.value)} required className="px-3 py-2 text-sm border rounded-lg bg-transparent border-slate-300 dark:border-slate-700" />
        <input type="text" placeholder="Full Legal Name" value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-2 text-sm border rounded-lg bg-transparent border-slate-300 dark:border-slate-700" />
        <input type="email" placeholder="Institutional Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-3 py-2 text-sm border rounded-lg bg-transparent border-slate-300 dark:border-slate-700" />
        <input type="text" placeholder="Academic Major" value={major} onChange={(e) => setMajor(e.target.value)} required className="px-3 py-2 text-sm border rounded-lg bg-transparent border-slate-300 dark:border-slate-700" />
        <button type="submit" disabled={loading} className="md:col-span-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Processing Registry Request...' : 'Commit System Profile'}
        </button>
      </form>
    </div>
  );
}