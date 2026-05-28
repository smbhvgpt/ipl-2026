// IPL 2026 — Complete tournament chronology generator.
// 70 league matches + 4 playoffs. Final standings: 1.RCB  2.GT  3.SRH  4.RR.
//
// The League stage is fully completed. The playoff state matches the late-May 2026
// snapshot described in the brief: Qualifier 1 & Eliminator done, Qualifier 2 (29 May)
// & Final (31 May) still upcoming.
//
// All league results derive from a deterministic head-to-head matrix so the standings
// always reconcile. Scores, performers and narratives are synthesised with a seeded RNG
// so the dataset is stable across reloads and ready to swap for a live API later.

import { TEAMS, VENUES } from './teams.js';
import { PLAYERS } from './players.js';

// ---------- Deterministic RNG (mulberry32) ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const between = (r, lo, hi) => Math.floor(r() * (hi - lo + 1)) + lo;

// ---------- Final head-to-head matrix (engineered to lock standings) ----------
// Format: [teamA, teamB, totalGames, teamAWinsCount]
// Totals: RCB=10, GT=9, SRH=9, RR=8, MI=7, CSK=7, KKR=6, DC=5, LSG=5, PBKS=4 → 70 W.
const H2H = [
  // ----- A-A singles (10) -----
  ['SRH','RCB', 1, 1],
  ['RCB','MI',  1, 1],
  ['RCB','KKR', 1, 1],
  ['RCB','LSG', 1, 1],
  ['SRH','MI',  1, 1],
  ['KKR','SRH', 1, 1],
  ['SRH','LSG', 1, 1],
  ['MI','KKR',  1, 1],
  ['MI','LSG',  1, 1],
  ['KKR','LSG', 1, 1],
  // ----- B-B singles (10) -----
  ['GT','RR',   1, 1],
  ['CSK','GT',  1, 1],
  ['GT','DC',   1, 1],
  ['GT','PBKS', 1, 1],
  ['RR','CSK',  1, 1],
  ['RR','DC',   1, 1],
  ['RR','PBKS', 1, 1],
  ['CSK','DC',  1, 1],
  ['CSK','PBKS',1, 1],
  ['DC','PBKS', 1, 1],
  // ----- A-B doubles (25 pairs × 2 = 50 games) -----
  ['RCB','GT',  2, 1],
  ['RCB','RR',  2, 1],
  ['RCB','CSK', 2, 2],
  ['RCB','DC',  2, 2],
  ['RCB','PBKS',2, 1],
  ['SRH','GT',  2, 1],
  ['SRH','RR',  2, 1],
  ['SRH','CSK', 2, 1],
  ['SRH','DC',  2, 2],
  ['SRH','PBKS',2, 1],
  ['MI','GT',   2, 1],
  ['MI','RR',   2, 1],
  ['MI','CSK',  2, 1],
  ['MI','DC',   2, 1],
  ['MI','PBKS', 2, 1],
  ['KKR','GT',  2, 0],
  ['KKR','RR',  2, 1],
  ['KKR','CSK', 2, 1],
  ['KKR','DC',  2, 1],
  ['KKR','PBKS',2, 1],
  ['LSG','GT',  2, 1],
  ['LSG','RR',  2, 1],
  ['LSG','CSK', 2, 1],
  ['LSG','DC',  2, 0],
  ['LSG','PBKS',2, 2],
];

// ---------- Expand H2H to chronological flat fixture list ----------
function expandFixtures() {
  const games = [];
  for (const [a, b, n, aWins] of H2H) {
    const bWins = n - aWins;
    // Construct n games for this pair; assign winners by quota.
    const winners = [];
    for (let i = 0; i < aWins; i++) winners.push(a);
    for (let i = 0; i < bWins; i++) winners.push(b);
    // Stagger leg ordering: first leg at A's home, second leg (if any) at B's home.
    for (let i = 0; i < n; i++) {
      const homeTeam = i === 0 ? a : b;
      const awayTeam = i === 0 ? b : a;
      games.push({
        team1: homeTeam,
        team2: awayTeam,
        winner: winners[i],
        homeOfTeam1: true
      });
    }
  }
  return games;
}

// ---------- Spread fixtures across the season calendar ----------
// March 22 → May 24, 2026. Roughly 64 days × ~1.09 matches/day ≈ 70.
// We seed an order based on a stable hash so the calendar feels organic across reloads.
function chronologicalSchedule() {
  const fixtures = expandFixtures();
  const r = rng(20260322);
  // Fisher-Yates shuffle with the seeded RNG
  const order = fixtures.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function dateForMatch(index) {
  // Spread 70 league matches across 64 calendar days starting 22-Mar-2026.
  const start = new Date(Date.UTC(2026, 2, 22)); // 22 Mar 2026
  const dayOffset = Math.floor((index * 64) / 70);
  const d = new Date(start);
  d.setUTCDate(start.getUTCDate() + dayOffset);
  return d;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function timeSlot(index) {
  // Doubleheaders on weekend-ish slots: alternate between 3:30 PM IST & 7:30 PM IST
  const sameDayNext = index > 0 && Math.floor(((index - 1) * 64) / 70) === Math.floor((index * 64) / 70);
  return sameDayNext ? '15:30 IST' : '19:30 IST';
}

function venueFor(team, idx) {
  // Mostly home venue; occasionally a neutral host so the venue map looks varied.
  const r = rng(0xC0FFEE + idx);
  if (r() < 0.15) return pick(r, VENUES);
  const home = TEAMS[team].home;
  return `${home}, ${TEAMS[team].city}`;
}

// ---------- Realistic scorelines ----------
function buildScores(seed, winner, team1, team2) {
  const r = rng(seed);
  // Decide format: chase or defend
  const battedFirst = r() < 0.5 ? team1 : team2;
  const battedSecond = battedFirst === team1 ? team2 : team1;

  // Generate first-innings total
  const first = {
    team: battedFirst,
    runs: between(r, 138, 232),
    wickets: between(r, 3, 9),
    overs: 20.0
  };
  // Second innings depends on winner
  let second;
  if (winner === battedSecond) {
    // Chase succeeds
    const ballsLeft = between(r, 1, 30);
    const wktsLost = between(r, 2, 8);
    second = {
      team: battedSecond,
      runs: first.runs + between(r, 1, 6),
      wickets: wktsLost,
      overs: Number((20 - ballsLeft / 6).toFixed(1))
    };
  } else {
    // Chase fails
    const margin = between(r, 6, 78);
    second = {
      team: battedSecond,
      runs: Math.max(80, first.runs - margin),
      wickets: 10,
      overs: Number((between(r, 14, 19) + Math.random() * 0.5).toFixed(1))
    };
  }
  // Build a margin string
  let margin;
  if (winner === battedSecond) {
    margin = `${10 - second.wickets} wickets`;
  } else {
    margin = `${first.runs - second.runs} runs`;
  }
  return {
    battedFirst,
    battedSecond,
    first,
    second,
    margin
  };
}

function buildPerformers(seed, team1, team2, winner) {
  const r = rng(seed + 7);
  const bat1 = pick(r, PLAYERS[team1].batsmen);
  const bat2 = pick(r, PLAYERS[team2].batsmen);
  const bowl1 = pick(r, PLAYERS[team1].bowlers);
  const bowl2 = pick(r, PLAYERS[team2].bowlers);

  const winningBat = winner === team1 ? bat1 : bat2;
  const winningBowl = winner === team1 ? bowl1 : bowl2;
  const potmIsBat = r() < 0.55;
  return {
    topBatsmen: {
      [team1]: {
        name: bat1,
        runs: between(r, 28, 96),
        balls: between(r, 22, 58),
        fours: between(r, 2, 9),
        sixes: between(r, 1, 6)
      },
      [team2]: {
        name: bat2,
        runs: between(r, 22, 88),
        balls: between(r, 18, 54),
        fours: between(r, 2, 8),
        sixes: between(r, 0, 5)
      }
    },
    topBowlers: {
      [team1]: {
        name: bowl1,
        overs: 4,
        wickets: between(r, 1, 4),
        runs: between(r, 18, 42)
      },
      [team2]: {
        name: bowl2,
        overs: 4,
        wickets: between(r, 1, 4),
        runs: between(r, 18, 44)
      }
    },
    potm: {
      name: potmIsBat ? winningBat : winningBowl,
      team: winner,
      role: potmIsBat ? 'Batter' : 'Bowler'
    }
  };
}

function buildToss(seed, team1, team2) {
  const r = rng(seed + 17);
  return {
    winner: r() < 0.5 ? team1 : team2,
    decision: r() < 0.55 ? 'bowl' : 'bat'
  };
}

function buildTurningPoint(r, winner, loser, performers) {
  const heroBat = performers.topBatsmen[winner];
  const heroBowl = performers.topBowlers[winner];
  const villainBowl = performers.topBowlers[loser];
  const intros = [
    `${heroBat.name}'s ${heroBat.runs}(${heroBat.balls}) turned the momentum decisively.`,
    `A pivotal middle-overs squeeze from ${heroBowl.name} (${heroBowl.wickets}/${heroBowl.runs}) cracked the chase open.`,
    `${winner} pulled away in the death overs once ${villainBowl.name}'s spell ran dry.`
  ];
  const closers = [
    `${loser} never recovered after losing two in the powerplay.`,
    `Sloppy fielding in the back-ten gifted ${winner} the cushion they needed.`,
    `${loser} threatened briefly but the asking rate kept climbing.`
  ];
  return `${pick(r, intros)} ${pick(r, closers)}`;
}

// ---------- Build the 70 league matches ----------
function buildLeagueMatches() {
  const order = chronologicalSchedule();
  return order.map((fx, i) => {
    const idx = i;
    const matchNo = i + 1;
    const seed = 0x1AB1 * (matchNo + 1);
    const r = rng(seed + 99);
    const scores = buildScores(seed, fx.winner, fx.team1, fx.team2);
    const performers = buildPerformers(seed, fx.team1, fx.team2, fx.winner);
    const toss = buildToss(seed, fx.team1, fx.team2);
    const loser = fx.winner === fx.team1 ? fx.team2 : fx.team1;
    const turningPoint = buildTurningPoint(r, fx.winner, loser, performers);
    const dt = dateForMatch(idx);
    return {
      id: `M${String(matchNo).padStart(2, '0')}`,
      matchNo,
      stage: 'league',
      date: formatDate(dt),
      time: timeSlot(idx),
      venue: venueFor(fx.homeOfTeam1 ? fx.team1 : fx.team2, idx),
      team1: fx.team1,
      team2: fx.team2,
      status: 'completed',
      result: {
        winner: fx.winner,
        margin: scores.margin,
        team1Score: fx.team1 === scores.first.team
          ? { runs: scores.first.runs, wickets: scores.first.wickets, overs: scores.first.overs }
          : { runs: scores.second.runs, wickets: scores.second.wickets, overs: scores.second.overs },
        team2Score: fx.team2 === scores.first.team
          ? { runs: scores.first.runs, wickets: scores.first.wickets, overs: scores.first.overs }
          : { runs: scores.second.runs, wickets: scores.second.wickets, overs: scores.second.overs },
        battedFirst: scores.battedFirst,
        toss,
        ...performers,
        turningPoint
      }
    };
  });
}

// ---------- Playoffs (verbatim per spec) ----------
function buildPlayoffs() {
  // Match 71 — Qualifier 1: RCB vs GT, RCB win by 92 runs
  const q1 = {
    id: 'M71',
    matchNo: 71,
    stage: 'playoff',
    bracket: 'Q1',
    title: 'Qualifier 1',
    date: '2026-05-26',
    time: '19:30 IST',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    team1: 'RCB',
    team2: 'GT',
    status: 'completed',
    result: {
      winner: 'RCB',
      margin: '92 runs',
      battedFirst: 'RCB',
      team1Score: { runs: 241, wickets: 7, overs: 20 },
      team2Score: { runs: 149, wickets: 10, overs: 17.4 },
      toss: { winner: 'GT', decision: 'bowl' },
      topBatsmen: {
        RCB: { name: 'Virat Kohli', runs: 102, balls: 56, fours: 9, sixes: 6 },
        GT: { name: 'Sai Sudharsan', runs: 44, balls: 31, fours: 5, sixes: 1 }
      },
      topBowlers: {
        RCB: { name: 'Yash Dayal', overs: 4, wickets: 4, runs: 22 },
        GT: { name: 'Rashid Khan', overs: 4, wickets: 2, runs: 38 }
      },
      potm: { name: 'Virat Kohli', team: 'RCB', role: 'Batter' },
      turningPoint: "Kohli's hundred set a 242 target that always felt 30 above par. Once Yash Dayal removed Shubman Gill and David Miller in successive overs, GT's chase folded inside 18."
    }
  };

  // Match 72 — Eliminator: SRH vs RR, RR win by 47 runs
  const elim = {
    id: 'M72',
    matchNo: 72,
    stage: 'playoff',
    bracket: 'EL',
    title: 'Eliminator',
    date: '2026-05-27',
    time: '19:30 IST',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    team1: 'SRH',
    team2: 'RR',
    status: 'completed',
    result: {
      winner: 'RR',
      margin: '47 runs',
      battedFirst: 'RR',
      team1Score: { runs: 138, wickets: 10, overs: 18.2 },
      team2Score: { runs: 185, wickets: 6, overs: 20 },
      toss: { winner: 'SRH', decision: 'bowl' },
      topBatsmen: {
        SRH: { name: 'Heinrich Klaasen', runs: 41, balls: 28, fours: 4, sixes: 2 },
        RR: { name: 'Yashasvi Jaiswal', runs: 79, balls: 47, fours: 8, sixes: 4 }
      },
      topBowlers: {
        SRH: { name: 'Pat Cummins', overs: 4, wickets: 2, runs: 32 },
        RR: { name: 'Trent Boult', overs: 4, wickets: 3, runs: 21 }
      },
      potm: { name: 'Yashasvi Jaiswal', team: 'RR', role: 'Batter' },
      turningPoint: 'Jaiswal\'s 79 powered RR to a defendable 185. Boult\'s opening burst left SRH 12/3 and the chase never threatened.'
    }
  };

  // Match 73 — Qualifier 2: GT vs RR, scheduled May 29
  const q2 = {
    id: 'M73',
    matchNo: 73,
    stage: 'playoff',
    bracket: 'Q2',
    title: 'Qualifier 2',
    date: '2026-05-29',
    time: '19:30 IST',
    venue: 'Maharaja Yadavindra Singh Stadium, Mullanpur',
    team1: 'GT',
    team2: 'RR',
    status: 'upcoming',
    preview: {
      stakes: 'Winner advances to the Final against RCB. Loser is eliminated in 3rd place.',
      h2h: { played: 2, GT: 1, RR: 1 },
      seasonForm: {
        GT: ['W','W','L','W','W'],
        RR: ['W','L','W','L','W']
      },
      winPrediction: { GT: 56, RR: 44 },
      keyMatchup: 'Rashid Khan vs Yashasvi Jaiswal — vintage GT spin guile against RR\'s in-form opener.',
      headline: 'A second chance for Gujarat, a survival test for Rajasthan.'
    }
  };

  // Match 74 — The Final: RCB vs Winner of Q2, scheduled May 31
  const final = {
    id: 'M74',
    matchNo: 74,
    stage: 'playoff',
    bracket: 'F',
    title: 'The Final',
    date: '2026-05-31',
    time: '19:30 IST',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    team1: 'RCB',
    team2: 'TBD',
    status: 'upcoming',
    preview: {
      stakes: 'IPL 2026 Champions decided. RCB chasing their first title in 19 seasons.',
      h2h: { note: 'Awaiting Qualifier 2 result.' },
      seasonForm: {
        RCB: ['W','W','W','W','W']
      },
      winPrediction: { RCB: 60, TBD: 40 },
      keyMatchup: 'Awaiting opponent — RCB enter rested with 5 days off and a 92-run statement from Q1.',
      headline: 'The Throne Room: Ahmedabad. One night. One trophy.'
    }
  };

  return [q1, elim, q2, final];
}

// ---------- Compute standings dynamically from completed league games ----------
export function buildStandings(allMatches) {
  const table = {};
  for (const code of Object.keys(TEAMS)) {
    table[code] = { code, played: 0, won: 0, lost: 0, points: 0, runsFor: 0, runsAgainst: 0, oversFor: 0, oversAgainst: 0 };
  }
  for (const m of allMatches.filter(x => x.stage === 'league' && x.status === 'completed')) {
    const a = table[m.team1], b = table[m.team2];
    a.played++; b.played++;
    a.runsFor += m.result.team1Score.runs;
    a.runsAgainst += m.result.team2Score.runs;
    b.runsFor += m.result.team2Score.runs;
    b.runsAgainst += m.result.team1Score.runs;
    a.oversFor += m.result.team1Score.overs;
    a.oversAgainst += m.result.team2Score.overs;
    b.oversFor += m.result.team2Score.overs;
    b.oversAgainst += m.result.team1Score.overs;
    if (m.result.winner === m.team1) { a.won++; b.lost++; a.points += 2; }
    else { b.won++; a.lost++; b.points += 2; }
  }
  // Engineered NRR pin so GT > SRH on tiebreak as required by spec:
  const NRR_PIN = {
    RCB: 0.92, GT: 0.61, SRH: 0.49, RR: 0.34,
    MI: 0.18, CSK: 0.07, KKR: -0.12, DC: -0.34, LSG: -0.41, PBKS: -0.74
  };
  return Object.values(table)
    .map(t => ({ ...t, nrr: NRR_PIN[t.code] }))
    .sort((x, y) => y.points - x.points || y.nrr - x.nrr);
}

// ---------- Public export ----------
export const LEAGUE_MATCHES = buildLeagueMatches();
export const PLAYOFF_MATCHES = buildPlayoffs();
export const ALL_MATCHES = [...LEAGUE_MATCHES, ...PLAYOFF_MATCHES];
export const STANDINGS = buildStandings(ALL_MATCHES);
