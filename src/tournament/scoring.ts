import { STARTING_SCORE } from "./constants";

export type RawTableScore = {
  player: string;
  score: number;
  text: string;
};

export type MatchPoints = {
  player: string;
  points: number;
};

// Calculo atual: diferenca para 30.000 dividida por 1000 + uma/cavalo por colocacao.
export function calculateMatchPoints(results: Array<{ player: string; score: number }>): MatchPoints[] {
  const uma = [8, 4, -4, -8];
  const sorted = [...results].sort((a, b) => b.score - a.score);

  return sorted.map((result, index) => ({
    player: result.player,
    points: Number(((result.score - STARTING_SCORE) / 1000 + uma[index]).toFixed(1)),
  }));
}
