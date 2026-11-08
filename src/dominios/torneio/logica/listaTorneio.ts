/**
 * Lista do torneio: um nome por linha, como a Lista do clube, mas sem convidados.
 * Todo mundo vira jogador do cadastro ao sortear, e as mesas fecham sempre com 4.
 */
import { jogadorDaLinha, linhasDoTexto } from '@/dominios/centerpiece/logica/listaClube'
import { normalizarTexto, type Jogador } from '@/dominios/jogadores/logica/jogadores'

/** Menor torneio: duas mesas. */
export const MINIMO_JOGADORES = 8

/** "1.", "2)", "10 -", "-", "•", "*" no começo da linha, como nas listas do WhatsApp. */
const MARCADOR = /^\s*(?:\d+\s*[.)\-:º°]?|[-–—•·*▪◦>])\s*/

/**
 * Texto colado: um nome por linha, sem números, marcadores e linhas que eram só
 * número. Nomes separados por vírgula ou ponto e vírgula também quebram.
 */
export function limparColagem(texto: string): string {
  return texto
    .split(/\r?\n|[,;]/)
    .map((linha) => {
      let limpa = linha
      // "1. - Ana": tira os marcadores um atrás do outro.
      for (let antes = ''; antes !== limpa; ) {
        antes = limpa
        limpa = limpa.replace(MARCADOR, '')
      }
      return limpa.trim().replace(/\s+/g, ' ')
    })
    .filter((linha) => linha && !/^\d+$/.test(linha))
    .join('\n')
}

export type StatusLista =
  | { tipo: 'primeiraMesa'; faltam: number }
  | { tipo: 'proximaMesa'; faltam: number }
  | { tipo: 'repetidos'; quantidade: number }
  | { tipo: 'pronta' }

export interface AnaliseLista {
  /** Nomes válidos, sem vazias e sem os repetidos. */
  nomes: string[]
  /** Índice (na lista de linhas) de cada linha repetida, para sublinhar. */
  repetidas: ReadonlySet<number>
  jogadores: number
  mesas: number
  status: StatusLista
  podeSortear: boolean
}

/**
 * O que a lista diz: quantos jogadores e mesas, o que falta e se dá para sortear.
 * Repetido é o mesmo nome (sem acento e sem maiúsculas) ou o mesmo cadastro.
 */
export function analisarLista(texto: string, jogadores: readonly Jogador[]): AnaliseLista {
  const vistos = new Set<string>()
  const nomes: string[] = []
  const repetidas = new Set<number>()
  linhasDoTexto(texto).forEach((linha, indice) => {
    if (!linha) return
    const jogador = jogadorDaLinha(jogadores, linha)
    const chave = jogador ? `id:${jogador.id}` : `nome:${normalizarTexto(linha)}`
    if (vistos.has(chave)) {
      repetidas.add(indice)
      return
    }
    vistos.add(chave)
    nomes.push(linha)
  })

  const total = nomes.length
  const mesas = Math.floor(total / 4)
  const status: StatusLista =
    repetidas.size > 0
      ? { tipo: 'repetidos', quantidade: repetidas.size }
      : total < 4
        ? { tipo: 'primeiraMesa', faltam: 4 - total }
        : total < MINIMO_JOGADORES || total % 4 !== 0
          ? { tipo: 'proximaMesa', faltam: 4 - (total % 4) }
          : { tipo: 'pronta' }
  return { nomes, repetidas, jogadores: total, mesas, status, podeSortear: status.tipo === 'pronta' }
}

/**
 * Ids de quem está na lista, na ordem dela. Quem já está no cadastro usa o id de
 * lá; os outros são criados por `cadastrar` (que recebe só os nomes novos).
 */
export function idsDaLista(
  nomes: readonly string[],
  jogadores: readonly Jogador[],
  cadastrar: (nomes: string[]) => string[],
): string[] {
  const existentes = nomes.map((nome) => jogadorDaLinha(jogadores, nome)?.id)
  const novos = nomes.filter((_, indice) => !existentes[indice])
  const idsNovos = novos.length > 0 ? cadastrar(novos) : []
  let proximo = 0
  return existentes.map((id) => id ?? idsNovos[proximo++])
}
