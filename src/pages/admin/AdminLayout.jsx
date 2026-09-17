import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { cn } from '../../lib/utils';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
        <div className="px-4 py-5 text-sm font-bold tracking-wide">TinkerSpace Admin</div>
        <nav className="flex-1 px-2">
          <div
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
              'bg-gray-100 dark:bg-white/10'
            )}
          >
            <Settings size={16} />
            Configure
          </div>
        </nav>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-5 py-4 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
