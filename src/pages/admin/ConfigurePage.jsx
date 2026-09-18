import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Smartphone, Laptop, Monitor, Tv } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { classifyDevice } from '../../utils/deviceType';

const DEVICE_BADGE = {
  mobile: { icon: Smartphone, label: 'Mobile' },
  laptop: { icon: Laptop, label: 'Laptop' },
  desktop: { icon: Monitor, label: 'Desktop' },
  tv: { icon: Tv, label: 'TV' },
};

function DeviceBadge({ screen }) {
  const kind = classifyDevice({
    userAgent: screen.user_agent,
    width: screen.screen_width,
    devicePixelRatio: screen.device_pixel_ratio,
  });
  const badge = DEVICE_BADGE[kind];
  if (!badge) return <span className="text-gray-400">—</span>;
  const Icon = badge.icon;
  const title = `${screen.screen_width ?? '?'}×${screen.screen_height ?? '?'} · DPR ${screen.device_pixel_ratio ?? '?'} · ${screen.user_agent ?? 'unknown UA'}`;
  return (
    <span className="inline-flex items-center gap-1 text-sm" title={title}>
      <Icon size={14} /> {badge.label}
    </span>
  );
}

export default function ConfigurePage() {
  const [spaces, setSpaces] = useState([]);
  const [settings, setSettings] = useState(null);
  const [unclaimedScreens, setUnclaimedScreens] = useState([]);
  const [claimedScreens, setClaimedScreens] = useState([]);
  const [claimDrafts, setClaimDrafts] = useState({}); // screenId -> { name, spaceId }
  const [newSpaceName, setNewSpaceName] = useState('');
  const [addSpaceOpen, setAddSpaceOpen] = useState(false);
  const [durationDraft, setDurationDraft] = useState({ calendarSec: 10, makerSec: 20 });

  const loadAll = useCallback(async () => {
    const [
      { data: spacesData, error: spacesError },
      { data: settingsData, error: settingsError },
      { data: screensData, error: screensError },
    ] = await Promise.all([
      supabase.from('spaces').select('*').order('id'),
      supabase.from('settings').select('*').single(),
      supabase.from('screens').select('*').order('first_seen', { ascending: false }),
    ]);
    if (spacesError) console.error('spaces query failed:', spacesError);
    if (settingsError) console.error('settings query failed:', settingsError);
    if (screensError) console.error('screens query failed:', screensError);

    setSpaces(spacesData ?? []);
    if (settingsData) {
      setSettings(settingsData);
      setDurationDraft({
        calendarSec: Math.round(settingsData.calendar_duration_ms / 1000),
        makerSec: Math.round(settingsData.maker_duration_ms / 1000),
      });
    }

    const screens = screensData ?? [];
    setUnclaimedScreens(screens.filter((s) => s.status === 'unclaimed'));
    setClaimedScreens(screens.filter((s) => s.status === 'claimed'));
  }, []);

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('admin-screens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screens' }, loadAll)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadAll]);

  const handleAddSpace = async () => {
    if (!newSpaceName.trim()) return;
    await supabase.from('spaces').insert({ name: newSpaceName.trim() });
    setNewSpaceName('');
    setAddSpaceOpen(false);
    loadAll();
  };

  const handleSaveDurations = async () => {
    await supabase
      .from('settings')
      .update({
        calendar_duration_ms: durationDraft.calendarSec * 1000,
        maker_duration_ms: durationDraft.makerSec * 1000,
      })
      .eq('id', true);
    loadAll();
  };

  const handleClaim = async (screenId) => {
    const draft = claimDrafts[screenId] || {};
    if (!draft.name || !draft.spaceId) return;
    await supabase
      .from('screens')
      .update({ status: 'claimed', name: draft.name, space_id: draft.spaceId })
      .eq('id', screenId);
    loadAll();
  };

  const handleReassign = async (screenId, spaceId) => {
    await supabase.from('screens').update({ space_id: spaceId }).eq('id', screenId);
    loadAll();
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('Delete this screen?')) return;
    await supabase.from('screens').delete().eq('id', screenId);
    loadAll();
  };

  const handleClearUnclaimed = async () => {
    if (!window.confirm(`Delete all ${unclaimedScreens.length} unclaimed screens?`)) return;
    await supabase.from('screens').delete().in('id', unclaimedScreens.map((s) => s.id));
    loadAll();
  };

  const spaceName = (id) => spaces.find((s) => s.id === id)?.name ?? '—';

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <h1 className="text-lg font-semibold">Configure</h1>

      {/* Durations */}
      <Card>
        <CardHeader>
          <CardTitle>Rotation durations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Calendar (seconds)
            <Input
              type="number"
              min="1"
              className="w-32"
              value={durationDraft.calendarSec}
              onChange={(e) => setDurationDraft((d) => ({ ...d, calendarSec: Number(e.target.value) }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Makers (seconds)
            <Input
              type="number"
              min="1"
              className="w-32"
              value={durationDraft.makerSec}
              onChange={(e) => setDurationDraft((d) => ({ ...d, makerSec: Number(e.target.value) }))}
            />
          </label>
          <Button onClick={handleSaveDurations} disabled={!settings}>
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Spaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Spaces</CardTitle>
          <Dialog open={addSpaceOpen} onOpenChange={setAddSpaceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus size={14} /> Add new space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new space</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Space name, e.g. Kozhikode"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                />
                <Button onClick={handleAddSpace}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell>{space.id}</TableCell>
                  <TableCell>{space.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unclaimed screens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Unclaimed screens</CardTitle>
          {unclaimedScreens.length > 0 && (
            <Button variant="outline" onClick={handleClearUnclaimed}>
              <Trash2 size={14} /> Clear all
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {unclaimedScreens.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No unclaimed screens right now. Open the display on a new device to register one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Space</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {unclaimedScreens.map((screen) => {
                  const draft = claimDrafts[screen.id] || { name: '', spaceId: null };
                  return (
                    <TableRow key={screen.id}>
                      <TableCell className="font-mono font-bold">#{screen.id.slice(-5).toUpperCase()}</TableCell>
                      <TableCell>
                        <DeviceBadge screen={screen} />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Screen name"
                          value={draft.name}
                          onChange={(e) =>
                            setClaimDrafts((prev) => ({ ...prev, [screen.id]: { ...draft, name: e.target.value } }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={draft.spaceId ? String(draft.spaceId) : undefined}
                          onValueChange={(value) =>
                            setClaimDrafts((prev) => ({ ...prev, [screen.id]: { ...draft, spaceId: Number(value) } }))
                          }
                        >
                          <SelectTrigger className="w-40">
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
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button onClick={() => handleClaim(screen.id)} disabled={!draft.name || !draft.spaceId}>
                          Claim
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteScreen(screen.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Claimed screens */}
      <Card>
        <CardHeader>
          <CardTitle>Screens</CardTitle>
        </CardHeader>
        <CardContent>
          {claimedScreens.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No screens claimed yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Space</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimedScreens.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell>{screen.name}</TableCell>
                    <TableCell>
                      <Select value={String(screen.space_id)} onValueChange={(value) => handleReassign(screen.id, Number(value))}>
                        <SelectTrigger className="w-40">
                          <SelectValue>{spaceName(screen.space_id)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {spaces.map((space) => (
                            <SelectItem key={space.id} value={String(space.id)}>
                              {space.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(screen.last_seen).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" onClick={() => handleDeleteScreen(screen.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
