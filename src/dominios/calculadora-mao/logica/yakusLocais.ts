/**
 * Yakus locais (regras da casa), da página "Local yaku" da Riichi Wiki.
 *
 * Nenhum vale por padrão: cada um é ligado em Regras de cálculo → Yakus locais.
 * Os que dependem só da mão têm um detector, que olha a mão já dividida em grupos.
 * Os que dependem da partida (Tsubame gaeshi, Renhou…) viram condições marcáveis
 * na calculadora, como Haitei e Rinshan, e só aparecem quando estão ligados.
 *
 * Valores em `han` são o que a regra soma ao que a calculadora padrão já contou
 * (ex.: Isshoku sanjun fechado vale 3, mas o Iipeikou de 1 já entrou, então soma 2).
 */
import type { Mao } from './tipos'
import { locaisQueCombinam } from './combinacoesLocais'

export type CategoriaYakuLocal = 'han1' | 'han2' | 'han2mais' | 'han3mais' | 'manganPedra' | 'mangan' | 'yakuman' | 'duplo'

export type ValorYakuLocal =
  | { tipo: 'han'; fechada: number | null; aberta: number | null }
  | { tipo: 'mangan' }
  | { tipo: 'yakuman'; vezes: 1 | 2 }

export interface TextoYakuLocal {
  /** Valor como se lê no guia (ex.: "2 han (1 aberta)"). */
  valor: string
  descricao: string
  /** Nome em português, para o card do guia. */
  traducao: string
}

export interface YakuLocal {
  id: string
  nome: string
  kanji: string
  categoria: CategoriaYakuLocal
  valor: ValorYakuLocal
  /** Depende da partida, não da mão: vira condição marcável na calculadora. */
  situacao?: boolean
  /** Mão fora do formato 4 grupos + par (a calculadora padrão não reconhece). */
  formatoIrregular?: boolean
  pt: TextoYakuLocal
  en: TextoYakuLocal
  detectar?: (contexto: ContextoMao) => boolean
}

// ─── Mão em grupos ────────────────────────────────────────────────────────────

/** Índice 0–33: 1m–9m, 1p–9p, 1s–9s, 1z–7z (Leste, Sul, Oeste, Norte, Haku, Hatsu, Chun). */
type Indice = number

export interface Grupo {
  tipo: 'seq' | 'tri'
  /** Primeira pedra (na sequência) ou a pedra da trinca. */
  pedra: Indice
  aberto: boolean
}

export interface Divisao {
  grupos: Grupo[]
  par: Indice
}

export interface ContextoMao {
  mao: Mao
  /** Quantas de cada pedra, contando as chamadas (kan conta 3). */
  contagem: number[]
  /** Todas as pedras físicas, pelo índice. */
  pedras: Indice[]
  divisoes: Divisao[]
  /** Sete pares: os 7 índices, ou null. */
  setePares: Indice[] | null
  aberta: boolean
  agari: Indice | null
  /** Pedras vermelhas (0m, 0p, 0s) na mão. */
  vermelhas: Set<string>
}

const NAIPES = 'mpsz'

export function indiceDaPedra(codigo: string): Indice {
  const numero = codigo[0] === '0' ? 5 : Number(codigo[0])
  return NAIPES.indexOf(codigo[1]) * 9 + numero - 1
}

const naipe = (indice: Indice) => Math.floor(indice / 9)
const numero = (indice: Indice) => (indice % 9) + 1
const ehHonra = (indice: Indice) => indice >= 27
const ehTerminal = (indice: Indice) => !ehHonra(indice) && (numero(indice) === 1 || numero(indice) === 9)
const ehVento = (indice: Indice) => indice >= 27 && indice <= 30
const ehDragao = (indice: Indice) => indice >= 31
const p = (codigo: string) => indiceDaPedra(codigo)

function dividir(contagem: number[], grupos: Grupo[], saida: Grupo[][]) {
  const primeiro = contagem.findIndex((quantidade) => quantidade > 0)
  if (primeiro === -1) {
    saida.push([...grupos])
    return
  }
  if (contagem[primeiro] >= 3) {
    contagem[primeiro] -= 3
    dividir(contagem, [...grupos, { tipo: 'tri', pedra: primeiro, aberto: false }], saida)
    contagem[primeiro] += 3
  }
  if (!ehHonra(primeiro) && numero(primeiro) <= 7 && contagem[primeiro + 1] > 0 && contagem[primeiro + 2] > 0) {
    contagem[primeiro] -= 1
    contagem[primeiro + 1] -= 1
    contagem[primeiro + 2] -= 1
    dividir(contagem, [...grupos, { tipo: 'seq', pedra: primeiro, aberto: false }], saida)
    contagem[primeiro] += 1
    contagem[primeiro + 1] += 1
    contagem[primeiro + 2] += 1
  }
}

export function montarContexto(mao: Mao): ContextoMao {
  const fechadas = mao.pedras.map(indiceDaPedra)
  const contagemFechada = Array<number>(34).fill(0)
  fechadas.forEach((indice) => (contagemFechada[indice] += 1))
  const gruposChamados: Grupo[] = mao.melds.map((meld) => {
    const indices = meld.pedras.map(indiceDaPedra).sort((a, b) => a - b)
    return {
      tipo: meld.tipo === 'chii' ? 'seq' : 'tri',
      pedra: indices[0],
      aberto: meld.tipo !== 'kanFechado',
    }
  })
  const contagem = [...contagemFechada]
  gruposChamados.forEach((grupo) => {
    for (let passo = 0; passo < 3; passo += 1) contagem[grupo.tipo === 'seq' ? grupo.pedra + passo : grupo.pedra] += 1
  })

  const divisoes: Divisao[] = []
  for (let par = 0; par < 34; par += 1) {
    if (contagemFechada[par] < 2) continue
    contagemFechada[par] -= 2
    const saida: Grupo[][] = []
    dividir(contagemFechada, [], saida)
    contagemFechada[par] += 2
    saida.forEach((grupos) => divisoes.push({ grupos: [...gruposChamados, ...grupos], par }))
  }

  const pares = contagemFechada.flatMap((quantidade, indice) => (quantidade === 2 ? [indice] : []))
  const setePares = mao.melds.length === 0 && pares.length === 7 ? pares : null
  const agariCodigo = mao.agariMeld?.pedra ?? mao.pedras[mao.indiceAgari]
  const todas = [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]

  return {
    mao,
    contagem,
    pedras: todas.map(indiceDaPedra),
    divisoes: divisoes.filter((divisao) => divisao.grupos.length === 4),
    setePares,
    aberta: mao.melds.some((meld) => meld.tipo !== 'kanFechado'),
    agari: agariCodigo ? indiceDaPedra(agariCodigo) : null,
    vermelhas: new Set(todas.filter((codigo) => codigo[0] === '0')),
  }
}

// ─── Ajudantes dos detectores ─────────────────────────────────────────────────

const algumaDivisao = (contexto: ContextoMao, teste: (divisao: Divisao) => boolean) =>
  contexto.divisoes.some(teste)

const trincas = (divisao: Divisao) => divisao.grupos.filter((grupo) => grupo.tipo === 'tri').map((grupo) => grupo.pedra)
const sequencias = (divisao: Divisao) =>
  divisao.grupos.filter((grupo) => grupo.tipo === 'seq').map((grupo) => grupo.pedra)

/** Só estas pedras na mão. */
const soPedras = (contexto: ContextoMao, permitidas: readonly string[]) => {
  const conjunto = new Set(permitidas.map(p))
  return contexto.pedras.every((indice) => conjunto.has(indice))
}

/** Há `quantas` trincas no mesmo naipe com o passo dado (1 = consecutivas). */
function trincasEmEscada(divisao: Divisao, quantas: number, passo: number) {
  const lista = trincas(divisao).filter((indice) => !ehHonra(indice))
  return lista.some((inicio) =>
    Array.from({ length: quantas }, (_vazio, k) => inicio + k * passo).every(
      (alvo) => naipe(alvo) === naipe(inicio) && lista.includes(alvo),
    ),
  )
}

/** Sequência que começa em `n` de cada naipe pedido. */
const temSequencia = (divisao: Divisao, indice: Indice) => sequencias(divisao).includes(indice)

function ittsuuNoNaipe(divisao: Divisao): number | null {
  for (let cor = 0; cor < 3; cor += 1) {
    if ([0, 3, 6].every((desvio) => temSequencia(divisao, cor * 9 + desvio))) return cor
  }
  return null
}

/** Grupos que sobram além do Ittsuu, para o Ittsuu chanta. */
function restoDoIttsuu(divisao: Divisao, cor: number): Grupo[] {
  const usados = [0, 3, 6].map((desvio) => cor * 9 + desvio)
  const resto = [...divisao.grupos]
  usados.forEach((alvo) => {
    const posicao = resto.findIndex((grupo) => grupo.tipo === 'seq' && grupo.pedra === alvo)
    if (posicao >= 0) resto.splice(posicao, 1)
  })
  return resto
}

const grupoComTerminalOuHonra = (grupo: Grupo) =>
  grupo.tipo === 'tri'
    ? ehHonra(grupo.pedra) || ehTerminal(grupo.pedra)
    : numero(grupo.pedra) === 1 || numero(grupo.pedra) === 7

const grupoComTerminal = (grupo: Grupo) =>
  !ehHonra(grupo.pedra) && grupoComTerminalOuHonra(grupo)

/** Par de sequências iguais em dois naipes, duas vezes (Kyandonhou). */
function kyandonhou(divisao: Divisao): [number, number] | null {
  const lista = sequencias(divisao)
  if (lista.length !== 4) return null
  for (const primeiro of [0, 1, 2]) {
    for (const segundo of [0, 1, 2]) {
      if (segundo <= primeiro) continue
      const numerosA = lista.filter((indice) => naipe(indice) === primeiro).map(numero).sort()
      const numerosB = lista.filter((indice) => naipe(indice) === segundo).map(numero).sort()
      if (numerosA.length === 2 && numerosB.length === 2 && numerosA.join() === numerosB.join()) return [primeiro, segundo]
    }
  }
  return null
}

function sequenciasIguais(divisao: Divisao, quantas: number) {
  const lista = sequencias(divisao)
  return lista.some((indice) => lista.filter((outra) => outra === indice).length >= quantas)
}

/** Sete pares consecutivos num naipe, começando em `inicio` (1 ou 3). */
function paresConsecutivos(contexto: ContextoMao, inicios: number[]) {
  const pares = contexto.setePares
  if (!pares) return false
  return [0, 1, 2].some((cor) =>
    inicios.some((inicio) =>
      Array.from({ length: 7 }, (_vazio, k) => cor * 9 + inicio - 1 + k).every((alvo) => pares.includes(alvo)),
    ),
  )
}

/** 22334455667788 de um naipe (a forma fixa da família Daisharin). */
function rodaGrande(contexto: ContextoMao, cor: number) {
  if (contexto.mao.melds.length > 0) return false
  return contexto.contagem.every((quantidade, indice) =>
    naipe(indice) === cor && numero(indice) >= 2 && numero(indice) <= 8 ? quantidade === 2 : quantidade === 0,
  )
}

const VERDES = ['2s', '3s', '4s', '6s', '8s', '6z']

// ─── Catálogo ─────────────────────────────────────────────────────────────────

const han = (fechada: number | null, aberta: number | null): ValorYakuLocal => ({ tipo: 'han', fechada, aberta })
const MANGAN: ValorYakuLocal = { tipo: 'mangan' }
const YAKUMAN: ValorYakuLocal = { tipo: 'yakuman', vezes: 1 }
const DUPLO: ValorYakuLocal = { tipo: 'yakuman', vezes: 2 }

export const YAKUS_LOCAIS: readonly YakuLocal[] = [
  // 1 han
  {
    id: 'tsubameGaeshi',
    nome: 'Tsubame gaeshi',
    kanji: '燕返し',
    categoria: 'han1',
    valor: han(1, 1),
    situacao: true,
    pt: { valor: '1 han', traducao: 'Retorno da andorinha', descricao: 'Ron na pedra que um oponente descartou ao declarar Riichi.' },
    en: { valor: '1 han', traducao: 'Swallow return', descricao: 'Ron on the tile an opponent discarded to declare Riichi.' },
  },
  {
    id: 'shiiaruRaotai',
    nome: 'Shiiaru raotai',
    kanji: '十二落抬',
    categoria: 'han1',
    valor: han(null, 1),
    pt: { valor: '1 han (só aberta)', traducao: 'Doze caídas', descricao: 'Quatro chamadas e espera tanki na última pedra (hadaka tanki).' },
    en: { valor: '1 han (open only)', traducao: 'Twelve fallen', descricao: 'Four calls and a tanki wait on the last tile (hadaka tanki).' },
    detectar: (contexto) => contexto.mao.melds.length === 4,
  },
  {
    id: 'kanburi',
    nome: 'Kanburi',
    kanji: '槓振り',
    categoria: 'han1',
    valor: han(1, 1),
    situacao: true,
    pt: { valor: '1 han', traducao: 'Descarte do kan', descricao: 'Ron no descarte feito logo depois de um oponente declarar kan.' },
    en: { valor: '1 han', traducao: 'Kan discard', descricao: 'Ron on the discard made right after an opponent declares a kan.' },
  },
  {
    id: 'sangenChiitoitsu',
    nome: 'Sangen chiitoitsu',
    kanji: '三元七対子',
    categoria: 'han1',
    valor: han(1, null),
    pt: { valor: '+1 han além do Chiitoitsu', traducao: 'Sete pares dos três dragões', descricao: 'Chiitoitsu com os pares dos três dragões.' },
    en: { valor: '+1 han on top of Chiitoitsu', traducao: 'Seven pairs with three dragons', descricao: 'Chiitoitsu with pairs of all three dragons.' },
    detectar: (contexto) => !!contexto.setePares && [31, 32, 33].every((indice) => contexto.setePares!.includes(indice)),
  },
  {
    id: 'suushiChiitoitsu',
    nome: 'Suushi chiitoitsu',
    kanji: '四喜七対子',
    categoria: 'han1',
    valor: han(1, null),
    pt: { valor: '+1 han além do Chiitoitsu', traducao: 'Sete pares dos quatro ventos', descricao: 'Chiitoitsu com os pares dos quatro ventos.' },
    en: { valor: '+1 han on top of Chiitoitsu', traducao: 'Seven pairs with four winds', descricao: 'Chiitoitsu with pairs of all four winds.' },
    detectar: (contexto) => !!contexto.setePares && [27, 28, 29, 30].every((indice) => contexto.setePares!.includes(indice)),
  },
  {
    id: 'uushinTsuukan',
    nome: 'Uushin tsuukan',
    kanji: '五心通貫',
    categoria: 'han1',
    valor: han(1, 1),
    pt: { valor: '+1 han além do Ittsuu', traducao: 'Cinco no coração', descricao: 'Ittsuu fechado com espera kanchan no 5 (123-46-789).' },
    en: { valor: '+1 han on top of Ittsuu', traducao: 'Five through the heart', descricao: 'Ittsuu completed on a kanchan wait on the 5 (123-46-789).' },
    detectar: (contexto) =>
      contexto.agari !== null &&
      !ehHonra(contexto.agari) &&
      numero(contexto.agari) === 5 &&
      algumaDivisao(contexto, (divisao) => ittsuuNoNaipe(divisao) === naipe(contexto.agari!)),
  },
  {
    id: 'ketsupaihou',
    nome: 'Ketsupaihou',
    kanji: '欠牌和',
    categoria: 'han1',
    valor: han(1, 1),
    situacao: true,
    pt: { valor: '1 han', traducao: 'Vitória da pedra que falta', descricao: 'Espera penchan ou kanchan com 3 das 4 pedras esperadas já visíveis na mesa.' },
    en: { valor: '1 han', traducao: 'Missing tile win', descricao: 'Penchan or kanchan wait with 3 of the 4 waited tiles already visible.' },
  },
  {
    id: 'toipuutao',
    nome: 'Toipuutao',
    kanji: '推不倒',
    categoria: 'han1',
    valor: han(1, 1),
    pt: { valor: '1 han', traducao: 'Não tomba', descricao: 'Só pedras simétricas de cabeça para baixo: Haku, 1-2-3-4-5-8-9 pin e 2-4-5-6-8-9 sou.' },
    en: { valor: '1 han', traducao: 'Reversible tiles', descricao: 'Only tiles that look the same upside down: Haku, 1-2-3-4-5-8-9 pin and 2-4-5-6-8-9 sou.' },
    detectar: (contexto) =>
      soPedras(contexto, ['5z', '1p', '2p', '3p', '4p', '5p', '8p', '9p', '2s', '4s', '5s', '6s', '8s', '9s']),
  },
  // 2 han
  {
    id: 'sanrenkou',
    nome: 'Sanrenkou',
    kanji: '三連刻',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Três trincas seguidas', descricao: 'Três trincas consecutivas no mesmo naipe (ex.: 444-555-666 man). Na variante Sanshoku renkou, em naipes diferentes.' },
    en: { valor: '2 han', traducao: 'Three consecutive triplets', descricao: 'Three consecutive triplets in one suit (e.g. 444-555-666 man). The Sanshoku renkou variant uses different suits.' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => trincasEmEscada(divisao, 3, 1)),
  },
  {
    id: 'sanshokuTsuukan',
    nome: 'Sanshoku tsuukan',
    kanji: '三色通貫',
    categoria: 'han2',
    valor: han(2, 1),
    pt: { valor: '2 han (1 aberta)', traducao: 'Reta das três cores', descricao: '123, 456 e 789 cada um num naipe diferente.' },
    en: { valor: '2 han (1 open)', traducao: 'Three-colour straight', descricao: '123, 456 and 789, each in a different suit.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) =>
        [
          [0, 1, 2],
          [0, 2, 1],
          [1, 0, 2],
          [1, 2, 0],
          [2, 0, 1],
          [2, 1, 0],
        ].some(([a, b, c]) => temSequencia(divisao, a * 9) && temSequencia(divisao, b * 9 + 3) && temSequencia(divisao, c * 9 + 6)),
      ),
  },
  {
    id: 'kyandonhou',
    nome: 'Kyandonhou',
    kanji: '鏡同和',
    categoria: 'han2',
    valor: han(2, 1),
    pt: { valor: '2 han (1 aberta)', traducao: 'Espelho', descricao: 'Duas sequências iguais em dois naipes, duas vezes (ex.: 123m 123p 789m 789p).' },
    en: { valor: '2 han (1 open)', traducao: 'Mirror hand', descricao: 'Two identical sequences in two suits, twice (e.g. 123m 123p 789m 789p).' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => kyandonhou(divisao) !== null),
  },
  {
    id: 'ryandoukou',
    nome: 'Ryandoukou',
    kanji: '二同刻',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '+2 han além do Toitoi', traducao: 'Duas trincas duplas', descricao: 'Dois pares de trincas iguais em dois naipes (ex.: 333m 333p 777p 777s).' },
    en: { valor: '+2 han on top of Toitoi', traducao: 'Two double triplets', descricao: 'Two pairs of same-number triplets in two suits (e.g. 333m 333p 777p 777s).' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => {
        const lista = trincas(divisao).filter((indice) => !ehHonra(indice))
        const numeros = new Map<number, number>()
        lista.forEach((indice) => numeros.set(numero(indice), (numeros.get(numero(indice)) ?? 0) + 1))
        return [...numeros.values()].filter((quantidade) => quantidade >= 2).length >= 2
      }),
  },
  {
    id: 'shoutate',
    nome: 'Shoutate',
    kanji: '小タテ',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Pequena coluna', descricao: 'Duas trincas e o par do mesmo número, em naipes diferentes.' },
    en: { valor: '2 han', traducao: 'Little column', descricao: 'Two triplets and the pair of the same number, in different suits.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => {
        if (ehHonra(divisao.par)) return false
        const mesmas = trincas(divisao).filter(
          (indice) => !ehHonra(indice) && numero(indice) === numero(divisao.par) && naipe(indice) !== naipe(divisao.par),
        )
        return new Set(mesmas.map(naipe)).size >= 2
      }),
  },
  {
    id: 'choupaikou',
    nome: 'Choupaikou / Sujipaikou / Chousankou',
    kanji: '跳牌刻',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Trincas em salto', descricao: 'Três trincas no mesmo naipe com intervalo de 2 (Choupaikou, ex.: 1-3-5), 3 (Sujipaikou 筋牌刻, ex.: 1-4-7) ou 4 (Chousankou 頂三刻, ex.: 1-5-9).' },
    en: { valor: '2 han', traducao: 'Skipping triplets', descricao: 'Three triplets in one suit spaced by 2 (Choupaikou, e.g. 1-3-5), 3 (Sujipaikou, e.g. 1-4-7) or 4 (Chousankou, e.g. 1-5-9).' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => [2, 3, 4].some((passo) => trincasEmEscada(divisao, 3, passo))),
  },
  {
    id: 'suuzuukou',
    nome: 'Suuzuukou',
    kanji: '四字刻',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Quatro trincas de honra', descricao: 'Quatro trincas (ou kans) de honras.' },
    en: { valor: '2 han', traducao: 'Four honour triplets', descricao: 'Four triplets (or kans) of honour tiles.' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => trincas(divisao).filter(ehHonra).length === 4),
  },
  {
    id: 'akadoraSanshoku',
    nome: 'Akadora sanshoku',
    kanji: '赤ドラ三色',
    categoria: 'han2',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Três cincos vermelhos', descricao: 'Os três cincos vermelhos (man, pin e sou) na mão.' },
    en: { valor: '2 han', traducao: 'Three red fives', descricao: 'All three red fives (man, pin and sou) in the hand.' },
    detectar: (contexto) => ['0m', '0p', '0s'].every((codigo) => contexto.vermelhas.has(codigo)),
  },
  // 2 han ou mais
  {
    id: 'openRiichi',
    nome: 'Open riichi',
    kanji: 'オープンリーチ',
    categoria: 'han2mais',
    valor: han(1, null),
    situacao: true,
    pt: { valor: '2 han (substitui o Riichi). Open double riichi: 3 han', traducao: 'Riichi aberto', descricao: 'Riichi declarado mostrando a mão. Marque junto com o Riichi: soma 1 han a ele.' },
    en: { valor: '2 han (replaces Riichi). Open double riichi: 3 han', traducao: 'Open riichi', descricao: 'Riichi declared with the hand revealed. Mark it together with Riichi: it adds 1 han to it.' },
  },
  {
    id: 'isshokuSanjun',
    nome: 'Isshoku sanjun',
    kanji: '一色三順',
    categoria: 'han2mais',
    valor: han(2, 2),
    pt: { valor: '3 han (2 aberta), substitui o Iipeikou', traducao: 'Três sequências iguais', descricao: 'Três sequências idênticas no mesmo naipe (ex.: 234-234-234 pin).' },
    en: { valor: '3 han (2 open), replaces Iipeikou', traducao: 'Three identical sequences', descricao: 'Three identical sequences in one suit (e.g. 234-234-234 pin).' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => sequenciasIguais(divisao, 3)),
  },
  {
    id: 'sanpuukou',
    nome: 'Sanpuukou',
    kanji: '三風刻',
    categoria: 'han2mais',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Três trincas de vento', descricao: 'Três trincas de vento. Na variante Otakaze sankou 客風三刻, três trincas de ventos convidados (que não são da rodada nem do assento), 3 han fechada e 2 aberta.' },
    en: { valor: '2 han', traducao: 'Three wind triplets', descricao: 'Three wind triplets. In the Otakaze sankou variant, three guest wind triplets, 3 han closed and 2 open.' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => trincas(divisao).filter(ehVento).length >= 3),
  },
  {
    id: 'uumensai',
    nome: 'Uumensai',
    kanji: '五門斉',
    categoria: 'han2mais',
    valor: han(2, 2),
    pt: { valor: '2 han', traducao: 'Cinco portas', descricao: 'Man, pin, sou, vento e dragão, todos na mão.' },
    en: { valor: '2 han', traducao: 'Five gates', descricao: 'Man, pin, sou, a wind and a dragon all in the hand.' },
    detectar: (contexto) =>
      [0, 1, 2].every((cor) => contexto.pedras.some((indice) => !ehHonra(indice) && naipe(indice) === cor)) &&
      contexto.pedras.some(ehVento) &&
      contexto.pedras.some(ehDragao),
  },
  {
    id: 'renkaihou',
    nome: 'Renkaihou',
    kanji: '連開花',
    categoria: 'han2mais',
    valor: han(1, 1),
    situacao: true,
    pt: { valor: '2 han (substitui o Rinshan)', traducao: 'Flor dupla', descricao: 'Rinshan depois de dois kans seguidos. Marque junto com o Rinshan: soma 1 han a ele.' },
    en: { valor: '2 han (replaces Rinshan)', traducao: 'Double flower', descricao: 'Rinshan after two kans in a row. Mark it together with Rinshan: it adds 1 han to it.' },
  },
  // 3 han ou mais
  {
    id: 'ittsuuChanta',
    nome: 'Ittsuu chanta',
    kanji: '一気通貫全帯么九',
    categoria: 'han3mais',
    valor: han(1, 1),
    pt: { valor: '3 han (2 aberta). Com junchan: 4 han (3 aberta)', traducao: 'Reta com terminais', descricao: 'Ittsuu em que o grupo e o par que sobram têm terminal ou honra.' },
    en: { valor: '3 han (2 open). Junchan version: 4 han (3 open)', traducao: 'Straight with terminals', descricao: 'Ittsuu where the remaining group and pair all hold a terminal or honour.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => {
        const cor = ittsuuNoNaipe(divisao)
        if (cor === null) return false
        const resto = restoDoIttsuu(divisao, cor)
        return resto.every(grupoComTerminalOuHonra) && (ehHonra(divisao.par) || ehTerminal(divisao.par))
      }),
  },
  {
    id: 'tanfonhou',
    nome: 'Tanfonhou',
    kanji: '断紅和',
    categoria: 'han3mais',
    valor: han(3, 2),
    pt: { valor: '3 han (2 aberta)', traducao: 'Sem vermelho', descricao: 'Nenhuma pedra com vermelho: só 2-3-4-6-8 sou, 2-4-8 pin, ventos, Haku e Hatsu. Variantes Hontanfon (3) e Chintanfon (6, 5 aberta).' },
    en: { valor: '3 han (2 open)', traducao: 'No red', descricao: 'No tile with red on it: only 2-3-4-6-8 sou, 2-4-8 pin, winds, Haku and Hatsu. Variants Hontanfon (3) and Chintanfon (6, 5 open).' },
    detectar: (contexto) =>
      soPedras(contexto, ['2s', '3s', '4s', '6s', '8s', '2p', '4p', '8p', '1z', '2z', '3z', '4z', '5z', '6z']),
  },
  {
    id: 'chinpeikou',
    nome: 'Chinpeikou',
    kanji: '清盃口',
    categoria: 'han3mais',
    valor: han(3, null),
    pt: { valor: '+3 han além do Ryanpeikou', traducao: 'Taça pura', descricao: 'Ryanpeikou em que as duas sequências repetidas são a mesma (quatro sequências iguais).' },
    en: { valor: '+3 han on top of Ryanpeikou', traducao: 'Pure cup', descricao: 'Ryanpeikou where both repeated sequences are the same one (four identical sequences).' },
    detectar: (contexto) => !contexto.aberta && algumaDivisao(contexto, (divisao) => sequenciasIguais(divisao, 4)),
  },
  // Mangan por pedra específica
  {
    id: 'kinkeiDokuritsu',
    nome: 'Kinkei dokuritsu',
    kanji: '金鶏独立',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Galo dourado sozinho', descricao: 'Quatro chamadas e tanki no 1 sou.' },
    en: { valor: 'Mangan', traducao: 'Golden rooster alone', descricao: 'Four calls and a tanki wait on the 1 sou.' },
    detectar: (contexto) => contexto.mao.melds.length === 4 && contexto.agari === p('1s'),
  },
  {
    id: 'touchaoHanchanshue',
    nome: 'Touchao hanchanshue',
    kanji: '独釣寒江雪',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Pesca solitária na neve', descricao: 'Quatro chamadas e tanki no Haku.' },
    en: { valor: 'Mangan', traducao: 'Fishing alone in the snow', descricao: 'Four calls and a tanki wait on Haku.' },
    detectar: (contexto) => contexto.mao.melds.length === 4 && contexto.agari === p('5z'),
  },
  {
    id: 'uupinKaihou',
    nome: 'Uupin kaihou',
    kanji: '五筒開花',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Flor do 5 pin', descricao: 'Rinshan com o 5 pin.' },
    en: { valor: 'Mangan', traducao: 'Five-pin flower', descricao: 'Rinshan on the 5 pin.' },
    detectar: (contexto) => contexto.mao.kan && contexto.mao.agari === 'tsumo' && contexto.agari === p('5p'),
  },
  {
    id: 'ryanzouChankan',
    nome: 'Ryanzou chankan',
    kanji: '二索槍槓',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Roubo do 2 sou', descricao: 'Chankan com o 2 sou.' },
    en: { valor: 'Mangan', traducao: 'Two-sou robbing', descricao: 'Chankan on the 2 sou.' },
    detectar: (contexto) => contexto.mao.kan && contexto.mao.agari === 'ron' && contexto.agari === p('2s'),
  },
  {
    id: 'iipinMouyue',
    nome: 'Iipin mouyue',
    kanji: '一筒摸月',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Lua do fundo do mar', descricao: 'Haitei com o 1 pin.' },
    en: { valor: 'Mangan', traducao: 'Moon from the bottom of the sea', descricao: 'Haitei on the 1 pin.' },
    detectar: (contexto) => contexto.mao.ultimaPedra && contexto.mao.agari === 'tsumo' && contexto.agari === p('1p'),
  },
  {
    id: 'chuupinRaoyui',
    nome: 'Chuupin raoyui',
    kanji: '九筒撈魚',
    categoria: 'manganPedra',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Peixe do fundo do rio', descricao: 'Houtei com o 9 pin.' },
    en: { valor: 'Mangan', traducao: 'Fish from the bottom of the river', descricao: 'Houtei on the 9 pin.' },
    detectar: (contexto) => contexto.mao.ultimaPedra && contexto.mao.agari === 'ron' && contexto.agari === p('9p'),
  },
  // Mangan ou mais
  {
    id: 'akaSanshokuDoujun',
    nome: 'Aka sanshoku doujun',
    kanji: '赤三色同順',
    categoria: 'mangan',
    valor: MANGAN,
    pt: {
      valor: 'Mangan',
      traducao: 'Três cores vermelhas',
      descricao: 'Sanshoku doujun em que a sequência de cada naipe tem o 5 vermelho (ex.: 406m 406p 406s).',
    },
    en: {
      valor: 'Mangan',
      traducao: 'Red three colours',
      descricao: 'Sanshoku doujun where each suit’s sequence holds the red 5 (e.g. 406m 406p 406s).',
    },
    detectar: (contexto) =>
      ['0m', '0p', '0s'].every((codigo) => contexto.vermelhas.has(codigo)) &&
      algumaDivisao(contexto, (divisao) =>
        [2, 3, 4].some((inicio) => [0, 1, 2].every((cor) => temSequencia(divisao, cor * 9 + inicio))),
      ),
  },
  {
    id: 'shanronChonchu',
    nome: 'Shanron chonchu',
    kanji: '双竜争珠',
    categoria: 'mangan',
    valor: MANGAN,
    pt: { valor: 'Mangan', traducao: 'Dois dragões disputam a pérola', descricao: 'Kyandonhou em man e sou com o par em pin.' },
    en: { valor: 'Mangan', traducao: 'Two dragons fight over the pearl', descricao: 'Kyandonhou in man and sou with the pair in pin.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => {
        const cores = kyandonhou(divisao)
        return !!cores && cores[0] === 0 && cores[1] === 2 && !ehHonra(divisao.par) && naipe(divisao.par) === 1
      }),
  },
  {
    id: 'chiishinUushii',
    nome: 'Chiishin uushii',
    kanji: '七星無靠',
    categoria: 'mangan',
    valor: MANGAN,
    formatoIrregular: true,
    pt: { valor: 'Mangan (ou Yakuman, pela casa)', traducao: 'Sete estrelas soltas', descricao: 'As 7 honras e 7 pedras soltas de 147, 258 e 369 em naipes diferentes, sem nenhum grupo.' },
    en: { valor: 'Mangan (or Yakuman, house rule)', traducao: 'Seven lone stars', descricao: 'All 7 honours plus 7 lone tiles from 147, 258 and 369 in different suits, with no groups.' },
    detectar: (contexto) => {
      if (contexto.mao.melds.length > 0 || contexto.pedras.length !== 14) return false
      if (![27, 28, 29, 30, 31, 32, 33].every((indice) => contexto.contagem[indice] === 1)) return false
      const numeros = contexto.pedras.filter((indice) => !ehHonra(indice))
      if (new Set(numeros).size !== 7) return false
      const linhaDe = new Map<number, number>()
      return numeros.every((indice) => {
        const resto = (numero(indice) - 1) % 3
        const cor = naipe(indice)
        if (linhaDe.has(cor) && linhaDe.get(cor) !== resto) return false
        linhaDe.set(cor, resto)
        return true
      }) && new Set(linhaDe.values()).size === linhaDe.size
    },
  },
  {
    id: 'renhou',
    nome: 'Renhou',
    kanji: '人和',
    categoria: 'mangan',
    valor: MANGAN,
    situacao: true,
    pt: { valor: 'Mangan, Baiman ou Yakuman (escolha nas regras)', traducao: 'Bênção do homem', descricao: 'Não dealer faz Ron antes da sua primeira compra, sem chamadas na mesa.' },
    en: { valor: 'Mangan, Baiman or Yakuman (pick in the rules)', traducao: 'Blessing of man', descricao: 'A non-dealer wins by Ron before their first draw, with no calls on the table.' },
  },
  {
    id: 'maneman',
    nome: 'Maneman',
    kanji: '真似満',
    categoria: 'mangan',
    valor: MANGAN,
    situacao: true,
    pt: { valor: 'Mangan, pago por quem foi copiado', traducao: 'Mangan da imitação', descricao: 'Vencer copiando os primeiros descartes de um oponente, que paga o Mangan.' },
    en: { valor: 'Mangan, paid by the copied player', traducao: 'Imitation mangan', descricao: 'Win after copying an opponent’s first discards. That player pays the Mangan.' },
  },
  // Yakuman
  {
    id: 'paarenchan',
    nome: 'Paarenchan',
    kanji: '八連荘',
    categoria: 'yakuman',
    valor: YAKUMAN,
    situacao: true,
    pt: {
      valor: 'Yakuman',
      traducao: 'Oito seguidas',
      descricao:
        'A oitava vitória seguida vale Yakuman, desde que a mão tenha pelo menos 1 yaku. Depois de 7 renchan (7 honba), a próxima vitória já é o Paarenchan. Há três variações, escolhidas nas regras: 1) 8 vitórias seguidas do mesmo jogador. 2) 8 vitórias seguidas como dealer, sem empate no meio. 3) chegar a 8 honba como dealer, com os empates contando, e vencer essa mão. Opcional: Ryanhan-shibari, que do 5º honba em diante exige 2 han sem dora.',
    },
    en: {
      valor: 'Yakuman',
      traducao: 'Eight in a row',
      descricao:
        'The eighth win in a row is a Yakuman, as long as the hand has at least 1 yaku. After 7 renchan (7 honba), the next win is the Paarenchan. Three variations, picked in the rules: 1) 8 wins in a row by the same player. 2) 8 wins in a row as dealer, no draws in between. 3) reach 8 honba as dealer, draws counting, and win that hand. Optional Ryanhan-shibari: from the 5th honba on, 2 han without dora are required.',
    },
  },
  {
    id: 'ishiNoUe',
    nome: 'Ishi no ue ni mo sannen',
    kanji: '石の上にも三年',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Três anos sobre a pedra', descricao: 'Double Riichi que vence no Haitei ou no Houtei.' },
    en: { valor: 'Yakuman', traducao: 'Three years on a rock', descricao: 'Double Riichi that wins on Haitei or Houtei.' },
    detectar: (contexto) => !!contexto.mao.riichi?.duplo && contexto.mao.ultimaPedra,
  },
  {
    id: 'toukanhou',
    nome: 'Toukanhou',
    kanji: '頭槓和',
    categoria: 'yakuman',
    valor: YAKUMAN,
    situacao: true,
    pt: { valor: 'Yakuman', traducao: 'Kan da primeira volta', descricao: 'Kan no primeiro turno e vitória no Rinshan logo em seguida.' },
    en: { valor: 'Yakuman', traducao: 'First-turn kan win', descricao: 'A kan on the very first turn followed by a Rinshan win.' },
  },
  {
    id: 'shiisanpuutaa',
    nome: 'Shiisanpuutaa / Shiisuupuutaa',
    kanji: '十三不塔',
    categoria: 'yakuman',
    valor: YAKUMAN,
    situacao: true,
    formatoIrregular: true,
    pt: { valor: 'Yakuman', traducao: 'Treze sem ligação', descricao: 'Mão inicial sem nenhuma conexão (nenhum par, nenhuma pedra vizinha). Shiisuupuutaa 十四不塔 é a versão com 14 pedras soltas.' },
    en: { valor: 'Yakuman', traducao: 'Thirteen unconnected', descricao: 'A starting hand with no connections at all (no pair, no neighbouring tiles). Shiisuupuutaa is the 14 loose tiles version.' },
  },
  {
    id: 'suurenkou',
    nome: 'Suurenkou',
    kanji: '四連刻',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Quatro trincas seguidas', descricao: 'Quatro trincas consecutivas no mesmo naipe.' },
    en: { valor: 'Yakuman', traducao: 'Four consecutive triplets', descricao: 'Four consecutive triplets in one suit.' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => trincasEmEscada(divisao, 4, 1)),
  },
  {
    id: 'daisharin',
    nome: 'Daisharin / Daichikurin / Daisuurin',
    kanji: '大車輪',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Grande roda', descricao: '22334455667788 em pin (Daisharin), sou (Daichikurin 大竹林) ou man (Daisuurin 大数隣).' },
    en: { valor: 'Yakuman', traducao: 'Big wheels', descricao: '22334455667788 in pin (Daisharin), sou (Daichikurin) or man (Daisuurin).' },
    detectar: (contexto) => [0, 1, 2].some((cor) => rodaGrande(contexto, cor)),
  },
  {
    id: 'shousharin',
    nome: 'Shousharin / Shouchikurin / Shousuurin',
    kanji: '小車輪',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Pequena roda', descricao: 'Sete pares consecutivos de 1 a 7 ou de 3 a 9 num naipe (pin, sou 小竹林 ou man 小数隣).' },
    en: { valor: 'Yakuman', traducao: 'Little wheels', descricao: 'Seven consecutive pairs from 1 to 7 or 3 to 9 in one suit.' },
    detectar: (contexto) => paresConsecutivos(contexto, [1, 3]),
  },
  {
    id: 'isshokuYonjun',
    nome: 'Isshoku yonjun',
    kanji: '一色四順',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Quatro sequências iguais', descricao: 'Quatro sequências idênticas.' },
    en: { valor: 'Yakuman', traducao: 'Four identical sequences', descricao: 'Four identical sequences.' },
    detectar: (contexto) => algumaDivisao(contexto, (divisao) => sequenciasIguais(divisao, 4)),
  },
  {
    id: 'hyakumanGoku',
    nome: 'Hyakuman goku',
    kanji: '百万石',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Um milhão de koku', descricao: 'Chinitsu de man em que a soma dos números das pedras dá 100 ou mais.' },
    en: { valor: 'Yakuman', traducao: 'One million koku', descricao: 'Man chinitsu where the tile numbers add up to 100 or more.' },
    detectar: (contexto) =>
      contexto.pedras.every((indice) => naipe(indice) === 0) &&
      contexto.pedras.reduce((soma, indice) => soma + numero(indice), 0) >= 100,
  },
  {
    id: 'kachoufuugetsu',
    nome: 'Kachoufuugetsu / Fuukasetsugetsu',
    kanji: '花鳥風月',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Flor, pássaro, vento e lua', descricao: 'Trincas de 5 pin (flor), 1 sou (pássaro), um vento e 1 pin (lua). Em Fuukasetsugetsu 風花雪月, o Haku (neve) entra no lugar do 1 sou.' },
    en: { valor: 'Yakuman', traducao: 'Flower, bird, wind and moon', descricao: 'Triplets of 5 pin (flower), 1 sou (bird), a wind and 1 pin (moon). In Fuukasetsugetsu, Haku (snow) replaces the 1 sou.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) => {
        const lista = trincas(divisao)
        return (
          lista.includes(p('5p')) &&
          lista.includes(p('1p')) &&
          (lista.includes(p('1s')) || lista.includes(p('5z'))) &&
          lista.some(ehVento)
        )
      }),
  },
  {
    id: 'kouitten',
    nome: 'Kouitten',
    kanji: '紅一点',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Um ponto vermelho', descricao: 'Ryuuiisou com o Chun no lugar do Hatsu: só 2-3-4-6-8 sou e Chun.' },
    en: { valor: 'Yakuman', traducao: 'One red dot', descricao: 'Ryuuiisou with Chun instead of Hatsu: only 2-3-4-6-8 sou and Chun.' },
    detectar: (contexto) => contexto.pedras.includes(p('7z')) && soPedras(contexto, ['2s', '3s', '4s', '6s', '8s', '7z']),
  },
  {
    id: 'benikujaku',
    nome: 'Benikujaku',
    kanji: '紅孔雀',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Pavão vermelho', descricao: 'Só 1, 5, 7 e 9 sou e Chun.' },
    en: { valor: 'Yakuman', traducao: 'Red peacock', descricao: 'Only 1, 5, 7 and 9 sou and Chun.' },
    detectar: (contexto) => soPedras(contexto, ['1s', '5s', '7s', '9s', '7z']),
  },
  {
    id: 'kokuiisou',
    nome: 'Kokuiisou',
    kanji: '黒一色',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Tudo preto', descricao: 'Só 2, 4 e 8 pin e ventos.' },
    en: { valor: 'Yakuman', traducao: 'All black', descricao: 'Only 2, 4 and 8 pin and winds.' },
    detectar: (contexto) => soPedras(contexto, ['2p', '4p', '8p', '1z', '2z', '3z', '4z']),
  },
  {
    id: 'ryuuiisourin',
    nome: 'Ryuuiisourin / Kouittenrin',
    kanji: '緑一色輪',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Anel verde', descricao: 'Ryuuiisou (ou Kouitten, no Kouittenrin 紅一点輪) com o par de 5 sou.' },
    en: { valor: 'Yakuman', traducao: 'Green ring', descricao: 'Ryuuiisou (or Kouitten, for Kouittenrin) with a pair of 5 sou.' },
    detectar: (contexto) =>
      contexto.contagem[p('5s')] === 2 &&
      (soPedras(contexto, [...VERDES, '5s']) || soPedras(contexto, ['2s', '3s', '4s', '6s', '8s', '7z', '5s'])),
  },
  {
    id: 'goldenGateBridge',
    nome: 'Golden Gate Bridge',
    kanji: '金門橋',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Ponte Golden Gate', descricao: '123, 345, 567 e 789 no mesmo naipe.' },
    en: { valor: 'Yakuman', traducao: 'Golden Gate Bridge', descricao: '123, 345, 567 and 789 in one suit.' },
    detectar: (contexto) =>
      algumaDivisao(contexto, (divisao) =>
        [0, 1, 2].some((cor) => [0, 2, 4, 6].every((desvio) => temSequencia(divisao, cor * 9 + desvio))),
      ),
  },
  {
    id: 'americanCivilWar',
    nome: 'American Civil War',
    kanji: '南北戦争',
    categoria: 'yakuman',
    valor: YAKUMAN,
    // Só da mão: a calculadora reconhece sozinha (não é botão de condição).
    formatoIrregular: true,
    pt: { valor: 'Yakuman', traducao: 'Guerra de Secessão', descricao: 'Mão fechada com trincas de Sul e Norte e as pedras 1861 e 1865 em naipes diferentes (os anos da guerra).' },
    en: { valor: 'Yakuman', traducao: 'American Civil War', descricao: 'Closed hand with South and North triplets plus 1861 and 1865 in different suits (the war years).' },
    detectar: (contexto) => {
      if (contexto.mao.melds.length > 0 || contexto.pedras.length !== 14) return false
      if (contexto.contagem[28] !== 3 || contexto.contagem[30] !== 3) return false
      const numeros = contexto.pedras.filter((indice) => !ehHonra(indice))
      if (numeros.length !== 8) return false
      // Cada ano num naipe: 1861 (1, 1, 6, 8) num e 1865 (1, 5, 6, 8) no outro.
      const porNaipe = new Map<number, number[]>()
      numeros.forEach((indice) => porNaipe.set(naipe(indice), [...(porNaipe.get(naipe(indice)) ?? []), numero(indice)]))
      const anos = [...porNaipe.values()].map((lista) => [...lista].sort((x, y) => x - y).join(''))
      return anos.length === 2 && anos.includes('1168') && anos.includes('1568')
    },
  },
  {
    id: 'touhokuExpressway',
    nome: 'Touhoku Expressway',
    kanji: '東北自動車道',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Rodovia Touhoku', descricao: 'Só 2, 4 e 6 pin, Leste e Norte.' },
    en: { valor: 'Yakuman', traducao: 'Touhoku Expressway', descricao: 'Only 2, 4 and 6 pin, East and North.' },
    detectar: (contexto) => soPedras(contexto, ['2p', '4p', '6p', '1z', '4z']),
  },
  {
    id: 'touhokuShinkansen',
    nome: 'Touhoku Shinkansen',
    kanji: '東北新幹線',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Trem-bala Touhoku', descricao: 'Mão fechada com Ittsuu, um par e uma trinca de Leste e Norte.' },
    en: { valor: 'Yakuman', traducao: 'Touhoku Shinkansen', descricao: 'Closed hand with Ittsuu plus a pair and a triplet of East and North.' },
    detectar: (contexto) =>
      !contexto.aberta &&
      algumaDivisao(contexto, (divisao) => {
        if (ittsuuNoNaipe(divisao) === null) return false
        const ventos = [p('1z'), p('4z')]
        return ventos.includes(divisao.par) && trincas(divisao).some((indice) => ventos.includes(indice) && indice !== divisao.par)
      }),
  },
  {
    id: 'blueTunnel',
    nome: 'Blue Tunnel',
    kanji: '青ノ洞門',
    categoria: 'yakuman',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman', traducao: 'Túnel azul', descricao: 'Toitoi só com 2, 4 e 8 pin, Hatsu e um vento.' },
    en: { valor: 'Yakuman', traducao: 'Blue Tunnel', descricao: 'Toitoi with only 2, 4 and 8 pin, Hatsu and one wind.' },
    detectar: (contexto) =>
      contexto.pedras.includes(p('6z')) &&
      soPedras(contexto, ['2p', '4p', '8p', '6z', '1z', '2z', '3z', '4z']) &&
      algumaDivisao(contexto, (divisao) => trincas(divisao).length === 4),
  },
  // Yakuman duplo
  {
    id: 'daichisei',
    nome: 'Daichisei',
    kanji: '大七星',
    categoria: 'duplo',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman duplo', traducao: 'Sete grandes estrelas', descricao: 'Chiitoitsu com as 7 honras. Soma 1 Yakuman ao Tsuuiisou que a mão já tem.' },
    en: { valor: 'Double Yakuman', traducao: 'Seven big stars', descricao: 'Chiitoitsu with all 7 honours. Adds 1 Yakuman to the Tsuuiisou the hand already has.' },
    detectar: (contexto) => !!contexto.setePares && contexto.setePares.every(ehHonra),
  },
  {
    id: 'junseiRyuuiisou',
    nome: 'Junsei ryuuiisou',
    kanji: '純正緑一色',
    categoria: 'duplo',
    valor: YAKUMAN,
    pt: { valor: 'Yakuman duplo', traducao: 'Tudo verde puro', descricao: 'Ryuuiisou sem o Hatsu. Soma 1 Yakuman ao Ryuuiisou que a mão já tem.' },
    en: { valor: 'Double Yakuman', traducao: 'Pure all green', descricao: 'Ryuuiisou without Hatsu. Adds 1 Yakuman to the Ryuuiisou the hand already has.' },
    detectar: (contexto) => soPedras(contexto, ['2s', '3s', '4s', '6s', '8s']),
  },
]

export const YAKU_LOCAL_POR_ID = new Map(YAKUS_LOCAIS.map((yaku) => [yaku.id, yaku]))

/** Texto do yaku no idioma (inglês fora do português). */
export function textoYakuLocal(yaku: YakuLocal, idioma: string): TextoYakuLocal {
  return idioma === 'pt-BR' ? yaku.pt : yaku.en
}

// ─── Aplicação no resultado ───────────────────────────────────────────────────

export type ValorRenhou = 'mangan' | 'baiman' | 'yakuman'

export interface OpcoesLocais {
  ativos: ReadonlySet<string>
  /** Condições de partida marcadas na calculadora. */
  condicoes: ReadonlySet<string>
  renhou: ValorRenhou
  /** Paarenchan ligado com Ryanhan-shibari. */
  ryanhanShibari?: boolean
}

export interface YakuLocalEncontrado {
  yaku: YakuLocal
  /** Han somado, ou null para Mangan/Yakuman. */
  han: number | null
}

/** Yakus locais que valem para esta mão, com o han de cada um. */
export function encontrarYakusLocais(mao: Mao, opcoes: OpcoesLocais): YakuLocalEncontrado[] {
  if (opcoes.ativos.size === 0) return []
  const contexto = montarContexto(mao)
  // Condições que não combinam entre si (ou com a batida) não contam, mesmo marcadas.
  const condicoes = new Set(
    locaisQueCombinam({
      agari: mao.agari,
      riichi: mao.riichi !== null,
      kan: mao.kan,
      ultimaPedra: mao.ultimaPedra,
      bencao: mao.bencao,
      locais: [...opcoes.condicoes],
    }),
  )
  const encontrados: YakuLocalEncontrado[] = []
  for (const yaku of YAKUS_LOCAIS) {
    if (!opcoes.ativos.has(yaku.id)) continue
    const vale = yaku.situacao ? condicoes.has(yaku.id) : !!yaku.detectar?.(contexto)
    if (!vale) continue
    if (yaku.valor.tipo === 'han') {
      const valor = contexto.aberta ? yaku.valor.aberta : yaku.valor.fechada
      if (valor === null) continue
      encontrados.push({ yaku, han: valor })
    } else {
      encontrados.push({ yaku, han: null })
    }
  }
  return encontrados
}

/** Han mínimo de cada patamar, para os yakus que garantem Mangan, Baiman… */
export const HAN_MINIMO = { mangan: 5, baiman: 8 } as const

/** Ordem dos grupos no Guia de bolso, com a chave do título de cada um. */
export const CATEGORIAS_LOCAIS_EM_ORDEM: readonly { categoria: CategoriaYakuLocal; chave: string }[] = [
  { categoria: 'han1', chave: 'pocketGuide.special.han1' },
  { categoria: 'han2', chave: 'pocketGuide.special.han2' },
  { categoria: 'han2mais', chave: 'pocketGuide.special.han2plus' },
  { categoria: 'han3mais', chave: 'pocketGuide.special.han3plus' },
  { categoria: 'manganPedra', chave: 'pocketGuide.special.manganTile' },
  { categoria: 'mangan', chave: 'pocketGuide.special.mangan' },
  { categoria: 'yakuman', chave: 'pocketGuide.special.yakuman' },
  { categoria: 'duplo', chave: 'pocketGuide.special.double' },
]
