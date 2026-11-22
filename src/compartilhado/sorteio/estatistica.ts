/** Qualidade de um conjunto de rodadas, para qualquer formato, Yonma ou Sanma. Sem tela. */
import {
  chaveDoGrupo,
  contarPares,
  contarTrios,
  contarVentos,
  jogadoresDaChave,
  ocupantes,
  type JogadoresPorMesa,
  type RodadaDoSorteio,
} from './contagens'
import { minimoDeRepetidas } from './minimos'

export type NotaSorteio = 'perfeita' | 'otima' | 'boa' | 'regular' | 'ruim'

/** Margem da nota Boa acima do mínimo. */
const MARGEM_BOA = 1.2

export interface EstatisticaJogador {
  jogadorId: string
  adversariosDiferentes: number
  repetiuCom: string[]
  /** null: os ventos saem na mesa, o app não sabe. */
  vezesLeste: number | null
}

export interface EstatisticaDaGrade {
  nota: NotaSorteio
  duplasRepetidas: number
  /** null: o mínimo não é conhecido. */
  minimoPossivel: number | null
  maxVezesMesmaDupla: number
  triosRepetidos: number
  mesasIguais: number
  maxRepetidosPorJogador: number
  adversariosDiferentes: { media: number; menor: number }
  /** null com os ventos na mesa. */
  ventos: { maxLeste: number; minLeste: number; equilibrados: boolean; porJogador: [string, number[]][] } | null
  indiretos: { semEncontro: number; comIndireto: number }
  paresRepetidos: { jogadores: string[]; vezes: number }[]
  /** Quem repetiu mais vem primeiro. */
  porJogador: EstatisticaJogador[]
}

function contarMesasIguais(rodadas: readonly RodadaDoSorteio[]): number {
  const vistas = new Set<string>()
  let iguais = 0
  for (const { mesas } of rodadas) {
    for (const mesa of mesas) {
      const chave = chaveDoGrupo(ocupantes(mesa.assentos))
      if (vistas.has(chave)) iguais++
      else vistas.add(chave)
    }
  }
  return iguais
}

/** Pares que nunca se enfrentam e, deles, quantos têm um adversário em comum. */
function contarIndiretos(adversarios: ReadonlyMap<string, ReadonlySet<string>>) {
  const ids = [...adversarios.keys()]
  let semEncontro = 0
  let comIndireto = 0
  ids.forEach((um, indice) => {
    const deUm = adversarios.get(um) ?? new Set<string>()
    for (const outro of ids.slice(indice + 1)) {
      if (deUm.has(outro)) continue
      semEncontro++
      const deOutro = adversarios.get(outro)
      if ([...deUm].some((id) => deOutro?.has(id))) comIndireto++
    }
  })
  return { semEncontro, comIndireto }
}

export function estatisticaDaGrade(
  rodadas: readonly RodadaDoSorteio[],
  jogadorIds: readonly string[],
  porMesa: JogadoresPorMesa,
  comVentos: boolean,
): EstatisticaDaGrade {
  const adversarios = new Map(jogadorIds.map((id) => [id, new Set<string>()]))
  const repetidos = new Map(jogadorIds.map((id) => [id, [] as string[]]))
  const paresRepetidos: EstatisticaDaGrade['paresRepetidos'] = []
  let maxVezesMesmaDupla = 0
  let encontros = 0

  for (const [chave, vezes] of contarPares(rodadas)) {
    const [um, outro] = jogadoresDaChave(chave)
    encontros += vezes
    maxVezesMesmaDupla = Math.max(maxVezesMesmaDupla, vezes)
    adversarios.get(um)?.add(outro)
    adversarios.get(outro)?.add(um)
    if (vezes < 2) continue
    paresRepetidos.push({ jogadores: [um, outro], vezes })
    repetidos.get(um)?.push(outro)
    repetidos.get(outro)?.push(um)
  }
  paresRepetidos.sort((um, outro) => outro.vezes - um.vezes)

  const total = jogadorIds.length
  const listaFixa = rodadas.every(
    ({ mesas }) => mesas.reduce((soma, mesa) => soma + ocupantes(mesa.assentos).length, 0) === total,
  )
  const minimoPossivel = listaFixa ? minimoDeRepetidas(total, rodadas.length, porMesa) : null
  // Sem mínimo conhecido, vale o limite de encaixar os encontros nos pares que existem.
  const ideal = minimoPossivel ?? Math.max(0, encontros - (total * (total - 1)) / 2)

  const contagemDeVentos = contarVentos(rodadas)
  const vezesLeste = jogadorIds.map((id) => contagemDeVentos.get(id)?.[0] ?? 0)
  // Leste de novo antes de todos terem sido: mais que 1 a cada `porMesa` rodadas jogadas.
  const equilibrados = [...contagemDeVentos.values()].every(
    (linha) => linha[0] <= Math.ceil(linha.reduce((soma, vezes) => soma + vezes, 0) / porMesa),
  )
  const ventos = comVentos
    ? {
        maxLeste: Math.max(...vezesLeste),
        minLeste: Math.min(...vezesLeste),
        equilibrados,
        porJogador: [...contagemDeVentos],
      }
    : null

  const duplasRepetidas = paresRepetidos.length
  const triosRepetidos = [...contarTrios(rodadas).values()].filter((vezes) => vezes > 1).length
  const trioEvitavel = triosRepetidos > 0 && (minimoPossivel !== null || ideal === 0)

  let nota: NotaSorteio
  if (maxVezesMesmaDupla > 2 || trioEvitavel || ventos?.equilibrados === false) nota = 'ruim'
  else if (duplasRepetidas === 0) nota = 'perfeita'
  else if (duplasRepetidas <= ideal && triosRepetidos === 0) nota = 'otima'
  else if (duplasRepetidas <= ideal * MARGEM_BOA) nota = 'boa'
  else nota = 'regular'

  const porJogador = jogadorIds
    .map((jogadorId, indice) => ({
      jogadorId,
      adversariosDiferentes: adversarios.get(jogadorId)?.size ?? 0,
      repetiuCom: repetidos.get(jogadorId) ?? [],
      vezesLeste: comVentos ? vezesLeste[indice] : null,
    }))
    .sort(
      (um, outro) =>
        outro.repetiuCom.length - um.repetiuCom.length || um.adversariosDiferentes - outro.adversariosDiferentes,
    )
  const diferentes = porJogador.map((linha) => linha.adversariosDiferentes)

  return {
    nota,
    duplasRepetidas,
    minimoPossivel,
    maxVezesMesmaDupla,
    triosRepetidos,
    mesasIguais: contarMesasIguais(rodadas),
    maxRepetidosPorJogador: Math.max(0, ...porJogador.map((linha) => linha.repetiuCom.length)),
    adversariosDiferentes: {
      media: diferentes.reduce((soma, valor) => soma + valor, 0) / Math.max(1, diferentes.length),
      menor: diferentes.length ? Math.min(...diferentes) : 0,
    },
    ventos,
    indiretos: contarIndiretos(adversarios),
    paresRepetidos,
    porJogador,
  }
}

const ORDEM_DAS_NOTAS: readonly NotaSorteio[] = ['perfeita', 'otima', 'boa', 'regular', 'ruim']

export function pedeAtencao({ nota }: Pick<EstatisticaDaGrade, 'nota'>): boolean {
  return nota === 'regular' || nota === 'ruim'
}

export type Comparacao = 'better' | 'same' | 'worse'

/** Pela nota e depois pelas duplas repetidas. */
export function compararSorteios(
  novo: Pick<EstatisticaDaGrade, 'nota' | 'duplasRepetidas'>,
  anterior: Pick<EstatisticaDaGrade, 'nota' | 'duplasRepetidas'>,
): Comparacao {
  const diferenca =
    ORDEM_DAS_NOTAS.indexOf(novo.nota) - ORDEM_DAS_NOTAS.indexOf(anterior.nota) ||
    novo.duplasRepetidas - anterior.duplasRepetidas
  if (diferenca === 0) return 'same'
  return diferenca < 0 ? 'better' : 'worse'
}
