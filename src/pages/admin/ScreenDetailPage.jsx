import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import DeviceBadge from '../../components/admin/DeviceBadge';

// raw !=null → this screen already overrides the field (override on).
// raw ==null → inherits; `fallback` is the resolved global value to show
// while the override toggle is off.
function initOverride(raw, fallback) {
  return raw != null ? { override: true, value: raw } : { override: false, value: fallback };
}

// A single switch, on by default (matching the always-true resolved
// default for these fields). Turning it off is itself what creates an
// override — no separate override toggle needed.
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}

// Renders an override-toggle switch + a bounded number input.
function NumberOverrideRow({ label, unit, state, onChange, min, max }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Switch
            checked={state.override}
            onChange={(e) => onChange({ ...state, override: e.target.checked })}
          />
          Override
        </label>
        <Input
          type="number"
          min={min}
          max={max}
          className="w-24"
          disabled={!state.override}
          value={state.value}
          onChange={(e) => onChange({ ...state, value: Number(e.target.value) })}
        />
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}

export default function ScreenDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [screen, setScreen] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState('');
  const [spaceId, setSpaceId] = useState(null);
  const [calendarEnabled, setCalendarEnabled] = useState(true);
  const [makersEnabled, setMakersEnabled] = useState(true);
  const [calendarDurationSec, setCalendarDurationSec] = useState({ override: false, value: 0 });
  const [makersDurationSec, setMakersDurationSec] = useState({ override: false, value: 0 });
  const [makersPerRow, setMakersPerRow] = useState({ override: false, value: 0 });

  const load = async () => {
    const [{ data: screenData, error: screenError }, { data: spacesData }, { data: settingsData }] = await Promise.all([
      supabase.from('screens').select('*').eq('id', id).single(),
      supabase.from('spaces').select('*').order('id'),
      supabase.from('settings').select('*').single(),
    ]);
    if (screenError) {
      console.error('screen query failed:', screenError);
      return;
    }
    setScreen(screenData);
    setSpaces(spacesData ?? []);
    setSettings(settingsData);
    setName(screenData.name ?? '');
    setSpaceId(screenData.space_id);
    setCalendarEnabled(screenData.calendar_enabled ?? true);
    setMakersEnabled(screenData.makers_enabled ?? true);
    setCalendarDurationSec(
      initOverride(
        screenData.calendar_duration_ms != null ? Math.round(screenData.calendar_duration_ms / 1000) : null,
        Math.round((settingsData?.calendar_duration_ms ?? 10000) / 1000)
      )
    );
    setMakersDurationSec(
      initOverride(
        screenData.makers_duration_ms != null ? Math.round(screenData.makers_duration_ms / 1000) : null,
        Math.round((settingsData?.maker_duration_ms ?? 20000) / 1000)
      )
    );
    setMakersPerRow(initOverride(screenData.makers_per_row, settingsData?.makers_per_row_min ?? 4));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    await supabase
      .from('screens')
      .update({
        name,
        space_id: spaceId,
        // On (matches the always-enabled default) collapses back to null
        // (inherit); off is what records an explicit override.
        calendar_enabled: calendarEnabled ? null : false,
        makers_enabled: makersEnabled ? null : false,
        calendar_duration_ms: calendarDurationSec.override ? calendarDurationSec.value * 1000 : null,
        makers_duration_ms: makersDurationSec.override ? makersDurationSec.value * 1000 : null,
        makers_per_row: makersPerRow.override ? makersPerRow.value : null,
      })
      .eq('id', id);
    load();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this screen?')) return;
    await supabase.from('screens').delete().eq('id', id);
    navigate('/admin');
  };

  if (!screen) {
    return (
      <div className="max-w-2xl">
        <Link to="/admin" className="text-sm text-gray-500 hover:underline">
          ← Back to screens
        </Link>
      </div>
    );
  }

  const perRowMin = settings?.makers_per_row_min ?? 1;
  const perRowMax = settings?.makers_per_row_max ?? 12;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link to="/admin" className="text-sm text-gray-500 hover:underline">
          ← Back to screens
        </Link>
        <h1 className="mt-2 text-lg font-semibold">{screen.name || `Screen #${id.slice(-5).toUpperCase()}`}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Screen name" />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            Device
            <div>
              <DeviceBadge screen={screen} />
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Space
            <Select value={spaceId ? String(spaceId) : undefined} onValueChange={(v) => setSpaceId(Number(v))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pick a space" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={String(space.id)}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="text-sm text-gray-500 dark:text-gray-400">Code: #{id.slice(-5).toUpperCase()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last seen: {new Date(screen.last_seen).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component toggles</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-white/10">
          <ToggleRow label="Calendar enabled" checked={calendarEnabled} onChange={setCalendarEnabled} />
          <ToggleRow label="Makers enabled" checked={makersEnabled} onChange={setMakersEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Duration overrides</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-white/10">
          <NumberOverrideRow
            label="Calendar duration"
            unit="sec"
            state={calendarDurationSec}
            onChange={setCalendarDurationSec}
            min={1}
          />
          <NumberOverrideRow
            label="Makers duration"
            unit="sec"
            state={makersDurationSec}
            onChange={setMakersDurationSec}
            min={1}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grid density</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberOverrideRow
            label={`Makers per row (${perRowMin}–${perRowMax})`}
            state={makersPerRow}
            onChange={setMakersPerRow}
            min={perRowMin}
            max={perRowMax}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="self-start">
        Save changes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            Delete screen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
