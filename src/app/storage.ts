import { DEFAULT_ROUND_SECONDS, STORAGE_KEY } from "../tournament/constants";
import type { RoundTimerState, TournamentState } from "../tournament/types";

/**
 * Cria o relogio padrao de uma rodada.
 *
 * @param indiceRodada - Rodada exibida no cronometro, com indice baseado em zero.
 * @param segundosBase - Duracao base escolhida pelo juiz para a rodada.
 * @param acrescimosPorMesa - Mapa com os acrescimos individuais ja registrados.
 * @returns Estado inicial do cronometro parado na duracao escolhida.
 */
export function criarTimerRodadaVazio(
  indiceRodada = 0,
  segundosBase = DEFAULT_ROUND_SECONDS,
  acrescimosPorMesa: Record<string, number> = {},
): RoundTimerState {
  return {
    totalSeconds: segundosBase,
    remainingSeconds: segundosBase,
    roundIndex: indiceRodada,
    isRunning: false,
    startedAt: null,
    tableExtensions: acrescimosPorMesa,
  };
}

/**
 * Monta o estado vazio usado no primeiro acesso e quando o torneio e reiniciado.
 *
 * @returns Torneio sem jogadores, mesas, resultados ou timer ativo.
 */
export function createEmptyTournament(): TournamentState {
  return {
    players: [],
    schedule: [],
    quality: null,
    classification: {},
    completedTables: {},
    tableScores: {},
    roundTimer: criarTimerRodadaVazio(),
  };
}

/**
 * Recupera o torneio salvo no navegador e completa campos que nao existiam em saves antigos.
 *
 * @returns Torneio persistido ou um estado novo quando nao houver save valido.
 */
export function loadTournament(): TournamentState {
  const torneioSalvo = window.localStorage.getItem(STORAGE_KEY);

  if (!torneioSalvo) {
    return createEmptyTournament();
  }

  try {
    const torneioLido = JSON.parse(torneioSalvo) as Partial<TournamentState>;
    const estadoVazio = createEmptyTournament();

    return {
      ...estadoVazio,
      ...torneioLido,
      classification: torneioLido.classification ?? {},
      completedTables: torneioLido.completedTables ?? {},
      tableScores: torneioLido.tableScores ?? {},
      roundTimer: {
        ...criarTimerRodadaVazio(),
        ...(torneioLido.roundTimer ?? {}),
        tableExtensions: torneioLido.roundTimer?.tableExtensions ?? {},
      },
    };
  } catch {
    return createEmptyTournament();
  }
}

/**
 * Salva o estado completo do torneio no localStorage.
 *
 * @param torneio - Estado atual que deve sobreviver ao reload da pagina.
 */
export function persistTournament(torneio: TournamentState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(torneio));
}

/** Remove do navegador qualquer torneio salvo. */
export function removeTournament(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
