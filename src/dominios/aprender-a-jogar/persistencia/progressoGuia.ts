import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'
import { MODULOS_MCR } from '../conteudo/mcr/modulos'

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
  prioridade: 'capa-turno',
  kan: 'capa-kan',
  juntando: 'capa-pontos',
  indicador: 'capa-dora',
  'aka-dora': 'capa-dora',
  'ura-dora': 'capa-dora',
  'dora-quiz': 'capa-dora',
}

/**
 * Módulos do MCR que mudaram de id quando o livro foi de 6 para 24 módulos
 * (2 → 10 e 3 → 8). Os antigos 1, 4, 5 e 6 guardaram o id (hoje 1, 11, 13 e 14).
 */
const MODULOS_MCR_MOVIDOS: Record<string, string> = {
  'mcr-termos': 'mcr-chamadas',
  'mcr-como-jogar': 'mcr-turno',
}

const doMcr = (id: string) => id.startsWith('mcr-')
const paginaDoMcr = (id: string) => /^(capa-|parte-|marco-)?mcr-/.test(id)

/** Os módulos concluídos com os ids de hoje. Os do Riichi passam intactos. */
export function migrarConcluidos(concluidos: string[]): string[] {
  const atuais = concluidos
    .map((id) => MODULOS_MCR_MOVIDOS[id] ?? id)
    .filter((id) => !doMcr(id) || MODULOS_MCR.includes(id))
  return [...new Set(atuais)]
}

/** Página salva de um módulo que mudou de id: vai para a capa do novo. */
export function migrarPaginaMcr(pagina: string): string {
  const antigo = Object.keys(MODULOS_MCR_MOVIDOS).find((id) => pagina.includes(id))
  return antigo ? `capa-${MODULOS_MCR_MOVIDOS[antigo]}` : pagina
}

interface Salvo {
  pagina?: unknown
  /** O lugar no livro do MCR, à parte do Riichi. */
  paginaMcr?: unknown
  concluidos?: unknown
  versao?: number
}

function lerSalvo(): Salvo | null {
  return JSON.parse(window.localStorage.getItem(CHAVE) ?? 'null') as Salvo | null
}

interface ProgressoGuia {
  /** Id da última tela do livro vista. */
  pagina?: string
  /** Ids dos módulos cujo quiz já foi alcançado. */
  concluidos: string[]
}

export function lerProgressoGuia(modo: ModoJogo): ProgressoGuia {
  try {
    const salvo = lerSalvo()
    const concluidos = migrarConcluidos(
      Array.isArray(salvo?.concluidos)
        ? salvo.concluidos.filter((id): id is string => typeof id === 'string')
        : [],
    )
    const pagina = typeof salvo?.pagina === 'string' ? salvo.pagina : undefined
    if (modo === 'mcr') {
      // Antes os dois livros dividiam o mesmo campo.
      const antes = pagina && paginaDoMcr(pagina) ? pagina : undefined
      const lugar = typeof salvo?.paginaMcr === 'string' ? salvo.paginaMcr : antes
      return { pagina: lugar && migrarPaginaMcr(lugar), concluidos }
    }
    const antiga = (salvo?.versao ?? 1) < VERSAO
    return { pagina: pagina && antiga ? (MOVIDAS_V1[pagina] ?? pagina) : pagina, concluidos }
  } catch {
    return { concluidos: [] }
  }
}

export function salvarProgressoGuia(modo: ModoJogo, { pagina, concluidos }: ProgressoGuia) {
  try {
    const salvo = lerSalvo()
    const doRiichi = salvo?.pagina
    const lugares =
      modo === 'mcr'
        ? {
            // A página antiga do Riichi é atualizada aqui, porque a versão sobe ao salvar.
            pagina:
              typeof doRiichi === 'string' && (salvo?.versao ?? 1) < VERSAO
                ? (MOVIDAS_V1[doRiichi] ?? doRiichi)
                : doRiichi,
            paginaMcr: pagina,
          }
        : { pagina, paginaMcr: salvo?.paginaMcr }
    window.localStorage.setItem(CHAVE, JSON.stringify({ ...lugares, concluidos, versao: VERSAO }))
  } catch {
    // Sem armazenamento: o progresso vale só enquanto o guia está aberto.
  }
}
