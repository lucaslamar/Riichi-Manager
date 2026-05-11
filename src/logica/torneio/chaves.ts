/**
 * @fileoverview Utilitários de chaves de mesa e formatação de texto.
 */

import { PONTUACAO_INICIAL } from './constantes'

/**
 * Gera uma chave única para identificar uma mesa em um objeto de índice.
 * Ex.: rodada 0, mesa 2 → "0_2"
 *
 * @param indiceRodada - Índice base zero da rodada.
 * @param indiceMesa - Índice base zero da mesa dentro da rodada.
 * @returns String usada como chave nos objetos `mesasConcluidas` e `pontuacoesPorMesa`.
 */
export function chaveMesa(indiceRodada: number, indiceMesa: number): string {
  return `${indiceRodada}_${indiceMesa}`
}

/**
 * Formata um número de pontuação para o padrão pt-BR com separador de milhar.
 * Ex.: 30000 → "30.000"
 *
 * @param pontuacao - Valor numérico a formatar.
 * @returns String formatada em pt-BR.
 */
export function formatarPontuacao(pontuacao: number): string {
  return new Intl.NumberFormat('pt-BR').format(pontuacao)
}

/**
 * Converte um texto de pontuação (pode ter pontos ou vírgulas) de volta para número.
 * Ex.: "30.000" → 30000, "30,000" → 30000
 *
 * @param texto - String digitada no campo de pontuação.
 * @returns Número inteiro correspondente (0 se inválido).
 */
export function parsePontuacao(texto: string): number {
  return Number.parseInt(texto.replace(/[.,]/g, ''), 10) || 0
}

/**
 * Retorna a pontuação inicial formatada, usada como placeholder nos inputs.
 *
 * @returns "30.000" (ou o valor de PONTUACAO_INICIAL formatado).
 */
export function pontuacaoInicialFormatada(): string {
  return formatarPontuacao(PONTUACAO_INICIAL)
}

/**
 * Formata uma duração em segundos para o formato HH:MM:SS ou MM:SS.
 * Usado no cronômetro da rodada.
 *
 * @param totalSegundos - Duração em segundos (nunca negativo).
 * @returns String pronta para exibir no timer.
 *
 * @example
 * formatarDuracao(5400)  // "01:30:00"
 * formatarDuracao(90)    // "01:30"
 * formatarDuracao(0)     // "00:00"
 */
export function formatarDuracao(totalSegundos: number): string {
  const segundosSeguros = Math.max(0, totalSegundos)
  const horas = Math.floor(segundosSeguros / 3600)
  const minutos = Math.floor((segundosSeguros % 3600) / 60)
  const segundos = segundosSeguros % 60
  const partes = [minutos, segundos].map((p) => String(p).padStart(2, '0'))

  return horas > 0 ? `${String(horas).padStart(2, '0')}:${partes.join(':')}` : partes.join(':')
}
