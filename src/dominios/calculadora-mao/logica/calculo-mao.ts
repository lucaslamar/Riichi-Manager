import Riichi from 'riichi'
import type { Mao } from './tipos'
import { converterMaoParaString } from './conversor-riichi'
import type { ConfiguracaoCalculo, PontosCalculados, ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import { ORDEM_YAKU, traduzirDetalhesFu, traduzirPatamares, traduzirYaku } from './traducoes'
import { aplicarHonba, calcularHanFu, calcularPatamarHanFu, montarPontosRapidos } from '@/compartilhado/mahjong/pontuacao'

/**
 * Calcula os pontos de uma mao completa.
 *
 * @param mao - Estado completo da mao (14 pedras contando melds).
 * @param config - Configuracoes de regras.
 * @returns Resultado com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const usaDoraManual = mao.doraManual > 0
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
      ? hanBase + mao.doraManual
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
  const pontos = aplicarHonba(pontosBase, mao.honba)

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
    yaku.push(['Dora manual', mao.doraManual, false])
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
    nome:
      patamarManual?.nome ??
      (resultadoBiblioteca.name ? traduzirPatamares(resultadoBiblioteca.name) : null),
  }
}
