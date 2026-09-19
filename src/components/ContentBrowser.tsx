import { useState, useMemo } from 'react';
import {
  Search, GraduationCap, Smartphone, Wrench, Lightbulb, Folder,
  FileText, PlayCircle, Zap, Package, MessageSquare, Newspaper,
  Brain, Clock, Download, ExternalLink, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { COLLECTIONS, COLLECTION_LIST, type ContentItem } from '@/lib/types';
import { fetchRows } from '@/lib/api';
import { useQuery } from '@/lib/hooks';

const ICONS: Record<string, typeof GraduationCap> = {
  GraduationCap, Smartphone, Wrench, Lightbulb, Folder,
  FileText, PlayCircle, Zap, Package, MessageSquare, Newspaper, Brain,
};

interface CategoryDef {
  key: string;
  label: string;
  icon: string;
  flagKey?: string;
}

const CATEGORIES: CategoryDef[] = [
  { key: 'courses', label: 'Courses', icon: 'GraduationCap' },
  { key: 'apks', label: 'APK Gallery', icon: 'Smartphone', flagKey: 'apk_gallery' },
  { key: 'methods', label: 'Methods', icon: 'Wrench' },
  { key: 'tips', label: 'Tips & Tricks', icon: 'Lightbulb' },
  { key: 'folders', label: 'Folders', icon: 'Folder', flagKey: 'folders' },
  { key: 'files', label: 'Files', icon: 'FileText', flagKey: 'files_section' },
  { key: 'long_videos', label: 'Long Videos', icon: 'PlayCircle', flagKey: 'long_videos' },
  { key: 'short_videos', label: 'Short Videos', icon: 'Zap', flagKey: 'short_videos' },
  { key: 'bundles', label: 'Bundles', icon: 'Package', flagKey: 'bundles_section' },
  { key: 'messages', label: 'Messages', icon: 'MessageSquare', flagKey: 'messages_section' },
  { key: 'news', label: 'News', icon: 'Newspaper', flagKey: 'daily_highlights' },
  { key: 'ai_knowledge', label: 'AI Knowledge', icon: 'Brain' },
];

export default function ContentBrowser() {
  const { settings } = useAuth();
  const [activeCategory, setActiveCategory] = useState('courses');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const flags = settings?.flags;
  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter((c) => !c.flagKey || flags?.[c.flagKey as keyof typeof flags]);
  }, [flags]);

  const { data: items, loading } = useQuery<ContentItem[]>(
    activeCategory,
    () => fetchRows<ContentItem>(activeCategory, 100),
    [activeCategory],
    [],
  );

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      (item.title || item.name || item.question || '').toLowerCase().includes(q) ||
      (item.description || item.content || item.body || item.answer || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q),
    );
  }, [items, search]);

  const def = COLLECTIONS[activeCategory];
  const Icon = ICONS[def?.icon] || GraduationCap;

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Sidebar - Categories */}
      <aside className="lg:w-64 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0d1320]/80 backdrop-blur-sm">
        <div className="p-4 lg:p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/40 transition-all"
            />
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {visibleCategories.map((cat) => {
              const CatIcon = ICONS[cat.icon] || GraduationCap;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setSelectedItem(null); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <CatIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{def?.plural}</h2>
            <p className="text-gray-500 text-sm">{filtered.length} items</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/5 p-4 animate-pulse">
                <div className="h-32 bg-white/5 rounded-xl mb-3" />
                <div className="h-4 bg-white/5 rounded mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No items found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                collectionKey={activeCategory}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          collectionKey={activeCategory}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function ContentCard({ item, collectionKey, onClick }: {
  item: ContentItem;
  collectionKey: string;
  onClick: () => void;
}) {
  const def = COLLECTIONS[collectionKey];
  const titleField = def?.fields.find((f) => f.k === 'title') || def?.fields.find((f) => f.k === 'name') || def?.fields.find((f) => f.k === 'question');
  const title = titleField ? String(item[titleField.k] || '') : '';
  const desc = String(item.description || item.content || item.body || item.answer || '').slice(0, 120);
  const img = String(item.thumbnail || item.logo || item.cover || item.image || '');
  const icon = String(item.icon || '');

  return (
    <button
      onClick={onClick}
      className="bg-white/5 hover:bg-white/[0.07] rounded-2xl border border-white/5 overflow-hidden text-left transition-all group hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      {img ? (
        <div className="h-36 bg-white/5 overflow-hidden">
          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : icon ? (
        <div className="h-36 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center text-5xl">
          {icon}
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
        {desc && <p className="text-gray-400 text-xs line-clamp-2">{desc}</p>}
        {(item.category || item.level || item.difficulty) && (
          <div className="flex gap-1.5 mt-2.5">
            {item.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">{item.category}</span>}
            {(item.level || item.difficulty) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">{item.level || item.difficulty}</span>}
          </div>
        )}
      </div>
    </button>
  );
}

function DetailModal({ item, collectionKey, onClose }: {
  item: ContentItem;
  collectionKey: string;
  onClose: () => void;
}) {
  const def = COLLECTIONS[collectionKey];
  const titleField = def?.fields.find((f) => f.k === 'title') || def?.fields.find((f) => f.k === 'name') || def?.fields.find((f) => f.k === 'question');
  const title = titleField ? String(item[titleField.k] || '') : '';
  const img = String(item.thumbnail || item.logo || item.cover || item.image || '');
  const videoUrl = String(item.previewVideo || item.videoUrl || item.url || item.downloadUrl || item.driveUrl || '');

  const displayFields = def?.fields.filter((f) => {
    if (['title', 'name', 'question', 'status'].includes(f.k)) return false;
    const val = item[f.k];
    return val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0);
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d1320] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {img && (
          <div className="h-48 overflow-hidden rounded-t-2xl">
            <img src={img} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-500/15 text-cyan-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cyan-500/25 transition-all mb-4"
            >
              {collectionKey === 'apks' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              {collectionKey === 'apks' ? 'Download' : collectionKey === 'bundles' ? 'Open Drive' : 'Open Link'}
            </a>
          )}

          <div className="space-y-3">
            {displayFields.map((field) => {
              const val = item[field.k];
              const display = Array.isArray(val) ? val.join(', ') : String(val);
              return (
                <div key={field.k}>
                  <span className="text-gray-500 text-xs font-medium">{field.l}</span>
                  <p className="text-gray-200 text-sm mt-0.5 whitespace-pre-wrap">{display}</p>
                </div>
              );
            })}
          </div>

          {item.copyright && (
            <p className="text-gray-600 text-xs mt-4 pt-4 border-t border-white/5">{item.copyright}</p>
          )}
        </div>
      </div>
    </div>
  );
}
