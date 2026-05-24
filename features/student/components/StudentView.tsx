'use client';

import React from 'react';

export default function StudentView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">Enrolled Academic Frameworks</h4>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between text-sm items-center">
          <span className="font-medium">CS50 Introduction to Artificial Intelligence</span>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Active</span>
        </div>
      </div>
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-1">Security Sandbox Audit</h4>
          <p className="text-xs text-slate-500 mt-1">Your authorization scope provides read-only restriction tokens across global data nodes.</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-400">
          ℹ️ Read-Only Mode enforced. Contact administrative desks for record mutations.
        </div>
      </div>
    </div>
  );
}