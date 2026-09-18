import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import useAutosave from '../../hooks/useAutosave';

const DEFAULT_DRAFT = {
  calendarSec: 10,
  makersSec: 20,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const showToast = useToast();

  const load = async () => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) {
      console.error('settings query failed:', error);
      return;
    }
    setSettings(data);
    setDraft({
      calendarSec: Math.round(data.calendar_duration_ms / 1000),
      makersSec: Math.round(data.maker_duration_ms / 1000),
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('settings')
      .update({
        calendar_duration_ms: draft.calendarSec * 1000,
        maker_duration_ms: draft.makersSec * 1000,
      })
      .eq('id', true);
    if (error) {
      showToast('Failed to save settings', 'error');
      return;
    }
    showToast('Settings saved');
    load();
  };

  useAutosave(handleSave, [draft.calendarSec, draft.makersSec]);

  const field = (key, num = true) => ({
    value: draft[key],
    onChange: (e) => setDraft((d) => ({ ...d, [key]: num ? Number(e.target.value) : e.target.value })),
  });

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Global rotation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Calendar duration ceiling (seconds)
            <Input type="number" min="1" className="w-40" disabled={!settings} {...field('calendarSec')} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Makers duration ceiling (seconds)
            <Input type="number" min="1" className="w-40" disabled={!settings} {...field('makersSec')} />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
