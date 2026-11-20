/**
 * Ponte entre a notação MCR (exemplos do Guia de bolso) e a calculadora: a mão
 * escrita vira uma `MaoChinesa` com as condições e é calculada pelo mesmo motor.
 */
import { lerNotacaoMcr } from '@/compartilhado/mahjong/mcr/notacao'
import { calcularFanMcr } from './fan-mcr'
import { paraMotor, type CondicoesMcr, type Flor, type MaoChinesa, type Vento } from './montagem'
import type { ResultadoFanMcr } from './tipos'

export interface MaoDaNotacao {
  mao: MaoChinesa
  condicoes: CondicoesMcr
}

export function maoDaNotacao(notacao: string): MaoDaNotacao {
  const lida = lerNotacaoMcr(notacao)
  return {
    mao: {
      pedras: lida.pedras,
      chamadas: lida.chamadas.map(({ tipo, pedras }) => ({ tipo, meio: pedras[1] })),
      flores: Array.from({ length: lida.flores }, (_, indice) => (indice + 1) as Flor),
    },
    condicoes: {
      forma: lida.tsumo ? 'tsumo' : 'ron',
      ventoRodada: lida.ventoRodada as Vento,
      ventoAssento: lida.ventoAssento as Vento,
      ultimaPedra: lida.ultimaDaParede,
      kan: lida.kan,
      ultimaDoTipo: lida.ultimaDoTipo,
    },
  }
}

/** Calcula a mão escrita na notação, com as flores. */
export function calcularNotacaoMcr(notacao: string): ResultadoFanMcr & MaoDaNotacao {
  const { mao, condicoes } = maoDaNotacao(notacao)
  return { ...calcularFanMcr(paraMotor(mao, condicoes), mao.flores.length), mao, condicoes }
}
