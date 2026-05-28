import React from 'react';
import { Trophy } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(700px 280px at 18% 110%, rgba(34,211,238,0.18), transparent 70%), radial-gradient(700px 280px at 90% -20%, rgba(167,139,250,0.18), transparent 70%)'
        }}
      />
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl grid place-items-center bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 ring-1 ring-white/10 shadow-glow">
            <Trophy size={26} className="text-neon-gold" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.32em] mono text-white/40 uppercase">Season 19</div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
              <span className="text-gradient">IPL 2026</span>{' '}
              <span className="text-white/85">· Tournament Chronology</span>
            </h1>
            <div className="text-[12px] text-white/55 mt-0.5">
              Every match, every twist — Day 1 to the Final.
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <Stat label="Matches" value="74" />
          <Sep />
          <Stat label="Played" value="72" />
          <Sep />
          <Stat label="To Go" value="2" accent />
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="text-right">
      <div className={`font-display font-semibold text-2xl tabular-nums ${accent ? 'text-neon-cyan' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] tracking-[0.22em] mono uppercase text-white/40">{label}</div>
    </div>
  );
}
function Sep() { return <span className="h-8 w-px bg-white/10" />; }
