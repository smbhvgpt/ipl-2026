import React, { useEffect, useState } from 'react';
import { matchDateTime, diffParts } from '../utils/format.js';

export default function Countdown({ isoDate, time, compact = false }) {
  const target = matchDateTime(isoDate, time).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = diffParts(target, now);
  if (p.total <= 0) {
    return <span className="text-neon-lime mono text-[11px] font-semibold tracking-wider">LIVE WINDOW</span>;
  }
  if (compact) {
    return (
      <span className="mono text-[11px] text-neon-cyan">
        {p.days}d {p.hours.toString().padStart(2, '0')}h {p.minutes.toString().padStart(2, '0')}m
      </span>
    );
  }
  return (
    <div className="flex items-end gap-2 mono">
      <Unit n={p.days} label="DAYS" />
      <Sep />
      <Unit n={p.hours} label="HRS" />
      <Sep />
      <Unit n={p.minutes} label="MIN" />
      <Sep />
      <Unit n={p.seconds} label="SEC" />
    </div>
  );
}

function Unit({ n, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl text-neon-cyan font-semibold tabular-nums">{String(n).padStart(2, '0')}</span>
      <span className="text-[9px] tracking-[0.2em] text-white/40">{label}</span>
    </div>
  );
}
function Sep() {
  return <span className="text-white/20 text-xl pb-3.5 leading-none">:</span>;
}
