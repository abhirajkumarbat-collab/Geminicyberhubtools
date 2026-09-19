import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Database, Upload, CalendarClock, Settings,
  Users, Bell, Brain, TrendingUp, FolderOpen, ChevronRight,
  Plus, Search, Trash2, Edit3, X, Save, Check, AlertCircle,
  Loader2, Filter, Clock, Zap, Eye, MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { COLLECTIONS, COLLECTION_LIST, type ContentItem, type QueueItem } from '@/lib/types';
import { fetchRows, countRows, logAudit } from '@/lib/api';
import { useQuery } from '@/lib/hooks';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminContentManager from '@/components/admin/AdminContentManager';
import AdminBulkImport from '@/components/admin/AdminBulkImport';
import AdminPublishQueue from '@/components/admin/AdminPublishQueue';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminNotifications from '@/components/admin/AdminNotifications';

type AdminTab = 'dashboard' | 'content' | 'import' | 'queue' | 'settings' | 'users' | 'notifications';

const TABS: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'content', label: 'Content', icon: Database },
  { key: 'import', label: 'Bulk Import', icon: Upload },
  { key: 'queue', label: 'Publish Queue', icon: CalendarClock },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminTools() {
  const [tab, setTab] = useState<AdminTab>('dashboard');

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Admin sidebar */}
      <aside className="lg:w-56 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0d1320]/80 backdrop-blur-sm">
        <div className="p-3 lg:p-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === key
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Admin content area */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <AdminDashboard onNavigate={setTab} />}
        {tab === 'content' && <AdminContentManager />}
        {tab === 'import' && <AdminBulkImport />}
        {tab === 'queue' && <AdminPublishQueue />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'notifications' && <AdminNotifications />}
        {tab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}
