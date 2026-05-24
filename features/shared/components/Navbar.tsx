import React from 'react';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider font-mono uppercase">
        Secure Subsystem Active Node
      </span>
      <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400">EDGE_SECURE</span>
      </div>
    </header>
  );
}