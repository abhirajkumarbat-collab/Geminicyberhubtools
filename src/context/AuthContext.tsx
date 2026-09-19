import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchProfile, fetchAppSettings } from '@/lib/api';
import type { Profile, AppSettings } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  settings: AppSettings | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  settings: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        Promise.all([
          fetchProfile(data.session.user.id),
          fetchAppSettings(),
        ]).then(([p, s]) => {
          setProfile(p);
          setSettings(s);
          setLoading(false);
        });
      } else {
        fetchAppSettings().then((s) => {
          setSettings(s);
          setLoading(false);
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          const p = await fetchProfile(newSession.user.id);
          setProfile(p);
          const s = await fetchAppSettings();
          setSettings(s);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session) {
      const p = await fetchProfile(session.user.id);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, settings, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
