import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, LayoutGrid, GitBranch, Sparkles, Calendar, History, Flame, Map } from 'lucide-react';
import TeamBadge from './TeamBadge.jsx';
import { TEAM_CODES, TEAMS } from '../data/teams.js';

const STAGES = [
  { id: 'all', label: 'All Matches', icon: LayoutGrid },
  { id: 'league', label: 'League Phase', icon: History },
  { id: 'playoff', label: 'Playoffs', icon: Sparkles },
  { id: 'remaining', label: 'Remaining', icon: Flame }
];

const JUMPS = [
  { id: 'opening', label: 'Day 1' },
  { id: 'mid', label: 'Mid-Season' },
  { id: 'current', label: 'Playoff Phase' }
];

export default function FilterBar({
  view, onViewChange,
  stage, onStageChange,
  teamFilter, onTeamFilter,
  onJump,
  soundOn, onToggleSound
}) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-midnight/80 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
        {/* Row 1 — view toggle + sound */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={onViewChange} />
          </div>
          <div className="flex items-center gap-2">
            {JUMPS.map(j => (
              <button
                key={j.id}
                onClick={() => onJump(j.id)}
                className="text-[11px] mono uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-md text-white/55 hover:text-white hover:bg-white/5 transition border border-white/5"
              >
                <span className="inline-flex items-center gap-1"><Calendar size={11} />{j.label}</span>
              </button>
            ))}
            <button
              onClick={onToggleSound}
              title={soundOn ? 'Mute sounds' : 'Unmute sounds'}
              className="ml-1 grid place-items-center w-8 h-8 rounded-md text-white/55 hover:text-white hover:bg-white/5 border border-white/5 transition"
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        {/* Row 2 — stage filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STAGES.map(s => {
            const Icon = s.icon;
            const active = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onStageChange(s.id)}
                className={[
                  'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition border',
                  active
                    ? 'text-white border-neon-cyan/40 bg-neon-cyan/10 shadow-glow'
                    : 'text-white/55 border-white/8 hover:border-white/15 hover:text-white/85'
                ].join(' ')}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
          <div className="h-5 w-px bg-white/10 mx-1" />
          {/* Team filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/35 mono mr-1">Track</span>
            {TEAM_CODES.map(code => {
              const isActive = teamFilter === code;
              const t = TEAMS[code];
              return (
                <motion.button
                  key={code}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onTeamFilter(isActive ? null : code)}
                  className={[
                    'rounded-md p-0.5 transition',
                    isActive ? 'ring-2' : 'ring-1 ring-white/8 hover:ring-white/25'
                  ].join(' ')}
                  style={isActive ? { boxShadow: `0 0 0 2px ${t.primary}99`, borderColor: t.primary } : undefined}
                  title={t.name}
                >
                  <TeamBadge code={code} size="xs" />
                </motion.button>
              );
            })}
            {teamFilter && (
              <button
                onClick={() => onTeamFilter(null)}
                className="ml-1 text-[10px] mono uppercase tracking-[0.18em] text-white/45 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ view, onViewChange }) {
  return (
    <div className="relative inline-flex p-1 rounded-lg glass border border-white/5">
      {[
        { id: 'bracket', label: 'Playoff Tree', icon: GitBranch },
        { id: 'stream', label: 'League Stream', icon: LayoutGrid },
        { id: 'flowchart', label: 'Tournament Map', icon: Map }
      ].map(opt => {
        const active = view === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => onViewChange(opt.id)}
            className={[
              'relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[12px] font-medium transition',
              active ? 'text-midnight' : 'text-white/65 hover:text-white'
            ].join(' ')}
          >
            {active && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 rounded-md bg-gradient-to-r from-neon-cyan to-neon-violet"
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              <Icon size={13} />
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
