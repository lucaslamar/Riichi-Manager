/**
 * Liga a linha do tempo da mão ao motor da partida: Riichi marcado no descarte
 * também paga o palito, e a mão informada vira esperas pela lógica da calculadora.
 */
import { configuracaoPadrao } from '@/compartilhado/mahjong/pontuacao/configuracao'
import { calcularEsperasPossiveis } from '@/dominios/calculadora-mao/logica/esperas'
import {
  interpretarNotacaoCompleta,
  normalizarNotacao,
  type ErroNotacao,
} from '@/dominios/calculadora-mao/logica/notacao'
import { contarSlotsLogicos } from '@/dominios/calculadora-mao/logica/ordenacao'
import type { CodigoPedra, Mao, Meld } from '@/dominios/calculadora-mao/logica/tipos'
import {
  adicionarDescartes,
  adicionarKakan,
  desfazerUltimoLance,
  descartesDe,
  marcarChamada,
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
  podeDeclararRiichi,
  type Cadeira,
  type Contexto,
  type Partida,
} from './partida'

const registroDe = (partida: Partida): RegistroMao => partida.registro ?? REGISTRO_VAZIO

export function registrarDescartes(
  partida: Partida,
  cadeira: Cadeira,
  pedras: readonly CodigoPedra[],
  opcoes: { riichi: boolean },
  contexto: Contexto,
): Partida {
  const registro = registroDe(partida)
  const jaDeitou = descartesDe(registro.lances, cadeira).some((descarte) => descarte.riichi)
  const emRiichi = partida.placar.riichi.includes(cadeira)

  if (opcoes.riichi && !emRiichi && podeDeclararRiichi(partida.placar, cadeira)) {
    const comRiichi = declararRiichi(partida, cadeira, contexto)
    return {
      ...comRiichi,
      registro: adicionarDescartes(registro, cadeira, pedras, {
        indiceRiichi: pedras.length - 1,
        declarouRiichi: true,
      }),
    }
  }

  // Riichi declarado pelo menu: o próximo descarte é o que fica deitado.
  const indiceRiichi = emRiichi && !jaDeitou ? 0 : undefined
  return { ...partida, registro: adicionarDescartes(registro, cadeira, pedras, { indiceRiichi }) }
}

export function registrarKakan(partida: Partida, cadeira: Cadeira, pedra: CodigoPedra): Partida {
  return { ...partida, registro: adicionarKakan(registroDe(partida), cadeira, pedra) }
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

export function chamarPedra(
  partida: Partida,
  ordem: number,
  chamada?: { cadeira: Cadeira; tipo: TipoChamada },
): Partida {
  return { ...partida, registro: marcarChamada(registroDe(partida), ordem, chamada) }
}

export type LeituraMao =
  | { mao: Omit<MaoInformada, 'aposOrdem'>; erro: null }
  | { mao: null; erro: ErroNotacao | { chave: 'match.discards.handNot13' | 'match.discards.handNotTenpai' } }

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

export function lerMaoInformada(texto: string): LeituraMao {
  const notacao = normalizarNotacao(texto)
  const { pedras, melds, erro } = interpretarNotacaoCompleta(notacao, { akadora: true })
  if (erro) return { mao: null, erro }
  if (contarSlotsLogicos({ pedras, melds }) !== 13) {
    return { mao: null, erro: { chave: 'match.discards.handNot13' } }
  }
  const esperas = esperasDaMao(pedras, melds)
  if (esperas.length === 0) return { mao: null, erro: { chave: 'match.discards.handNotTenpai' } }
  return { mao: { notacao, pedras, melds, esperas }, erro: null }
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
