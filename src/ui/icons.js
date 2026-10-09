// Единый набор SVG-иконок (стиль Lucide: контурные, stroke 2 — без эмодзи, по гайдам UI-скилла)

const base = (inner, extra = '') =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;

export const ICONS = {
  rocket: base('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  piggy: base('<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><circle cx="16" cy="11" r="0.5" fill="currentColor"/>'),
  medkit: base('<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M12 11v6"/><path d="M9 14h6"/>'),
  shield: base('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  gift: base('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>'),
  car: base('<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'),
  phone: base('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
  'chart-up': base('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 14 4-4 4 4 5-5"/><path d="M17 9h3v3"/>'),
  'chart-down': base('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 10 4 4 4-4 5 5"/><path d="M17 15h3v-3"/>'),
  palm: base('<path d="M13 8c1.5-2 4-3 6-2"/><path d="M13 8c2-1.5 5-1 6 1"/><path d="M13 8c-2-1.5-5-1-6 1"/><path d="M13 8c-.5-2.5-2.5-4.5-5-4"/><path d="M13 8v13"/><path d="M9 21h8"/>'),
  storm: base('<path d="M17.5 17a4.5 4.5 0 1 0-.9-8.9 6 6 0 0 0-11.5 1.6A4 4 0 0 0 6 17.5"/><path d="M13 12l-3 5h4l-3 5"/>'),
  target: base('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  checklist: base('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1.5 1.5L12.5 6"/><path d="M15 9h1"/><path d="m8 15 1.5 1.5L12.5 13"/><path d="M15 16h1"/>'),
  bulb: base('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>'),
  wallet: base('<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>'),
  coins: base('<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>'),
  book: base('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'),
  share: base('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>'),
  external: base('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  play: base('<polygon points="6 3 20 12 6 21 6 3"/>'),
  refresh: base('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),
  arrowUp: base('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>'),
  arrowDown: base('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
  shieldPlus: base('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v6"/><path d="M9 11h6"/>'),
  award: base('<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>'),
  crown: base('<path d="M2 8l4 4 6-8 6 8 4-4v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>')
};

export function icon(name) {
  return ICONS[name] || ICONS.target;
}
