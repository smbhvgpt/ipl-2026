import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, Trophy, Crown, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import TeamBadge from './TeamBadge.jsx';
import { TEAMS, TEAM_CODES } from '../data/teams.js';
import { STANDINGS } from '../data/matches.js';

// ─── Fixture Matrix Cell ───
function FixtureCell({ matches, teamA, teamB, onClick, teamFilter }) {
  if (teamA === teamB) return (
    <td className="w-[72px] h-[52px] bg-white/[0.02]" />
  );
  if (!matches || matches.length === 0) return (
    <td className="w-[72px] h-[52px] bg-ink/50 border border-white/[0.04]">
      <div className="text-[8px] text-white/15 text-center">—</div>
    </td>
  );

  const dim = teamFilter && teamFilter !== teamA && teamFilter !== teamB;

  return (
    <td className={`w-[72px] h-[52px] border border-white/[0.04] p-0 ${dim ? 'opacity-20' : ''}`}>
      <div className="flex flex-col gap-0.5 p-1 h-full justify-center">
        {matches.map((m, i) => {
          const won = m.result?.winner === teamA;
          const lost = m.result?.winner === teamB;
          return (
            <button
              key={m.id}
              onClick={() => onClick?.(m)}
              className={[
                'w-full rounded text-center py-0.5 text-[8px] mono font-semibold transition-all',
                'hover:ring-1 hover:ring-white/30 cursor-pointer',
                won ? 'bg-emerald-500/20 text-emerald-300' :
                lost ? 'bg-rose-500/15 text-rose-300' :
                'bg-neon-cyan/10 text-neon-cyan'
              ].join(' ')}
              title={`#${m.matchNo}: ${m.team1} vs ${m.team2}${m.result ? ` — ${m.result.winner} won by ${m.result.margin}` : ' (upcoming)'}`}
            >
              {m.result ? (
                <>{won ? 'W' : 'L'} <span className="text-white/30">#{m.matchNo}</span></>
              ) : (
                <>TBD</>
              )}
            </button>
          );
        })}
      </div>
    </td>
  );
}

// ─── Playoff Node ───
function PlayoffNode({ match, onClick, teamFilter }) {
  const isCompleted = match.status === 'completed';
  const winner = isCompleted ? match.result.winner : null;
  const dim = teamFilter && match.team1 !== teamFilter && match.team2 !== teamFilter;

  return (
    <button
      onClick={() => onClick?.(match)}
      className={[
        'relative rounded-xl text-left transition-all duration-200 w-[220px]',
        'bg-gradient-to-b from-slatex/95 to-ink/95 border',
        isCompleted ? 'border-emerald-500/30' : 'border-neon-cyan/30',
        'hover:border-white/25 hover:shadow-lg hover:shadow-neon-violet/15',
        dim ? 'opacity-20' : ''
      ].join(' ')}
      style={{ padding: '10px 12px' }}
    >
      {!isCompleted && <span className="scanline" />}
      <div className="flex items-center justify-between text-[9px] tracking-[0.18em] mono text-white/40 uppercase mb-2">
        <span>{match.title}</span>
        <span className={isCompleted ? 'text-emerald-400' : 'text-neon-cyan'}>
          {isCompleted ? 'FT' : 'UPCOMING'}
        </span>
      </div>
      {[match.team1, match.team2].map(code => {
        const t = code === 'TBD' ? null : TEAMS[code];
        const isWinner = winner === code;
        return (
          <div key={code} className={`flex items-center justify-between gap-2 px-2 py-1 rounded ${isWinner ? 'bg-white/[0.04] ring-1 ring-white/10' : ''} mb-1`}>
            <div className="flex items-center gap-1.5">
              <TeamBadge code={code} size="sm" />
              <span className={`text-[11px] font-semibold ${isWinner ? 'text-white' : 'text-white/65'}`}>
                {t ? t.short : 'TBD'}
              </span>
              {isWinner && <Crown size={10} className="text-neon-gold" />}
            </div>
            {isCompleted && match.result && (
              <span className={`mono text-[10px] tabular-nums ${isWinner ? 'text-white' : 'text-white/40'}`}>
                {code === match.team1 ? `${match.result.team1Score.runs}/${match.result.team1Score.wickets}` : `${match.result.team2Score.runs}/${match.result.team2Score.wickets}`}
              </span>
            )}
          </div>
        );
      })}
      <div className="mt-1.5 pt-1 border-t border-white/[0.05] text-[8px] mono text-white/30">
        {match.date} · {match.time} · #{match.matchNo}
      </div>
    </button>
  );
}

// ─── Main Component ───
export default function TournamentFlowchart({ allMatches, leagueMatches, playoffMatches, onSelectMatch, teamFilter }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Build fixture matrix: for each pair of teams, find their matches
  const fixtureMatrix = useMemo(() => {
    const matrix = {};
    for (const a of TEAM_CODES) {
      matrix[a] = {};
      for (const b of TEAM_CODES) {
        matrix[a][b] = [];
      }
    }
    for (const m of leagueMatches) {
      matrix[m.team1][m.team2].push(m);
      matrix[m.team2][m.team1].push(m);
    }
    return matrix;
  }, [leagueMatches]);

  // Team win/loss record for the matrix header
  const teamRecords = useMemo(() => {
    const rec = {};
    for (const row of STANDINGS) {
      rec[row.code] = row;
    }
    return rec;
  }, []);

  // Sort teams by standings
  const sortedTeams = useMemo(() => STANDINGS.map(r => r.code), []);
  const top4 = sortedTeams.slice(0, 4);

  // Zoom
  const handleZoom = useCallback((delta) => {
    setScale(s => Math.min(1.5, Math.max(0.3, s + delta)));
  }, []);
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? -0.08 : 0.08);
    }
  }, [handleZoom]);
  const resetView = useCallback(() => { setScale(0.85); setPanOffset({ x: 0, y: 0 }); }, []);

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('td')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y };
  }, [panOffset]);
  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPanOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y)
    });
  }, [isPanning]);
  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div className="relative rounded-xl glass neon-border overflow-hidden" style={{ minHeight: '80vh' }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-ink/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.32em] mono text-white/40 uppercase">Full Tournament Structure</div>
          <h2 className="font-display font-semibold text-xl text-gradient">IPL 2026 · Fixture Chart</h2>
          <p className="text-[11px] text-white/45 mt-0.5">Head-to-head matrix → Top 4 qualification → Playoff bracket → Champion</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => handleZoom(0.15)} className="zoom-btn" title="Zoom in"><ZoomIn size={15} /></button>
          <span className="text-[10px] mono text-white/50 w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={() => handleZoom(-0.15)} className="zoom-btn" title="Zoom out"><ZoomOut size={15} /></button>
          <button onClick={resetView} className="zoom-btn ml-1" title="Reset"><Maximize2 size={15} /></button>
          <div className="ml-2 flex items-center gap-1 text-[9px] mono text-white/30 uppercase tracking-wider">
            <Move size={11} /> Drag to pan
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: 'calc(80vh - 80px)', cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${panOffset.x / scale}px, ${panOffset.y / scale}px)`,
            transformOrigin: 'top center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            padding: '40px 40px 120px',
            width: 'fit-content',
            margin: '0 auto'
          }}
        >
          {/* ═══ SECTION 1: LEAGUE STAGE FIXTURE MATRIX ═══ */}
          <div className="mb-8">
            <div className="mb-4">
              <div className="text-[10px] tracking-[0.32em] mono text-neon-cyan/50 uppercase">70 Matches · Round Robin</div>
              <h3 className="font-display font-bold text-2xl text-gradient mt-0.5">League Stage — Head-to-Head Results</h3>
              <p className="text-[12px] text-white/40 mt-1">Each cell shows match result(s) between row team vs column team. <span className="text-emerald-300">W</span> = row team won, <span className="text-rose-300">L</span> = row team lost. Click any cell for details.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="border-collapse" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-ink px-3 py-2 text-left text-[9px] mono text-white/30 uppercase tracking-wider w-[140px]">
                      Team
                    </th>
                    {sortedTeams.map(code => {
                      const t = TEAMS[code];
                      const inTop4 = top4.includes(code);
                      return (
                        <th key={code} className="px-1 py-2 text-center w-[72px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <TeamBadge code={code} size="xs" />
                            <span className={`text-[9px] mono font-semibold ${inTop4 ? 'text-neon-gold' : 'text-white/50'}`}>{code}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-2 text-center text-[9px] mono text-white/30 w-[50px]">W</th>
                    <th className="px-2 py-2 text-center text-[9px] mono text-white/30 w-[50px]">L</th>
                    <th className="px-2 py-2 text-center text-[9px] mono text-white/30 w-[50px]">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((rowCode, ri) => {
                    const t = TEAMS[rowCode];
                    const rec = teamRecords[rowCode];
                    const inTop4 = ri < 4;
                    const dimRow = teamFilter && teamFilter !== rowCode;
                    return (
                      <tr key={rowCode} className={`${inTop4 ? 'bg-neon-gold/[0.02]' : ''} ${dimRow ? 'opacity-30' : ''}`}>
                        <td className={`sticky left-0 z-10 bg-ink px-3 py-1.5 border-b border-white/[0.04] ${inTop4 ? 'bg-gradient-to-r from-neon-gold/[0.06] to-ink' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] mono font-bold w-4 text-right ${inTop4 ? 'text-neon-gold' : 'text-white/30'}`}>{ri + 1}</span>
                            <TeamBadge code={rowCode} size="sm" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white truncate">{t.short}</div>
                              <div className="text-[8px] mono uppercase" style={{ color: t.primary }}>{t.code}</div>
                            </div>
                          </div>
                        </td>
                        {sortedTeams.map(colCode => (
                          <FixtureCell
                            key={colCode}
                            matches={fixtureMatrix[rowCode][colCode]}
                            teamA={rowCode}
                            teamB={colCode}
                            onClick={onSelectMatch}
                            teamFilter={teamFilter}
                          />
                        ))}
                        <td className="px-2 py-1 text-center mono text-[11px] text-emerald-300 font-semibold border-b border-white/[0.04]">{rec.won}</td>
                        <td className="px-2 py-1 text-center mono text-[11px] text-rose-300 border-b border-white/[0.04]">{rec.lost}</td>
                        <td className="px-2 py-1 text-center mono text-[11px] text-white font-bold border-b border-white/[0.04]">{rec.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-[10px] mono text-white/40">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" /> Win</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/15 border border-rose-500/30" /> Loss</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-neon-cyan/10 border border-neon-cyan/30" /> Upcoming</span>
              <span className="text-white/25">|</span>
              <span className="text-neon-gold">Gold rows = Top 4 (qualify for Playoffs)</span>
            </div>
          </div>

          {/* ═══ SECTION 2: QUALIFICATION FUNNEL ═══ */}
          <div className="my-12 relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-neon-gold/40 to-transparent" />
            <div className="relative flex justify-center">
              <div className="bg-ink px-8 py-5 rounded-2xl border border-neon-gold/30 text-center">
                <div className="text-[10px] tracking-[0.32em] mono text-neon-gold/70 uppercase">League Stage Complete</div>
                <div className="font-display font-bold text-xl text-gradient mt-1">Top 4 Qualify for Playoffs</div>
                <div className="mt-4 flex items-center justify-center gap-6">
                  {top4.map((code, i) => {
                    const t = TEAMS[code];
                    const rec = teamRecords[code];
                    return (
                      <div key={code} className="flex items-center gap-2">
                        <span className="text-[11px] mono text-neon-gold font-bold">#{i + 1}</span>
                        <TeamBadge code={code} size="md" />
                        <div>
                          <div className="text-[12px] font-semibold text-white">{t.short}</div>
                          <div className="text-[9px] mono text-white/40">{rec.won}W {rec.lost}L · NRR {rec.nrr > 0 ? '+' : ''}{rec.nrr.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-[10px] text-white/30">6 teams eliminated: {sortedTeams.slice(4).map(c => TEAMS[c].short).join(', ')}</div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <ChevronDown size={28} className="text-neon-gold/50 animate-floaty" />
            </div>
          </div>

          {/* ═══ SECTION 3: PLAYOFF BRACKET ═══ */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="text-[10px] tracking-[0.32em] mono text-neon-violet/50 uppercase">4 Matches · Double Elimination Ladder</div>
              <h3 className="font-display font-bold text-2xl text-gradient mt-0.5">Playoffs → Champion</h3>
              <p className="text-[12px] text-white/40 mt-1">#1 vs #2 get two chances. #3 vs #4 is do-or-die. Lines show the progression path.</p>
            </div>

            {playoffMatches.length >= 4 && (
              <PlayoffBracket
                q1={playoffMatches[0]}
                el={playoffMatches[1]}
                q2={playoffMatches[2]}
                fin={playoffMatches[3]}
                teamFilter={teamFilter}
                onClick={onSelectMatch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Playoff Bracket (horizontal flow) ───
function PlayoffBracket({ q1, el, q2, fin, teamFilter, onClick }) {
  const q1Winner = q1.result?.winner;
  const q1Loser = q1.team1 === q1Winner ? q1.team2 : q1.team1;
  const elWinner = el.result?.winner;

  return (
    <div className="flex items-start gap-6 overflow-x-auto pb-4">
      {/* Column 1: Q1 + Eliminator */}
      <div className="flex flex-col gap-8 shrink-0">
        <div className="text-center">
          <div className="text-[9px] mono text-white/25 uppercase tracking-[0.18em] mb-2">#1 vs #2</div>
          <PlayoffNode match={q1} onClick={onClick} teamFilter={teamFilter} />
          <div className="mt-1 text-[8px] mono text-emerald-400/50">Winner → Final</div>
          <div className="text-[8px] mono text-white/20">Loser → Qualifier 2</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] mono text-white/25 uppercase tracking-[0.18em] mb-2">#3 vs #4</div>
          <PlayoffNode match={el} onClick={onClick} teamFilter={teamFilter} />
          <div className="mt-1 text-[8px] mono text-emerald-400/50">Winner → Qualifier 2</div>
          <div className="text-[8px] mono text-rose-400/40">Loser eliminated</div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center justify-center shrink-0 pt-16" style={{ minHeight: 360 }}>
        <svg width="80" height="280" className="shrink-0">
          <defs>
            <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Q1 loser → Q2 */}
          <path d="M0,40 C40,40 40,140 80,140" fill="none" stroke="url(#arrowGrad)" strokeWidth="2" strokeDasharray="5 3" />
          <text x="15" y="30" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">LOSER</text>
          {/* EL winner → Q2 */}
          <path d="M0,240 C40,240 40,140 80,140" fill="none" stroke="url(#arrowGrad)" strokeWidth="2" />
          <text x="10" y="250" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">WINNER</text>
        </svg>
      </div>

      {/* Column 2: Q2 */}
      <div className="flex flex-col items-center justify-center shrink-0" style={{ paddingTop: 100 }}>
        <div className="text-[9px] mono text-white/25 uppercase tracking-[0.18em] mb-2 text-center">
          {q1Loser && elWinner ? `${TEAMS[q1Loser]?.short} vs ${TEAMS[elWinner]?.short}` : 'Loser Q1 vs Winner EL'}
        </div>
        <PlayoffNode match={q2} onClick={onClick} teamFilter={teamFilter} />
        <div className="mt-1 text-[8px] mono text-emerald-400/50">Winner → Final</div>
      </div>

      {/* Arrow to Final */}
      <div className="flex items-center justify-center shrink-0" style={{ paddingTop: 120 }}>
        <svg width="80" height="60">
          <defs>
            <linearGradient id="arrowGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <line x1="0" y1="30" x2="65" y2="30" stroke="url(#arrowGrad2)" strokeWidth="2" />
          <polygon points="67,24 80,30 67,36" fill="#FBBF24" fillOpacity="0.5" />
        </svg>
      </div>

      {/* Column 3: Final + Champion */}
      <div className="flex flex-col items-center shrink-0" style={{ paddingTop: 80 }}>
        <div className="text-[9px] mono text-neon-gold/50 uppercase tracking-[0.18em] mb-2 flex items-center gap-1">
          <Trophy size={10} className="text-neon-gold" /> The Final
        </div>
        <PlayoffNode match={fin} onClick={onClick} teamFilter={teamFilter} />

        {/* Champion */}
        <div className="mt-6 text-center bg-gradient-to-br from-neon-gold/10 via-neon-violet/10 to-neon-pink/10 rounded-2xl p-6 border border-neon-gold/30 ring-1 ring-neon-gold/20 w-[220px]">
          <Crown size={28} className="mx-auto text-neon-gold animate-floaty" />
          <div className="mt-2 font-display font-bold text-lg text-gradient">CHAMPION</div>
          <div className="mt-1 text-[10px] text-white/40">IPL 2026</div>
          <div className="mt-1 text-[9px] mono text-neon-gold/50 uppercase tracking-[0.18em]">Awaiting Final</div>
        </div>
      </div>
    </div>
  );
}
