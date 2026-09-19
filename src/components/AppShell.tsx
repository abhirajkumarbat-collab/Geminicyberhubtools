import { useState } from 'react';
import { LogOut, Shield, Search, X, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ContentBrowser from '@/components/ContentBrowser';
import AdminTools from '@/components/admin/AdminTools';

export default function AppShell() {
  const { profile, settings, signOut } = useAuth();
  const [view, setView] = useState<'content' | 'admin'>('content');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const branding = settings?.branding;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="h-screen flex flex-col bg-[#0a0e17] text-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/5 bg-[#0d1320]/90 backdrop-blur-lg z-30">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold tracking-tight">{branding?.appName || 'CyberHub'}</span>
              </div>
            </div>
          </div>

          {/* View toggle - only for admin */}
          {isAdmin && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setView('content')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === 'content' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === 'admin' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                Admin Tools
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium leading-tight">{profile?.name}</div>
                <div className="text-[10px] text-gray-500 capitalize">{profile?.role}</div>
              </div>
            </button>

            <button
              onClick={signOut}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Profile dropdown */}
        {showProfile && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
            <div className="absolute right-4 top-14 z-50 bg-[#111827] border border-white/10 rounded-2xl p-4 w-64 shadow-2xl">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold">
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{profile?.name}</div>
                  <div className="text-xs text-gray-500">{profile?.email}</div>
                </div>
              </div>
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Role</span>
                  <span className="text-cyan-400 font-medium capitalize">{profile?.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400 font-medium capitalize">{profile?.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Member since</span>
                  <span className="text-gray-300">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
              <button
                onClick={() => { signOut(); setShowProfile(false); }}
                className="w-full mt-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </>
        )}
      </header>

      {/* Body */}
      {view === 'admin' && isAdmin ? (
        <AdminTools />
      ) : (
        <ContentBrowser />
      )}
    </div>
  );
}
