/**
 * @fileoverview Declaração de tipos para a biblioteca `riichi`.
 *
 * A biblioteca `riichi` (github:1Computer1/riichi) é JavaScript puro sem tipos.
 * Este arquivo diz ao TypeScript como ela funciona para evitar erros de compilação.
 *
 * Arquivos `.d.ts` são "contratos de tipos" — não geram código JavaScript,
 * só existem para o TypeScript saber o que esperar de um módulo externo.
 */

declare module 'riichi' {
  type PadraoFu =
    | {
        t: 'base' | 'chiitoi' | 'pinfuTsumo' | 'closedRon' | 'rinshanTsumo' | 'tsumo' | 'openPinfu'
        fu: number
      }
    | { t: 'yakuhaiPair'; double: boolean; fu: number; v: string | string[] }
    | { t: 'quad' | 'triplet'; yaochuu: boolean; open: boolean; fu: number; v: string | string[] }
    | {
        t: 'wait'
        w: 'ryanmen' | 'shanpon' | 'kanchan' | 'penchan' | 'tanki'
        fu: number
        v: string | string[]
      }

  /** Opções de configuração de regras passadas ao construtor. */
  interface OpcoesRiichi {
    multiYakuman?: boolean
    wyakuman?: boolean
    kuitan?: boolean
    ryuuiisouHatsu?: boolean
    noYakuFu?: boolean
    noYakuDora?: boolean
    kiriageMangan?: boolean
    kazoeYakuman?: boolean
    doubleWindFu?: boolean
    rinshanFu?: boolean
    sanma?: boolean
    sanmaBisection?: boolean
    otakazePei?: boolean
    aka?: boolean
    disabledYaku?: string[]
    localYaku?: string[]
  }

  /** Resultado retornado pelo método `.calc()`. */
  interface ResultadoRiichi {
    /** True se a mão é um agari válido. */
    isAgari: boolean
    /** True se não há yaku (mas a mão é válida estruturalmente). */
    noYaku: boolean
    /** Total de pontos do ganhador. */
    ten: number
    /** Han totais. */
    han: number
    /** Fu totais. */
    fu: number
    /** Detalhamento dos fu usados na melhor decomposição. */
    pattern?: PadraoFu[]
    /** Número de yakuman (0 se não for yakuman). */
    yakuman: number
    /** Nome especial da mão (満貫, 役満, etc.) ou undefined. */
    name?: string
    /** Map de nome do yaku → valor em string (ex: "1翻", "役満"). */
    yaku: Record<string, string>
    /** Pagamentos como Oya: [ron/tsumo-all]. */
    oya: number[]
    /** Pagamentos como Ko: [ron ou tsumo-oya, tsumo-ko]. */
    ko: number[]
    /** Mensagem de erro se a string de entrada for inválida. */
    error?: string
  }

  /**
   * Classe principal da biblioteca.
   * Recebe uma string de mão e opções de regras, expõe `.calc()`.
   */
  class Riichi {
    constructor(mao: string, opcoes?: OpcoesRiichi)
    calc(): ResultadoRiichi
  }

  export default Riichi
}
