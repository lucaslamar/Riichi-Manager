// ─── Tipos de resultado ───────────────────────────────────────────────────────

type PontosTsumo = {
  agari: 'tsumo'
  pontos: { total: number; oya: { ko: number }; ko: { oya: number; ko: number } }
}
type PontosRon = {
  agari: 'ron'
  pontos: { total: number; oya: { ron: number }; ko: { ron: number } }
}
type SemAgari = { agari: null }
export type PontosCalculados = PontosTsumo | PontosRon | SemAgari

export type ResultadoMao = PontosCalculados & {
  isOya: boolean
  yakuman: number
  /** [nome traduzido, valor han, é yakuman?] */
  yaku: [string, number, boolean][]
  fuDetalhes: DetalheFu[]
  semYaku: boolean
  han: number
  fu: number
  /** Nome do patamar traduzido (Mangan, Haneman, etc.) */
  nome: string | null
}

export type DetalheFu = {
  tipo: string
  descricao: string
  fu: number
}
