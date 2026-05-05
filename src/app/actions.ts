import { generateRiichiBalancedSchedule } from "../pairing/riichiBalanced";
import { STARTING_SCORE } from "../tournament/constants";
import { parsePlayers, validatePlayers } from "../tournament/players";
import { calculateMatchPoints } from "../tournament/scoring";
import { getTableKey } from "../tournament/tableKeys";
import type { TournamentState } from "../tournament/types";
import { formatScore, parseScore } from "../utils/format";
import { shuffle } from "../utils/random";
import { getTournament, resetTournamentState, setTournament, updateTournament } from "./state";

export function isTournamentActive(tournament = getTournament()): boolean {
  return tournament.schedule.length > 0 && tournament.players.length > 0;
}

// Cria um torneio novo a partir da lista digitada, sem depender de botoes de quantidade.
export function startTournament(rawPlayers: string): string | null {
  const players = parsePlayers(rawPlayers);
  const validationError = validatePlayers(players);

  if (validationError) {
    return validationError;
  }

  const shuffledPlayers = shuffle(players);
  const candidate = generateRiichiBalancedSchedule(shuffledPlayers);

  // O estado salvo aqui e a fonte da tela: ranking, mesas, resultados e diagnostico.
  setTournament({
    players: shuffledPlayers,
    schedule: candidate.rounds,
    quality: candidate.quality,
    classification: Object.fromEntries(shuffledPlayers.map((player) => [player, 0])),
    completedTables: {},
    tableScores: {},
  });

  return null;
}

export function resetTournament(): void {
  resetTournamentState();
}

export function saveTableScores(
  roundIndex: number,
  tableIndex: number,
  readScore: (seatIndex: number) => string,
  confirmSave: (summary: string) => boolean,
): void {
  const tournament = getTournament();
  const table = tournament.schedule[roundIndex]?.tables[tableIndex];

  if (!table) {
    return;
  }

  const tableStorageKey = getTableKey(roundIndex, tableIndex);

  if (tournament.completedTables[tableStorageKey]) {
    return;
  }

  // Le os inputs da mesa no momento do clique, para preservar edicoes do usuario.
  const rawScores = table.seats.map((seat, seatIndex) => {
    const score = parseScore(readScore(seatIndex) || String(STARTING_SCORE));
    return {
      player: seat.player,
      score,
      text: formatScore(score),
    };
  });
  const summary = rawScores
    .map((result) => `${result.player}: ${result.text}`)
    .join("\n");

  if (!confirmSave(summary)) {
    return;
  }

  updateTournament((currentTournament): TournamentState => {
    const classification = { ...currentTournament.classification };

    // Cada mesa concluida soma PT no ranking e depois fica travada no front.
    for (const result of calculateMatchPoints(rawScores)) {
      classification[result.player] = (classification[result.player] ?? 0) + result.points;
    }

    return {
      ...currentTournament,
      classification,
      completedTables: {
        ...currentTournament.completedTables,
        [tableStorageKey]: true,
      },
      tableScores: {
        ...currentTournament.tableScores,
        [tableStorageKey]: rawScores.map((result) => result.text),
      },
    };
  });
}
