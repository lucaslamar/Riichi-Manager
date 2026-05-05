import {
  MAX_PAIRING_ATTEMPTS,
  ROUND_COUNT,
  STARTING_SCORE,
  WINDS,
} from "../tournament/constants";
import type {
  PairKey,
  PairingCandidate,
  Round,
  Seat,
  Table,
  Wind,
} from "../tournament/types";
import { shuffle } from "../utils/random";
import { evaluateSchedule, pairKey } from "./quality";

// Quanto mais um par ja se encontrou, mais caro fica coloca-los juntos de novo.
function tablePairPenalty(players: string[], pairCounts: Map<PairKey, number>): number {
  let penalty = 0;

  for (let first = 0; first < players.length; first += 1) {
    for (let second = first + 1; second < players.length; second += 1) {
      const previousMatches =
        pairCounts.get(pairKey(players[first], players[second])) ?? 0;
      penalty += previousMatches * previousMatches;
    }
  }

  return penalty;
}

function addTablePairs(players: string[], pairCounts: Map<PairKey, number>): void {
  for (let first = 0; first < players.length; first += 1) {
    for (let second = first + 1; second < players.length; second += 1) {
      const key = pairKey(players[first], players[second]);
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }
  }
}

function buildRound(
  roundIndex: number,
  players: string[],
  windOffsetByPlayer: Map<string, number>,
  pairCounts: Map<PairKey, number>,
): Round {
  // Separa os jogadores pelo vento que cada um precisa receber nesta rodada.
  const playersByWind = new Map<Wind, string[]>(
    WINDS.map((wind) => [wind, []] as [Wind, string[]]),
  );
  const tables: Table[] = [];

  for (const player of players) {
    const wind = WINDS[
      (roundIndex + (windOffsetByPlayer.get(player) ?? 0)) % WINDS.length
    ];
    playersByWind.get(wind)?.push(player);
  }

  const shuffledByWind = new Map<Wind, string[]>(
    WINDS.map(
      (wind) => [wind, shuffle(playersByWind.get(wind) ?? [])] as [
        Wind,
        string[],
      ],
    ),
  );
  const tableCount = players.length / WINDS.length;

  for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
    const selectedSeats: Seat[] = [];

    // Cada mesa recebe exatamente um Leste, um Sul, um Oeste e um Norte.
    for (const wind of shuffle(WINDS)) {
      const options = shuffledByWind.get(wind) ?? [];
      const selectedPlayers = selectedSeats.map((seat) => seat.player);
      let bestOptionIndex = 0;
      let bestOptionPenalty = Number.POSITIVE_INFINITY;

      options.forEach((option, optionIndex) => {
        // Escolhe o jogador que menos piora os encontros ja existentes da mesa.
        const penalty = tablePairPenalty(
          [...selectedPlayers, option],
          pairCounts,
        );
        const randomTieBreak = Math.random() * 0.01;

        if (penalty + randomTieBreak < bestOptionPenalty) {
          bestOptionPenalty = penalty + randomTieBreak;
          bestOptionIndex = optionIndex;
        }
      });

      const [player] = options.splice(bestOptionIndex, 1);
      selectedSeats.push({
        player,
        wind,
        score: STARTING_SCORE,
      });
    }

    const seats = selectedSeats.sort(
      (seatA, seatB) => WINDS.indexOf(seatA.wind) - WINDS.indexOf(seatB.wind),
    );
    addTablePairs(
      seats.map((seat) => seat.player),
      pairCounts,
    );

    tables.push({
      id: tables.length + 1,
      seats,
    });
  }

  return {
    id: roundIndex + 1,
    tables,
  };
}

function createCandidate(players: string[]): PairingCandidate {
  const windOffsetByPlayer = new Map<string, number>();
  const shuffledForWinds = shuffle(players);

  // O offset faz cada jogador passar por todos os quatro ventos em quatro rodadas.
  shuffledForWinds.forEach((player, index) => {
    windOffsetByPlayer.set(player, index % WINDS.length);
  });

  const pairCounts = new Map<PairKey, number>();
  const rounds = Array.from({ length: ROUND_COUNT }, (_, roundIndex) =>
    buildRound(roundIndex, players, windOffsetByPlayer, pairCounts),
  );

  return {
    rounds,
    quality: evaluateSchedule(rounds),
  };
}

export function generateRiichiBalancedSchedule(players: string[]): PairingCandidate {
  let best = createCandidate(players);

  // Gera varias grades candidatas e mantem a melhor nota do diagnostico.
  for (let attempt = 1; attempt < MAX_PAIRING_ATTEMPTS; attempt += 1) {
    const candidate = createCandidate(players);

    if (candidate.quality.score < best.quality.score) {
      best = candidate;
    }

    if (
      best.quality.maxPairRepeats <= 2 &&
      best.quality.twicePairCount <= best.quality.idealRepeatedPairCount + 2 &&
      best.quality.fullTableRepeats === 0 &&
      best.quality.windRepeats === 0 &&
      best.quality.repeatedOpponentOverload.length === 0
    ) {
      break;
    }
  }

  return best;
}
