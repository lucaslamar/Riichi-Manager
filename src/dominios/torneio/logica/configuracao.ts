/** Opções das Configurações do torneio, sem tela. */
import type { ConfigFormato } from './tipos'

export const OPCOES_TIMER_RODADA = [60 * 60, 90 * 60, 120 * 60] as const
export const ACRESCIMO_SEGUNDOS = 5 * 60

/**
 * "16, 8, 4" → [16, 8, 4]. Cada corte é múltiplo de 4, menor que o anterior e
 * menor que o total de jogadores (quando já se sabe). `null` = texto inválido.
 */
export function lerCortes(texto: string, jogadores?: number, porMesa: 3 | 4 = 4): number[] | null {
  const partes = texto
    .split(/[^\d]+/)
    .filter(Boolean)
    .map(Number)
  if (partes.length === 0) return null
  const validos = partes.every(
    (corte, indice) =>
      corte >= porMesa && corte % porMesa === 0 && (indice === 0 ? !jogadores || corte < jogadores : corte < partes[indice - 1]),
  )
  return validos ? partes : null
}

/** `porMesa`: no Sanma cada corte é múltiplo de 3. */
export function formatoValido(formato: ConfigFormato, jogadores?: number, porMesa: 3 | 4 = 4): boolean {
  switch (formato.tipo) {
    case 'rodizio':
    case 'suico':
      return formato.rodadas >= 1
    case 'eliminatorio':
      return (
        formato.rodadasClassificatoria >= 1 &&
        formato.rodadasPorFase >= 1 &&
        lerCortes(formato.cortes.join(','), jogadores, porMesa) !== null
      )
    case 'temporada':
      return formato.temporadaId !== ''
    default:
      return true
  }
}
