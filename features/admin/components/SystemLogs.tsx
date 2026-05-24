'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(4));
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
      <div className="text-white font-semibold mb-2 flex items-center justify-between">
        <span>System Log Mutation Monitor Stream</span>
        <span className="text-[10px] bg-red-950/50 text-red-400 px-2 py-0.5 border border-red-900/30 rounded">Live</span>
      </div>
      <div className="space-y-1.5 divide-y divide-slate-900">
        {logs.map((log) => (
          <p key={log.id} className="pt-1.5">
            <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.action} — <span className="text-slate-500">{log.performedBy}</span>
          </p>
        ))}
      </div>
    </div>
  );
}