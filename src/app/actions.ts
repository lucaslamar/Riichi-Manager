import { generateRiichiBalancedSchedule } from "../pairing/riichiBalanced";
import { STARTING_SCORE, TABLE_EXTENSION_SECONDS } from "../tournament/constants";
import { parsePlayers, validatePlayers } from "../tournament/players";
import { calculateMatchPoints } from "../tournament/scoring";
import { getTableKey } from "../tournament/tableKeys";
import type { RoundTimerState, TournamentState } from "../tournament/types";
import { formatScore, parseScore } from "../utils/format";
import { shuffle } from "../utils/random";
import { criarTimerRodadaVazio } from "./storage";
import { getTournament, resetTournamentState, setTournament, updateTournament } from "./state";

/**
 * Informa se ja existe uma grade de mesas carregada.
 *
 * @param torneio - Estado que sera verificado; por padrao usa o estado global.
 * @returns Verdadeiro quando ha jogadores e rodadas geradas.
 */
export function isTournamentActive(torneio = getTournament()): boolean {
  return torneio.schedule.length > 0 && torneio.players.length > 0;
}

/**
 * Cria um torneio novo a partir da lista digitada, sem depender de botoes de quantidade.
 *
 * @param jogadoresDigitados - Texto com nomes separados por linha ou virgula.
 * @returns Mensagem de erro de validacao ou null quando o torneio foi criado.
 */
export function startTournament(jogadoresDigitados: string): string | null {
  const jogadores = parsePlayers(jogadoresDigitados);
  const erroValidacao = validatePlayers(jogadores);

  if (erroValidacao) {
    return erroValidacao;
  }

  const jogadoresEmbaralhados = shuffle(jogadores);
  const gradeCandidata = generateRiichiBalancedSchedule(jogadoresEmbaralhados);

  setTournament({
    players: jogadoresEmbaralhados,
    schedule: gradeCandidata.rounds,
    quality: gradeCandidata.quality,
    classification: Object.fromEntries(jogadoresEmbaralhados.map((jogador) => [jogador, 0])),
    completedTables: {},
    tableScores: {},
    roundTimer: criarTimerRodadaVazio(),
  });

  return null;
}

/** Reinicia o estado em memoria e remove o save do navegador. */
export function resetTournament(): void {
  resetTournamentState();
}

/**
 * Calcula quanto tempo ainda deve aparecer no relogio considerando a ultima retomada.
 *
 * @param timerRodada - Estado persistido do timer.
 * @returns Segundos restantes atualizados, nunca abaixo de zero.
 */
export function calcularSegundosRestantes(timerRodada: RoundTimerState): number {
  if (!timerRodada.isRunning || !timerRodada.startedAt) {
    return timerRodada.remainingSeconds;
  }

  const segundosDecorridos = Math.floor((Date.now() - timerRodada.startedAt) / 1000);

  return Math.max(0, timerRodada.remainingSeconds - segundosDecorridos);
}

/** Inicia ou pausa o timer global da rodada atual. */
export function alternarTimerRodada(): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;

    if (timerAtual.isRunning) {
      return {
        ...torneioAtual,
        roundTimer: {
          ...timerAtual,
          remainingSeconds: calcularSegundosRestantes(timerAtual),
          isRunning: false,
          startedAt: null,
        },
      };
    }

    return {
      ...torneioAtual,
      roundTimer: {
        ...timerAtual,
        isRunning: true,
        startedAt: Date.now(),
      },
    };
  });
}

/** Volta o timer da rodada selecionada para o tempo padrao. */
export function reiniciarTimerRodada(): void {
  updateTournament((torneioAtual): TournamentState => ({
    ...torneioAtual,
    roundTimer: criarTimerRodadaVazio(torneioAtual.roundTimer.roundIndex),
  }));
}

/**
 * Troca qual rodada o timer esta controlando e reinicia o relogio em 90 minutos.
 *
 * @param indiceRodada - Indice baseado em zero recebido do select da tela.
 */
export function selecionarRodadaDoTimer(indiceRodada: number): void {
  updateTournament((torneioAtual): TournamentState => ({
    ...torneioAtual,
    roundTimer: criarTimerRodadaVazio(indiceRodada),
  }));
}

/** Adiciona 5 minutos ao timer global sem associar a uma mesa especifica. */
export function adicionarCincoMinutosGlobais(): void {
  adicionarSegundosAoTimer(TABLE_EXTENSION_SECONDS);
}

/**
 * Adiciona 5 minutos ao timer global e registra qual mesa recebeu o acrescimo.
 *
 * @param indiceRodada - Indice baseado em zero da rodada da mesa.
 * @param indiceMesa - Indice baseado em zero da mesa.
 */
export function adicionarCincoMinutosParaMesa(indiceRodada: number, indiceMesa: number): void {
  const chaveMesa = getTableKey(indiceRodada, indiceMesa);

  adicionarSegundosAoTimer(TABLE_EXTENSION_SECONDS, chaveMesa);
}

/**
 * Persiste o tempo calculado quando o cronometro chega a zero enquanto esta rodando.
 * Isso evita que reloads continuem subtraindo tempo negativo.
 */
export function sincronizarTimerExpirado(): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;

    if (!timerAtual.isRunning || calcularSegundosRestantes(timerAtual) > 0) {
      return torneioAtual;
    }

    return {
      ...torneioAtual,
      roundTimer: {
        ...timerAtual,
        remainingSeconds: 0,
        isRunning: false,
        startedAt: null,
      },
    };
  });
}

/**
 * Soma segundos ao timer preservando a contagem em andamento.
 *
 * @param segundosExtras - Quantidade de segundos acrescentada.
 * @param chaveMesa - Chave opcional usada para auditar acrescimos por mesa.
 */
function adicionarSegundosAoTimer(segundosExtras: number, chaveMesa?: string): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;
    const segundosRestantes = calcularSegundosRestantes(timerAtual) + segundosExtras;

    return {
      ...torneioAtual,
      roundTimer: {
        ...timerAtual,
        totalSeconds: timerAtual.totalSeconds + segundosExtras,
        remainingSeconds: segundosRestantes,
        startedAt: timerAtual.isRunning ? Date.now() : null,
        tableExtensions: chaveMesa
          ? {
              ...timerAtual.tableExtensions,
              [chaveMesa]: (timerAtual.tableExtensions[chaveMesa] ?? 0) + 1,
            }
          : timerAtual.tableExtensions,
      },
    };
  });
}

/**
 * Salva a pontuacao final de uma mesa, atualiza o ranking e trava novos lancamentos nela.
 *
 * @param indiceRodada - Indice baseado em zero da rodada.
 * @param indiceMesa - Indice baseado em zero da mesa.
 * @param lerPontuacao - Funcao que le o input de cada assento no DOM.
 * @param confirmarSalvamento - Funcao que pede confirmacao antes de arquivar a mesa.
 */
export function saveTableScores(
  indiceRodada: number,
  indiceMesa: number,
  lerPontuacao: (indiceAssento: number) => string,
  confirmarSalvamento: (resumo: string) => boolean,
): void {
  const torneio = getTournament();
  const mesa = torneio.schedule[indiceRodada]?.tables[indiceMesa];

  if (!mesa) {
    return;
  }

  const chaveMesa = getTableKey(indiceRodada, indiceMesa);

  if (torneio.completedTables[chaveMesa]) {
    return;
  }

  const pontuacoesLidas = mesa.seats.map((assento, indiceAssento) => {
    const pontuacao = parseScore(lerPontuacao(indiceAssento) || String(STARTING_SCORE));

    return {
      player: assento.player,
      score: pontuacao,
      text: formatScore(pontuacao),
    };
  });
  const resumo = pontuacoesLidas
    .map((resultado) => `${resultado.player}: ${resultado.text}`)
    .join("\n");

  if (!confirmarSalvamento(resumo)) {
    return;
  }

  updateTournament((torneioAtual): TournamentState => {
    const classificacao = { ...torneioAtual.classification };

    for (const resultado of calculateMatchPoints(pontuacoesLidas)) {
      classificacao[resultado.player] = (classificacao[resultado.player] ?? 0) + resultado.points;
    }

    return {
      ...torneioAtual,
      classification: classificacao,
      completedTables: {
        ...torneioAtual.completedTables,
        [chaveMesa]: true,
      },
      tableScores: {
        ...torneioAtual.tableScores,
        [chaveMesa]: pontuacoesLidas.map((resultado) => resultado.text),
      },
    };
  });
}
