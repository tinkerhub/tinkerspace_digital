import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import DeviceBadge from '../../components/admin/DeviceBadge';

export default function ScreensPage() {
  const [spaces, setSpaces] = useState([]);
  const [unclaimedScreens, setUnclaimedScreens] = useState([]);
  const [claimedScreens, setClaimedScreens] = useState([]);
  const [claimDrafts, setClaimDrafts] = useState({}); // screenId -> { name, spaceId }
  const [newSpaceName, setNewSpaceName] = useState('');
  const [addSpaceOpen, setAddSpaceOpen] = useState(false);

  const loadAll = useCallback(async () => {
    const [
      { data: spacesData, error: spacesError },
      { data: screensData, error: screensError },
    ] = await Promise.all([
      supabase.from('spaces').select('*').order('id'),
      supabase.from('screens').select('*').order('first_seen', { ascending: false }),
    ]);
    if (spacesError) console.error('spaces query failed:', spacesError);
    if (screensError) console.error('screens query failed:', screensError);

    setSpaces(spacesData ?? []);

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

  const handleClaim = async (screenId) => {
    const draft = claimDrafts[screenId] || {};
    if (!draft.name || !draft.spaceId) return;
    await supabase
      .from('screens')
      .update({ status: 'claimed', name: draft.name, space_id: draft.spaceId })
      .eq('id', screenId);
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
      <h1 className="text-lg font-semibold">Screens</h1>

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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {claimedScreens.map((screen) => (
                <div
                  key={screen.id}
                  className="group relative rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteScreen(screen.id);
                    }}
                    className="absolute right-2 top-2 rounded-md p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-opacity"
                    aria-label="Delete screen"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link to={`/admin/screens/${screen.id}`} className="block">
                    <div className="pr-6 font-semibold">{screen.name}</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{spaceName(screen.space_id)}</div>
                    <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      Last seen {new Date(screen.last_seen).toLocaleString()}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
