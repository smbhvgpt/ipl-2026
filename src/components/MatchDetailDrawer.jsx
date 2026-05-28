import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins, Crosshair, Flame, Sparkles, MapPin, Clock, TrendingUp } from 'lucide-react';
import TeamBadge from './TeamBadge.jsx';
import Countdown from './Countdown.jsx';
import { TEAMS } from '../data/teams.js';
import { formatDateLabel } from '../utils/format.js';

export default function MatchDetailDrawer({ match, onClose }) {
  return (
    <AnimatePresence>
      {match && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key={`drawer-${match.id}`}
            layoutId={`match-${match.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-[640px] glass border-l border-white/10 overflow-y-auto"
          >
            <DrawerBody match={match} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerBody({ match, onClose }) {
  const isCompleted = match.status === 'completed';
  const t1 = TEAMS[match.team1];
  const t2 = TEAMS[match.team2];
  const winnerCode = isCompleted ? match.result.winner : null;
  const winner = winnerCode ? TEAMS[winnerCode] : null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 bg-ink/95 backdrop-blur-md border-b border-white/10 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-[0.22em] mono text-white/40 uppercase">
            Match #{String(match.matchNo).padStart(2, '0')} · {match.stage === 'playoff' ? match.title : 'League Phase'}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-white/40" />{formatDateLabel(match.date)} · {match.time}</span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1.5 truncate"><MapPin size={13} className="text-white/40" />{match.venue}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-2 hover:bg-white/5 text-white/60 hover:text-white transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 pt-6 pb-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${t1?.primary || '#888'}55, transparent 60%), radial-gradient(ellipse at 80% 100%, ${t2?.primary || '#888'}55, transparent 60%)`
          }}
        />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <TeamHero code={match.team1} score={isCompleted ? match.result.team1Score : null} winner={winnerCode === match.team1} />
          <div className="text-center">
            <div className="font-display font-bold text-3xl text-gradient">VS</div>
            {isCompleted && (
              <div className="mt-1 text-[10px] tracking-[0.22em] mono text-emerald-400">FT</div>
            )}
          </div>
          <TeamHero code={match.team2} score={isCompleted ? match.result.team2Score : null} winner={winnerCode === match.team2} flip />
        </div>

        {isCompleted ? (
          <div className="relative mt-5 flex items-center justify-center gap-2 text-sm">
            <Trophy size={16} style={{ color: winner?.secondary || '#FBBF24' }} />
            <span className="text-white/90">
              <span className="font-semibold" style={{ color: winner?.secondary || '#FBBF24' }}>{winner?.name}</span>{' '}
              won by <span className="font-semibold">{match.result.margin}</span>
            </span>
          </div>
        ) : (
          <div className="relative mt-5 flex flex-col items-center gap-3">
            <Countdown isoDate={match.date} time={match.time} />
            <div className="text-[11px] uppercase tracking-[0.22em] mono text-neon-cyan/80">Preview locked in</div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-10 space-y-5">
        {isCompleted ? <CompletedBody match={match} /> : <PreviewBody match={match} />}
      </div>
    </div>
  );
}

function TeamHero({ code, score, winner, flip }) {
  const t = TEAMS[code];
  if (!t) {
    return (
      <div className={`flex items-center gap-3 ${flip ? 'flex-row-reverse text-right' : ''}`}>
        <TeamBadge code={code} size="xl" />
        <div>
          <div className="font-display font-semibold text-white/60 text-lg">TBD</div>
          <div className="text-[10px] uppercase tracking-wider mono text-white/30">awaiting Q2</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${flip ? 'flex-row-reverse text-right' : ''}`}>
      <TeamBadge code={code} size="xl" />
      <div>
        <div className="font-display font-semibold text-white text-lg leading-tight">{t.short}</div>
        <div className="text-[10px] uppercase tracking-[0.22em] mono" style={{ color: t.primary }}>{t.name}</div>
        {score && (
          <div className={`mt-1 mono ${winner ? 'text-white' : 'text-white/70'}`}>
            <span className="text-xl tabular-nums">{score.runs}</span>
            <span className="text-white/40">/{score.wickets}</span>
            <span className="text-white/40 text-xs ml-1">({Number(score.overs).toFixed(1)})</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CompletedBody({ match }) {
  const r = match.result;
  const t1 = TEAMS[match.team1];
  const t2 = TEAMS[match.team2];
  return (
    <>
      {/* Summary row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <SummaryCard icon={<Coins size={14} />} label="Toss">
          <span className="text-white">{r.toss.winner}</span>{' '}
          <span className="text-white/55">chose to {r.toss.decision} first</span>
        </SummaryCard>
        <SummaryCard icon={<Crosshair size={14} />} label="Batted First">
          <span className="text-white">{r.battedFirst}</span>
        </SummaryCard>
        <SummaryCard icon={<Sparkles size={14} />} label="Player of the Match">
          <span className="text-white">{r.potm.name}</span>{' '}
          <span className="text-white/45 text-[11px]">({r.potm.team} · {r.potm.role})</span>
        </SummaryCard>
      </div>

      {/* Top performers */}
      <Section title="Top Performers" icon={<Flame size={14} className="text-neon-pink" />}>
        <div className="grid sm:grid-cols-2 gap-3">
          <PerformerColumn team={t1} bat={r.topBatsmen[match.team1]} bowl={r.topBowlers[match.team1]} />
          <PerformerColumn team={t2} bat={r.topBatsmen[match.team2]} bowl={r.topBowlers[match.team2]} />
        </div>
      </Section>

      {/* Turning point */}
      <Section title="Turning Point" icon={<TrendingUp size={14} className="text-neon-cyan" />}>
        <p className="text-sm text-white/75 leading-relaxed">{r.turningPoint}</p>
      </Section>
    </>
  );
}

function PreviewBody({ match }) {
  const p = match.preview || {};
  const t1 = TEAMS[match.team1];
  const t2 = TEAMS[match.team2];
  const teams = Object.keys(p.winPrediction || {});

  return (
    <>
      {p.headline && (
        <div className="text-base text-white/90 leading-snug">{p.headline}</div>
      )}
      {p.stakes && (
        <SummaryCard icon={<Trophy size={14} />} label="Stakes">
          <span className="text-white/80">{p.stakes}</span>
        </SummaryCard>
      )}

      {/* Win prediction wheel */}
      {p.winPrediction && (
        <Section title="Win Probability" icon={<Sparkles size={14} className="text-neon-violet" />}>
          <PredictionWheel prediction={p.winPrediction} />
        </Section>
      )}

      {/* H2H */}
      {p.h2h && (
        <Section title="Head to Head" icon={<Crosshair size={14} className="text-neon-cyan" />}>
          {p.h2h.note ? (
            <p className="text-sm text-white/65">{p.h2h.note}</p>
          ) : (
            <div className="flex items-center gap-6">
              <H2HCell team={t1} wins={p.h2h[match.team1] || 0} />
              <div className="text-white/30 mono text-xs">{p.h2h.played} encounters</div>
              <H2HCell team={t2} wins={p.h2h[match.team2] || 0} />
            </div>
          )}
        </Section>
      )}

      {/* Recent form */}
      {p.seasonForm && (
        <Section title="Last 5 Games" icon={<Flame size={14} className="text-neon-pink" />}>
          <div className="space-y-2">
            {Object.entries(p.seasonForm).map(([code, form]) => (
              <FormRow key={code} code={code} form={form} />
            ))}
          </div>
        </Section>
      )}

      {/* Key matchup */}
      {p.keyMatchup && (
        <Section title="Key Matchup" icon={<TrendingUp size={14} className="text-neon-cyan" />}>
          <p className="text-sm text-white/75 leading-relaxed">{p.keyMatchup}</p>
        </Section>
      )}
    </>
  );
}

function SummaryCard({ icon, label, children }) {
  return (
    <div className="rounded-lg glass px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40 mono">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/55 mono">
        {icon} {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PerformerColumn({ team, bat, bowl }) {
  if (!team) return null;
  return (
    <div className="rounded-lg glass overflow-hidden">
      <div
        className="px-3 py-2 flex items-center gap-2 border-b border-white/5"
        style={{ background: `linear-gradient(90deg, ${team.primary}33, transparent)` }}
      >
        <TeamBadge code={team.code} size="sm" />
        <span className="text-[11px] font-semibold tracking-tight" style={{ color: team.secondary }}>{team.short}</span>
      </div>
      <div className="px-3 py-2.5 space-y-2.5">
        <StatRow
          label="Top Bat"
          name={bat.name}
          primary={`${bat.runs} (${bat.balls})`}
          secondary={`${bat.fours}×4 · ${bat.sixes}×6`}
        />
        <StatRow
          label="Top Bowl"
          name={bowl.name}
          primary={`${bowl.wickets}/${bowl.runs}`}
          secondary={`${bowl.overs} ov`}
        />
      </div>
    </div>
  );
}

function StatRow({ label, name, primary, secondary }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/35 mono">{label}</div>
        <div className="text-sm text-white truncate">{name}</div>
      </div>
      <div className="text-right">
        <div className="mono tabular-nums text-white">{primary}</div>
        <div className="mono text-[10px] text-white/40">{secondary}</div>
      </div>
    </div>
  );
}

function H2HCell({ team, wins }) {
  return (
    <div className="flex items-center gap-2">
      <TeamBadge code={team?.code} size="md" />
      <div>
        <div className="text-xs uppercase tracking-wider mono" style={{ color: team?.primary }}>{team?.code}</div>
        <div className="text-2xl mono tabular-nums font-semibold">{wins}</div>
      </div>
    </div>
  );
}

function FormRow({ code, form }) {
  return (
    <div className="flex items-center gap-3">
      <TeamBadge code={code} size="sm" showName />
      <div className="flex items-center gap-1.5">
        {form.map((r, i) => (
          <span
            key={i}
            className={[
              'w-6 h-6 grid place-items-center rounded mono text-[10px] font-semibold',
              r === 'W' ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
            ].join(' ')}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function PredictionWheel({ prediction }) {
  const entries = Object.entries(prediction);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  let acc = 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  const colorOf = (code) => TEAMS[code]?.primary || (code === 'TBD' ? '#64748B' : '#A78BFA');

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={R} stroke="#1A2236" strokeWidth="14" fill="none" />
          {entries.map(([code, val]) => {
            const frac = val / total;
            const dash = `${frac * C} ${C}`;
            const offset = -acc * C;
            acc += frac;
            return (
              <circle
                key={code}
                cx="70" cy="70" r={R}
                stroke={colorOf(code)}
                strokeWidth="14"
                fill="none"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.2em] mono text-white/40">WIN %</div>
            <div className="font-display font-semibold text-2xl text-white tabular-nums">
              {entries[0][1]}<span className="text-white/40 text-base">/100</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {entries.map(([code, v]) => (
          <div key={code} className="flex items-center gap-2 text-sm">
            <span className="dot" style={{ background: colorOf(code) }} />
            <span className="font-semibold w-12 mono" style={{ color: colorOf(code) }}>{code}</span>
            <span className="text-white/65 mono tabular-nums">{v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
