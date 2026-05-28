import React from 'react';
import { TEAMS } from '../data/teams.js';
import TeamBadge from './TeamBadge.jsx';

export default function PointsTable({ standings, highlightCodes = [], teamFilter }) {
  return (
    <div className="rounded-xl glass overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.22em] mono text-white/40 uppercase">Final League Standings</div>
          <div className="text-sm text-white/85 font-semibold">Top 4 advance to Playoffs</div>
        </div>
        <div className="text-[10px] tracking-[0.22em] mono text-white/40">P · W · L · PTS · NRR</div>
      </div>
      <div className="divide-y divide-white/5">
        {standings.map((row, i) => {
          const t = TEAMS[row.code];
          const inPlayoffs = i < 4;
          const dim = teamFilter && row.code !== teamFilter;
          const highlight = highlightCodes.includes(row.code);
          return (
            <div
              key={row.code}
              className={[
                'flex items-center gap-2 px-3 py-2.5 transition',
                dim ? 'opacity-30' : '',
                highlight ? 'bg-white/[0.03]' : ''
              ].join(' ')}
            >
              <div className="w-6 text-right">
                <span className={`mono text-sm ${inPlayoffs ? 'text-neon-gold' : 'text-white/40'}`}>
                  {i + 1}
                </span>
              </div>
              <TeamBadge code={row.code} size="sm" />
              <div className="flex-1 min-w-0 mr-1">
                <div className="text-[13px] font-semibold truncate">{t.short}</div>
                <div className="text-[9px] uppercase tracking-wider mono" style={{ color: t.primary }}>{t.code}</div>
              </div>
              <div className="flex items-center gap-1.5 mono text-[12px] tabular-nums shrink-0">
                <Cell v={row.played} />
                <Cell v={row.won} className="text-emerald-300" />
                <Cell v={row.lost} className="text-rose-300" />
                <Cell v={row.points} className="text-white font-semibold" />
                <Cell v={row.nrr.toFixed(2)} className={row.nrr >= 0 ? 'text-emerald-300/80' : 'text-rose-300/80'} width="w-10" />
              </div>
              {inPlayoffs && (
                <span className="ml-1 text-[9px] mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-neon-gold/10 text-neon-gold ring-1 ring-neon-gold/30">
                  {i + 1 === 4 ? 'EL' : `Q${i + 1}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Cell({ v, className = '', width = 'w-7' }) {
  return <span className={`${width} text-right ${className} text-white/70`}>{v}</span>;
}
