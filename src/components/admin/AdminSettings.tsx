import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Save, Loader2, AlertCircle, Check,
  Palette, Bot, ToggleLeft, ToggleRight, CalendarClock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/api';
import type { AppSettings, Branding, AISettings, FeatureFlags, ScheduleSettings } from '@/lib/types';

type SettingsSection = 'branding' | 'ai' | 'flags' | 'schedule';

export default function AdminSettings() {
  const { settings } = useAuth();
  const [section, setSection] = useState<SettingsSection>('branding');
  const [branding, setBranding] = useState<Branding | null>(null);
  const [ai, setAi] = useState<AISettings | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (settings) {
      setBranding(settings.branding);
      setAi(settings.ai);
      setFlags(settings.flags);
      setSchedule(settings.schedule);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings || !branding || !ai || !flags || !schedule) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({
          branding: branding as unknown as Record<string, unknown>,
          ai: ai as unknown as Record<string, unknown>,
          flags: flags as unknown as Record<string, unknown>,
          schedule: schedule as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      if (updateError) throw updateError;
      await logAudit('update_settings', 'app_settings', settings.id);
      setSuccess('Settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const sections: { key: SettingsSection; label: string; icon: typeof Palette }[] = [
    { key: 'branding', label: 'Branding', icon: Palette },
    { key: 'ai', label: 'AI Assistant', icon: Bot },
    { key: 'flags', label: 'Feature Flags', icon: ToggleLeft },
    { key: 'schedule', label: 'Schedule', icon: CalendarClock },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">Configure branding, AI assistant, features, and scheduling.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
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

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              section === key
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Branding */}
      {section === 'branding' && branding && (
        <div className="space-y-4">
          <Card title="App Identity">
            <Field label="App Name" value={branding.appName} onChange={(v) => setBranding({ ...branding, appName: v })} />
            <Field label="Tagline" value={branding.tagline} onChange={(v) => setBranding({ ...branding, tagline: v })} />
            <Field label="Logo Emoji" value={branding.logoEmoji} onChange={(v) => setBranding({ ...branding, logoEmoji: v })} />
            <Field label="Logo URL" value={branding.logoUrl} onChange={(v) => setBranding({ ...branding, logoUrl: v })} />
          </Card>
          <Card title="Colors">
            <ColorField label="Primary Color" value={branding.primaryColor} onChange={(v) => setBranding({ ...branding, primaryColor: v })} />
            <ColorField label="Secondary Color" value={branding.secondaryColor} onChange={(v) => setBranding({ ...branding, secondaryColor: v })} />
          </Card>
          <Card title="Admin & Footer">
            <Field label="Admin Name" value={branding.adminName} onChange={(v) => setBranding({ ...branding, adminName: v })} />
            <Field label="Admin Email" value={branding.adminEmail} onChange={(v) => setBranding({ ...branding, adminEmail: v })} />
            <Field label="Admin Avatar (initial)" value={branding.adminAvatar} onChange={(v) => setBranding({ ...branding, adminAvatar: v })} />
            <Field label="Copyright Text" value={branding.copyright} onChange={(v) => setBranding({ ...branding, copyright: v })} />
            <Field label="About Text" value={branding.aboutText} onChange={(v) => setBranding({ ...branding, aboutText: v })} multiline />
            <Field label="Sector" value={branding.sector} onChange={(v) => setBranding({ ...branding, sector: v })} />
            <Field label="Version" value={branding.version} onChange={(v) => setBranding({ ...branding, version: v })} />
            <Field label="Company" value={branding.company} onChange={(v) => setBranding({ ...branding, company: v })} />
          </Card>
        </div>
      )}

      {/* AI */}
      {section === 'ai' && ai && (
        <div className="space-y-4">
          <Card title="Bot Identity">
            <Field label="Bot Name" value={ai.botName} onChange={(v) => setAi({ ...ai, botName: v })} />
            <Field label="Bot Avatar (emoji)" value={ai.botAvatar} onChange={(v) => setAi({ ...ai, botAvatar: v })} />
            <Field label="Bot Avatar URL" value={ai.botAvatarUrl} onChange={(v) => setAi({ ...ai, botAvatarUrl: v })} />
            <Field label="Welcome Message" value={ai.welcomeMessage} onChange={(v) => setAi({ ...ai, welcomeMessage: v })} multiline />
          </Card>
          <Card title="Model Configuration">
            <Field label="Model" value={ai.model} onChange={(v) => setAi({ ...ai, model: v })} />
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Temperature: {ai.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ai.temperature}
                onChange={(e) => setAi({ ...ai, temperature: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <Field label="Daily Message Limit" value={String(ai.dailyLimit)} onChange={(v) => setAi({ ...ai, dailyLimit: Number(v) || 0 })} type="number" />
            <Field label="Max Input Length" value={String(ai.maxInputLength)} onChange={(v) => setAi({ ...ai, maxInputLength: Number(v) || 0 })} type="number" />
          </Card>
          <Card title="System Prompt">
            <textarea
              value={ai.systemPrompt}
              onChange={(e) => setAi({ ...ai, systemPrompt: e.target.value })}
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 resize-y font-mono"
            />
          </Card>
          <Card title="Quick Prompts">
            {ai.quickPrompts.map((prompt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => {
                    const newArr = [...ai.quickPrompts];
                    newArr[i] = e.target.value;
                    setAi({ ...ai, quickPrompts: newArr });
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  onClick={() => setAi({ ...ai, quickPrompts: ai.quickPrompts.filter((_, idx) => idx !== i) })}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => setAi({ ...ai, quickPrompts: [...ai.quickPrompts, ''] })}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              + Add prompt
            </button>
          </Card>
        </div>
      )}

      {/* Feature Flags */}
      {section === 'flags' && flags && (
        <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(flags).map(([key, enabled]) => (
              <button
                key={key}
                onClick={() => setFlags({ ...flags, [key]: !enabled })}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all"
              >
                <span className="text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                {enabled ? (
                  <ToggleRight className="w-7 h-7 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {section === 'schedule' && schedule && (
        <div className="space-y-4">
          <Card title="Auto-Publish Schedule">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
              <span className="text-sm text-gray-300">Enable auto-publishing</span>
              <button onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}>
                {schedule.enabled ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-gray-600" />}
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Items per day</label>
              <select
                value={schedule.itemsPerDay}
                onChange={(e) => setSchedule({ ...schedule, itemsPerDay: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n} className="bg-[#0d1320]">{n} per day</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03]">
              <span className="text-xs text-gray-500">Total published:</span>
              <span className="text-sm font-bold text-cyan-400">{schedule.totalPublished}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-cyan-500/40"
        />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/40"
        />
      </div>
    </div>
  );
}
