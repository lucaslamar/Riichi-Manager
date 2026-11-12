import Riichi from 'riichi'
import type { Mao, MaoSanma } from './tipos'
import { converterMaoParaString } from './conversor-riichi'
import type { ConfiguracaoCalculo, PontosCalculados, ResultadoMao } from '@/compartilhado/mahjong/pontuacao'
import { ORDEM_YAKU, traduzirDetalhesFu, traduzirPatamares, traduzirYaku } from './traducoes'
import { encontrarYakusLocais, HAN_MINIMO, type OpcoesLocais } from './yakusLocais'
import {
  aplicarHonba,
  arredondar100,
  BASE_PATAMAR,
  calcularHanFu,
  calcularPatamarHanFu,
  doraFlamejanteAtiva,
  montarPontosRapidos,
  valorPorHonba,
} from '@/compartilhado/mahjong/pontuacao'
import {
  calcularPagamentos,
  dorasDoKita,
  proximaDora as proximaDoraDaVariante,
} from '@/compartilhado/mahjong/variante'

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
    // Sanma: 1m aponta 9m e 9m aponta 1m; o yonma segue com a conta de sempre.
    const doraReal = mao.sanma ? proximaDoraDaVariante(indicador, 'sanma') : proximaDora(indicador)
    const hanPorDora = doraFlamejante && indicador[0] === '0' ? 2 : 1
    return (
      total +
      pedrasFisicas.filter((pedra) => codigoBase(pedra) === codigoBase(doraReal)).length *
        hanPorDora
    )
  }, 0)
}

/** Kita que vale como Nukidora (0 no yonma ou com a regra desligada). */
function kitaDaMao(mao: Mao): number {
  if (!mao.sanma?.regras.kitaNukidora) return 0
  return Math.max(0, Math.min(4, mao.sanma.kita))
}

/**
 * Indicador Oeste aponta o Norte: cada Kita vale mais 1 dora por indicador desses.
 * O 1 do próprio Nukidora vem da biblioteca (`+nN`).
 */
function doraDoKitaPorIndicador(mao: Mao, indicadores: string[]): number {
  const kita = kitaDaMao(mao)
  return kita > 0 ? dorasDoKita(kita, indicadores) - kita : 0
}

/**
 * Pontos do Sanma: a mesma base (han, fu ou yakuman) paga por 2 jogadores no
 * Tsumo, com o honba das Regras de Sanma.
 */
function pontosSanma(
  mao: Mao,
  sanma: MaoSanma,
  pontosBase: PontosCalculados,
  han: number,
  fu: number,
  yakuman: number,
  config: ConfiguracaoCalculo,
): { pontos: PontosCalculados; honba: number } {
  if (pontosBase.agari === null) return { pontos: pontosBase, honba: 0 }
  const isOya = mao.ventoAssento === '1'
  const base = yakuman > 0 ? 8000 * yakuman : calcularPatamarHanFu(han, fu, config).base
  const pagamentos = calcularPagamentos({
    han,
    fu,
    base,
    dealer: isOya,
    tipo: mao.agari,
    honba: mao.honba,
    variante: 'sanma',
    regras: sanma.regras,
    config,
  })
  if (mao.agari === 'ron') {
    const ron = pagamentos.total
    return { pontos: { agari: 'ron', pontos: { total: ron, oya: { ron }, ko: { ron } } }, honba: pagamentos.honbaTotal }
  }
  const tsumo = pagamentos.tsumo ?? { dealer: 0, naoDealer: 0 }
  return {
    pontos: {
      agari: 'tsumo',
      pontos: {
        total: pagamentos.total,
        oya: { ko: tsumo.todos ?? tsumo.dealer },
        ko: { oya: tsumo.dealer, ko: tsumo.naoDealer },
      },
    },
    honba: pagamentos.honbaTotal,
  }
}

/**
 * Calcula os pontos de uma mao completa.
 *
 * @param mao - Estado completo da mao (14 pedras contando melds).
 * @param config - Configuracoes de regras.
 * @returns Resultado com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo, locais?: OpcoesLocais): ResultadoMao {
  const padrao = calcularMaoPadrao(mao, config)
  const resultado = locais ? aplicarYakusLocais(padrao, mao, config, locais) : padrao
  // Ryanhan-shibari do Paarenchan: do 5º honba em diante, 2 han sem contar dora.
  if (locais?.ryanhanShibari && mao.honba >= 5 && resultado.agari !== null && resultado.yakuman === 0) {
    const semDora = resultado.yaku
      .filter(([nome]) => !/dora/i.test(nome))
      .reduce((soma, [, han]) => soma + han, 0)
    if (semDora < 2) return { ...resultado, semYaku: true }
  }
  return resultado
}

/** Pontos de uma mão com han, fu e yakuman já decididos (yonma ou Sanma, com honba). */
function pontuar(mao: Mao, config: ConfiguracaoCalculo, han: number, fu: number, yakuman: number) {
  const isOya = mao.ventoAssento === '1'
  const patamar = calcularPatamarHanFu(han, fu, config)
  const base = yakuman > 0 ? BASE_PATAMAR.yakuman * yakuman : patamar.base
  const tabela = {
    tsumoOya: arredondar100(base * 2),
    tsumoKo: arredondar100(base),
    ronOya: arredondar100(base * 6),
    ronKo: arredondar100(base * 4),
  }
  const pontosBase = montarPontosRapidos(isOya, mao.agari, tabela)
  if (mao.sanma) {
    const sanma = pontosSanma(mao, mao.sanma, pontosBase, han, fu, yakuman, config)
    return { pontos: sanma.pontos, pontosHonba: sanma.honba, patamar }
  }
  const pontos = aplicarHonba(pontosBase, mao.honba, valorPorHonba(config))
  const pontosHonba = pontos.agari !== null ? pontos.pontos.total - pontosBase.pontos.total : 0
  return { pontos, pontosHonba, patamar }
}

/**
 * Yakus locais ligados: soma o han (ou garante Mangan/Yakuman) por cima do
 * cálculo padrão. O Paarenchan sozinho não basta: a mão precisa de outro yaku.
 */
function aplicarYakusLocais(
  padrao: ResultadoMao,
  mao: Mao,
  config: ConfiguracaoCalculo,
  locais: OpcoesLocais,
): ResultadoMao {
  const encontrados = encontrarYakusLocais(mao, locais)
  if (encontrados.length === 0) return padrao
  const irregular = encontrados.some(({ yaku }) => yaku.formatoIrregular)
  if (padrao.agari === null && !irregular) return padrao
  const temOutroYaku = !padrao.semYaku || encontrados.some(({ yaku }) => yaku.id !== 'paarenchan')
  if (!temOutroYaku) return padrao

  let yakumanLocal = 0
  let hanLocal = 0
  let hanMinimo = 0
  for (const { yaku, han } of encontrados) {
    if (yaku.id === 'renhou') {
      if (locais.renhou === 'yakuman') yakumanLocal += 1
      else hanMinimo = Math.max(hanMinimo, HAN_MINIMO[locais.renhou])
    } else if (yaku.valor.tipo === 'yakuman') yakumanLocal += yaku.valor.vezes
    else if (yaku.valor.tipo === 'mangan') hanMinimo = Math.max(hanMinimo, HAN_MINIMO.mangan)
    else hanLocal += han ?? 0
  }
  const yakumanAntes = padrao.agari === null ? 0 : padrao.yakuman
  let yakuman = yakumanLocal > 0 ? yakumanAntes + yakumanLocal : yakumanAntes
  if (!config.multiYakuman) yakuman = Math.min(yakuman, 1)
  const hanAntes = padrao.agari === null || padrao.semYaku ? 0 : padrao.han
  const han = Math.max(hanAntes + hanLocal, hanMinimo)
  const fu = padrao.fu || 30
  const { pontos, pontosHonba, patamar } = pontuar(mao, config, han, fu, yakuman)

  const linhas: [string, number, boolean][] = encontrados.map(({ yaku, han: valor }) => {
    const ehYakuman = yaku.valor.tipo === 'yakuman' || (yaku.id === 'renhou' && locais.renhou === 'yakuman')
    return [yaku.nome, ehYakuman ? (yaku.valor.tipo === 'yakuman' ? yaku.valor.vezes : 1) : (valor ?? 0), ehYakuman]
  })
  const yakuPadrao = padrao.agari === null || padrao.semYaku ? [] : padrao.yaku
  // Com Yakuman, os yakus de han deixam de contar (como no cálculo padrão).
  const yaku = yakuman > 0 ? [...yakuPadrao.filter((linha) => linha[2]), ...linhas.filter((linha) => linha[2])] : [...yakuPadrao, ...linhas]

  return {
    ...padrao,
    ...pontos,
    isOya: mao.ventoAssento === '1',
    yakuman,
    yaku,
    semYaku: false,
    han,
    fu,
    pontosHonba,
    nome: yakuman > 1 ? `${yakuman}x Yakuman` : yakuman === 1 ? 'Yakuman' : patamar.nome,
  } as ResultadoMao
}

function calcularMaoPadrao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const dorasAutomaticasAka = config.akadora ? contarAkaDora(mao) : 0
  const flamejante = doraFlamejanteAtiva(config)
  const dorasPorIndicadores =
    contarDorasPorIndicadores(mao, mao.dora, flamejante) + doraDoKitaPorIndicador(mao, mao.dora)
  const dorasNaMaoTotal = Math.min(13, dorasAutomaticasAka + dorasPorIndicadores + mao.doraManual)
  const uradorasTotal = mao.riichi
    ? contarDorasPorIndicadores(mao, mao.uradora, flamejante) +
      doraDoKitaPorIndicador(mao, mao.uradora) +
      mao.uradoraManual
    : 0
  const dorasBonusTotal = dorasNaMaoTotal + uradorasTotal
  const usaDoraManual = dorasBonusTotal > 0
  const kita = kitaDaMao(mao)
  // Sanma: `+nN` é o Norte retirado; a biblioteca conta o Nukidora e tira Tenhou/Chiihou.
  const stringMao = converterMaoParaString(mao) + (kita > 0 ? `+n${kita}` : '')

  const riichi = new Riichi(stringMao, {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    aka: usaDoraManual ? false : config.akadora,
    ...(mao.sanma
      ? {
          sanma: true,
          sanmaBisection: mao.sanma.regras.pagamentoTsumo === 'divisao-norte',
          otakazePei: mao.sanma.regras.norteYakuhai,
        }
      : {}),
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
  const sanma = mao.sanma ? pontosSanma(mao, mao.sanma, pontosBase, hanFinal, fu, yakumanFinal, config) : null
  const pontos = sanma ? sanma.pontos : aplicarHonba(pontosBase, mao.honba, valorPorHonba(config))
  const pontosHonba = sanma
    ? sanma.honba
    : pontos.agari !== null && pontosBase.agari !== null
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
