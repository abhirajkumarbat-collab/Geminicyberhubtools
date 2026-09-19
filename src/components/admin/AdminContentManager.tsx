import { useState, useMemo } from 'react';
import {
  Plus, Search, Trash2, Edit3, X, Save, Loader2, AlertCircle,
  Database, ChevronDown, Check,
} from 'lucide-react';
import { COLLECTIONS, COLLECTION_LIST, type CollectionField, type ContentItem } from '@/lib/types';
import { fetchRows, logAudit } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@/lib/hooks';

export default function AdminContentManager() {
  const [activeCollection, setActiveCollection] = useState('courses');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const def = COLLECTIONS[activeCollection];

  const { data: items, loading, refetch } = useQuery<ContentItem[]>(
    activeCollection,
    () => fetchRows<ContentItem>(activeCollection, 200),
    [activeCollection],
    [],
  );

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      Object.values(item).some((v) => String(v || '').toLowerCase().includes(q)),
    );
  }, [items, search]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (editing) {
        const { error: updateError } = await supabase
          .from(activeCollection)
          .update(payload)
          .eq('id', editing.id);
        if (updateError) throw updateError;
        await logAudit('update', activeCollection, editing.id);
      } else {
        const { error: insertError } = await supabase
          .from(activeCollection)
          .insert(payload);
        if (insertError) throw insertError;
        await logAudit('create', activeCollection, '');
      }
      setEditing(null);
      setCreating(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from(activeCollection)
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      await logAudit('delete', activeCollection, id);
      setDeleteId(null);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Content Manager</h1>
          <p className="text-gray-500 text-sm">Full CRUD across {COLLECTION_LIST.length} collections.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Collection tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {COLLECTION_LIST.map((key) => (
          <button
            key={key}
            onClick={() => { setActiveCollection(key); setSearch(''); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCollection === key
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {COLLECTIONS[key].plural}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search in ${def.plural}...`}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/40 transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Database className="w-10 h-10 text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No items found. Click "Add New" to create one.</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {def.columns.map((col) => (
                    <th key={col.k} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                      {col.l}
                    </th>
                  ))}
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    {def.columns.map((col) => (
                      <td key={col.k} className="px-4 py-3">
                        <CellRenderer value={item[col.k]} type={col.t} />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(item); setCreating(false); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Create modal */}
      {(editing || creating) && (
        <EditModal
          fields={def.fields}
          item={editing}
          collectionLabel={def.label}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setEditing(null); setCreating(false); setError(''); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <ConfirmDialog
          title="Delete item?"
          message="This action cannot be undone. The item will be permanently removed."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

function CellRenderer({ value, type }: { value: unknown; type: string }) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-gray-600 text-xs">—</span>;
  }

  switch (type) {
    case 'image':
      return (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
          {String(value) ? <img src={String(value)} alt="" className="w-full h-full object-cover" /> : null}
        </div>
      );
    case 'emoji':
      return <span className="text-2xl">{String(value)}</span>;
    case 'strong':
      return <span className="text-white text-sm font-medium line-clamp-1">{String(value)}</span>;
    case 'status': {
      const isPub = String(value) === 'published';
      return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          isPub ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
        }`}>
          {String(value)}
        </span>
      );
    }
    case 'bdg-primary':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-medium">{String(value)}</span>;
    case 'bdg-secondary':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">{String(value)}</span>;
    case 'bdg-warning':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">{String(value)}</span>;
    case 'bdg-pink':
      return <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 font-medium">{String(value)}</span>;
    case 'tags': {
      const tags = Array.isArray(value) ? value : String(value).split(',');
      return (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {tags.slice(0, 3).map((t, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{String(t).trim()}</span>
          ))}
          {tags.length > 3 && <span className="text-[10px] text-gray-600">+{tags.length - 3}</span>}
        </div>
      );
    }
    default:
      return <span className="text-gray-300 text-sm line-clamp-1">{String(value)}</span>;
  }
}

function EditModal({ fields, item, collectionLabel, saving, onSave, onClose }: {
  fields: CollectionField[];
  item: ContentItem | null;
  collectionLabel: string;
  saving: boolean;
  onSave: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (item) {
        initial[f.k] = f.k === 'tags' && Array.isArray(item[f.k])
          ? (item[f.k] as string[]).join(', ')
          : item[f.k] ?? '';
      } else {
        initial[f.k] = f.k === 'status' ? 'published' : '';
      }
    });
    return initial;
  });

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      let val = formData[f.k];
      if (f.k === 'tags' && typeof val === 'string') {
        val = (val as string).split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (f.k === 'itemCount' || f.t === 'number') {
        val = Number(val) || 0;
      }
      payload[f.k] = val;
    });
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d1320] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d1320] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">
            {item ? `Edit ${collectionLabel}` : `New ${collectionLabel}`}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.k}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {field.l}
                {field.req && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.t === 'textarea' ? (
                <textarea
                  value={String(formData[field.k] ?? '')}
                  onChange={(e) => handleChange(field.k, e.target.value)}
                  required={field.req}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-all resize-y"
                />
              ) : field.t === 'select' ? (
                <select
                  value={String(formData[field.k] ?? '')}
                  onChange={(e) => handleChange(field.k, e.target.value)}
                  required={field.req}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-all"
                >
                  <option value="" className="bg-[#0d1320]">Select...</option>
                  {field.opts?.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0d1320]">{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.t === 'number' ? 'number' : 'text'}
                  value={String(formData[field.k] ?? '')}
                  onChange={(e) => handleChange(field.k, e.target.value)}
                  required={field.req}
                  min={field.min}
                  maxLength={field.maxlength}
                  placeholder={field.t === 'image' ? 'https://...' : field.t === 'video' ? 'https://...' : ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 transition-all"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {item ? 'Save Changes' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[#0d1320] border border-white/10 rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
