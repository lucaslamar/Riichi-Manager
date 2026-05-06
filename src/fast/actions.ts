import { generateRiichiBalancedSchedule } from "../pairing/riichiBalanced";
import { STARTING_SCORE } from "../tournament/constants";
import { parsePlayers, validatePlayers } from "../tournament/players";
import { calculateMatchPoints } from "../tournament/scoring";
import { getTableKey } from "../tournament/tableKeys";
import type { TournamentState } from "../tournament/types";
import { formatScore, parseScore } from "../utils/format";
import { shuffle } from "../utils/random";
import { criarTimerRodadaVazio } from "../app/storage";
import { getTournament, setTournament, updateTournament } from "../app/state";
import { isTournamentActive } from "../app/actions";

/**
 * Cria um torneio fast novo a partir da lista digitada.
 *
 * @param jogadoresDigitados - Texto com nomes separados por linha ou virgula.
 * @returns Mensagem de erro de validacao ou null quando o torneio foi criado.
 */
export function iniciarTorneioFast(jogadoresDigitados: string): string | null {
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
 * Refaz apenas o sorteio fast usando os mesmos jogadores ja cadastrados.
 * Ranking, resultados salvos e acrescimos por mesa sao limpos porque pertencem
 * a grade antiga; a duracao base escolhida pelo juiz e preservada.
 *
 * @returns true quando um novo sorteio foi gerado; false quando nao ha torneio ativo.
 */
export function refazerSorteioFast(): boolean {
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

/**
 * Salva a pontuacao final de uma mesa do torneio fast, atualiza o ranking e trava novos lancamentos nela.
 *
 * @param indiceRodada - Indice baseado em zero da rodada.
 * @param indiceMesa - Indice baseado em zero da mesa.
 * @param lerPontuacao - Funcao que le o input de cada assento no DOM.
 * @param confirmarSalvamento - Funcao que pede confirmacao antes de arquivar a mesa.
 */
export function salvarPontuacoesMesaFast(
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
