import { STORAGE_KEY } from "../tournament/constants";
import type { TournamentState } from "../tournament/types";

// Estado vazio usado tanto no primeiro acesso quanto ao limpar torneio.
export function createEmptyTournament(): TournamentState {
  return {
    players: [],
    schedule: [],
    quality: null,
    classification: {},
    completedTables: {},
    tableScores: {},
  };
}

export function loadTournament(): TournamentState {
  const rawTournament = window.localStorage.getItem(STORAGE_KEY);

  if (!rawTournament) {
    return createEmptyTournament();
  }

  try {
    const parsed = JSON.parse(rawTournament) as TournamentState;

    // O spread com defaults protege contra saves antigos sem campos novos.
    return {
      ...createEmptyTournament(),
      ...parsed,
      classification: parsed.classification ?? {},
      completedTables: parsed.completedTables ?? {},
      tableScores: parsed.tableScores ?? {},
    };
  } catch {
    return createEmptyTournament();
  }
}

export function persistTournament(tournament: TournamentState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
}

export function removeTournament(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
