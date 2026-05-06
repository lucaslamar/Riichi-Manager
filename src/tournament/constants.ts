import type { Wind } from "./types";

export const WINDS: Wind[] = ["Leste", "Sul", "Oeste", "Norte"];
export const ROUND_COUNT = 4;
export const STARTING_SCORE = 30000;
export const STORAGE_KEY = "riichi-tournament-pro-ts";
export const MAX_PAIRING_ATTEMPTS = 2200;
export const REPEATED_OPPONENT_SPREAD_MIN_PLAYERS = 20;
export const MAX_REPEATED_OPPONENTS_PER_PLAYER = 1;
export const DEFAULT_ROUND_SECONDS = 90 * 60;
export const TABLE_EXTENSION_SECONDS = 5 * 60;

export const ROUND_TIMER_OPTIONS = [
  { label: "1h", seconds: 60 * 60 },
  { label: "1h30", seconds: DEFAULT_ROUND_SECONDS },
  { label: "2h", seconds: 120 * 60 },
];

export const DEFAULT_PLAYERS = [];
