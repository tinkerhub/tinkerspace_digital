import React from 'react';
import { Smartphone, Laptop, Monitor, Tv } from 'lucide-react';
import { classifyDevice } from '../../utils/deviceType';

const DEVICE_BADGE = {
  mobile: { icon: Smartphone, label: 'Mobile' },
  laptop: { icon: Laptop, label: 'Laptop' },
  desktop: { icon: Monitor, label: 'Desktop' },
  tv: { icon: Tv, label: 'TV' },
};

export default function DeviceBadge({ screen }) {
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
