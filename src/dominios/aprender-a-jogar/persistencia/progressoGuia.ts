/**
 * Onde a pessoa parou no guia e quais módulos já concluiu, só neste aparelho.
 * O armazenamento pode faltar (janela anônima, dados bloqueados): o guia
 * funciona do mesmo jeito, só sem lembrar.
 */
const CHAVE = 'riichi-manager-aprender-a-jogar'

/** Ordem atual dos módulos. Sobe quando páginas mudam de número. */
const VERSAO = 2

/**
 * Páginas salvas na versão 1 (6 módulos) que mudaram de número ou saíram do
 * livro: a pessoa volta para a capa do módulo onde o assunto está agora.
 */
const MOVIDAS_V1: Record<string, string> = {
  'muro-morto': 'capa-mesa',
  compra: 'capa-mesa',
  prioridade: 'capa-turno',
  kan: 'capa-kan',
  juntando: 'capa-pontos',
  indicador: 'capa-dora',
  'aka-dora': 'capa-dora',
  'ura-dora': 'capa-dora',
  'dora-quiz': 'capa-dora',
}

export interface ProgressoGuia {
  /** Id da última tela do livro vista. */
  pagina?: string
  /** Ids dos módulos cujo quiz já foi alcançado. */
  concluidos: string[]
}

export function lerProgressoGuia(): ProgressoGuia {
  try {
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE) ?? 'null') as
      | (Partial<ProgressoGuia> & { versao?: number })
      | null
    const pagina = typeof salvo?.pagina === 'string' ? salvo.pagina : undefined
    const antiga = (salvo?.versao ?? 1) < VERSAO
    return {
      pagina: pagina && antiga ? (MOVIDAS_V1[pagina] ?? pagina) : pagina,
      concluidos: Array.isArray(salvo?.concluidos)
        ? salvo.concluidos.filter((id): id is string => typeof id === 'string')
        : [],
    }
  } catch {
    return { concluidos: [] }
  }
}

export function salvarProgressoGuia(progresso: ProgressoGuia) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ ...progresso, versao: VERSAO }))
  } catch {
    // Sem armazenamento: o progresso vale só enquanto o guia está aberto.
  }
}
