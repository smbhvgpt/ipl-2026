import React from 'react';
import { TEAMS } from '../data/teams.js';

export default function TeamBadge({ code, size = 'md', showName = false, dim = false, className = '' }) {
  const t = TEAMS[code];
  if (!t) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`${dims(size).box} rounded-md grid place-items-center font-display font-bold bg-edge text-white/60`}>
          ?
        </div>
        {showName && <span className="text-white/60">TBD</span>}
      </div>
    );
  }
  const d = dims(size);
  return (
    <div className={`inline-flex items-center gap-2 ${className} ${dim ? 'opacity-35 grayscale' : ''}`}>
      <div
        className={`${d.box} rounded-md grid place-items-center font-display font-bold tracking-tight shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]`}
        style={{
          background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primary}cc 70%, ${t.secondary}33 100%)`,
          color: t.ink,
          fontSize: d.font
        }}
        title={t.name}
      >
        {t.monogram}
      </div>
      {showName && (
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold">{t.short}</span>
          <span className="text-[10px] uppercase tracking-wider text-white/40 mono">{t.code}</span>
        </div>
      )}
    </div>
  );
}

function dims(size) {
  switch (size) {
    case 'xs': return { box: 'w-6 h-6', font: 9 };
    case 'sm': return { box: 'w-8 h-8', font: 10 };
    case 'lg': return { box: 'w-12 h-12', font: 13 };
    case 'xl': return { box: 'w-16 h-16', font: 16 };
    case 'md':
    default: return { box: 'w-10 h-10', font: 11 };
  }
}
