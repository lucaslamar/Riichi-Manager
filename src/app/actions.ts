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


/**
 * Refaz apenas o sorteio das mesas usando os mesmos jogadores ja cadastrados.
 * Ranking, resultados salvos e acrescimos por mesa sao limpos porque pertencem
 * a grade antiga; a duracao base escolhida pelo juiz e preservada.
 *
 * @returns true quando um novo sorteio foi gerado; false quando nao ha torneio ativo.
 */
export function refazerSorteio(): boolean {
  const torneioAtual = getTournament();

  if (!isTournamentActive(torneioAtual)) {
    return false;
  }

  const jogadoresEmbaralhados = shuffle(torneioAtual.players);
  const gradeCandidata = generateRiichiBalancedSchedule(jogadoresEmbaralhados);

  setTournament({
    ...torneioAtual,
    players: jogadoresEmbaralhados,
    schedule: gradeCandidata.rounds,
    quality: gradeCandidata.quality,
    classification: Object.fromEntries(jogadoresEmbaralhados.map((jogador) => [jogador, 0])),
    completedTables: {},
    tableScores: {},
    roundTimer: criarTimerRodadaVazio(0, torneioAtual.roundTimer.totalSeconds),
  });

  return true;
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

/** Volta o timer da rodada selecionada para a duracao base escolhida pelo juiz. */
export function reiniciarTimerRodada(): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;

    return {
      ...torneioAtual,
      roundTimer: criarTimerRodadaVazio(
        timerAtual.roundIndex,
        timerAtual.totalSeconds,
        timerAtual.tableExtensions,
      ),
    };
  });
}

/**
 * Troca qual rodada o timer esta controlando e reinicia o relogio na duracao escolhida.
 *
 * @param indiceRodada - Indice baseado em zero recebido do select da tela.
 */
export function selecionarRodadaDoTimer(indiceRodada: number): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;

    return {
      ...torneioAtual,
      roundTimer: criarTimerRodadaVazio(
        indiceRodada,
        timerAtual.totalSeconds,
        timerAtual.tableExtensions,
      ),
    };
  });
}

/**
 * Altera a duracao inicial da rodada e reinicia o timer com esse novo tempo base.
 *
 * @param segundosBase - Novo tempo base escolhido pelo juiz.
 */
export function alterarDuracaoTimerRodada(segundosBase: number): void {
  updateTournament((torneioAtual): TournamentState => {
    const timerAtual = torneioAtual.roundTimer;

    return {
      ...torneioAtual,
      roundTimer: criarTimerRodadaVazio(
        timerAtual.roundIndex,
        segundosBase,
        timerAtual.tableExtensions,
      ),
    };
  });
}

/** Adiciona 5 minutos ao timer global sem associar a uma mesa especifica. */
export function adicionarCincoMinutosGlobais(): void {
  adicionarSegundosAoTimer(TABLE_EXTENSION_SECONDS);
}

/**
 * Registra 5 minutos extras apenas para uma mesa, sem alterar o timer global.
 *
 * @param indiceRodada - Indice baseado em zero da rodada da mesa.
 * @param indiceMesa - Indice baseado em zero da mesa.
 */
export function adicionarCincoMinutosParaMesa(indiceRodada: number, indiceMesa: number): void {
  const chaveMesa = getTableKey(indiceRodada, indiceMesa);

  updateTournament((torneioAtual): TournamentState => ({
    ...torneioAtual,
    roundTimer: {
      ...torneioAtual.roundTimer,
      tableExtensions: {
        ...torneioAtual.roundTimer.tableExtensions,
        [chaveMesa]: (torneioAtual.roundTimer.tableExtensions[chaveMesa] ?? 0) + 1,
      },
    },
  }));
}

/**
 * Calcula o tempo restante especifico da mesa somando o acrescimo individual dela.
 *
 * @param timerRodada - Estado persistido do timer.
 * @param chaveMesa - Chave da mesa usada no armazenamento.
 * @returns Tempo restante da mesa, considerando timer global + acrescimos da mesa.
 */
export function calcularSegundosRestantesMesa(
  timerRodada: RoundTimerState,
  chaveMesa: string,
): number {
  const quantidadeAcrescimos = timerRodada.tableExtensions[chaveMesa] ?? 0;

  return calcularSegundosRestantes(timerRodada) + quantidadeAcrescimos * TABLE_EXTENSION_SECONDS;
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
 */
function adicionarSegundosAoTimer(segundosExtras: number): void {
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
