/**
 * Trocar a pedra da batida de uma mão completa. As opções são as esperas das 13
 * pedras sem a batida atual, as mesmas da primeira tela: trocar a batida não muda
 * o valor de nenhuma. Tocar numa pedra da própria mão (qual das 14 foi a batida)
 * é outra coisa e fica em `escolherPedraAgariMao`.
 */
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao'
import { calcularMao } from './calculo-mao'
import { calcularEsperasPossiveis } from './esperas'
import { ordenarPedras } from './ordenacao'
import type { CodigoPedra, Mao } from './tipos'

export interface CandidataBatida {
  pedra: CodigoPedra
  han: number
  yakuman: number
  semYaku: boolean
  furiten: boolean
}

const codigoBase = (pedra: CodigoPedra) => (pedra[0] === '0' ? `5${pedra[1]}` : pedra)

/** A mão sem a pedra da batida; `null` se nenhuma batida está marcada. */
export function maoSemBatida(mao: Mao): Mao | null {
  if (mao.agariMeld) {
    return {
      ...mao,
      pedras: [...mao.pedras, ...mao.agariMeld.pedrasConsumidasMao],
      melds: mao.melds.filter((_meld, indice) => indice !== mao.agariMeld?.indiceMeld),
      indiceAgari: -1,
      agariMeld: null,
    }
  }
  if (mao.indiceAgari < 0 || mao.indiceAgari >= mao.pedras.length) return null
  return {
    ...mao,
    pedras: mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari),
    indiceAgari: -1,
    agariMeld: null,
  }
}

/** A mão com `pedra` como batida, ou `null` se ela não é espera das 13 pedras. */
export function trocarBatida(mao: Mao, pedra: CodigoPedra, config: ConfiguracaoCalculo): Mao | null {
  const base = maoSemBatida(mao)
  if (!base) return null
  if (!calcularEsperasPossiveis(base, config, 13).some((espera) => espera.pedra === pedra)) return null
  const pedras = ordenarPedras([...base.pedras, pedra])
  return { ...base, pedras, indiceAgari: pedras.lastIndexOf(pedra) }
}

export function candidatasDaBatida(
  mao: Mao,
  config: ConfiguracaoCalculo,
): Map<string, CandidataBatida> {
  const base = maoSemBatida(mao)
  const esperas = base ? calcularEsperasPossiveis(base, config, 13) : []
  if (esperas.length > 0) {
    return new Map(
      esperas.map(({ pedra, han, yakuman, semYaku, furiten }) => [
        pedra,
        { pedra, han, yakuman, semYaku, furiten },
      ]),
    )
  }

  /*
   * Mão completa: tirar qualquer pedra da mão fechada deixa uma espera por ela
   * mesma. Se a base (13 pedras) não espera a batida, ou se tirar a primeira
   * pedra não deixa espera por ela, a mão não fecha e nenhuma pedra é batida. A
   * conferência barata evita calcular a mão inteira para cada uma das 14 pedras,
   * segundos no celular numa mão inválida.
   */
  if (base) return new Map()
  const [primeira] = mao.pedras
  if (primeira) {
    const semPrimeira = { ...mao, pedras: mao.pedras.slice(1), indiceAgari: -1, agariMeld: null }
    const fecha = calcularEsperasPossiveis(semPrimeira, config, 13).some(
      (espera) => codigoBase(espera.pedra) === codigoBase(primeira),
    )
    if (!fecha) return new Map()
  }

  // Sem batida marcada não há 13 pedras de base: a escolha é entre as pedras da mão.
  const candidatas = new Map<string, CandidataBatida>()
  const registrarCandidata = (pedra: CodigoPedra, maoCandidata: Mao) => {
    if (candidatas.has(pedra)) return
    try {
      const resultado = calcularMao(maoCandidata, config)
      if (resultado.agari == null) return
      candidatas.set(pedra, {
        pedra,
        han: resultado.han,
        yakuman: resultado.yakuman,
        semYaku: resultado.semYaku,
        furiten: false,
      })
    } catch {
      // Nem toda pedra visível é uma batida calculável; ela só não vira candidata.
    }
  }

  mao.pedras.forEach((pedra, indiceAgari) => {
    registrarCandidata(pedra, { ...mao, indiceAgari, agariMeld: null })
  })

  if (mao.agariMeld) {
    const { indiceMeld, indicePedra } = mao.agariMeld
    const meld = mao.melds[indiceMeld]
    const pedra = meld?.pedras[indicePedra]
    if (meld && pedra) {
      registrarCandidata(pedra, {
        ...mao,
        indiceAgari: -1,
        agariMeld: { ...mao.agariMeld, pedra, tipo: meld.tipo },
      })
    }
  }

  const ronBloqueadoPorFuriten = [...candidatas.entries()].some(
    ([chave, candidata]) =>
      !candidata.semYaku &&
      mao.descartes.some((descarte) => codigoBase(descarte) === codigoBase(chave)),
  )
  if (ronBloqueadoPorFuriten) {
    candidatas.forEach((candidata) => {
      if (!candidata.semYaku) candidata.furiten = true
    })
  }

  return candidatas
}
