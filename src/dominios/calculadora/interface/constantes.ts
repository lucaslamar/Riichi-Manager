import type { CodigoPedra, ConfiguracaoCalculo, Mao, Meld, VentoMao } from '../logica/mao'

export const NAIPES = [
  { naipe: 'm' as const, rotulo: 'Man (万)' },
  { naipe: 'p' as const, rotulo: 'Pin (筒)' },
  { naipe: 's' as const, rotulo: 'Sou (索)' },
]

export const HONRAS: CodigoPedra[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z']

const NOMES_ARQUIVOS_PEDRAS: Record<string, string> = {
  '1z': 'Ton',
  '2z': 'Nan',
  '3z': 'Shaa',
  '4z': 'Pei',
  '5z': 'Haku',
  '6z': 'Hatsu',
  '7z': 'Chun',
}

export function arquivoPedra(pedra: CodigoPedra): string {
  const valor = pedra[0]
  const naipe = pedra[1]
  if (valor === '0' && naipe === 'm') return 'Man5-Dora'
  if (valor === '0' && naipe === 'p') return 'Pin5-Dora'
  if (valor === '0' && naipe === 's') return 'Sou5-Dora'
  if (naipe === 'm') return `Man${valor}`
  if (naipe === 'p') return `Pin${valor}`
  if (naipe === 's') return `Sou${valor}`
  return NOMES_ARQUIVOS_PEDRAS[pedra] ?? 'Blank'
}

export function codigoBase(pedra: CodigoPedra): CodigoPedra {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

export function valorPedra(pedra: CodigoPedra): number {
  return pedra[0] === '0' ? 5 : Number(pedra[0])
}

export function expandirGrupoMesmoValor(pedra: CodigoPedra, tamanho: number): CodigoPedra[] {
  if (pedra[0] !== '0') return Array(tamanho).fill(pedra)
  return [pedra, ...Array(tamanho - 1).fill(codigoBase(pedra))]
}

export function urlPedra(nomeArquivo: string, formato: 'png' | 'svg'): string {
  const pasta = formato === 'png' ? 'regular-png' : 'regular'
  return `tiles/${pasta}/${nomeArquivo}.${formato}?v=2`
}

export function ehPedraNumerada(pedra: CodigoPedra): boolean {
  return ['m', 'p', 's'].includes(pedra[1])
}

export function podeAdicionarAoChii(selecionadas: CodigoPedra[], pedra: CodigoPedra): boolean {
  if (!ehPedraNumerada(pedra)) return false
  if (selecionadas.length >= 3) return false
  if (
    selecionadas.some(
      (pedraSelecionada) => !ehPedraNumerada(pedraSelecionada) || pedraSelecionada[1] !== pedra[1],
    )
  ) {
    return false
  }

  const numeros = [...selecionadas, pedra].map(valorPedra)
  if (new Set(numeros).size !== numeros.length) return false

  return [1, 2, 3, 4, 5, 6, 7].some((inicio) =>
    numeros.every((numero) => numero >= inicio && numero <= inicio + 2),
  )
}

export function proximaDoraIndicada(pedra: CodigoPedra): CodigoPedra {
  const base = codigoBase(pedra)
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

/** Vento da RODADA: só Leste e Sul (regras padrão de riichi). */
export const VENTOS_RODADA: { valor: VentoMao; nome: string }[] = [
  { valor: '1', nome: 'Leste' },
  { valor: '2', nome: 'Sul' },
]

/** Vento do ASSENTO: todos os quatro. */
export const VENTOS_ASSENTO: { valor: VentoMao; nome: string }[] = [
  { valor: '1', nome: 'Leste' },
  { valor: '2', nome: 'Sul' },
  { valor: '3', nome: 'Oeste' },
  { valor: '4', nome: 'Norte' },
]

/** Estado inicial de uma mão completamente vazia. */
export const MAO_VAZIA: Mao = {
  pedras: [],
  melds: [],
  indiceAgari: -1,
  agari: 'tsumo',
  dora: [],
  uradora: [],
  descartes: [],
  doraManual: 0,
  honba: 0,
  riichi: null,
  bencao: false,
  ultimaPedra: false,
  kan: false,
  ventoRodada: '1',
  ventoAssento: '1',
}

export const CONFIGURACOES_REGRAS: {
  chave: keyof ConfiguracaoCalculo
  titulo: string
  ligado: string
  desligado: string
  ajuda: string
}[] = [
  {
    chave: 'akadora',
    titulo: 'Aka dora',
    ligado: 'Ativar',
    desligado: 'Desativar',
    ajuda:
      'Permite contar os cincos vermelhos como dora. Quando ativado, o teclado mostra um 5 vermelho para cada naipe.',
  },
  {
    chave: 'tanyaoAberto',
    titulo: 'Tanyao aberto',
    ligado: 'Permitido',
    desligado: 'Fechado apenas',
    ajuda:
      'Define se Tanyao vale com chamadas abertas. É comum em regras japonesas modernas, mas alguns grupos usam kuitan nashi.',
  },
  {
    chave: 'fuVentosDuplo',
    titulo: 'Par de vento duplo',
    ligado: '4 fu',
    desligado: '2 fu',
    ajuda:
      'Quando o par é ao mesmo tempo vento da rodada e do assento, algumas regras somam 4 fu. Em regras competitivas modernas costuma ser 2 fu.',
  },
  {
    chave: 'fuRinshan',
    titulo: 'Fu em Rinshan',
    ligado: '+2 fu',
    desligado: 'Sem +2 fu',
    ajuda: 'Define se uma vitória por Rinshan Kaihou recebe também os 2 fu de tsumo.',
  },
  {
    chave: 'kiriageMangan',
    titulo: 'Kiriage mangan',
    ligado: 'Ativar',
    desligado: 'Desativar',
    ajuda: 'Arredonda 4 han 30 fu e 3 han 60 fu para mangan quando a regra da mesa usa kiriage.',
  },
  {
    chave: 'kazoeYakuman',
    titulo: 'Kazoe yakuman',
    ligado: 'Yakuman',
    desligado: 'Sanbaiman',
    ajuda:
      'Define se 13 ou mais han sem yakuman natural contam como yakuman contado ou param em Sanbaiman.',
  },
  {
    chave: 'yakumanDuplo',
    titulo: 'Yakuman duplo',
    ligado: 'Permitir',
    desligado: 'Simples',
    ajuda:
      'Permite formas especiais como Suuankou tanki ou Kokushi 13 esperas valerem yakuman duplo.',
  },
  {
    chave: 'multiYakuman',
    titulo: 'Yakuman acumulado',
    ligado: 'Permitir',
    desligado: 'Um so',
    ajuda:
      'Permite somar múltiplos yakuman na mesma mão, por exemplo Daisuushii junto com Tsuuiisou.',
  },
]

// ─── Cores dos melds ──────────────────────────────────────────────────────────

/**
 * Cada tipo de meld tem cor e rótulo diferente para identificação rápida.
 */
export const ESTILO_MELD: Record<Meld['tipo'], { fundo: string; borda: string; rotulo: string }> = {
  chii: { fundo: '#e8f5e9', borda: '#4caf50', rotulo: 'Chi' },
  pon: { fundo: '#e3f2fd', borda: '#2196f3', rotulo: 'Pon' },
  kanAberto: { fundo: '#f8edfb', borda: '#ba68c8', rotulo: 'Kan aberto' },
  kanFechado: { fundo: '#f3e5f5', borda: '#9c27b0', rotulo: 'Kan fechado' },
}

// ─── Componente principal ─────────────────────────────────────────────────────
