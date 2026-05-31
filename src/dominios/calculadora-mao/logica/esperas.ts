import Riichi from 'riichi'
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao'
import { converterMaoParaString } from './conversor-riichi'
import type { CodigoPedra, Mao } from './tipos'
import { traduzirYaku } from './traducoes'

export interface EsperaPossivel {
  pedra: CodigoPedra
  yakus: string[]
  han: number
  fu: number
  yakuman: number
  nome: string | null
  semYaku: boolean
  furiten: boolean
}

const TODAS_PEDRAS: CodigoPedra[] = [
  '1m',
  '2m',
  '3m',
  '4m',
  '5m',
  '6m',
  '7m',
  '8m',
  '9m',
  '1p',
  '2p',
  '3p',
  '4p',
  '5p',
  '6p',
  '7p',
  '8p',
  '9p',
  '1s',
  '2s',
  '3s',
  '4s',
  '5s',
  '6s',
  '7s',
  '8s',
  '9s',
  '1z',
  '2z',
  '3z',
  '4z',
  '5z',
  '6z',
  '7z',
]

function base(pedra: CodigoPedra): CodigoPedra {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

function pedrasVisiveis(mao: Mao): CodigoPedra[] {
  return [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras), ...mao.descartes]
}

function contar(pedras: CodigoPedra[]): Map<CodigoPedra, number> {
  const mapa = new Map<CodigoPedra, number>()
  for (const pedra of pedras) {
    const chave = base(pedra)
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1)
  }
  return mapa
}

function configuracaoRiichi(config: ConfiguracaoCalculo) {
  return {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    aka: config.akadora,
    noYakuFu: true,
    noYakuDora: true,
  }
}

export function calcularEsperasPossiveis(
  mao: Mao,
  config: ConfiguracaoCalculo,
  slotsUsados: number,
): EsperaPossivel[] {
  if (slotsUsados !== 13) return []

  const contagem = contar([...pedrasVisiveis(mao), ...mao.dora, ...mao.uradora])
  const descartes = new Set(mao.descartes.map(base))

  const esperas = TODAS_PEDRAS.flatMap((pedra) => {
    if ((contagem.get(pedra) ?? 0) >= 4) return []

    const candidata: Mao = {
      ...mao,
      pedras: [...mao.pedras, pedra],
      indiceAgari: mao.pedras.length,
    }

    try {
      const riichi = new Riichi(converterMaoParaString(candidata), configuracaoRiichi(config))
      riichi.setHairi(false)
      const resultado = riichi.calc()
      if (!resultado.isAgari) return []
      const yakus = Object.keys(resultado.yaku ?? {})
        .map(traduzirYaku)
        .filter((nome) => !['Dora', 'Uradora', 'Akadora'].includes(nome))
      const yakuman = resultado.yakuman ?? 0

      return [
        {
          pedra,
          yakus,
          han: resultado.han ?? 0,
          fu: resultado.fu ?? 0,
          yakuman,
          nome: resultado.name ?? null,
          semYaku: yakuman === 0 && yakus.length === 0 && (resultado.noYaku ?? false),
          furiten: false,
        },
      ]
    } catch {
      return []
    }
  })
  const ronBloqueadoPorFuriten =
    esperas.some((espera) => !espera.semYaku && descartes.has(base(espera.pedra)))

  return esperas.map((espera) => ({
    ...espera,
    furiten: ronBloqueadoPorFuriten && !espera.semYaku,
  }))
}
