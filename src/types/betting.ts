export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  status: "upcoming" | "live" | "completed";
  liquidity: number;
  startTime: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  colorVar: "primary" | "accent";
}

export interface Order {
  id: string;
  matchId: string;
  teamId: string;
  teamName: string;
  opponentName: string;
  amount: number;
  status: "pending" | "matched" | "won" | "lost";
  matchedAt?: number;
  commission?: number;
  payout?: number;
}

export const STAKE_OPTIONS = [10, 20, 50, 100, 200, 500] as const;

export const COMMISSION_RATE = 0.05;

export const MATCHES: Match[] = [
  {
    id: "mi-vs-csk",
    teamA: { id: "mi", name: "Mumbai Indians", shortName: "MI", colorVar: "primary" },
    teamB: { id: "csk", name: "Chennai Super Kings", shortName: "CSK", colorVar: "accent" },
    status: "live",
    liquidity: 420000,
    startTime: "2026-03-16T19:30:00",
  },
  {
    id: "rcb-vs-kkr",
    teamA: { id: "rcb", name: "Royal Challengers", shortName: "RCB", colorVar: "primary" },
    teamB: { id: "kkr", name: "Kolkata Knight Riders", shortName: "KKR", colorVar: "accent" },
    status: "upcoming",
    liquidity: 180000,
    startTime: "2026-03-17T15:30:00",
  },
  {
    id: "dc-vs-srh",
    teamA: { id: "dc", name: "Delhi Capitals", shortName: "DC", colorVar: "primary" },
    teamB: { id: "srh", name: "Sunrisers Hyderabad", shortName: "SRH", colorVar: "accent" },
    status: "upcoming",
    liquidity: 95000,
    startTime: "2026-03-18T19:30:00",
  },
];
