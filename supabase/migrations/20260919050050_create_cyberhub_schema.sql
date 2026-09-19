/*
# CyberHub - Complete Database Schema

Creates the full content management system with 12 content collections,
publish queue, user profiles, app settings, notifications, and audit logs.

## New Tables
1. profiles - User profiles with role (user/admin), linked to auth.users
2. courses - Course catalog
3. apks - APK gallery items
4. methods - Step-by-step tutorials
5. tips - Tips & tricks
6. folders - Content organizers
7. files - Downloadable files
8. long_videos - Full tutorials/lectures
9. short_videos - Reels/shorts
10. bundles - Google Drive bundle links
11. messages - In-app messages/popups
12. news - News & daily highlights
13. ai_knowledge - AI chatbot training data
14. publish_queue - Scheduled content items
15. app_settings - Global app configuration (branding, AI, flags, schedule)
16. notifications - Push notification history
17. audit_logs - Admin action audit trail

## Security
- RLS enabled on all tables
- Content tables: public read (anon+authenticated), admin-only write
- profiles: users read own profile, admin reads all
- publish_queue, app_settings, audit_logs, notifications: admin-only
- Role check uses a SECURITY DEFINER function is_admin() for write policies
*/

-- Profiles table (must come first since is_admin() references it)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL DEFAULT 'User',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'editor')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  avatar text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  total_logins int DEFAULT 0
);

-- Helper function to check admin role (after profiles exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  description text DEFAULT '',
  category text DEFAULT '',
  level text DEFAULT 'Beginner',
  duration text DEFAULT '',
  instructor text DEFAULT '',
  price text DEFAULT '0',
  thumbnail text DEFAULT '',
  "previewVideo" text DEFAULT '',
  url text DEFAULT '',
  tags text[] DEFAULT '{}',
  copyright text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- APKs
CREATE TABLE IF NOT EXISTS public.apks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text DEFAULT '',
  developer text DEFAULT '',
  category text DEFAULT '',
  size text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  "screenshot1" text DEFAULT '',
  "screenshot2" text DEFAULT '',
  "downloadUrl" text DEFAULT '',
  "useCase" text DEFAULT '',
  "setupVideo" text DEFAULT '',
  license text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Methods
CREATE TABLE IF NOT EXISTS public.methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  difficulty text DEFAULT 'Beginner',
  cover text DEFAULT '',
  "videoUrl" text DEFAULT '',
  steps text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tips
CREATE TABLE IF NOT EXISTS public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  category text DEFAULT '',
  image text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Folders
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text DEFAULT '📁',
  type text DEFAULT 'Mixed',
  description text DEFAULT '',
  cover text DEFAULT '',
  "itemCount" int DEFAULT 0,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Files
CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "fileType" text DEFAULT 'Other',
  size text DEFAULT '',
  url text DEFAULT '',
  icon text DEFAULT '📄',
  description text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Long Videos
CREATE TABLE IF NOT EXISTS public.long_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration text DEFAULT '',
  category text DEFAULT '',
  url text DEFAULT '',
  thumbnail text DEFAULT '',
  description text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Short Videos
CREATE TABLE IF NOT EXISTS public.short_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration text DEFAULT '',
  platform text DEFAULT 'Custom',
  url text DEFAULT '',
  thumbnail text DEFAULT '',
  description text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bundles
CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  "driveUrl" text DEFAULT '',
  category text DEFAULT '',
  cover text DEFAULT '',
  "itemCount" int DEFAULT 0,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text DEFAULT 'Announcement',
  title text NOT NULL,
  content text DEFAULT '',
  image text DEFAULT '',
  priority text DEFAULT 'Normal',
  "actionUrl" text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text DEFAULT '',
  topic text DEFAULT '',
  type text DEFAULT 'daily',
  image text DEFAULT '',
  "linkUrl" text DEFAULT '',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Knowledge
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text DEFAULT '',
  tags text DEFAULT '',
  category text DEFAULT '',
  difficulty text DEFAULT 'Beginner',
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Publish Queue
CREATE TABLE IF NOT EXISTS public.publish_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  url text DEFAULT '',
  collection text DEFAULT 'methods',
  platform text DEFAULT '',
  "platformIcon" text DEFAULT '🌐',
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  copyright text DEFAULT '',
  "scheduledDate" text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  "addedAt" timestamptz DEFAULT now(),
  "publishedAt" timestamptz
);

-- App Settings (single-row config table)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branding jsonb DEFAULT '{"appName":"CyberHub","tagline":"Learn. Practice. Secure.","logoEmoji":"🛡️","logoUrl":"","primaryColor":"#00d4ff","secondaryColor":"#a855f7","adminName":"Admin","adminEmail":"","adminAvatar":"A","copyright":"© 2026 CyberHub","aboutText":"Cybersecurity learning platform.","sector":"Cybersecurity","version":"v1.0.0","company":"CyberHub Inc."}'::jsonb,
  ai jsonb DEFAULT '{"botName":"CyberBot Pro","botAvatar":"🤖","botAvatarUrl":"","model":"gemini-2.0-flash","temperature":0.7,"dailyLimit":20,"maxInputLength":500,"welcomeMessage":"Hi! I am CyberBot Pro, your cybersecurity learning assistant.","quickPrompts":["What is packet inspection?","How to set up a home lab?"],"systemPrompt":"You are CYBERBOT PRO, a cybersecurity learning assistant. Help users understand security concepts, tools, and techniques. Always promote ethical hacking and legal use only."}'::jsonb,
  flags jsonb DEFAULT '{"ai_assistant":true,"apk_gallery":true,"folders":true,"files_section":true,"long_videos":true,"short_videos":true,"bundles_section":true,"messages_section":true,"daily_highlights":true,"promotions":false,"voice_assistant":false,"offline_mode":true,"live_chat":true,"user_reviews":true,"dark_mode_default":true}'::jsonb,
  schedule jsonb DEFAULT '{"enabled":false,"itemsPerDay":3,"lastPublishCheck":null,"totalPublished":0}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text DEFAULT '',
  "deepLink" text DEFAULT '',
  audience text DEFAULT 'All Users',
  image text DEFAULT '',
  "sentAt" timestamptz DEFAULT now()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  collection text DEFAULT '',
  doc_id text DEFAULT '',
  admin_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ===== RLS POLICIES =====

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE
  TO authenticated USING (public.is_admin());

-- Content tables: public read, admin-only write
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['courses','apks','methods','tips','folders','files','long_videos','short_videos','bundles','messages','news','ai_knowledge'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "content_read_all" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "content_read_all" ON public.%I FOR SELECT TO anon, authenticated USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "content_admin_insert" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "content_admin_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin());', t);
    EXECUTE format('DROP POLICY IF EXISTS "content_admin_update" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "content_admin_update" ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', t);
    EXECUTE format('DROP POLICY IF EXISTS "content_admin_delete" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "content_admin_delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin());', t);
  END LOOP;
END $$;

-- Publish Queue: admin-only
ALTER TABLE public.publish_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "queue_admin_select" ON public.publish_queue;
CREATE POLICY "queue_admin_select" ON public.publish_queue FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "queue_admin_insert" ON public.publish_queue;
CREATE POLICY "queue_admin_insert" ON public.publish_queue FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "queue_admin_update" ON public.publish_queue;
CREATE POLICY "queue_admin_update" ON public.publish_queue FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "queue_admin_delete" ON public.publish_queue;
CREATE POLICY "queue_admin_delete" ON public.publish_queue FOR DELETE TO authenticated USING (public.is_admin());

-- App Settings: public read, admin write
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_read_all" ON public.app_settings;
CREATE POLICY "settings_read_all" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "settings_admin_update" ON public.app_settings;
CREATE POLICY "settings_admin_update" ON public.app_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "settings_admin_insert" ON public.app_settings;
CREATE POLICY "settings_admin_insert" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Notifications: public read, admin write
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_read_all" ON public.notifications;
CREATE POLICY "notif_read_all" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "notif_admin_insert" ON public.notifications;
CREATE POLICY "notif_admin_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "notif_admin_delete" ON public.notifications;
CREATE POLICY "notif_admin_delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin());

-- Audit Logs: admin-only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_admin_select" ON public.audit_logs;
CREATE POLICY "audit_admin_select" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "audit_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_admin_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "audit_admin_delete" ON public.audit_logs;
CREATE POLICY "audit_admin_delete" ON public.audit_logs FOR DELETE TO authenticated USING (public.is_admin());

-- Insert default app settings row
INSERT INTO public.app_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_apks_status ON public.apks(status);
CREATE INDEX IF NOT EXISTS idx_methods_status ON public.methods(status);
CREATE INDEX IF NOT EXISTS idx_tips_status ON public.tips(status);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.publish_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_date ON public.publish_queue("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
