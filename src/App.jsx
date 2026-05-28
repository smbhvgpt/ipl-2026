import React, { useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import LeagueStreamView from './components/LeagueStreamView.jsx';
import PlayoffBracketView from './components/PlayoffBracketView.jsx';
import TournamentFlowchart from './components/TournamentFlowchart.jsx';
import MatchDetailDrawer from './components/MatchDetailDrawer.jsx';
import PointsTable from './components/PointsTable.jsx';
import Confetti from './components/Confetti.jsx';
import { ALL_MATCHES, LEAGUE_MATCHES, PLAYOFF_MATCHES, STANDINGS } from './data/matches.js';
import { playClick, playWhoosh } from './utils/sounds.js';

export default function App() {
  const [view, setView] = useState('bracket'); // 'flowchart' | 'stream' | 'bracket'
  const [stage, setStage] = useState('all'); // 'all' | 'league' | 'playoff' | 'remaining'
  const [teamFilter, setTeamFilter] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [confettiTick, setConfettiTick] = useState(0);

  const jumpAnchorRefs = useRef({});
  const playoffSectionRef = useRef(null);

  // Active match list (drives the League Stream)
  const visibleMatches = useMemo(() => {
    let pool = ALL_MATCHES;
    if (stage === 'league') pool = LEAGUE_MATCHES;
    else if (stage === 'playoff') pool = PLAYOFF_MATCHES;
    else if (stage === 'remaining') pool = ALL_MATCHES.filter(m => m.status === 'upcoming');
    return pool;
  }, [stage]);

  // Highlighted matches (when a team filter is active, dim others)
  const handleSelectMatch = (m) => {
    playClick(soundOn);
    setActiveMatch(m);
  };
  const handleCloseDrawer = () => {
    playWhoosh(soundOn);
    setActiveMatch(null);
  };

  // Burst confetti when a completed knockout node is selected
  React.useEffect(() => {
    if (!activeMatch) return;
    if (activeMatch.stage === 'playoff' && activeMatch.status === 'completed') {
      setConfettiTick(t => t + 1);
    }
  }, [activeMatch?.id]);

  const handleJump = (id) => {
    if (id === 'current') {
      // Jump to playoff section regardless of current view; flip view if needed.
      setView('bracket');
      requestAnimationFrame(() => {
        playoffSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    // Anchors apply to League Stream
    if (view !== 'stream') setView('stream');
    requestAnimationFrame(() => {
      const el = jumpAnchorRefs.current[id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleChampionTap = () => {
    setConfettiTick(t => t + 1);
    playWhoosh(soundOn);
  };

  // Compose what each view receives
  const streamMatches = useMemo(() => {
    // For stream we always render chronologically.
    return [...visibleMatches].sort((a, b) =>
      a.date === b.date ? a.matchNo - b.matchNo : a.date.localeCompare(b.date)
    );
  }, [visibleMatches]);

  return (
    <div className="min-h-screen text-white">
      <Header />
      <FilterBar
        view={view}
        onViewChange={(v) => { playClick(soundOn); setView(v); }}
        stage={stage}
        onStageChange={(s) => { playClick(soundOn); setStage(s); }}
        teamFilter={teamFilter}
        onTeamFilter={(t) => { playClick(soundOn); setTeamFilter(t); }}
        onJump={handleJump}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn(v => !v)}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'flowchart' ? (
          <TournamentFlowchart
            allMatches={ALL_MATCHES}
            leagueMatches={LEAGUE_MATCHES}
            playoffMatches={PLAYOFF_MATCHES}
            onSelectMatch={handleSelectMatch}
            teamFilter={teamFilter}
          />
        ) : view === 'stream' ? (
          <div className="grid xl:grid-cols-[1fr_360px] gap-6">
            <LeagueStreamView
              matches={streamMatches}
              onSelectMatch={handleSelectMatch}
              teamFilter={teamFilter}
              highlightId={activeMatch?.id}
              jumpAnchorRefs={jumpAnchorRefs}
            />
            <aside className="hidden xl:block">
              <div className="sticky top-[120px] space-y-4">
                <PointsTable
                  standings={STANDINGS}
                  teamFilter={teamFilter}
                  highlightCodes={teamFilter ? [teamFilter] : []}
                />
                <MiniBracket onJump={() => handleJump('current')} />
              </div>
            </aside>
          </div>
        ) : (
          <div ref={playoffSectionRef} className="space-y-6">
            <PlayoffBracketView
              playoffs={PLAYOFF_MATCHES}
              onSelectMatch={handleSelectMatch}
              teamFilter={teamFilter}
              onChampionTap={handleChampionTap}
            />
            <PointsTable
              standings={STANDINGS}
              teamFilter={teamFilter}
              highlightCodes={teamFilter ? [teamFilter] : ['RCB','GT','SRH','RR']}
            />
          </div>
        )}
      </main>

      <Footer />

      <MatchDetailDrawer match={activeMatch} onClose={handleCloseDrawer} />
      <Confetti trigger={confettiTick} />
    </div>
  );
}

function MiniBracket({ onJump }) {
  return (
    <button
      onClick={onJump}
      className="w-full text-left rounded-xl glass neon-border p-4 lift relative overflow-hidden group"
    >
      <span className="scanline" />
      <div className="text-[10px] tracking-[0.22em] mono text-white/40 uppercase">Live phase</div>
      <div className="font-display font-semibold text-lg mt-0.5">Playoffs in motion</div>
      <p className="text-sm text-white/55 mt-1 leading-relaxed">
        Q2 (GT vs RR) is 24 hours out. RCB are already in the Final. Tap to open the bracket.
      </p>
      <div className="mt-3 text-[11px] mono uppercase tracking-[0.22em] text-neon-cyan group-hover:translate-x-1 transition">
        Open Playoff Tree →
      </div>
    </button>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-3 flex-wrap text-[11px] text-white/40">
        <div className="mono tracking-[0.18em] uppercase">
          IPL 2026 · Tournament Chronology · Frontend demo
        </div>
        <div className="mono">
          Mock data layer ready for live API swap
        </div>
      </div>
    </footer>
  );
}
