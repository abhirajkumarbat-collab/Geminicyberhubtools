import { useMemo, useEffect, useState } from 'react';
import {
  TrendingUp, Database, Upload, CalendarClock, Users, Bell,
  GraduationCap, Smartphone, Wrench, Lightbulb, Folder,
  FileText, PlayCircle, Zap, Package, MessageSquare, Newspaper,
  Brain, ArrowRight, Activity,
} from 'lucide-react';
import { COLLECTIONS, COLLECTION_LIST } from '@/lib/types';
import { countRows } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const ICONS: Record<string, typeof GraduationCap> = {
  GraduationCap, Smartphone, Wrench, Lightbulb, Folder,
  FileText, PlayCircle, Zap, Package, MessageSquare, Newspaper, Brain,
};

type AdminTab = 'dashboard' | 'content' | 'import' | 'queue' | 'settings' | 'users' | 'notifications';

export default function AdminDashboard({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [queueCount, setQueueCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    COLLECTION_LIST.forEach((key) => {
      countRows(key).then((c) => setCounts((prev) => ({ ...prev, [key]: c })));
    });
    countRows('publish_queue').then(setQueueCount);
    countRows('profiles').then(setUserCount);
  }, []);

  const totalContent = useMemo(() =>
    Object.values(counts).reduce((a, b) => a + b, 0),
  [counts]);

  const stats = [
    { label: 'Total Content', value: totalContent, icon: Database, color: 'cyan' },
    { label: 'Publish Queue', value: queueCount, icon: CalendarClock, color: 'blue' },
    { label: 'Registered Users', value: userCount, icon: Users, color: 'teal' },
    { label: 'Collections', value: COLLECTION_LIST.length, icon: Folder, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    teal: 'from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your platform content and activity.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-2xl border p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5" />
              <TrendingUp className="w-4 h-4 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('import')}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Bulk Import</div>
              <div className="text-xs text-gray-500">Paste 150+ links</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 ml-auto transition-colors" />
          </button>

          <button
            onClick={() => onNavigate('queue')}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Publish Queue</div>
              <div className="text-xs text-gray-500">Schedule content</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 ml-auto transition-colors" />
          </button>

          <button
            onClick={() => onNavigate('content')}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Manage Content</div>
              <div className="text-xs text-gray-500">CRUD operations</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 ml-auto transition-colors" />
          </button>
        </div>
      </div>

      {/* Collection breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Collection Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLLECTION_LIST.map((key) => {
            const def = COLLECTIONS[key];
            const Icon = ICONS[def.icon] || Database;
            const count = counts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => onNavigate('content')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/[0.08] rounded-xl border border-white/5 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-white truncate">{def.plural}</div>
                  <div className="text-xs text-gray-500">{key}</div>
                </div>
                <div className="text-lg font-bold text-cyan-400">{count}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
