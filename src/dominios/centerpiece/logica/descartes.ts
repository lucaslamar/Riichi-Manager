/**
 * Linha do tempo da mão: descartes dos 4 jogadores em ordem global, com Riichi,
 * pedras chamadas e kakan. Dados estruturados, prontos para o furiten e para um
 * futuro modo falado. Puro: quem chama decide onde guardar.
 */
import {
  interpretarNotacao,
  normalizarNotacao,
  type ErroNotacao,
} from '@/dominios/calculadora-mao/logica/notacao'
import type { CodigoPedra, Meld } from '@/dominios/calculadora-mao/logica/tipos'
import type { Cadeira } from './partida'
import type { EstadoVez } from './vez'

export type TipoChamada = 'chi' | 'pon' | 'kan' | 'ron'

/** Como a mesa estava antes do lance: é para onde o Desfazer volta. */
export interface AntesDoLance {
  vezAntes?: EstadoVez
  eventosAntes?: number
}

export interface LanceDescarte extends AntesDoLance {
  tipo: 'descarte'
  /** Ordem global na mão: 1, 2, 3… somando os 4 jogadores. */
  ordem: number
  cadeira: Cadeira
  pedra: CodigoPedra
  riichi: boolean
  /** O Riichi foi declarado por este descarte: desfazer um desfaz o outro. */
  declarouRiichi?: boolean
  chamadaPor?: { cadeira: Cadeira; jogadorId?: string; tipo: TipoChamada }
}

/** Pedra acrescentada a um pon: quem esperava por ela perdeu o chankan. */
export interface LanceKakan extends AntesDoLance {
  tipo: 'kakan'
  ordem: number
  cadeira: Cadeira
  pedra: CodigoPedra
}

export type Lance = LanceDescarte | LanceKakan

export interface MaoInformada {
  notacao: string
  pedras: CodigoPedra[]
  melds: Meld[]
  esperas: CodigoPedra[]
  /** Quantos lances já existiam ao informar: um descarte depois pode ter mudado a mão. */
  aposOrdem: number
}

export interface RegistroMao {
  lances: Lance[]
  maos: Partial<Record<Cadeira, MaoInformada>>
}

export const REGISTRO_VAZIO: RegistroMao = { lances: [], maos: {} }

/** O 5 vermelho conta como o 5 comum em espera, furiten e contagem de cópias. */
export function pedraBase(pedra: CodigoPedra): CodigoPedra {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

export function adicionarDescartes(
  registro: RegistroMao,
  cadeira: Cadeira,
  pedras: readonly CodigoPedra[],
  marca: { indiceRiichi?: number; declarouRiichi?: boolean; antes?: AntesDoLance } = {},
): RegistroMao {
  const novos: Lance[] = pedras.map((pedra, indice) => ({
    tipo: 'descarte',
    ordem: registro.lances.length + indice + 1,
    cadeira,
    pedra,
    riichi: indice === marca.indiceRiichi,
    ...marca.antes,
    ...(indice === marca.indiceRiichi && marca.declarouRiichi ? { declarouRiichi: true } : {}),
  }))
  return { ...registro, lances: [...registro.lances, ...novos] }
}

export function adicionarKakan(
  registro: RegistroMao,
  cadeira: Cadeira,
  pedra: CodigoPedra,
  antes?: AntesDoLance,
): RegistroMao {
  const lance: Lance = { tipo: 'kakan', ordem: registro.lances.length + 1, cadeira, pedra, ...antes }
  return { ...registro, lances: [...registro.lances, lance] }
}

export function ultimoLanceDe(registro: RegistroMao, cadeira: Cadeira): Lance | undefined {
  return registro.lances.filter((lance) => lance.cadeira === cadeira).pop()
}

/** Tira o último lance do jogador e renumera os seguintes. */
export function desfazerUltimoLance(registro: RegistroMao, cadeira: Cadeira): RegistroMao {
  const ultimo = ultimoLanceDe(registro, cadeira)
  if (!ultimo) return registro
  return {
    ...registro,
    lances: registro.lances
      .filter((lance) => lance !== ultimo)
      .map((lance, indice) => ({ ...lance, ordem: indice + 1 })),
  }
}

/** Marca (ou, sem `chamada`, desmarca) a pedra chamada por outro jogador. */
export function marcarChamada(
  registro: RegistroMao,
  ordem: number,
  chamada?: LanceDescarte['chamadaPor'],
): RegistroMao {
  return {
    ...registro,
    lances: registro.lances.map((lance) => {
      if (lance.ordem !== ordem || lance.tipo !== 'descarte') return lance
      const { chamadaPor: _anterior, ...resto } = lance
      return chamada ? { ...resto, chamadaPor: chamada } : resto
    }),
  }
}

/** O Riichi foi desfeito pela mesa: o descarte deixa de estar deitado. */
export function desmarcarRiichi(registro: RegistroMao, cadeira: Cadeira): RegistroMao {
  return {
    ...registro,
    lances: registro.lances.map((lance) =>
      lance.tipo === 'descarte' && lance.cadeira === cadeira && lance.riichi
        ? { ...lance, riichi: false, declarouRiichi: undefined }
        : lance,
    ),
  }
}

export function descartesDe(lances: readonly Lance[], cadeira: Cadeira) {
  return lances.filter(
    (lance): lance is LanceDescarte => lance.tipo === 'descarte' && lance.cadeira === cadeira,
  )
}

const ehTerminalOuHonra = (pedra: CodigoPedra) =>
  pedra[1] === 'z' || pedra[0] === '1' || pedra[0] === '9'

/** Quem descartou só terminais e honras e não teve pedra chamada. */
export function candidatosNagashi(lances: readonly Lance[]): Cadeira[] {
  return ([0, 1, 2, 3] as const).filter((cadeira) => {
    const descartes = descartesDe(lances, cadeira)
    return (
      descartes.length > 0 &&
      descartes.every((descarte) => ehTerminalOuHonra(descarte.pedra) && !descarte.chamadaPor)
    )
  })
}

/** Os 4 primeiros lances são descartes do mesmo vento, de 4 jogadores, sem chamada. */
export function ehQuatroVentos(lances: readonly Lance[]): boolean {
  if (lances.length !== 4) return false
  const [primeiro] = lances
  return (
    ['1z', '2z', '3z', '4z'].includes(primeiro.pedra) &&
    new Set(lances.map((lance) => lance.cadeira)).size === 4 &&
    lances.every(
      (lance) => lance.tipo === 'descarte' && lance.pedra === primeiro.pedra && !lance.chamadaPor,
    )
  )
}

export function informarMao(registro: RegistroMao, cadeira: Cadeira, mao: MaoInformada): RegistroMao {
  return { ...registro, maos: { ...registro.maos, [cadeira]: mao } }
}

export function removerMao(registro: RegistroMao, cadeira: Cadeira): RegistroMao {
  const maos = { ...registro.maos }
  delete maos[cadeira]
  return { ...registro, maos }
}

export interface LeituraPedras {
  pedras: CodigoPedra[]
  erro: ErroNotacao | null
}

/**
 * Lê `3m5p1z`, a mesma notação da calculadora, e recusa o que não existe na mesa:
 * mais de 4 cópias de uma pedra somando o que já foi descartado.
 */
export function lerPedrasDescartadas(texto: string, lances: readonly Lance[]): LeituraPedras {
  const { pedras, erro } = interpretarNotacao(normalizarNotacao(texto), { melds: [], akadora: true })
  if (erro) return { pedras: [], erro }
  if (pedras.length === 0) return { pedras: [], erro: { chave: 'notation.errors.invalid' } }

  const copias = new Map<string, number>()
  for (const pedra of [...lances.map((lance) => lance.pedra), ...pedras]) {
    const base = pedraBase(pedra)
    const total = (copias.get(base) ?? 0) + 1
    if (total > 4) {
      return { pedras: [], erro: { chave: 'notation.errors.tooManyCopies', parametros: { tile: base } } }
    }
    copias.set(base, total)
  }
  return { pedras, erro: null }
}
