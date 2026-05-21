import Riichi from 'riichi'
import type { ConfiguracaoCalculo } from './configuracao'
import { converterMaoParaString } from './conversor-riichi'
import type { CodigoPedra, Mao } from './tipos'
import { traduzirYaku } from './traducoes'

export interface CaminhoYaku {
  titulo: string
  estado: 'bom' | 'atencao' | 'cuidado'
  resumo: string
  detalhe: string
  pedras: CodigoPedra[]
}

export interface EsperaPossivel {
  pedra: CodigoPedra
  yakus: string[]
  han: number
  fu: number
  yakuman: number
  nome: string | null
  semYaku: boolean
}

export interface OrientacaoYaku {
  caminhos: CaminhoYaku[]
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

const TERMINAIS_E_HONRAS = new Set(['1', '9'])

function base(pedra: CodigoPedra): CodigoPedra {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

function valor(pedra: CodigoPedra): number {
  return pedra[0] === '0' ? 5 : Number(pedra[0])
}

function pedrasVisiveis(mao: Mao): CodigoPedra[] {
  return [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]
}

function pedrasTravadas(mao: Mao): CodigoPedra[] {
  return mao.melds.flatMap((meld) => meld.pedras)
}

function contar(pedras: CodigoPedra[]): Map<CodigoPedra, number> {
  const mapa = new Map<CodigoPedra, number>()
  for (const pedra of pedras) {
    const chave = base(pedra)
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1)
  }
  return mapa
}

function pegarPedras(
  pedras: CodigoPedra[],
  predicado: (pedra: CodigoPedra) => boolean,
  limite = 6,
) {
  return pedras.filter(predicado).slice(0, limite)
}

function contarDorasVisiveis(mao: Mao): number {
  return (
    mao.dora.length +
    mao.uradora.length +
    pedrasVisiveis(mao).filter((pedra) => pedra[0] === '0').length
  )
}

function ehSimples(pedra: CodigoPedra): boolean {
  return ['m', 'p', 's'].includes(pedra[1]) && valor(pedra) >= 2 && valor(pedra) <= 8
}

function ehTerminalOuHonra(pedra: CodigoPedra): boolean {
  return pedra[1] === 'z' || TERMINAIS_E_HONRAS.has(base(pedra)[0])
}

function grupoTemTerminalOuHonra(pedras: CodigoPedra[]): boolean {
  return pedras.some(ehTerminalOuHonra)
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

  return TODAS_PEDRAS.flatMap((pedra) => {
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
        },
      ]
    } catch {
      return []
    }
  })
}

function sugerirCaminhos(mao: Mao): CaminhoYaku[] {
  const pedras = pedrasVisiveis(mao)
  const travadas = pedrasTravadas(mao)
  const contagem = contar(pedras)
  const fechada = mao.melds.every((meld) => meld.tipo === 'kanFechado')
  const temChiiTravado = mao.melds.some((meld) => meld.tipo === 'chii')
  const trincasOuKansTravados = mao.melds.filter((meld) => meld.tipo !== 'chii').length
  const caminhos: CaminhoYaku[] = []
  const doraVisivel = contarDorasVisiveis(mao)

  const simples = pedras.filter(ehSimples)
  const terminaisHonras = pedras.filter(ehTerminalOuHonra)
  const travadasNaoHonra = travadas.filter((pedra) => pedra[1] !== 'z')
  const naipesTravados = new Set(travadasNaoHonra.map((pedra) => pedra[1]))
  const meldsPermitemChanta = mao.melds.every((meld) => grupoTemTerminalOuHonra(meld.pedras))

  if (doraVisivel > 0) {
    caminhos.push({
      titulo: 'Dora',
      estado: 'atencao',
      resumo: 'Dora aumenta han, mas nao e yaku',
      detalhe: `${doraVisivel} dora${doraVisivel > 1 ? 's' : ''} ajudam a pontuar. Antes de abrir, garanta Tanyao, Yakuhai, Honitsu ou outro yaku real.`,
      pedras: pegarPedras([...mao.dora, ...mao.uradora, ...pedras], () => true, 5),
    })
  }

  if (fechada && pedras.length >= 8) {
    caminhos.push({
      titulo: 'Riichi / Menzen Tsumo',
      estado: 'bom',
      resumo: 'Yaku de mao fechada',
      detalhe:
        'Quando a mao ainda esta confusa, ficar fechado preserva os yakus mais faceis para iniciante e evita depender de chamadas.',
      pedras: pegarPedras(pedras, (pedra) => pedra[1] !== 'z', 6),
    })
  }

  if (simples.length >= Math.max(5, pedras.length - 2)) {
    caminhos.push({
      titulo: 'Tanyao',
      estado: 'bom',
      resumo: 'Mao sem 1, 9 ou honras',
      detalhe:
        'Pode abrir se a regra permitir Tanyao aberto. Se aparecer terminal ou honra, a mao sai desse caminho.',
      pedras: simples.slice(0, 6),
    })
  }

  const yakuhai = ['5z', '6z', '7z', mao.ventoRodada + 'z', mao.ventoAssento + 'z'].filter(
    (pedra, indice, lista) => lista.indexOf(pedra) === indice && (contagem.get(pedra) ?? 0) >= 2,
  )
  if (yakuhai.length > 0) {
    caminhos.push({
      titulo: 'Yakuhai',
      estado: 'bom',
      resumo: 'Trinca de dragao ou vento de valor',
      detalhe:
        'Esse e o caminho aberto mais seguro: uma trinca de dragao, vento da rodada ou vento do assento ja resolve o yaku.',
      pedras: yakuhai.flatMap((pedra) => Array(Math.min(contagem.get(pedra) ?? 0, 3)).fill(pedra)),
    })
  }

  const paresOuMais = TODAS_PEDRAS.filter((pedra) => (contagem.get(pedra) ?? 0) >= 2)
  if (fechada && paresOuMais.length >= 3) {
    caminhos.push({
      titulo: 'Chiitoitsu',
      estado: 'atencao',
      resumo: 'Sete pares',
      detalhe: `${paresOuMais.length} pares formados. Exige mao fechada; evite Pon/Chi se quiser continuar nessa rota.`,
      pedras: paresOuMais.slice(0, 5).flatMap((pedra) => [pedra, pedra]),
    })
  }

  if (!temChiiTravado && (paresOuMais.length >= 3 || trincasOuKansTravados >= 2)) {
    caminhos.push({
      titulo: 'Toitoi',
      estado: 'bom',
      resumo: 'Todas as sequencias viram trincas ou kans',
      detalhe:
        'Se voce ja tem muitos pares, Pon pode ser uma decisao boa porque Toitoi continua valendo aberto.',
      pedras: paresOuMais.slice(0, 4).flatMap((pedra) => [pedra, pedra]),
    })
  }

  for (const naipe of ['m', 'p', 's'] as const) {
    const doNaipe = pedras.filter((pedra) => pedra[1] === naipe)
    const numeros = new Set(doNaipe.map(valor))
    const blocos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ].filter((bloco) => bloco.some((numero) => numeros.has(numero))).length

    if (doNaipe.length >= 5 && blocos >= 2) {
      caminhos.push({
        titulo: 'Ittsu',
        estado: 'atencao',
        resumo: `Sequencia 123 + 456 + 789 de ${naipe.toUpperCase()}`,
        detalhe:
          'Ittsu aceita mao aberta, mas perde valor. Procure completar 123, 456 e 789 do mesmo naipe.',
        pedras: doNaipe.slice(0, 7),
      })
      break
    }
  }

  const porNaipe = ['m', 'p', 's'].map((naipe) => ({
    naipe,
    pedras: pedras.filter((pedra) => pedra[1] === naipe),
  }))
  const dominante = porNaipe.sort((a, b) => b.pedras.length - a.pedras.length)[0]
  const naipeFlush =
    naipesTravados.size === 1
      ? [...naipesTravados][0]
      : naipesTravados.size === 0
        ? dominante?.naipe
        : null
  const pedrasDoFlush = naipeFlush ? pedras.filter((pedra) => pedra[1] === naipeFlush) : []
  if (naipeFlush && pedrasDoFlush.length >= 6) {
    caminhos.push({
      titulo: terminaisHonras.length > 0 ? 'Honitsu' : 'Chinitsu',
      estado: 'bom',
      resumo:
        terminaisHonras.length > 0
          ? `Um naipe (${naipeFlush.toUpperCase()}) + honras`
          : `Apenas um naipe (${naipeFlush.toUpperCase()})`,
      detalhe:
        'Chamadas abertas travam o naipe. Se voce ja abriu outro naipe, este caminho deixa de ser possivel.',
      pedras: [...pedrasDoFlush, ...terminaisHonras.filter((pedra) => pedra[1] === 'z')].slice(
        0,
        8,
      ),
    })
  }

  if (meldsPermitemChanta && terminaisHonras.length >= 5) {
    caminhos.push({
      titulo: 'Chanta / Honroutou',
      estado: 'cuidado',
      resumo: 'Blocos com 1, 9 ou honras',
      detalhe:
        'Pode virar uma mao valiosa, mas e mais dificil. Ao abrir, confira se cada bloco ainda usa 1, 9 ou honra.',
      pedras: terminaisHonras.slice(0, 7),
    })
  }

  return caminhos.slice(0, 5)
}

export function analisarCaminhosYaku(
  mao: Mao,
  _config: ConfiguracaoCalculo,
  _slotsUsados: number,
): OrientacaoYaku {
  return {
    caminhos: sugerirCaminhos(mao),
  }
}
