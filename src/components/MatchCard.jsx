import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Trophy } from 'lucide-react';
import TeamBadge from './TeamBadge.jsx';
import Countdown from './Countdown.jsx';
import { TEAMS } from '../data/teams.js';
import { formatDateShort } from '../utils/format.js';

export default function MatchCard({ match, onClick, highlighted, dimmed }) {
  const isCompleted = match.status === 'completed';
  const winner = isCompleted ? match.result.winner : null;
  const winnerTeam = winner ? TEAMS[winner] : null;
  const layoutId = `match-${match.id}`;

  return (
    <motion.button
      layoutId={layoutId}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      animate={{ opacity: dimmed ? 0.32 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={[
        'group relative w-full text-left rounded-xl glass neon-border overflow-hidden lift',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60',
        highlighted ? 'ring-2 ring-neon-cyan/60 shadow-glow' : '',
        isCompleted ? '' : 'shadow-neon'
      ].join(' ')}
      style={
        highlighted && winnerTeam
          ? { boxShadow: `0 0 32px ${winnerTeam.primary}55` }
          : undefined
      }
    >
      {/* Status edge bar */}
      <span
        className={[
          'absolute left-0 top-0 bottom-0 w-1',
          isCompleted ? 'bg-emerald-400/80' : 'bg-neon-cyan animate-pulseSlow'
        ].join(' ')}
      />
      {!isCompleted && <span className="scanline" />}

      <div className="px-4 pt-3 pb-3">
        {/* Header row */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/45 mono">
          <span>
            #{String(match.matchNo).padStart(2, '0')} ·{' '}
            {match.stage === 'playoff'
              ? match.title
              : `League`}
          </span>
          <span className="flex items-center gap-1">
            {isCompleted ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-emerald-400">COMPLETED</span>
              </>
            ) : (
              <>
                <Clock size={12} className="text-neon-cyan" />
                <span className="text-neon-cyan">UPCOMING</span>
              </>
            )}
          </span>
        </div>

        {/* Teams + score */}
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamRow code={match.team1} score={isCompleted ? match.result.team1Score : null} winner={winner === match.team1} align="left" />
          <div className="flex flex-col items-center mono text-[10px] text-white/40">
            <span>VS</span>
          </div>
          <TeamRow code={match.team2} score={isCompleted ? match.result.team2Score : null} winner={winner === match.team2} align="right" />
        </div>

        {/* Result line */}
        <div className="mt-3 min-h-[28px]">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-[12px]">
              <Trophy size={13} style={{ color: winnerTeam?.secondary || '#FBBF24' }} />
              <span className="text-white/85">
                <span className="font-semibold" style={{ color: winnerTeam?.secondary || '#FBBF24' }}>{winner}</span>{' '}
                won by <span className="font-semibold">{match.result.margin}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <Countdown isoDate={match.date} time={match.time} compact />
              <span className="text-[10px] uppercase tracking-[0.18em] text-neon-cyan/80 mono">PREVIEW →</span>
            </div>
          )}
        </div>

        {/* Footer meta */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
          <span className="mono">{formatDateShort(match.date)} · {match.time}</span>
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin size={11} className="text-white/40" />
            <span className="truncate">{shortVenue(match.venue)}</span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function TeamRow({ code, score, winner, align }) {
  const t = TEAMS[code];
  const justify = align === 'right' ? 'justify-end text-right' : 'justify-start text-left';
  if (!t) {
    return (
      <div className={`flex items-center gap-2 ${justify}`}>
        <TeamBadge code={code} size="md" />
        <div>
          <div className="text-[13px] font-semibold text-white/60">TBD</div>
          <div className="text-[10px] uppercase tracking-wider mono text-white/30">awaiting Q2</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 ${justify}`}>
      {align === 'right' && score && (
        <div className="text-right">
          <div className={`mono text-[13px] tabular-nums ${winner ? 'text-white' : 'text-white/70'}`}>
            {score.runs}/{score.wickets}
          </div>
          <div className="text-[10px] text-white/35 mono">{Number(score.overs).toFixed(1)} ov</div>
        </div>
      )}
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <TeamBadge code={code} size="md" />
        <div className={align === 'right' ? 'text-right' : ''}>
          <div className={`text-[13px] font-semibold tracking-tight ${winner ? 'text-white' : 'text-white/80'}`}>
            {t.short}
          </div>
          <div className="text-[10px] uppercase tracking-wider mono" style={{ color: t.primary }}>
            {t.code}
          </div>
        </div>
      </div>
      {align === 'left' && score && (
        <div className="text-left ml-1">
          <div className={`mono text-[13px] tabular-nums ${winner ? 'text-white' : 'text-white/70'}`}>
            {score.runs}/{score.wickets}
          </div>
          <div className="text-[10px] text-white/35 mono">{Number(score.overs).toFixed(1)} ov</div>
        </div>
      )}
    </div>
  );
}

function shortVenue(v) {
  if (!v) return '';
  // Trim to "<city>" if there's a comma
  const parts = v.split(',');
  if (parts.length >= 2) return parts[parts.length - 1].trim() + ' · ' + parts[0].trim().replace('Stadium', '').replace(/\s+$/, '');
  return v;
}
