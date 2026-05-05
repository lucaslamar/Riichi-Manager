import { STARTING_SCORE } from "../tournament/constants";

export function formatScore(score: number): string {
  return new Intl.NumberFormat("pt-BR").format(score);
}

export function parseScore(score: string): number {
  return Number.parseInt(score.replace(/[\.,]/g, ""), 10) || 0;
}

export function defaultScoreText(): string {
  return formatScore(STARTING_SCORE);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
