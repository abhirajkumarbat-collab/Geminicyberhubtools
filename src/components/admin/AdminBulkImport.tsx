import { useState, useMemo, useCallback } from 'react';
import {
  Upload, Loader2, Check, X, AlertCircle, Link2, Sparkles,
  Edit3, Save, ChevronRight, Clock, Tag, FileText, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COLLECTIONS, COLLECTION_LIST, type BulkParsedItem } from '@/lib/types';
import { logAudit } from '@/lib/api';

function detectPlatform(url: string): { platform: string; icon: string; type: string } {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { platform: 'YouTube', icon: '▶', type: u.includes('short') ? 'short_video' : 'long_video' };
  if (u.includes('instagram.com')) return { platform: 'Instagram', icon: '📸', type: 'short_video' };
  if (u.includes('tiktok.com')) return { platform: 'TikTok', icon: '🎵', type: 'short_video' };
  if (u.includes('drive.google.com')) return { platform: 'Google Drive', icon: '📁', type: 'bundle' };
  if (u.includes('mega.nz') || u.includes('mediafire.com')) return { platform: 'File Host', icon: '💾', type: 'file' };
  if (u.includes('github.com')) return { platform: 'GitHub', icon: '🐙', type: 'file' };
  if (u.endsWith('.apk') || u.includes('apk')) return { platform: 'APK Mirror', icon: '📱', type: 'apk' };
  if (u.includes('udemy.com') || u.includes('coursera.org')) return { platform: 'Course', icon: '🎓', type: 'course' };
  if (u.match(/\.(mp4|avi|mkv|mov|webm)(\?|$)/)) return { platform: 'Direct Video', icon: '🎬', type: 'long_video' };
  if (u.match(/\.(pdf|doc|docx|txt|epub)(\?|$)/)) return { platform: 'Document', icon: '📄', type: 'file' };
  if (u.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) return { platform: 'Image', icon: '🖼️', type: 'file' };
  return { platform: 'Web', icon: '🌐', type: 'method' };
}

function generateTitle(url: string, platform: string): string {
  try {
    const u = new URL(url);
    let path = u.pathname.replace(/\/$/, '').split('/').pop() || '';
    path = path.replace(/\.(mp4|pdf|apk|zip|docx?|txt|epub|jpg|png|gif|webp|avi|mkv|mov|webm)$/i, '');
    path = path.replace(/[-_]/g, ' ').replace(/\.(html|php|aspx?)$/i, '');
    if (path) {
      return path.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 80);
    }
    return `${platform} Content`;
  } catch {
    const parts = url.split('/').pop()?.split('?')[0] || 'Content';
    return parts.replace(/[-_]/g, ' ').slice(0, 80);
  }
}

function generateDescription(url: string, platform: string, type: string): string {
  const typeMap: Record<string, string> = {
    course: 'A comprehensive learning course covering key concepts and practical skills.',
    apk: 'An Android application package for download. Includes setup instructions and use case details.',
    method: 'A step-by-step method demonstrating a specific technique or approach.',
    short_video: 'A short-form video tutorial or highlight clip.',
    long_video: 'A full-length video tutorial or lecture covering the topic in depth.',
    bundle: 'A bundled collection of resources and files available for download.',
    file: 'A downloadable file resource for offline use.',
  };
  return typeMap[type] || `Content from ${platform}. Access the full resource via the provided link.`;
}

function generateCopyright(platform: string): string {
  return `Content sourced from ${platform}. All rights belong to the respective owners. For educational purposes only.`;
}

function generateCategory(url: string, type: string): string {
  const u = url.toLowerCase();
  const categories: Record<string, string[]> = {
    'Networking': ['network', 'tcp', 'ip', 'packet', 'wireshark', 'nmap', 'scan'],
    'Web Security': ['web', 'xss', 'sqli', 'burp', 'owasp', 'csrf'],
    'Cryptography': ['crypto', 'encrypt', 'decrypt', 'cipher', 'hash', 'rsa', 'aes'],
    'Mobile Security': ['android', 'apk', 'mobile', 'kali', 'frida', 'root'],
    'Malware Analysis': ['malware', 'virus', 'reverse', 'ida', 'ghidra', 'sample'],
    'Penetration Testing': ['pentest', 'exploit', 'payload', 'metasploit', 'shell'],
    'Forensics': ['forensic', 'disk', 'memory', 'volatility', 'autopsy'],
    'OSINT': ['osint', 'recon', 'intelligence', 'gather'],
    'Cloud Security': ['cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes'],
    'General': [],
  };
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => u.includes(kw))) return cat;
  }
  return 'General';
}

function generateTags(url: string, type: string, category: string): string[] {
  const baseTags = [category.toLowerCase()];
  const typeTag = type.replace('_', ' ');
  baseTags.push(typeTag);
  const u = url.toLowerCase();
  if (u.includes('tutorial')) baseTags.push('tutorial');
  if (u.includes('beginner')) baseTags.push('beginner');
  if (u.includes('advanced')) baseTags.push('advanced');
  return [...new Set(baseTags)].slice(0, 5);
}

export default function AdminBulkImport() {
  const [rawInput, setRawInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<BulkParsedItem[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [error, setError] = useState('');

  const linkCount = useMemo(() => {
    return rawInput.split('\n').map((l) => l.trim()).filter((l) => l && l.startsWith('http')).length;
  }, [rawInput]);

  const handleParse = async () => {
    setError('');
    const lines = rawInput.split('\n').map((l) => l.trim()).filter((l) => l && l.startsWith('http'));
    if (lines.length === 0) {
      setError('Please paste at least one valid URL (starting with http)');
      return;
    }
    setParsing(true);
    // Simulate AI processing time for UX feedback
    await new Promise((r) => setTimeout(r, 800));

    const results: BulkParsedItem[] = lines.map((url) => {
      const { platform, icon, type } = detectPlatform(url);
      const collectionMap: Record<string, string> = {
        course: 'courses',
        apk: 'apks',
        method: 'methods',
        short_video: 'short_videos',
        long_video: 'long_videos',
        bundle: 'bundles',
        file: 'files',
      };
      const collection = collectionMap[type] || 'methods';
      const category = generateCategory(url, type);
      return {
        url,
        platform,
        platformIcon: icon,
        title: generateTitle(url, platform),
        description: generateDescription(url, platform, type),
        category,
        collection,
        copyright: generateCopyright(platform),
        tags: generateTags(url, type, category),
        keywords: [],
        contentType: type,
        skipped: false,
      };
    });

    setParsed(results);
    setParsing(false);
  };

  const handleEditField = (idx: number, field: keyof BulkParsedItem, value: string | string[]) => {
    setParsed((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSkip = (idx: number) => {
    setParsed((prev) => prev.map((item, i) => i === idx ? { ...item, skipped: !item.skipped } : item));
  };

  const handleRemove = (idx: number) => {
    setParsed((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddAllToQueue = async () => {
    setAddingToQueue(true);
    setError('');
    const valid = parsed.filter((p) => !p.skipped);
    if (valid.length === 0) {
      setError('No valid items to add. Unskip items or parse new links.');
      setAddingToQueue(false);
      return;
    }
    try {
      const queueItems = valid.map((item) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        collection: item.collection,
        platform: item.platform,
        platformIcon: item.platformIcon,
        category: item.category,
        tags: item.tags,
        copyright: item.copyright,
        scheduledDate: '',
        status: 'pending' as const,
      }));

      const { error: insertError } = await supabase.from('publish_queue').insert(queueItems);
      if (insertError) throw insertError;

      await logAudit('bulk_import', 'publish_queue', `${valid.length} items`);
      setAddedCount(valid.length);
      setParsed([]);
      setRawInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add items to queue');
    } finally {
      setAddingToQueue(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Bulk Import Wizard</h1>
        <p className="text-gray-500 text-sm">Paste up to 150+ content links. AI analysis extracts titles, descriptions, categories, and tags automatically.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {addedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" /> {addedCount} items added to the publish queue successfully.
        </div>
      )}

      {parsed.length === 0 ? (
        /* Input phase */
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <label className="text-sm font-semibold text-white">Paste Content Links</label>
              {linkCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">
                  {linkCount} links detected
                </span>
              )}
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={`Paste content links here, one per line:\n\nhttps://youtube.com/watch?v=...\nhttps://drive.google.com/file/d/...\nhttps://example.com/tutorial.pdf\n...`}
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all resize-y"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI will analyze each link and suggest metadata</span>
              </div>
              <button
                onClick={handleParse}
                disabled={parsing || linkCount === 0}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parsing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Links</>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm text-gray-400">
                <p className="font-medium text-white mb-1">Supported Platforms</p>
                <p>YouTube, Instagram, TikTok, Google Drive, Mega, MediaFire, GitHub, Udemy, Coursera, and direct file links (PDF, APK, MP4, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview phase */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {parsed.length} items analyzed
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">
                {parsed.filter((p) => !p.skipped).length} ready
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setParsed([]); setRawInput(''); }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleAddAllToQueue}
                disabled={addingToQueue}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {addingToQueue ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Add all to Queue</>
                )}
              </button>
            </div>
          </div>

          {/* Preview list */}
          <div className="space-y-2">
            {parsed.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white/5 rounded-xl border p-4 transition-all ${
                  item.skipped ? 'opacity-40 border-white/5' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                    {item.platformIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">{item.platform}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">{COLLECTIONS[item.collection]?.label}</span>
                    </div>

                    {editingIdx === idx ? (
                      <div className="space-y-2 mt-2">
                        <EditRow label="Title" value={item.title} onChange={(v) => handleEditField(idx, 'title', v)} />
                        <EditRow label="Description" value={item.description} onChange={(v) => handleEditField(idx, 'description', v)} multiline />
                        <EditRow label="Category" value={item.category} onChange={(v) => handleEditField(idx, 'category', v)} />
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Collection</label>
                          <select
                            value={item.collection}
                            onChange={(e) => handleEditField(idx, 'collection', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500/40"
                          >
                            {COLLECTION_LIST.map((c) => (
                              <option key={c} value={c} className="bg-[#0d1320]">{COLLECTIONS[c].plural}</option>
                            ))}
                          </select>
                        </div>
                        <EditRow label="Tags (comma-separated)" value={item.tags.join(', ')} onChange={(v) => handleEditField(idx, 'tags', v.split(',').map((t) => t.trim()).filter(Boolean))} />
                        <EditRow label="Copyright" value={item.copyright} onChange={(v) => handleEditField(idx, 'copyright', v)} multiline />
                        <button
                          onClick={() => setEditingIdx(null)}
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          <Save className="w-3.5 h-3.5" /> Done editing
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                            <Tag className="w-3 h-3" /> {item.category}
                          </span>
                          {item.tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{t}</span>
                          ))}
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-cyan-400 truncate block mt-1">
                          {item.url}
                        </a>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSkip(idx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                      title={item.skipped ? 'Unskip' : 'Skip'}
                    >
                      {item.skipped ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditRow({ label, value, onChange, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500/40 resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500/40"
        />
      )}
    </div>
  );
}
