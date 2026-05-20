import Riichi from 'riichi'
import type { ConfiguracaoCalculo } from './configuracao'
import type { Mao } from './tipos'
import { converterMaoParaString } from './conversor-riichi'
import type { PontosCalculados, ResultadoMao } from './resultado'
import { ORDEM_YAKU, traduzirDetalhesFu, traduzirPatamares, traduzirYaku } from './traducoes'

// ─── Cálculo principal ────────────────────────────────────────────────────────

/**
 * Calcula os pontos de uma mão completa.
 *
 * @param mao - Estado completo da mão (14 pedras contando melds).
 * @param config - Configurações de regras.
 * @returns Resultado com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const stringMao = converterMaoParaString(mao)

  const riichi = new Riichi(stringMao, {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    aka: config.akadora,
  })

  const resultadoBiblioteca = riichi.calc()
  const isOya = mao.ventoAssento === '1'
  const yakuman = resultadoBiblioteca.yakuman ?? 0

  const pontos: PontosCalculados = !resultadoBiblioteca.isAgari
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

  return {
    ...pontos,
    isOya,
    yakuman,
    yaku: Object.entries(resultadoBiblioteca.yaku ?? {})
      .sort((a, b) => (ORDEM_YAKU[a[0]] ?? 99) - (ORDEM_YAKU[b[0]] ?? 99))
      .map(([nome, valor]) => {
        const traduzido = traduzirYaku(nome)
        const ehYakuman = String(valor).endsWith('役満')
        const han = ehYakuman
          ? parseInt(String(valor), 10) || 1
          : Number(/\d+/.exec(String(valor))?.[0]) || 0
        return [traduzido, han, ehYakuman] as [string, number, boolean]
      }),
    fuDetalhes: traduzirDetalhesFu(resultadoBiblioteca.pattern ?? []),
    semYaku: resultadoBiblioteca.noYaku ?? false,
    han: resultadoBiblioteca.han ?? 0,
    fu: resultadoBiblioteca.fu ?? 0,
    nome: resultadoBiblioteca.name ? traduzirPatamares(resultadoBiblioteca.name) : null,
  }
}
