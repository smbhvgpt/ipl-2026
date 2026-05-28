// IPL 2026 — Franchise master data
// Each team has brand accents used to dynamically theme cards, badges, and bracket nodes.

export const TEAMS = {
  RCB: {
    code: 'RCB',
    name: 'Royal Challengers Bengaluru',
    short: 'Bengaluru',
    home: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    primary: '#E2231A',   // Crimson
    secondary: '#F5C518', // Gold
    ink: '#0B0F19',
    monogram: 'RCB'
  },
  GT: {
    code: 'GT',
    name: 'Gujarat Titans',
    short: 'Gujarat',
    home: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    primary: '#0B2A4A',
    secondary: '#C9A961',
    ink: '#FFFFFF',
    monogram: 'GT'
  },
  SRH: {
    code: 'SRH',
    name: 'Sunrisers Hyderabad',
    short: 'Hyderabad',
    home: 'Rajiv Gandhi International Stadium',
    city: 'Hyderabad',
    primary: '#F26522',
    secondary: '#0A0A0A',
    ink: '#FFFFFF',
    monogram: 'SRH'
  },
  RR: {
    code: 'RR',
    name: 'Rajasthan Royals',
    short: 'Rajasthan',
    home: 'Sawai Mansingh Stadium',
    city: 'Jaipur',
    primary: '#254AA5',
    secondary: '#EA1A8C',
    ink: '#FFFFFF',
    monogram: 'RR'
  },
  MI: {
    code: 'MI',
    name: 'Mumbai Indians',
    short: 'Mumbai',
    home: 'Wankhede Stadium',
    city: 'Mumbai',
    primary: '#004BA0',
    secondary: '#D1AB3E',
    ink: '#FFFFFF',
    monogram: 'MI'
  },
  CSK: {
    code: 'CSK',
    name: 'Chennai Super Kings',
    short: 'Chennai',
    home: 'MA Chidambaram Stadium',
    city: 'Chennai',
    primary: '#F9CD05',
    secondary: '#1F4E97',
    ink: '#0B0F19',
    monogram: 'CSK'
  },
  KKR: {
    code: 'KKR',
    name: 'Kolkata Knight Riders',
    short: 'Kolkata',
    home: 'Eden Gardens',
    city: 'Kolkata',
    primary: '#3A225D',
    secondary: '#D4AF37',
    ink: '#FFFFFF',
    monogram: 'KKR'
  },
  DC: {
    code: 'DC',
    name: 'Delhi Capitals',
    short: 'Delhi',
    home: 'Arun Jaitley Stadium',
    city: 'Delhi',
    primary: '#17449B',
    secondary: '#EE1B2E',
    ink: '#FFFFFF',
    monogram: 'DC'
  },
  PBKS: {
    code: 'PBKS',
    name: 'Punjab Kings',
    short: 'Punjab',
    home: 'Maharaja Yadavindra Singh Stadium',
    city: 'Mullanpur',
    primary: '#A60C2D',
    secondary: '#C4C4C4',
    ink: '#FFFFFF',
    monogram: 'PBKS'
  },
  LSG: {
    code: 'LSG',
    name: 'Lucknow Super Giants',
    short: 'Lucknow',
    home: 'BRSABV Ekana Stadium',
    city: 'Lucknow',
    primary: '#0FA5C9',
    secondary: '#0A2E5C',
    ink: '#FFFFFF',
    monogram: 'LSG'
  }
};

export const TEAM_CODES = Object.keys(TEAMS);

export const getTeam = (code) => TEAMS[code];

export const VENUES = [
  'M. Chinnaswamy Stadium, Bengaluru',
  'Narendra Modi Stadium, Ahmedabad',
  'Rajiv Gandhi International Stadium, Hyderabad',
  'Sawai Mansingh Stadium, Jaipur',
  'Wankhede Stadium, Mumbai',
  'MA Chidambaram Stadium, Chennai',
  'Eden Gardens, Kolkata',
  'Arun Jaitley Stadium, Delhi',
  'Maharaja Yadavindra Singh Stadium, Mullanpur',
  'BRSABV Ekana Stadium, Lucknow'
];
