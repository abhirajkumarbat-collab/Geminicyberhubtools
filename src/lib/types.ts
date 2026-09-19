export type ContentStatus = 'published' | 'draft' | 'scheduled';

export type UserRole = 'user' | 'admin' | 'moderator' | 'editor';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'blocked';
  avatar: string;
  created_at: string;
  last_seen: string;
  total_logins: number;
}

export interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  body?: string;
  answer?: string;
  question?: string;
  category?: string;
  level?: string;
  duration?: string;
  instructor?: string;
  price?: string;
  thumbnail?: string;
  previewVideo?: string;
  url?: string;
  tags?: string[];
  copyright?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface QueueItem {
  id: string;
  title: string;
  description: string;
  url: string;
  collection: string;
  platform: string;
  platformIcon: string;
  category: string;
  tags: string[];
  copyright: string;
  scheduledDate: string;
  status: 'pending' | 'published';
  addedAt: string;
  publishedAt: string | null;
}

export interface Branding {
  appName: string;
  tagline: string;
  logoEmoji: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  adminName: string;
  adminEmail: string;
  adminAvatar: string;
  copyright: string;
  aboutText: string;
  sector: string;
  version: string;
  company: string;
}

export interface AISettings {
  botName: string;
  botAvatar: string;
  botAvatarUrl: string;
  model: string;
  temperature: number;
  dailyLimit: number;
  maxInputLength: number;
  welcomeMessage: string;
  quickPrompts: string[];
  systemPrompt: string;
}

export interface FeatureFlags {
  ai_assistant: boolean;
  apk_gallery: boolean;
  folders: boolean;
  files_section: boolean;
  long_videos: boolean;
  short_videos: boolean;
  bundles_section: boolean;
  messages_section: boolean;
  daily_highlights: boolean;
  promotions: boolean;
  voice_assistant: boolean;
  offline_mode: boolean;
  live_chat: boolean;
  user_reviews: boolean;
  dark_mode_default: boolean;
}

export interface ScheduleSettings {
  enabled: boolean;
  itemsPerDay: number;
  lastPublishCheck: string | null;
  totalPublished: number;
}

export interface AppSettings {
  id: string;
  branding: Branding;
  ai: AISettings;
  flags: FeatureFlags;
  schedule: ScheduleSettings;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  deepLink: string;
  audience: string;
  image: string;
  sentAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  collection: string;
  doc_id: string;
  admin_id: string | null;
  created_at: string;
}

export interface BulkParsedItem {
  url: string;
  platform: string;
  platformIcon: string;
  title: string;
  description: string;
  category: string;
  collection: string;
  copyright: string;
  tags: string[];
  keywords: string[];
  contentType: string;
  skipped: boolean;
  error?: string;
}

export interface CollectionField {
  k: string;
  l: string;
  t: 'text' | 'textarea' | 'select' | 'image' | 'video' | 'url' | 'number';
  req?: boolean;
  opts?: string[];
  maxlength?: number;
  min?: number;
}

export interface CollectionColumn {
  k: string;
  l: string;
  t: string;
}

export interface CollectionDef {
  label: string;
  icon: string;
  plural: string;
  fields: CollectionField[];
  columns: CollectionColumn[];
}

export const COLLECTIONS: Record<string, CollectionDef> = {
  courses: {
    label: 'Course',
    icon: 'GraduationCap',
    plural: 'Courses',
    fields: [
      { k: 'title', l: 'Course Title', t: 'text', req: true },
      { k: 'subtitle', l: 'Subtitle', t: 'text' },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'level', l: 'Level', t: 'select', opts: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { k: 'duration', l: 'Duration', t: 'text' },
      { k: 'instructor', l: 'Instructor', t: 'text' },
      { k: 'price', l: 'Price', t: 'text' },
      { k: 'thumbnail', l: 'Thumbnail', t: 'image' },
      { k: 'previewVideo', l: 'Preview Video', t: 'video' },
      { k: 'url', l: 'Course URL', t: 'url' },
      { k: 'tags', l: 'Tags (comma-separated)', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft', 'scheduled'] },
    ],
    columns: [
      { k: 'thumbnail', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'category', l: 'Category', t: 'bdg-primary' },
      { k: 'level', l: 'Level', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  apks: {
    label: 'APK',
    icon: 'Smartphone',
    plural: 'APK Gallery',
    fields: [
      { k: 'name', l: 'APK Name', t: 'text', req: true },
      { k: 'version', l: 'Version', t: 'text' },
      { k: 'developer', l: 'Developer', t: 'text' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'size', l: 'File Size', t: 'text' },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'logo', l: 'Logo', t: 'image' },
      { k: 'screenshot1', l: 'Screenshot 1', t: 'image' },
      { k: 'screenshot2', l: 'Screenshot 2', t: 'image' },
      { k: 'downloadUrl', l: 'Download URL', t: 'url' },
      { k: 'useCase', l: 'Use Case', t: 'textarea' },
      { k: 'setupVideo', l: 'Setup Video', t: 'video' },
      { k: 'license', l: 'License', t: 'text' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'logo', l: '', t: 'image' },
      { k: 'name', l: 'Name', t: 'strong' },
      { k: 'version', l: 'Version', t: 'bdg-primary' },
      { k: 'category', l: 'Category', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  methods: {
    label: 'Method',
    icon: 'Wrench',
    plural: 'Methods',
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'difficulty', l: 'Difficulty', t: 'select', opts: ['Beginner', 'Intermediate', 'Advanced'] },
      { k: 'cover', l: 'Cover Image', t: 'image' },
      { k: 'videoUrl', l: 'Video', t: 'video' },
      { k: 'steps', l: 'Steps (one per line)', t: 'textarea' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'cover', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'category', l: 'Category', t: 'bdg-primary' },
      { k: 'difficulty', l: 'Difficulty', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  tips: {
    label: 'Tip',
    icon: 'Lightbulb',
    plural: 'Tips & Tricks',
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'content', l: 'Content', t: 'textarea' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'image', l: 'Image', t: 'image' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'image', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'category', l: 'Category', t: 'bdg-primary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  news: {
    label: 'News',
    icon: 'Newspaper',
    plural: 'News',
    fields: [
      { k: 'title', l: 'Headline', t: 'text', req: true },
      { k: 'body', l: 'Body', t: 'textarea' },
      { k: 'topic', l: 'Topic', t: 'text' },
      { k: 'type', l: 'Type', t: 'select', opts: ['daily', 'update', 'welcome', 'promotion', 'alert'] },
      { k: 'image', l: 'Image', t: 'image' },
      { k: 'linkUrl', l: 'Link URL', t: 'url' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'image', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'topic', l: 'Topic', t: 'bdg-primary' },
      { k: 'type', l: 'Type', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  folders: {
    label: 'Folder',
    icon: 'Folder',
    plural: 'Folders',
    fields: [
      { k: 'name', l: 'Folder Name', t: 'text', req: true },
      { k: 'icon', l: 'Icon (emoji)', t: 'text', maxlength: 4 },
      { k: 'type', l: 'Type', t: 'select', opts: ['Videos', 'APKs', 'Documents', 'Images', 'Mixed', 'Courses'] },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'cover', l: 'Cover', t: 'image' },
      { k: 'itemCount', l: 'Item Count', t: 'number', min: 0 },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'icon', l: '', t: 'emoji' },
      { k: 'name', l: 'Folder', t: 'strong' },
      { k: 'type', l: 'Type', t: 'bdg-secondary' },
      { k: 'itemCount', l: 'Items', t: 'bdg-primary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  files: {
    label: 'File',
    icon: 'FileText',
    plural: 'Files',
    fields: [
      { k: 'name', l: 'File Name', t: 'text', req: true },
      { k: 'fileType', l: 'File Type', t: 'select', opts: ['PDF', 'ZIP', 'Image', 'DOC', 'APK', 'TXT', 'Other'] },
      { k: 'size', l: 'File Size', t: 'text' },
      { k: 'url', l: 'File URL', t: 'url' },
      { k: 'icon', l: 'Icon (emoji)', t: 'text', maxlength: 4 },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'icon', l: '', t: 'emoji' },
      { k: 'name', l: 'File', t: 'strong' },
      { k: 'fileType', l: 'Type', t: 'bdg-primary' },
      { k: 'size', l: 'Size', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  long_videos: {
    label: 'Long Video',
    icon: 'PlayCircle',
    plural: 'Long Videos',
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'duration', l: 'Duration', t: 'text' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'url', l: 'Video', t: 'video' },
      { k: 'thumbnail', l: 'Thumbnail', t: 'image' },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'thumbnail', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'duration', l: 'Duration', t: 'bdg-warning' },
      { k: 'category', l: 'Category', t: 'bdg-primary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  short_videos: {
    label: 'Short Video',
    icon: 'Zap',
    plural: 'Short Videos',
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'duration', l: 'Duration (sec)', t: 'text' },
      { k: 'platform', l: 'Platform', t: 'select', opts: ['YouTube Shorts', 'Instagram Reels', 'TikTok', 'Custom'] },
      { k: 'url', l: 'Video', t: 'video' },
      { k: 'thumbnail', l: 'Thumbnail', t: 'image' },
      { k: 'description', l: 'Caption', t: 'textarea' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'thumbnail', l: '', t: 'image' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'duration', l: 'Duration', t: 'bdg-pink' },
      { k: 'platform', l: 'Platform', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  bundles: {
    label: 'Bundle',
    icon: 'Package',
    plural: 'Drive Bundles',
    fields: [
      { k: 'name', l: 'Bundle Name', t: 'text', req: true },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'driveUrl', l: 'Drive URL', t: 'url' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'cover', l: 'Cover Image', t: 'image' },
      { k: 'itemCount', l: 'Item Count', t: 'number', min: 0 },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'cover', l: '', t: 'image' },
      { k: 'name', l: 'Bundle', t: 'strong' },
      { k: 'category', l: 'Category', t: 'bdg-warning' },
      { k: 'itemCount', l: 'Items', t: 'bdg-primary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  messages: {
    label: 'Message',
    icon: 'MessageSquare',
    plural: 'Messages',
    fields: [
      { k: 'type', l: 'Type', t: 'select', opts: ['Welcome', 'Announcement', 'Popup', 'Alert', 'Promotion', 'Update'] },
      { k: 'title', l: 'Title', t: 'text', req: true },
      { k: 'content', l: 'Content', t: 'textarea' },
      { k: 'image', l: 'Image', t: 'image' },
      { k: 'priority', l: 'Priority', t: 'select', opts: ['Normal', 'High', 'Urgent'] },
      { k: 'actionUrl', l: 'Action URL', t: 'url' },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'type', l: 'Type', t: 'bdg-secondary' },
      { k: 'title', l: 'Title', t: 'strong' },
      { k: 'priority', l: 'Priority', t: 'bdg-warning' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
  ai_knowledge: {
    label: 'Knowledge',
    icon: 'Brain',
    plural: 'AI Knowledge Base',
    fields: [
      { k: 'question', l: 'Question', t: 'text', req: true },
      { k: 'answer', l: 'Answer', t: 'textarea' },
      { k: 'tags', l: 'Tags (comma-separated)', t: 'text' },
      { k: 'category', l: 'Category', t: 'text' },
      { k: 'difficulty', l: 'Difficulty', t: 'select', opts: ['Beginner', 'Intermediate', 'Advanced'] },
      { k: 'status', l: 'Status', t: 'select', opts: ['published', 'draft'] },
    ],
    columns: [
      { k: 'question', l: 'Question', t: 'strong' },
      { k: 'tags', l: 'Tags', t: 'tags' },
      { k: 'difficulty', l: 'Difficulty', t: 'bdg-secondary' },
      { k: 'status', l: 'Status', t: 'status' },
    ],
  },
};

export const COLLECTION_LIST = Object.keys(COLLECTIONS);
