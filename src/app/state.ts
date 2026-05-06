import {
  createEmptyTournament,
  loadTournament,
  persistTournament,
  removeTournament,
} from "./storage";
import type { TournamentState } from "../tournament/types";

let tournament = loadTournament();
let quickSetupVisible = false;

// Estado em memoria. Sempre que muda, persistimos via set/update.
export function getTournament(): TournamentState {
  return tournament;
}

export function setTournament(nextTournament: TournamentState): void {
  tournament = nextTournament;
  persistTournament(tournament);
}

export function updateTournament(
  updater: (currentTournament: TournamentState) => TournamentState,
): void {
  setTournament(updater(tournament));
}

export function resetTournamentState(): void {
  removeTournament();
  tournament = createEmptyTournament();
}


export function isQuickSetupVisible(): boolean {
  return quickSetupVisible;
}

export function showQuickSetup(): void {
  quickSetupVisible = true;
}

export function hideQuickSetup(): void {
  quickSetupVisible = false;
}
