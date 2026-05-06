import {
  createEmptyTournament,
  loadTournament,
  persistTournament,
  removeTournament,
} from "./storage";
import type { TournamentState } from "../tournament/types";

export type AppScreen =
  | "home"
  | "fastSetup"
  | "swiss"
  | "handTools"
  | "yakuReference";

let tournament = loadTournament();
let appScreen: AppScreen = "home";

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

export function getAppScreen(): AppScreen {
  return appScreen;
}

export function setAppScreen(nextScreen: AppScreen): void {
  appScreen = nextScreen;
}

export function isQuickSetupVisible(): boolean {
  return appScreen === "fastSetup";
}

export function showQuickSetup(): void {
  appScreen = "fastSetup";
}

export function hideQuickSetup(): void {
  appScreen = "home";
}
