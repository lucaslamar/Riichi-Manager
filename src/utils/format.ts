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

/**
 * Formata duracoes de torneio como HH:MM:SS.
 *
 * @param totalSegundos - Duracao em segundos.
 * @returns Texto pronto para exibicao no cronometro.
 */
export function formatarDuracao(totalSegundos: number): string {
  const segundosSeguros = Math.max(0, totalSegundos);
  const horas = Math.floor(segundosSeguros / 3600);
  const minutos = Math.floor((segundosSeguros % 3600) / 60);
  const segundos = segundosSeguros % 60;
  const partes = [minutos, segundos].map((parte) => String(parte).padStart(2, "0"));

  return horas > 0 ? `${String(horas).padStart(2, "0")}:${partes.join(":")}` : partes.join(":");
}
