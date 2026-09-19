import { useState, useMemo, useEffect } from 'react';
import {
  CalendarClock, Loader2, AlertCircle, Trash2, Check, Zap,
  Clock, ExternalLink, Edit3, Save, X, Calendar, Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COLLECTIONS, type QueueItem } from '@/lib/types';
import { fetchRows, logAudit } from '@/lib/api';
import { useQuery } from '@/lib/hooks';

export default function AdminPublishQueue() {
  const [itemsPerDay, setItemsPerDay] = useState(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published'>('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const { data: items, loading, refetch } = useQuery<QueueItem[]>(
    'publish_queue',
    () => fetchRows<QueueItem>('publish_queue', 500),
    [],
    [],
  );

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filterStatus === 'all') return items;
    return items.filter((i) => i.status === filterStatus);
  }, [items, filterStatus]);

  const pendingCount = useMemo(() => items?.filter((i) => i.status === 'pending').length || 0, [items]);
  const publishedCount = useMemo(() => items?.filter((i) => i.status === 'published').length || 0, [items]);
  const scheduledCount = useMemo(() => items?.filter((i) => i.status === 'pending' && i.scheduledDate).length || 0, [items]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, QueueItem[]> = {};
    filtered.forEach((item) => {
      const date = item.scheduledDate || 'Unscheduled';
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  const handleAutoSchedule = async () => {
    setScheduling(true);
    setError('');
    setSuccess('');
    try {
      const pending = items?.filter((i) => i.status === 'pending') || [];
      if (pending.length === 0) {
        setError('No pending items to schedule.');
        return;
      }

      const updates: { id: string; scheduledDate: string }[] = [];
      const start = new Date(startDate);
      let dayOffset = 0;
      let itemsToday = 0;

      pending.forEach((item) => {
        if (itemsToday >= itemsPerDay) {
          dayOffset++;
          itemsToday = 0;
        }
        const date = new Date(start);
        date.setDate(start.getDate() + dayOffset);
        updates.push({
          id: item.id,
          scheduledDate: date.toISOString().split('T')[0],
        });
        itemsToday++;
      });

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('publish_queue')
          .update({ scheduledDate: update.scheduledDate })
          .eq('id', update.id);
        if (updateError) throw updateError;
      }

      await logAudit('auto_schedule', 'publish_queue', `${updates.length} items`);
      setSuccess(`${updates.length} items scheduled at ${itemsPerDay} per day starting ${startDate}.`);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scheduling failed');
    } finally {
      setScheduling(false);
    }
  };

  const handlePublishNow = async (item: QueueItem) => {
    setPublishingId(item.id);
    setError('');
    try {
      const collection = item.collection;
      const insertData: Record<string, unknown> = {
        title: item.title,
        description: item.description,
        url: item.url,
        category: item.category,
        copyright: item.copyright,
        status: 'published',
      };

      // Map queue fields to collection-specific fields
      if (collection === 'short_videos' || collection === 'long_videos') {
        insertData.thumbnail = '';
        insertData.duration = '';
      }
      if (collection === 'bundles') {
        insertData.driveUrl = item.url;
        insertData.name = item.title;
        delete insertData.url;
      }
      if (collection === 'apks') {
        insertData.name = item.title;
        insertData.downloadUrl = item.url;
        delete insertData.url;
      }
      if (collection === 'files') {
        insertData.name = item.title;
        insertData.url = item.url;
      }
      if (collection === 'folders') {
        insertData.name = item.title;
      }
      if (collection === 'messages') {
        insertData.title = item.title;
        insertData.content = item.description;
      }
      if (collection === 'news') {
        insertData.title = item.title;
        insertData.body = item.description;
      }
      if (collection === 'tips') {
        insertData.title = item.title;
        insertData.content = item.description;
      }
      if (collection === 'ai_knowledge') {
        insertData.question = item.title;
        insertData.answer = item.description;
      }

      const { error: insertError } = await supabase.from(collection).insert(insertData);
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('publish_queue')
        .update({ status: 'published', publishedAt: new Date().toISOString() })
        .eq('id', item.id);
      if (updateError) throw updateError;

      await logAudit('publish_from_queue', collection, item.id);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('publish_queue').delete().eq('id', id);
      if (deleteError) throw deleteError;
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleUpdateDate = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('publish_queue')
        .update({ scheduledDate: editDate })
        .eq('id', id);
      if (updateError) throw updateError;
      setEditingId(null);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Publish Queue</h1>
        <p className="text-gray-500 text-sm">Schedule and publish content automatically across consecutive dates.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">{pendingCount}</div>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-500">Scheduled</span>
          </div>
          <div className="text-2xl font-bold text-white">{scheduledCount}</div>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Published</span>
          </div>
          <div className="text-2xl font-bold text-white">{publishedCount}</div>
        </div>
      </div>

      {/* Auto-schedule controls */}
      <div className="bg-white/5 rounded-2xl border border-white/5 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Auto-Schedule Generator</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">Items per day</label>
            <select
              value={itemsPerDay}
              onChange={(e) => setItemsPerDay(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n} className="bg-[#0d1320]">{n} per day</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <button
            onClick={handleAutoSchedule}
            disabled={scheduling || pendingCount === 0}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Auto-Schedule {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-4">
        {(['all', 'pending', 'published'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filterStatus === s
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Queue list grouped by date */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarClock className="w-10 h-10 text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">Queue is empty. Use Bulk Import to add items.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dateItems]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-white">
                  {date === 'Unscheduled' ? 'Unscheduled' : new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <span className="text-xs text-gray-600">({dateItems.length})</span>
              </div>
              <div className="space-y-2">
                {dateItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white/5 rounded-xl border p-4 flex items-start gap-3 transition-all ${
                      item.status === 'published' ? 'opacity-50 border-green-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                      {item.platformIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                        {item.status === 'published' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Published
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">
                          {COLLECTIONS[item.collection]?.label || item.collection}
                        </span>
                        <span className="text-[10px] text-gray-500">{item.platform}</span>
                        {item.category && <span className="text-[10px] text-gray-500">/ {item.category}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {editingId === item.id ? (
                        <>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-cyan-500/40"
                          />
                          <button onClick={() => handleUpdateDate(item.id)} className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-all">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => { setEditingId(item.id); setEditDate(item.scheduledDate || startDate); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                title="Edit date"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePublishNow(item)}
                                disabled={publishingId === item.id}
                                className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all disabled:opacity-50"
                                title="Publish now"
                              >
                                {publishingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
