/**
 * Onde a pessoa parou no guia e quais módulos já concluiu, só neste aparelho.
 * O armazenamento pode faltar (janela anônima, dados bloqueados): o guia
 * funciona do mesmo jeito, só sem lembrar.
 */
const CHAVE = 'riichi-manager-aprender-a-jogar'

export interface ProgressoGuia {
  /** Id da última tela do livro vista. */
  pagina?: string
  /** Ids dos módulos cujo quiz já foi alcançado. */
  concluidos: string[]
}

export function lerProgressoGuia(): ProgressoGuia {
  try {
    const salvo = JSON.parse(
      window.localStorage.getItem(CHAVE) ?? 'null',
    ) as Partial<ProgressoGuia> | null
    return {
      pagina: typeof salvo?.pagina === 'string' ? salvo.pagina : undefined,
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
    window.localStorage.setItem(CHAVE, JSON.stringify(progresso))
  } catch {
    // Sem armazenamento: o progresso vale só enquanto o guia está aberto.
  }
}
