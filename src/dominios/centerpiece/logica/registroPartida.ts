/**
 * Liga a linha do tempo da mão ao motor da partida: Riichi marcado no descarte
 * também paga o palito, e a mão informada vira esperas pela lógica da calculadora.
 */
import { configuracaoPadrao } from '@/compartilhado/mahjong/pontuacao/configuracao'
import { calcularEsperasPossiveis } from '@/dominios/calculadora-mao/logica/esperas'
import { gerarNotacaoCompleta } from '@/dominios/calculadora-mao/logica/notacao'
import { contarSlotsLogicos } from '@/dominios/calculadora-mao/logica/ordenacao'
import type { CodigoPedra, Mao, Meld } from '@/dominios/calculadora-mao/logica/tipos'
import {
  adicionarDescartes,
  adicionarKakan,
  desfazerUltimoLance,
  descartesDe,
  marcarChamada,
  muroPermiteRiichi,
  pedraBase,
  REGISTRO_VAZIO,
  ultimoLanceDe,
  type MaoInformada,
  type RegistroMao,
  type TipoChamada,
} from './descartes'
import { calcularFuriten, type EstadoFuriten } from './furiten'
import {
  declararRiichi,
  desfazer,
  jogadoresNaMesa,
  podeDeclararRiichi,
  type Cadeira,
  type Contexto,
  type Partida,
} from './partida'
import { passarVezPara } from './vez'

const registroDe = (partida: Partida): RegistroMao => partida.registro ?? REGISTRO_VAZIO

export function registrarDescartes(
  partida: Partida,
  cadeira: Cadeira,
  pedras: readonly CodigoPedra[],
  opcoes: { riichi: boolean },
  contexto: Contexto,
): Partida {
  const registro = registroDe(partida)
  const antes = { vezAntes: partida.vez, eventosAntes: partida.eventos.length }
  const jaDeitou = descartesDe(registro.lances, cadeira).some((descarte) => descarte.riichi)
  const emRiichi = partida.placar.riichi.includes(cadeira)

  if (
    opcoes.riichi &&
    !emRiichi &&
    podeDeclararRiichi(partida.placar, cadeira) &&
    muroPermiteRiichi(registro.lances, jogadoresNaMesa(partida))
  ) {
    const comRiichi = declararRiichi(partida, cadeira, contexto)
    return {
      ...comRiichi,
      registro: adicionarDescartes(registro, cadeira, pedras, {
        indiceRiichi: pedras.length - 1,
        declarouRiichi: true,
        antes,
      }),
    }
  }

  // Riichi declarado pelo menu: o próximo descarte é o que fica deitado.
  const indiceRiichi = emRiichi && !jaDeitou ? 0 : undefined
  return { ...partida, registro: adicionarDescartes(registro, cadeira, pedras, { indiceRiichi, antes }) }
}

export function registrarKakan(
  partida: Partida,
  cadeira: Cadeira,
  pedra: CodigoPedra,
  fechado = false,
): Partida {
  return {
    ...partida,
    registro: adicionarKakan(
      registroDe(partida),
      cadeira,
      pedra,
      { vezAntes: partida.vez, eventosAntes: partida.eventos.length },
      fechado,
    ),
  }
}

export function desfazerLance(partida: Partida, cadeira: Cadeira): Partida {
  const registro = registroDe(partida)
  const ultimo = ultimoLanceDe(registro, cadeira)
  if (!ultimo) return partida
  const semLance = { ...partida, registro: desfazerUltimoLance(registro, cadeira) }

  const evento = partida.eventos[partida.eventos.length - 1]
  const desfazRiichi =
    ultimo.tipo === 'descarte' &&
    ultimo.declarouRiichi &&
    evento?.tipo === 'riichi' &&
    evento.detalhe?.cadeira === cadeira
  return desfazRiichi ? desfazer(semLance) : semLance
}

/**
 * O Desfazer da mesa: o que aconteceu por último, seja o descarte (com a chamada e
 * a vez de antes dele) ou um evento da mesa, como um Riichi declarado pelo menu.
 */
export function desfazerUltimoDaMesa(partida: Partida, agora: number): Partida {
  const { lances } = registroDe(partida)
  const ultimo = lances[lances.length - 1]
  if (!ultimo) return desfazer(partida)

  const eventosDoLance =
    (ultimo.eventosAntes ?? partida.eventos.length) +
    (ultimo.tipo === 'descarte' && ultimo.declarouRiichi ? 1 : 0)
  if (partida.eventos.length > eventosDoLance) return desfazer(partida)

  const semLance = desfazerLance(partida, ultimo.cadeira)
  const vez = ultimo.vezAntes
  if (!vez) return semLance
  return {
    ...semLance,
    vez:
      vez.comecou && partida.config.timerVez > 0
        ? passarVezPara(vez.cadeira, partida.config.timerVez, agora)
        : vez,
  }
}

export function chamarPedra(
  partida: Partida,
  ordem: number,
  chamada?: { cadeira: Cadeira; tipo: TipoChamada },
): Partida {
  return {
    ...partida,
    registro: marcarChamada(
      registroDe(partida),
      ordem,
      chamada && { ...chamada, jogadorId: partida.assentos[chamada.cadeira].jogadorId },
    ),
  }
}

/** Usa a mesma lógica de esperas da Calculadora de Mão, sem nada novo de regra. */
export function esperasDaMao(pedras: CodigoPedra[], melds: Meld[]): CodigoPedra[] {
  const mao: Mao = {
    pedras,
    melds,
    indiceAgari: -1,
    agariMeld: null,
    agari: 'ron',
    dora: [],
    uradora: [],
    descartes: [],
    doraManual: 0,
    uradoraManual: 0,
    honba: 0,
    riichi: null,
    bencao: false,
    ultimaPedra: false,
    kan: false,
    ventoRodada: '1',
    ventoAssento: '1',
  }
  const esperas = calcularEsperasPossiveis(mao, configuracaoPadrao, contarSlotsLogicos(mao))
  return [...new Set(esperas.map((espera) => pedraBase(espera.pedra)))]
}

/** Agrupa as últimas pedras escolhidas numa chamada, se elas formarem uma. */
export function agruparChamada(
  soltas: readonly CodigoPedra[],
  tipo: Meld['tipo'],
): { soltas: CodigoPedra[]; meld: Meld } | null {
  const tamanho = tipo === 'kanAberto' || tipo === 'kanFechado' ? 4 : 3
  if (soltas.length < tamanho) return null
  const pedras = soltas.slice(-tamanho)
  const resto = soltas.slice(0, -tamanho)
  const bases = pedras.map(pedraBase)
  if (tipo === 'chii') {
    if (bases.some((base) => base[1] === 'z' || base[1] !== bases[0][1])) return null
    const ordenadas = [...pedras].sort((a, b) => pedraBase(a).localeCompare(pedraBase(b)))
    const numeros = ordenadas.map((pedra) => Number(pedraBase(pedra)[0]))
    if (numeros[1] !== numeros[0] + 1 || numeros[2] !== numeros[1] + 1) return null
    return { soltas: resto, meld: { tipo, pedras: ordenadas } }
  }
  if (bases.some((base) => base !== bases[0])) return null
  return { soltas: resto, meld: { tipo, pedras } }
}

export function montarMaoInformada(
  pedras: CodigoPedra[],
  melds: Meld[],
  esperas: CodigoPedra[],
): Omit<MaoInformada, 'aposOrdem'> {
  return { notacao: gerarNotacaoCompleta(pedras, -1, melds), pedras, melds, esperas }
}

export function salvarMaoInformada(
  partida: Partida,
  cadeira: Cadeira,
  mao: Omit<MaoInformada, 'aposOrdem'>,
): Partida {
  const registro = registroDe(partida)
  return {
    ...partida,
    registro: {
      ...registro,
      maos: { ...registro.maos, [cadeira]: { ...mao, aposOrdem: registro.lances.length } },
    },
  }
}

export function furitenDe(partida: Partida, cadeira: Cadeira): EstadoFuriten | null {
  const mao = partida.registro?.maos[cadeira]
  return mao ? calcularFuriten(partida.registro?.lances ?? [], cadeira, mao.esperas) : null
}

/** Sem Riichi, um descarte depois de informar pode ter mudado a mão: vale avisar. */
export function maoPodeTerMudado(partida: Partida, cadeira: Cadeira): boolean {
  const mao = partida.registro?.maos[cadeira]
  if (!mao || partida.placar.riichi.includes(cadeira)) return false
  return descartesDe(partida.registro?.lances ?? [], cadeira).some(
    (descarte) => descarte.ordem > mao.aposOrdem,
  )
}
