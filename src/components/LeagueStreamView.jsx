import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import MatchCard from './MatchCard.jsx';
import { formatDateLabel } from '../utils/format.js';

export default function LeagueStreamView({
  matches,
  onSelectMatch,
  teamFilter,
  highlightId,
  jumpAnchorRefs
}) {
  // Group matches by date
  const groups = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date).push(m);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [matches]);

  return (
    <div className="relative">
      {/* Spine */}
      <div className="absolute left-[16px] top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/40 via-white/10 to-neon-violet/40 hidden md:block" />

      <div className="space-y-8">
        {groups.map(([date, dayMatches], gi) => {
          const allDone = dayMatches.every(m => m.status === 'completed');
          const anchorKey = anchorForGroup(gi, groups.length);
          return (
            <motion.div
              key={date}
              ref={el => { if (anchorKey && jumpAnchorRefs) jumpAnchorRefs.current[anchorKey] = el; }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              {/* Date label */}
              <div className="md:pl-12 mb-3 flex items-baseline gap-3">
                <div className="hidden md:flex absolute left-0 top-1.5 items-center">
                  <span className={[
                    'w-[14px] h-[14px] rounded-full border-2',
                    allDone ? 'bg-emerald-400/80 border-emerald-200/60' : 'bg-neon-cyan/80 border-neon-cyan/40 animate-pulseSlow'
                  ].join(' ')} />
                </div>
                <div className="font-display font-semibold text-white/85 text-lg">
                  {formatDateLabel(date)}
                </div>
                <div className="text-[10px] mono tracking-[0.22em] uppercase text-white/40">
                  {dayMatches.length} match{dayMatches.length > 1 ? 'es' : ''}
                </div>
              </div>

              {/* Cards */}
              <div className="md:pl-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {dayMatches.map(m => {
                  const dim = teamFilter && m.team1 !== teamFilter && m.team2 !== teamFilter;
                  return (
                    <MatchCard
                      key={m.id}
                      match={m}
                      onClick={() => onSelectMatch(m)}
                      highlighted={highlightId === m.id}
                      dimmed={dim}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function anchorForGroup(i, total) {
  if (i === 0) return 'opening';
  if (i === Math.floor(total / 2)) return 'mid';
  return null;
}
