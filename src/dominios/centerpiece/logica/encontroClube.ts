/**
 * Encontro do clube: cada sorteio vira um encontro com data e hora, e as mesas que
 * saem dele ficam agrupadas em "Em andamento", como um torneio rápido de uma rodada.
 * Novo sorteio no mesmo dia é uma nova rodada do mesmo grupo.
 */
import type { InteiroAleatorio } from '@/compartilhado/sorteio/aleatorio'
import type { RodadaDoSorteio } from '@/compartilhado/sorteio/contagens'
import { estatisticaDaGrade, type EstatisticaDaGrade } from '@/compartilhado/sorteio/estatistica'
import { sortearRodada } from '@/compartilhado/sorteio/rodada'
import { normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import { chaveDaEntrada, type EntradaLista } from './listaClube'
import { ORDEM_VENTOS, type Partida } from './partida'
import { sortearMesas, type MesaSorteada, type ResultadoSorteio } from './sorteioClube'

export interface EncontroClube {
  id: string
  criadoEm: string
  /** A lista usada no sorteio: "Novo sorteio" repete com ela. */
  jogadores: EntradaLista[]
  /** As mesas do sorteio, por `chaveDaEntrada`, na ordem dos ventos. Encontros antigos não têm. */
  mesas?: { assentos: string[] }[]
  /** "Começar do zero": não conta mais nos próximos sorteios do dia. */
  foraDoDia?: boolean
}

export interface MesaDoSorteio extends MesaSorteada<EntradaLista> {
  /** Partida registrada a partir desta mesa. */
  partidaId?: string
}

/** Último sorteio, guardado até ser refeito ou a lista ser limpa. */
export interface SorteioClube {
  encontro: EncontroClube
  mesas: MesaDoSorteio[]
}

type GrupoAbertas =
  | { tipo: 'encontro'; encontroId: string; partidas: Partida[] }
  | { tipo: 'avulsa'; partida: Partida }

/**
 * Mesas abertas na ordem em que foram criadas, com as de um mesmo encontro juntas
 * (na posição da primeira) e ordenadas pelo número da mesa no sorteio.
 */
export function agruparAbertas(abertas: readonly Partida[]): GrupoAbertas[] {
  const grupos: GrupoAbertas[] = []
  const porEncontro = new Map<string, Partida[]>()
  for (const partida of abertas) {
    const encontroId = partida.encontro?.id
    if (!encontroId) {
      grupos.push({ tipo: 'avulsa', partida })
      continue
    }
    const lista = porEncontro.get(encontroId)
    if (lista) {
      lista.push(partida)
      continue
    }
    const nova = [partida]
    porEncontro.set(encontroId, nova)
    grupos.push({ tipo: 'encontro', encontroId, partidas: nova })
  }
  for (const lista of porEncontro.values()) {
    lista.sort((uma, outra) => (uma.encontro?.mesa ?? 0) - (outra.encontro?.mesa ?? 0))
  }
  return grupos
}

/** Com uma mesa só não há o que sortear nem o que avaliar. */
const MINIMO_PARA_AVALIAR = 8

/** Partida ou placar com o vínculo do encontro de onde saiu. */
type JogadaDoClube = { encontro?: { id: string } }

export function mesasParaGuardar(mesas: readonly MesaSorteada<EntradaLista>[]): { assentos: string[] }[] {
  return mesas.map((mesa) => ({ assentos: mesa.assentos.map(({ jogador }) => chaveDaEntrada(jogador)) }))
}

function mesmoDia(iso: string, dia: Date): boolean {
  return new Date(iso).toDateString() === dia.toDateString()
}

/**
 * As rodadas já jogadas no dia (data local), com as pessoas de `lista`. Só contam
 * sorteios com mesa iniciada ou registrada. Quem já foi embora vira lugar vazio, e o
 * convidado que se cadastrou no meio do dia é achado pelo nome.
 */
export function rodadasDoDia(
  encontros: readonly EncontroClube[],
  jogadas: readonly JogadaDoClube[],
  dia: Date,
  lista: readonly EntradaLista[],
): RodadaDoSorteio[] {
  const comMesaJogada = new Set(jogadas.map((jogada) => jogada.encontro?.id))
  const naLista = new Set(lista.map(chaveDaEntrada))
  const peloNome = new Map(lista.map((entrada) => [normalizarTexto(entrada.nome), chaveDaEntrada(entrada)]))

  return encontros.flatMap(({ id, criadoEm, jogadores, mesas, foraDoDia }) => {
    if (!mesas || foraDoDia || !comMesaJogada.has(id) || !mesmoDia(criadoEm, dia)) return []
    const entradas = new Map(jogadores.map((entrada) => [chaveDaEntrada(entrada), entrada]))
    const chaveDeHoje = (chave: string) => {
      if (naLista.has(chave)) return chave
      const entrada = entradas.get(chave)
      return (entrada && peloNome.get(normalizarTexto(entrada.nome))) ?? ''
    }
    return [{ mesas: mesas.map((mesa) => ({ assentos: mesa.assentos.map(chaveDeHoje) })) }]
  })
}

/** 1º sorteio do dia: aleatório puro. Do 2º em diante: o sorteio mitigado do Torneio. */
export function sortearDoDia(
  jogadores: readonly EntradaLista[],
  anteriores: readonly RodadaDoSorteio[],
  opcoes: { aleatorio?: InteiroAleatorio; evitar?: RodadaDoSorteio['mesas'] } = {},
): ResultadoSorteio<EntradaLista> {
  const simples = sortearMesas(jogadores, opcoes.aleatorio)
  if (!simples.ok || anteriores.length === 0) return simples
  const porChave = new Map(jogadores.map((entrada) => [chaveDaEntrada(entrada), entrada]))
  // Duas pessoas com a mesma chave (lista de backup antigo) não dão para mitigar.
  if (porChave.size !== jogadores.length) return simples
  const mesas = sortearRodada([...porChave.keys()], anteriores, opcoes).map(({ numero, assentos }) => ({
    numero,
    assentos: assentos.map((chave, indice) => ({ vento: ORDEM_VENTOS[indice], jogador: porChave.get(chave)! })),
  }))
  return { ok: true, mesas }
}

export interface SituacaoDoDia {
  /** Que rodada do dia é este sorteio. */
  numero: number
  /** Que rodada será o Novo sorteio. */
  proxima: number
  /** Do 2º sorteio do dia em diante, com 8 pessoas ou mais. */
  estatistica: EstatisticaDaGrade | null
}

export function situacaoDoDia(
  sorteio: SorteioClube,
  encontros: readonly EncontroClube[],
  jogadas: readonly JogadaDoClube[],
  agora: Date,
): SituacaoDoDia {
  const { id, criadoEm, jogadores } = sorteio.encontro
  const posicao = encontros.findIndex((encontro) => encontro.id === id)
  const atual = encontros[posicao]
  const proxima = rodadasDoDia(encontros, jogadas, agora, jogadores).length + 1
  if (!atual || atual.foraDoDia) return { numero: 1, proxima, estatistica: null }

  const anteriores = rodadasDoDia(encontros.slice(0, posicao), jogadas, new Date(criadoEm), jogadores)
  const avalia = anteriores.length > 0 && jogadores.length >= MINIMO_PARA_AVALIAR
  return {
    numero: anteriores.length + 1,
    proxima,
    estatistica: avalia
      ? estatisticaDaGrade(
          [...anteriores, { mesas: mesasParaGuardar(sorteio.mesas) }],
          jogadores.map(chaveDaEntrada),
          4,
          true,
        )
      : null,
  }
}

/** "Começar do zero": os sorteios de hoje deixam de contar, sem sair do histórico. */
export function comecarDiaDoZero(encontros: readonly EncontroClube[], agora: Date): EncontroClube[] {
  return encontros.map((encontro) => (mesmoDia(encontro.criadoEm, agora) ? { ...encontro, foraDoDia: true } : encontro))
}

/** Marca a mesa do sorteio como registrada, sem perder as outras. */
export function marcarMesaRegistrada(sorteio: SorteioClube, numero: number, partidaId: string): SorteioClube {
  return {
    ...sorteio,
    mesas: sorteio.mesas.map((mesa) => (mesa.numero === numero ? { ...mesa, partidaId } : mesa)),
  }
}

/** Quantas mesas do sorteio já têm resultado (a partida existe no histórico). */
export function mesasRegistradas(sorteio: SorteioClube, partidas: readonly Pick<Partida, 'id'>[]): number {
  const ids = new Set(partidas.map((partida) => partida.id))
  return sorteio.mesas.filter((mesa) => mesa.partidaId && ids.has(mesa.partidaId)).length
}
