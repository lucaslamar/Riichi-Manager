import Riichi from 'riichi'
import type { Mao } from './tipos'
import { converterMaoParaString } from './conversor-riichi'
import type { ConfiguracaoCalculo, PontosCalculados, ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import { ORDEM_YAKU, traduzirDetalhesFu, traduzirPatamares, traduzirYaku } from './traducoes'
import {
  aplicarHonba,
  calcularHanFu,
  calcularPatamarHanFu,
  doraFlamejanteAtiva,
  montarPontosRapidos,
  valorPorHonba,
} from '@/compartilhado/mahjong/pontuacao'

function codigoBase(pedra: string): string {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

function proximaDora(indicador: string): string {
  const base = codigoBase(indicador)
  const valor = Number(base[0])
  const naipe = base[1]

  if (naipe === 'm' || naipe === 'p' || naipe === 's') {
    return `${valor === 9 ? 1 : valor + 1}${naipe}`
  }

  if (['1', '2', '3', '4'].includes(base[0])) {
    return `${valor === 4 ? 1 : valor + 1}z`
  }

  return `${valor === 7 ? 5 : valor + 1}z`
}

function pedrasDaMaoFisica(mao: Mao): string[] {
  return [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]
}

function contarAkaDora(mao: Mao): number {
  return pedrasDaMaoFisica(mao).filter((pedra) => pedra[0] === '0').length
}

/**
 * Doras dos indicadores. Com Dora flamejante, cada dora de um indicador 5
 * vermelho vale 2 han; cada indicador conta à parte.
 */
function contarDorasPorIndicadores(
  mao: Mao,
  indicadores: string[],
  doraFlamejante: boolean,
): number {
  const pedrasFisicas = pedrasDaMaoFisica(mao)
  return indicadores.reduce((total, indicador) => {
    const doraReal = proximaDora(indicador)
    const hanPorDora = doraFlamejante && indicador[0] === '0' ? 2 : 1
    return (
      total +
      pedrasFisicas.filter((pedra) => codigoBase(pedra) === codigoBase(doraReal)).length *
        hanPorDora
    )
  }, 0)
}

/**
 * Calcula os pontos de uma mao completa.
 *
 * @param mao - Estado completo da mao (14 pedras contando melds).
 * @param config - Configuracoes de regras.
 * @returns Resultado com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const dorasAutomaticasAka = config.akadora ? contarAkaDora(mao) : 0
  const flamejante = doraFlamejanteAtiva(config)
  const dorasPorIndicadores = contarDorasPorIndicadores(mao, mao.dora, flamejante)
  const dorasNaMaoTotal = Math.min(13, dorasAutomaticasAka + dorasPorIndicadores + mao.doraManual)
  const uradorasTotal = mao.riichi
    ? contarDorasPorIndicadores(mao, mao.uradora, flamejante) + mao.uradoraManual
    : 0
  const dorasBonusTotal = dorasNaMaoTotal + uradorasTotal
  const usaDoraManual = dorasBonusTotal > 0
  const stringMao = converterMaoParaString(mao)

  const riichi = new Riichi(stringMao, {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    aka: usaDoraManual ? false : config.akadora,
  })

  const resultadoBiblioteca = riichi.calc()
  const isOya = mao.ventoAssento === '1'
  const yakuman = resultadoBiblioteca.yakuman ?? 0
  const semYaku = yakuman === 0 && (resultadoBiblioteca.noYaku ?? false)
  const hanBase = resultadoBiblioteca.han ?? 0
  const fu = resultadoBiblioteca.fu ?? 0
  const hanFinal =
    usaDoraManual && yakuman === 0 && resultadoBiblioteca.isAgari && !semYaku
      ? hanBase + dorasBonusTotal
      : hanBase
  const patamarManual =
    usaDoraManual && yakuman === 0 && resultadoBiblioteca.isAgari && !semYaku
      ? calcularPatamarHanFu(hanFinal, fu, config)
      : null
  const yakumanFinal = patamarManual?.yakuman ?? yakuman

  const pontosBiblioteca: PontosCalculados = !resultadoBiblioteca.isAgari
    ? { agari: null }
    : mao.agari === 'ron'
      ? {
          agari: 'ron',
          pontos: {
            total: resultadoBiblioteca.ten,
            oya: { ron: resultadoBiblioteca.oya[0] },
            ko: { ron: resultadoBiblioteca.ko[0] },
          },
        }
      : {
          agari: 'tsumo',
          pontos: {
            total: resultadoBiblioteca.ten,
            oya: { ko: resultadoBiblioteca.oya[0] },
            ko: { oya: resultadoBiblioteca.ko[0], ko: resultadoBiblioteca.ko[1] },
          },
        }

  const pontosBase: PontosCalculados =
    usaDoraManual &&
    yakuman === 0 &&
    resultadoBiblioteca.isAgari &&
    !semYaku
      ? montarPontosRapidos(isOya, mao.agari, calcularHanFu(hanFinal, fu, config))
      : pontosBiblioteca
  const pontos = aplicarHonba(pontosBase, mao.honba, valorPorHonba(config))
  const pontosHonba =
    pontos.agari !== null && pontosBase.agari !== null
      ? pontos.pontos.total - pontosBase.pontos.total
      : 0

  const yaku = Object.entries(resultadoBiblioteca.yaku ?? {})
    .sort((a, b) => (ORDEM_YAKU[a[0]] ?? 99) - (ORDEM_YAKU[b[0]] ?? 99))
    .map(([nome, valor]) => {
      const traduzido = traduzirYaku(nome)
      const textoValor = String(valor)
      const ehYakuman = textoValor.endsWith('役満') || textoValor.endsWith('倍役満')
      const han = ehYakuman
        ? parseInt(textoValor, 10) || 1
        : Number(/\d+/.exec(textoValor)?.[0]) || 0
      return [traduzido, han, ehYakuman] as [string, number, boolean]
    })

  if (usaDoraManual && yakuman === 0 && resultadoBiblioteca.isAgari && !semYaku) {
    if (dorasNaMaoTotal > 0) yaku.push(['Dora manual', dorasNaMaoTotal, false])
    if (uradorasTotal > 0) yaku.push(['Uradora', uradorasTotal, false])
  }

  return {
    ...pontos,
    isOya,
    yakuman: yakumanFinal,
    yaku,
    fuDetalhes: traduzirDetalhesFu(resultadoBiblioteca.pattern ?? []),
    semYaku,
    han: hanFinal,
    fu,
    pontosHonba,
    nome:
      patamarManual?.nome ??
      (resultadoBiblioteca.name ? traduzirPatamares(resultadoBiblioteca.name) : null),
  }
}
