/** Regras do bloco de notas de jogadores: uma linha por nome. */
import { normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import { MINIMO_JOGADORES } from './constantes'

/** Tira numeração e marcadores de listas coladas: "1.", "2)", "-", "•", "*". */
export function limparLinhaColada(linha: string) {
  return linha
    .trim()
    .replace(/^(\d+[.)\-:]?|[-•*–—])\s+/, '')
    .replace(/^\d+[.)]/, '')
    .trim()
}

/** Quebra um texto colado em nomes, ignorando linhas vazias e só numéricas. */
export function quebrarColagem(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map(limparLinhaColada)
    .filter((linha) => linha !== '' && !/^\d+$/.test(linha))
}

/** Cola na linha atual: o texto antes do cursor fica e as linhas novas entram depois. */
export function colarNaLinha(linhas: readonly string[], indice: number, texto: string): string[] {
  const nomes = quebrarColagem(texto)
  if (nomes.length === 0) return [...linhas]
  const atual = linhas[indice] ?? ''
  const novas = atual.trim() === '' ? nomes : [atual, ...nomes]
  return [...linhas.slice(0, indice), ...novas, ...linhas.slice(indice + 1)]
}

export function nomesPreenchidos(linhas: readonly string[]) {
  return linhas.map((linha) => linha.trim()).filter(Boolean)
}

/** Índices das linhas com nome repetido, sem olhar maiúsculas nem acentos. */
export function linhasRepetidas(linhas: readonly string[]): Set<number> {
  const vistos = new Map<string, number[]>()
  linhas.forEach((linha, indice) => {
    const chave = normalizarTexto(linha)
    if (chave) vistos.set(chave, [...(vistos.get(chave) ?? []), indice])
  })
  return new Set([...vistos.values()].filter((lista) => lista.length > 1).flat())
}

export interface SituacaoLista {
  total: number
  mesas: number
  faltam: number
  repetidos: boolean
  valida: boolean
}

/** Mínimo de 8 e múltiplo de 4, sem nomes repetidos. */
export function situacaoDaLista(linhas: readonly string[]): SituacaoLista {
  const total = nomesPreenchidos(linhas).length
  const repetidos = linhasRepetidas(linhas).size > 0
  const alvo = Math.max(MINIMO_JOGADORES, Math.ceil(total / 4) * 4)
  const faltam = alvo - total
  return {
    total,
    mesas: Math.floor(total / 4),
    faltam,
    repetidos,
    valida: faltam === 0 && !repetidos,
  }
}
