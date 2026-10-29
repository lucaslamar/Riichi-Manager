/**
 * @fileoverview Adaptador entre a notação digitada (`2388m447p2458889s`) e as
 * pedras da calculadora (`CodigoPedra`, ex.: "5m", "0p" para o 5 vermelho).
 *
 * O parser (`parseHand`) não conhece melds nem regras; aqui ficam as checagens
 * que dependem da mão atual: limite de 14 slots, cópias somadas aos melds e Aka dora.
 */
import { parseHand, type Suit, type Tile } from './parseHand'
import { contarSlotsLogicos } from './ordenacao'
import type { CodigoPedra, Meld } from './tipos'

export interface ErroNotacao {
  /** Chave de i18n em `notation.errors`. */
  chave: string
  parametros?: Record<string, string | number>
}

export interface ResultadoNotacao {
  /** Pedras na ordem digitada: a última é a candidata a pedra de batida. */
  pedras: CodigoPedra[]
  erro: ErroNotacao | null
}

const ORDEM_NAIPES: Suit[] = ['m', 'p', 's', 'z']

/** `red: true` vira o 5 vermelho ("0m"); honras usam 1z–7z (E S W N, branco, verde, vermelho). */
export function pedraDoTile(tile: Tile): CodigoPedra {
  return tile.red ? `0${tile.suit}` : `${tile.num}${tile.suit}`
}

/** Aceita maiúsculas e espaços antes de passar ao parser: "2388M 447P" vira "2388m447p". */
export function normalizarNotacao(texto: string): string {
  return texto.toLowerCase().replace(/\s+/g, '')
}

/**
 * Gera a notação das pedras da mão fechada. A pedra de batida, se houver, vai
 * por último, para que ao interpretar de volta ela continue sendo a batida.
 */
export function gerarNotacao(pedras: CodigoPedra[], indiceAgari = -1): string {
  const agari = pedras[indiceAgari]
  const resto = pedras.filter((_pedra, indice) => indice !== indiceAgari)
  const grupos = ORDEM_NAIPES.map((naipe) => ({
    naipe,
    digitos: resto.filter((pedra) => pedra[1] === naipe).map((pedra) => pedra[0]),
  })).filter((grupo) => grupo.digitos.length > 0)

  if (agari) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.naipe === agari[1]) ultimo.digitos.push(agari[0])
    else grupos.push({ naipe: agari[1] as Suit, digitos: [agari[0]] })
  }
  return grupos.map((grupo) => grupo.digitos.join('') + grupo.naipe).join('')
}

/** Traduz a mensagem do parser para uma chave de i18n, sem mexer no parser. */
function erroDoParser(mensagem: string): ErroNotacao {
  let achado = mensagem.match(/^Naipe "(.)"/)
  if (achado)
    return { chave: 'notation.errors.suitWithoutNumbers', parametros: { suit: achado[1] } }
  achado = mensagem.match(/^(\d)z não existe/)
  if (achado)
    return { chave: 'notation.errors.invalidHonor', parametros: { tile: `${achado[1]}z` } }
  achado = mensagem.match(/^Caractere inválido: "(.+)"/)
  if (achado) return { chave: 'notation.errors.invalidChar', parametros: { char: achado[1] } }
  if (mensagem.startsWith('Faltou o naipe')) return { chave: 'notation.errors.missingSuit' }
  achado = mensagem.match(/^Mais de 4 peças (\w+)/)
  if (achado) return { chave: 'notation.errors.tooManyCopies', parametros: { tile: achado[1] } }
  return { chave: 'notation.errors.invalid' }
}

/**
 * Interpreta o texto digitado considerando os melds já declarados na mão.
 * Com erro, `pedras` traz o que foi lido até ali, mas não deve ir para o cálculo.
 */
export function interpretarNotacao(
  texto: string,
  contexto: { melds: Meld[]; akadora: boolean },
): ResultadoNotacao {
  const { tiles, error } = parseHand(texto)
  const pedras = tiles.map(pedraDoTile)
  if (error) return { pedras, erro: erroDoParser(error) }

  const slotsMelds = contarSlotsLogicos({ pedras: [], melds: contexto.melds })
  if (pedras.length + slotsMelds > 14) {
    return {
      pedras,
      erro: { chave: 'notation.errors.tooManyTiles', parametros: { max: 14 - slotsMelds } },
    }
  }

  const todas = [...contexto.melds.flatMap((meld) => meld.pedras), ...pedras]
  if (!contexto.akadora && todas.some((pedra) => pedra[0] === '0')) {
    return { pedras, erro: { chave: 'notation.errors.akaDisabled' } }
  }

  const copias = new Map<string, number>()
  const akas = new Map<string, number>()
  for (const pedra of todas) {
    const base = pedra[0] === '0' ? `5${pedra[1]}` : pedra
    copias.set(base, (copias.get(base) ?? 0) + 1)
    if (copias.get(base)! > 4) {
      return {
        pedras,
        erro: { chave: 'notation.errors.tooManyCopies', parametros: { tile: base } },
      }
    }
    if (pedra[0] === '0') {
      akas.set(pedra, (akas.get(pedra) ?? 0) + 1)
      if (akas.get(pedra)! > 1) {
        return {
          pedras,
          erro: { chave: 'notation.errors.duplicateAka', parametros: { tile: pedra } },
        }
      }
    }
  }

  return { pedras, erro: null }
}

export interface ResultadoNotacaoCompleta extends ResultadoNotacao {
  /** Chamadas digitadas com `c` (chi, pon, kan aberto) ou `a` (kan fechado). */
  melds: Meld[]
}

/** Grupo de chamada: números, naipe e a marca (`123mc`, `111pc`, `1111sa`). */
const GRUPO_CHAMADA = /(\d+)([mpsz])([ca])/g

const valorBase = (pedra: CodigoPedra) => (pedra[0] === '0' ? 5 : Number(pedra[0]))

/**
 * Deduz o tipo da chamada pelo formato do grupo: com `c`, sequência é chi,
 * trinca é pon e 4 iguais é kan aberto; com `a`, só 4 iguais (kan fechado).
 */
function meldDoGrupo(pedras: CodigoPedra[], marca: string, grupo: string): Meld | ErroNotacao {
  const iguais = pedras.every(
    (pedra) => pedra[1] === pedras[0][1] && valorBase(pedra) === valorBase(pedras[0]),
  )
  if (marca === 'a') {
    if (pedras.length === 4 && iguais) return { tipo: 'kanFechado', pedras }
    return { chave: 'notation.errors.invalidClosedKan', parametros: { group: grupo } }
  }
  if (pedras.length === 4 && iguais) return { tipo: 'kanAberto', pedras }
  if (pedras.length === 3 && iguais) return { tipo: 'pon', pedras }
  const valores = pedras.map(valorBase).sort((a, b) => a - b)
  const sequencia =
    pedras.length === 3 &&
    pedras[0][1] !== 'z' &&
    valores[1] === valores[0] + 1 &&
    valores[2] === valores[1] + 1
  if (sequencia) {
    return { tipo: 'chii', pedras: [...pedras].sort((a, b) => valorBase(a) - valorBase(b)) }
  }
  return { chave: 'notation.errors.invalidCall', parametros: { group: grupo } }
}

/**
 * Interpreta a mão inteira: os grupos marcados com `c`/`a` viram melds e o
 * resto é a mão fechada (a última pedra dela é a candidata a batida).
 * Ex.: `2388m447p 123mc 111pc 1111sa`. O texto deve vir de `normalizarNotacao`.
 */
export function interpretarNotacaoCompleta(
  texto: string,
  contexto: { akadora: boolean },
): ResultadoNotacaoCompleta {
  const melds: Meld[] = []
  for (const [grupo, digitos, naipe, marca] of texto.matchAll(GRUPO_CHAMADA)) {
    const { tiles, error } = parseHand(digitos + naipe)
    if (error) return { pedras: [], melds, erro: erroDoParser(error) }
    const meld = meldDoGrupo(tiles.map(pedraDoTile), marca, grupo)
    if ('chave' in meld) return { pedras: [], melds, erro: meld }
    melds.push(meld)
  }
  const resto = texto.replace(GRUPO_CHAMADA, '')
  return { ...interpretarNotacao(resto, { melds, akadora: contexto.akadora }), melds }
}

/**
 * Notação da mão inteira: a mão fechada (batida por último) e depois cada
 * meld com a sua marca, `c` ou `a` para o kan fechado.
 */
export function gerarNotacaoCompleta(pedras: CodigoPedra[], indiceAgari: number, melds: Meld[]) {
  const chamadas = melds.map(
    (meld) =>
      meld.pedras.map((pedra) => pedra[0]).join('') +
      meld.pedras[0][1] +
      (meld.tipo === 'kanFechado' ? 'a' : 'c'),
  )
  return [gerarNotacao(pedras, indiceAgari), ...chamadas].filter(Boolean).join(' ')
}
