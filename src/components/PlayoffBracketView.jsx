import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Trophy } from 'lucide-react';
import TeamBadge from './TeamBadge.jsx';
import { TEAMS } from '../data/teams.js';
import { formatDateLabel } from '../utils/format.js';

export default function PlayoffBracketView({ playoffs, onSelectMatch, teamFilter, onChampionTap }) {
  const [q1, el, q2, fin] = playoffs;
  const q1Winner = q1.result?.winner;
  const q1Loser = q1Winner ? (q1.team1 === q1Winner ? q1.team2 : q1.team1) : null;
  const elWinner = el.result?.winner;

  return (
    <div className="relative rounded-xl glass neon-border p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.32em] mono text-white/40 uppercase">Knockout Theatre</div>
          <h2 className="font-display font-semibold text-2xl text-gradient">Playoff Tree</h2>
          <p className="text-sm text-white/55 mt-1">Two games down · Two to go. Lines show how teams progress through rounds.</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] tracking-[0.22em] mono text-white/45 uppercase">
          <span className="inline-flex items-center gap-1"><span className="dot bg-emerald-400" /> Completed</span>
          <span className="inline-flex items-center gap-1"><span className="dot bg-neon-cyan animate-pulseSlow" /> Upcoming</span>
        </div>
      </div>

      {/* Bracket with SVG lines */}
      <div className="overflow-x-auto pb-4">
        <div className="relative" style={{ minWidth: 1000, minHeight: 520 }}>
          {/* SVG connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="lineGradGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.7" />
              </linearGradient>
              <marker id="arrowCyan" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0,0 L10,4 L0,8 Z" fill="#A78BFA" fillOpacity="0.6" />
              </marker>
              <marker id="arrowGold" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0,0 L10,4 L0,8 Z" fill="#FBBF24" fillOpacity="0.6" />
              </marker>
            </defs>

            {/* Q1 Winner → Final (top path) */}
            <path d="M 260,75 C 350,75 350,235 680,235"
              fill="none" stroke="url(#lineGradGold)" strokeWidth="2.5" markerEnd="url(#arrowGold)" />
            <text x="370" y="110" fill="#FBBF24" fillOpacity="0.4" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {q1Winner ? `${TEAMS[q1Winner]?.short} (Winner)` : 'WINNER → FINAL'}
            </text>

            {/* Q1 Loser → Q2 (dashed, middle path) */}
            <path d="M 260,105 C 350,105 350,245 430,245"
              fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrowCyan)" />
            <text x="305" y="185" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {q1Loser ? `${TEAMS[q1Loser]?.short}` : 'LOSER'}
            </text>

            {/* EL Winner → Q2 (solid, bottom path) */}
            <path d="M 260,365 C 350,365 350,275 430,275"
              fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" markerEnd="url(#arrowCyan)" />
            <text x="305" y="350" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {elWinner ? `${TEAMS[elWinner]?.short}` : 'WINNER'}
            </text>

            {/* Q2 Winner → Final */}
            <path d="M 660,260 L 680,260"
              fill="none" stroke="url(#lineGradGold)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrowGold)" />
            {/* Extended Q2→Final line */}
            <path d="M 655,260 C 665,260 670,260 680,260"
              fill="none" stroke="url(#lineGradGold)" strokeWidth="2" strokeDasharray="6 4" />

            {/* Final Winner → Champion */}
            <path d="M 810,290 L 810,370"
              fill="none" stroke="#FBBF24" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6 4" markerEnd="url(#arrowGold)" />
          </svg>

          {/* ── Round 1 Column ── */}
          <div className="absolute" style={{ left: 0, top: 0, width: 260 }}>
            <div className="text-center mb-3">
              <div className="text-[10px] tracking-[0.22em] mono text-white/35 uppercase">Round 1</div>
              <div className="text-[9px] mono text-white/20">26–27 May</div>
            </div>

            {/* Q1 */}
            <div className="mb-10">
              <BracketNode match={q1} onClick={() => onSelectMatch(q1)} dim={teamFilter && !involves(q1, teamFilter)} label="Qualifier 1 · #1 vs #2" />
            </div>

            {/* Eliminator */}
            <div style={{ marginTop: 60 }}>
              <BracketNode match={el} onClick={() => onSelectMatch(el)} dim={teamFilter && !involves(el, teamFilter)} label="Eliminator · #3 vs #4" />
            </div>
          </div>

          {/* ── Round 2 Column ── */}
          <div className="absolute" style={{ left: 420, top: 160, width: 260 }}>
            <div className="text-center mb-3">
              <div className="text-[10px] tracking-[0.22em] mono text-white/35 uppercase">Round 2</div>
              <div className="text-[9px] mono text-white/20">29 May</div>
            </div>
            <BracketNode match={q2} onClick={() => onSelectMatch(q2)} dim={teamFilter && !involves(q2, teamFilter)} label="Qualifier 2 · Loser Q1 vs Winner EL" />
          </div>

          {/* ── Final Column ── */}
          <div className="absolute" style={{ left: 700, top: 150, width: 260 }}>
            <div className="text-center mb-3">
              <div className="text-[10px] tracking-[0.22em] mono text-neon-gold/50 uppercase flex items-center justify-center gap-1">
                <Trophy size={11} className="text-neon-gold" /> The Final
              </div>
              <div className="text-[9px] mono text-white/20">31 May · Ahmedabad</div>
            </div>
            <BracketNode match={fin} onClick={() => onSelectMatch(fin)} dim={teamFilter && !involves(fin, teamFilter)} isFinal label="IPL 2026 Final" />

            {/* Champion placeholder */}
            <motion.button
              onClick={() => { onChampionTap?.(); onSelectMatch(fin); }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="relative rounded-xl p-5 w-full text-center overflow-hidden ring-1 ring-neon-gold/30 bg-gradient-to-br from-neon-gold/10 via-neon-violet/10 to-neon-pink/10 lift mt-8"
              style={{ zIndex: 2 }}
              title="Tap to celebrate"
            >
              <Crown size={24} className="mx-auto text-neon-gold animate-floaty" />
              <div className="mt-1.5 font-display font-bold text-base text-gradient">CHAMPION 2026</div>
              <div className="mt-1 text-[11px] text-white/50">🏆 tap for confetti</div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Flow narrative */}
      <FlowLegend playoffs={playoffs} />
    </div>
  );
}

function involves(match, code) {
  return match.team1 === code || match.team2 === code;
}

function BracketNode({ match, onClick, dim, isFinal, label }) {
  const isCompleted = match.status === 'completed';
  const winnerCode = isCompleted ? match.result.winner : null;
  const winnerColor = winnerCode ? TEAMS[winnerCode].primary : '#22D3EE';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      animate={{ opacity: dim ? 0.3 : 1 }}
      className={[
        'relative rounded-xl text-left glass neon-border lift overflow-hidden w-full',
        isFinal ? 'py-4 px-4 ring-1 ring-neon-gold/20' : 'p-3.5',
        isCompleted ? '' : 'shadow-neon'
      ].join(' ')}
      style={{ zIndex: 2, boxShadow: isFinal ? `0 0 36px ${winnerColor}44` : undefined }}
    >
      {!isCompleted && <span className="scanline" />}
      {/* Header */}
      <div className="flex items-center justify-between text-[9px] tracking-[0.18em] mono text-white/40 uppercase mb-2">
        <span>{match.title} · #{match.matchNo}</span>
        <span className={isCompleted ? 'text-emerald-400' : 'text-neon-cyan'}>
          {isCompleted ? 'FT' : 'UPCOMING'}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-1.5">
        <BracketTeamRow code={match.team1} score={isCompleted ? match.result.team1Score : null} winner={winnerCode === match.team1} />
        <BracketTeamRow code={match.team2} score={isCompleted ? match.result.team2Score : null} winner={winnerCode === match.team2} />
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] mono">
        <span className="text-white/45">{formatDateLabel(match.date)} · {match.time}</span>
        {isCompleted ? (
          <span style={{ color: TEAMS[winnerCode].secondary }}>
            {winnerCode} +{match.result.margin}
          </span>
        ) : (
          <span className="text-neon-cyan">Preview →</span>
        )}
      </div>
    </motion.button>
  );
}

function BracketTeamRow({ code, score, winner }) {
  const t = code === 'TBD' ? null : TEAMS[code];
  return (
    <div className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md ${winner ? 'bg-white/[0.04] ring-1 ring-white/10' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <TeamBadge code={code} size="sm" />
        <span className={`text-sm font-semibold ${winner ? 'text-white' : 'text-white/75'}`}>
          {t ? t.short : 'TBD'}
        </span>
        {winner && <Crown size={12} className="text-neon-gold" />}
      </div>
      {score && (
        <span className={`mono text-[12px] tabular-nums ${winner ? 'text-white' : 'text-white/55'}`}>
          {score.runs}/{score.wickets} <span className="text-white/30">({Number(score.overs).toFixed(1)})</span>
        </span>
      )}
    </div>
  );
}

function FlowLegend({ playoffs }) {
  return (
    <div className="mt-8 grid md:grid-cols-2 gap-3 text-[12px]">
      <div className="rounded-lg glass px-3 py-2.5">
        <div className="text-[10px] tracking-[0.22em] mono text-white/40 uppercase">Done</div>
        <div className="mt-1 text-white/75">
          RCB stamped Q1 with a 92-run statement. SRH crashed out 4th after RR's Boult-led 47-run rout in the Eliminator.
        </div>
      </div>
      <div className="rounded-lg glass px-3 py-2.5">
        <div className="text-[10px] tracking-[0.22em] mono text-white/40 uppercase">Next 96 Hours</div>
        <div className="mt-1 text-white/75">
          GT vs RR (Mullanpur, 29 May) decides RCB's Final opponent. Then Ahmedabad, 31 May — one night, one trophy.
        </div>
      </div>
    </div>
  );
}
