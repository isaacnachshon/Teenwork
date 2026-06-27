import React from 'react';

type IconDef = [string, Record<string, string | number>][];

const ICONS: Record<string, IconDef> = {
  overview: [['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1.6 }], ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1.6 }], ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1.6 }], ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1.6 }]],
  users: [['path', { d: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1' }], ['circle', { cx: 9, cy: 8, r: 3.4 }], ['path', { d: 'M21.5 19v-1a4 4 0 0 0-3-3.87' }], ['path', { d: 'M15.5 4.6a3.4 3.4 0 0 1 0 6.6' }]],
  user: [['path', { d: 'M19 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 18.5V20' }], ['circle', { cx: 12, cy: 8, r: 4 }]],
  link: [['path', { d: 'M9 17H7.5a5 5 0 0 1 0-10H9' }], ['path', { d: 'M15 7h1.5a5 5 0 0 1 0 10H15' }], ['path', { d: 'M8.5 12h7' }]],
  chat: [['path', { d: 'M20 11.5a7.5 7.5 0 0 1-10.5 6.86L4 20l1.64-5.5A7.5 7.5 0 1 1 20 11.5z' }]],
  bell: [['path', { d: 'M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5z' }], ['path', { d: 'M13.7 20.5a2 2 0 0 1-3.4 0' }]],
  search: [['circle', { cx: 11, cy: 11, r: 7 }], ['path', { d: 'M21 21l-4.3-4.3' }]],
  briefcase: [['rect', { x: 2.5, y: 7.5, width: 19, height: 12, rx: 2.2 }], ['path', { d: 'M16 19.5V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v13.5' }]],
  logout: [['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }], ['path', { d: 'M16 17l5-5-5-5' }], ['path', { d: 'M21 12H9' }]],
  plus: [['path', { d: 'M12 5v14' }], ['path', { d: 'M5 12h14' }]],
  shield: [['path', { d: 'M12 22s7.5-3.7 7.5-9.5V5.5L12 2.5 4.5 5.5v7C4.5 18.3 12 22 12 22z' }], ['path', { d: 'M9 12l2 2 4-4' }]],
  flag: [['path', { d: 'M5 14s1-.9 3.5-.9S13 15 16 15s3.5-.9 3.5-.9V4S18 5 16 5s-5-2-7.5-2S5 4 5 4z' }], ['path', { d: 'M5 21v-7' }]],
  send: [['path', { d: 'M21.5 3.5L11 14' }], ['path', { d: 'M21.5 3.5L15 21l-4-8-8-4 18.5-5.5z' }]],
  check: [['path', { d: 'M20 6.5L9.5 17 4.5 12' }]],
  clock: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M12 7.5V12l3 1.8' }]],
  eye: [['path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' }], ['circle', { cx: 12, cy: 12, r: 2.7 }]],
  star: [['path', { d: 'M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.2l1-5.8L3.5 9.2l5.9-.9z' }]],
  calendar: [['rect', { x: 3.5, y: 5, width: 17, height: 16, rx: 2.2 }], ['path', { d: 'M16 3v4' }], ['path', { d: 'M8 3v4' }], ['path', { d: 'M3.5 10h17' }]],
  wallet: [['rect', { x: 3, y: 6, width: 18, height: 13, rx: 2.4 }], ['path', { d: 'M3 9.8h18' }], ['circle', { cx: 17, cy: 14, r: 1.3 }]],
  alert: [['path', { d: 'M12 3L2 20h20L12 3z' }], ['path', { d: 'M12 10v4' }], ['path', { d: 'M12 17.4v.01' }]],
  ban: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M6.2 6.2l11.6 11.6' }]],
  dots: [['circle', { cx: 5, cy: 12, r: 1.4 }], ['circle', { cx: 12, cy: 12, r: 1.4 }], ['circle', { cx: 19, cy: 12, r: 1.4 }]],
  gear: [['circle', { cx: 12, cy: 12, r: 3 }], ['path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' }]],
};

interface IconOpts {
  size?: number;
  color?: string;
  sw?: number;
}

export function DIcon(name: string, opts?: IconOpts): React.ReactElement {
  const o = opts || {};
  const parts = ICONS[name] || ICONS.overview;
  return React.createElement(
    'svg',
    {
      width: o.size || 20,
      height: o.size || 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: o.color || 'currentColor',
      strokeWidth: o.sw || 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: { display: 'block', flexShrink: 0 },
    },
    parts.map((s, i) => React.createElement(s[0], { key: i, ...s[1] }))
  );
}
