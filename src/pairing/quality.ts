import { WINDS } from "../tournament/constants";
import type { PairKey, PairRepeat, QualityReport, Round } from "../tournament/types";

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

  const fullTableRepeats = [...tableCounts.values()].filter((count) => count > 1)
    .length;
  const exactEast = [...windCounts.values()].every(
    (counts) => (counts.get("Leste") ?? 0) === 1,
  );
  const score =
    // Problemas graves recebem peso alto para perderem de grades com repeticoes leves.
    triplePairCount * 12000 +
    Math.max(0, maxPairRepeats - 2) * 6000 +
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
  };
}

export function qualityLabel(quality: QualityReport): string {
  if (quality.triplePairCount > 0 || quality.windRepeats > 0) {
    return "Precisa melhorar";
  }

  if (quality.twicePairCount > quality.idealRepeatedPairCount + 2) {
    return "Aceitavel";
  }

  return "Boa grade";
}
