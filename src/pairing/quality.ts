import {
  MAX_REPEATED_OPPONENTS_PER_PLAYER,
  REPEATED_OPPONENT_SPREAD_MIN_PLAYERS,
  WINDS,
} from "../tournament/constants";
import type {
  PairKey,
  PairRepeat,
  PlayerRepeatedOpponents,
  QualityReport,
  Round,
} from "../tournament/types";

export function pairKey(playerA: string, playerB: string): PairKey {
  return [playerA, playerB].sort((a, b) => a.localeCompare(b)).join("::");
}

function pairPlayers(key: PairKey): [string, string] {
  const [firstPlayer, secondPlayer] = key.split("::");
  return [firstPlayer, secondPlayer];
}

export function tableKey(players: string[]): string {
  return [...players].sort((a, b) => a.localeCompare(b)).join("::");
}

export function buildPairCounts(rounds: Round[]): Map<PairKey, number> {
  const pairs = new Map<PairKey, number>();

  for (const round of rounds) {
    for (const table of round.tables) {
      const players = table.seats.map((seat) => seat.player);

      for (let first = 0; first < players.length; first += 1) {
        for (let second = first + 1; second < players.length; second += 1) {
          const key = pairKey(players[first], players[second]);
          pairs.set(key, (pairs.get(key) ?? 0) + 1);
        }
      }
    }
  }

  return pairs;
}

export function getWindCounts(rounds: Round[]): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();

  for (const round of rounds) {
    for (const table of round.tables) {
      for (const seat of table.seats) {
        const playerCounts = counts.get(seat.player) ?? new Map<string, number>();
        playerCounts.set(seat.wind, (playerCounts.get(seat.wind) ?? 0) + 1);
        counts.set(seat.player, playerCounts);
      }
    }
  }

  return counts;
}

/**
 * Calcula quantos adversarios repetidos cada jogador teve.
 *
 * @param repeatedPairs - Pares que se encontraram mais de uma vez na grade.
 * @returns Lista ordenada dos jogadores que tiveram pelo menos um adversario repetido.
 */
function buildRepeatedOpponentsByPlayer(
  repeatedPairs: PairRepeat[],
): PlayerRepeatedOpponents[] {
  const opponentsByPlayer = new Map<string, Set<string>>();

  for (const pair of repeatedPairs) {
    const [playerA, playerB] = pair.players;
    const playerAOpponents = opponentsByPlayer.get(playerA) ?? new Set<string>();
    const playerBOpponents = opponentsByPlayer.get(playerB) ?? new Set<string>();

    playerAOpponents.add(playerB);
    playerBOpponents.add(playerA);
    opponentsByPlayer.set(playerA, playerAOpponents);
    opponentsByPlayer.set(playerB, playerBOpponents);
  }

  return [...opponentsByPlayer.entries()]
    .map(([player, opponents]) => ({
      player,
      count: opponents.size,
      opponents: [...opponents].sort((opponentA, opponentB) =>
        opponentA.localeCompare(opponentB),
      ),
    }))
    .sort(
      (playerA, playerB) =>
        playerB.count - playerA.count || playerA.player.localeCompare(playerB.player),
    );
}

/**
 * Define quando a grade deve espalhar repeticoes para evitar mesas monotonas.
 * Em torneios pequenos, repeticao e inevitavel demais para impor esse limite.
 *
 * @param playerCount - Quantidade de participantes do torneio.
 * @returns Limite por jogador ou null quando o criterio nao deve ser aplicado.
 */
function repeatedOpponentLimit(playerCount: number): number | null {
  return playerCount >= REPEATED_OPPONENT_SPREAD_MIN_PLAYERS
    ? MAX_REPEATED_OPPONENTS_PER_PLAYER
    : null;
}

export function evaluateSchedule(rounds: Round[]): QualityReport {
  const pairs = buildPairCounts(rounds);
  const windCounts = getWindCounts(rounds);
  const playerCount = windCounts.size;
  // Repeticoes inevitaveis existem em torneios pequenos; este e o piso matematico.
  const totalPairSeats = rounds.length * (playerCount / WINDS.length) * 6;
  const possiblePairs = (playerCount * (playerCount - 1)) / 2;
  const idealRepeatedPairCount = Math.max(0, totalPairSeats - possiblePairs);
  const tableCounts = new Map<string, number>();
  let repeatedPairCount = 0;
  let twicePairCount = 0;
  let triplePairCount = 0;
  let maxPairRepeats = 0;
  let windRepeats = 0;
  const repeatedPairs: PairRepeat[] = [];

  for (const [key, count] of pairs.entries()) {
    maxPairRepeats = Math.max(maxPairRepeats, count);

    if (count > 1) {
      repeatedPairCount += 1;
      repeatedPairs.push({
        players: pairPlayers(key),
        count,
      });
    }

    if (count === 2) {
      twicePairCount += 1;
    }

    if (count >= 3) {
      triplePairCount += 1;
    }
  }

  for (const playerCounts of windCounts.values()) {
    for (const wind of WINDS) {
      const count = playerCounts.get(wind) ?? 0;

      if (count !== 1) {
        windRepeats += Math.abs(count - 1);
      }
    }
  }

  for (const round of rounds) {
    for (const table of round.tables) {
      const key = tableKey(table.seats.map((seat) => seat.player));
      tableCounts.set(key, (tableCounts.get(key) ?? 0) + 1);
    }
  }

  const repeatedOpponentsByPlayer = buildRepeatedOpponentsByPlayer(repeatedPairs);
  const repeatedOpponentLimitValue = repeatedOpponentLimit(playerCount);
  const repeatedOpponentOverload = repeatedOpponentLimitValue === null
    ? []
    : repeatedOpponentsByPlayer.filter(
        (player) => player.count > repeatedOpponentLimitValue,
      );
  const repeatedOpponentOverloadPenalty = repeatedOpponentOverload.reduce(
    (total, player) => total + (player.count - (repeatedOpponentLimitValue ?? 0)),
    0,
  );
  const maxRepeatedOpponentsByPlayer = repeatedOpponentsByPlayer[0]?.count ?? 0;
  const fullTableRepeats = [...tableCounts.values()].filter((count) => count > 1)
    .length;
  const exactEast = [...windCounts.values()].every(
    (counts) => (counts.get("Leste") ?? 0) === 1,
  );
  const score =
    // Problemas graves recebem peso alto para perderem de grades com repeticoes leves.
    triplePairCount * 12000 +
    Math.max(0, maxPairRepeats - 2) * 6000 +
    repeatedOpponentOverloadPenalty * 3500 +
    twicePairCount * 85 +
    repeatedPairCount * 30 +
    fullTableRepeats * 900 +
    windRepeats * 20000;

  return {
    score,
    maxPairRepeats,
    repeatedPairs: repeatedPairs.sort(
      (pairA, pairB) =>
        pairB.count - pairA.count ||
        pairA.players.join(" ").localeCompare(pairB.players.join(" ")),
    ),
    repeatedPairCount,
    idealRepeatedPairCount,
    twicePairCount,
    triplePairCount,
    exactEast,
    windRepeats,
    fullTableRepeats,
    repeatedOpponentLimit: repeatedOpponentLimitValue,
    maxRepeatedOpponentsByPlayer,
    repeatedOpponentOverload,
  };
}

export function qualityLabel(quality: QualityReport): string {
  if (
    quality.triplePairCount > 0 ||
    quality.windRepeats > 0 ||
    quality.repeatedOpponentOverload.length > 0
  ) {
    return "Precisa melhorar";
  }

  if (quality.twicePairCount > quality.idealRepeatedPairCount + 2) {
    return "Aceitavel";
  }

  return "Boa grade";
}
