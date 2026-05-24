import React from 'react';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onSignOut: () => void;
}

export default function Sidebar({ darkMode, setDarkMode, onSignOut }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between h-screen">
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            Ω
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block">EduPortal</span>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Core Layout</span>
          </div>
        </div>
        <nav className="space-y-1">
          <span className="flex items-center space-x-2 px-3 py-2.5 text-sm font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <span>Workspace Console</span>
          </span>
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {darkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </button>
        <button 
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
        >
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}