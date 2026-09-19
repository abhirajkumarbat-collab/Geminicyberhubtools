import { supabase } from '@/lib/supabase';
import type { Profile, AppSettings } from '@/lib/types';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as Profile | null;
}

export async function fetchAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
  return data as AppSettings | null;
}

export async function logAudit(action: string, collection: string, docId: string): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    action,
    collection,
    doc_id: docId,
  });
  if (error) console.error('Audit log error:', error);
}

export async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`Error counting ${table}:`, error);
    return 0;
  }
  return count || 0;
}

export async function fetchRows<T>(table: string, limit = 50): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
  return (data || []) as T[];
}
