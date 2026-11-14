/**
 * Busca e filtros das listas de mesas, encontros e torneios (Em andamento).
 * Funções puras: quem usa monta os itens com os textos que a busca enxerga.
 */

export type PeriodoLista = 'hoje' | 'semana' | 'mes' | 'tudo'
export type OrdemLista = 'recentes' | 'antigos' | 'nome'

export interface FiltrosLista {
  periodo: PeriodoLista
  ordem: OrdemLista
}

export const FILTROS_LISTA_PADRAO: FiltrosLista = { periodo: 'tudo', ordem: 'recentes' }
export const PERIODOS_LISTA: readonly PeriodoLista[] = ['hoje', 'semana', 'mes', 'tudo']
export const ORDENS_LISTA: readonly OrdemLista[] = ['recentes', 'antigos', 'nome']

/** O que a lista precisa saber de cada item para buscar, filtrar e ordenar. */
export interface ItemDaLista {
  /** Data ISO de quando o item começou. */
  data: string
  /** Nome para ordenar de A a Z. */
  nome: string
  /** Tudo que a busca encontra: nome, jogadores, data escrita. */
  textos: readonly string[]
}

/** Sem acento nem maiúscula: "joão" acha "João". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/** Cada palavra da busca tem que aparecer em algum dos textos. */
export function casaBusca(busca: string, textos: readonly string[]): boolean {
  const palavras = normalizar(busca).split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return true
  const alvo = textos.map(normalizar).join(' ')
  return palavras.every((palavra) => alvo.includes(palavra))
}

/** Hoje, nos últimos 7 dias, no mês corrente ou sempre. */
export function noPeriodo(iso: string, periodo: PeriodoLista, agora: Date): boolean {
  if (periodo === 'tudo') return true
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return true
  if (periodo === 'hoje') return data.toDateString() === agora.toDateString()
  if (periodo === 'semana') return agora.getTime() - data.getTime() <= 7 * 24 * 60 * 60 * 1000
  return data.getFullYear() === agora.getFullYear() && data.getMonth() === agora.getMonth()
}

/** Quantos filtros da folha estão fora do padrão (o número no botão). */
export function filtrosListaAtivos(filtros: FiltrosLista): number {
  return (
    Number(filtros.periodo !== FILTROS_LISTA_PADRAO.periodo) + Number(filtros.ordem !== FILTROS_LISTA_PADRAO.ordem)
  )
}

/** Aplica busca, período e ordem. Não muda a lista original. */
export function filtrarLista<T extends ItemDaLista>(
  itens: readonly T[],
  busca: string,
  filtros: FiltrosLista,
  agora: Date,
  idioma: string,
): T[] {
  const visiveis = itens.filter((item) => casaBusca(busca, item.textos) && noPeriodo(item.data, filtros.periodo, agora))
  const tempo = (item: T) => new Date(item.data).getTime() || 0
  return [...visiveis].sort((a, b) =>
    filtros.ordem === 'nome'
      ? a.nome.localeCompare(b.nome, idioma, { sensitivity: 'base', numeric: true })
      : filtros.ordem === 'antigos'
        ? tempo(a) - tempo(b)
        : tempo(b) - tempo(a),
  )
}
