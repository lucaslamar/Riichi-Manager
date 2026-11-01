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
 * Chamadas que cabem no último grupo digitado (`…123m` → chi, `…111p` → pon,
 * `…1111s` → kan aberto e kan fechado). O teclado da notação só acende essas
 * teclas, e todas escrevem a marca deduzida (`c`) ou `a`.
 */
export function chamadasPossiveis(texto: string): Set<Meld['tipo']> {
  const possiveis = new Set<Meld['tipo']>()
  const fim = normalizarNotacao(texto).match(/(\d+)([mpsz]?)$/)
  if (!fim) return possiveis
  // Ainda sem naipe, o formato do grupo é o mesmo em qualquer naipe numérico.
  const { tiles, error } = parseHand(fim[1] + (fim[2] || 'm'))
  if (error) return possiveis
  const pedras = tiles.map(pedraDoTile)
  for (const marca of ['c', 'a']) {
    const meld = meldDoGrupo(pedras, marca, fim[0] + marca)
    if (!('chave' in meld)) possiveis.add(meld.tipo)
  }
  return possiveis
}

/** Um grupo ainda sem naipe: números soltos ou uma chamada marcada (`999c`, `1111a`). */
export interface GrupoPendente {
  digitos: string
  marca: string
}

/**
 * Separa o fim da notação que ainda espera o naipe do resto, já completo. Podem
 * ser vários grupos (`999c123c78`): o naipe escolhido no fim vale para todos.
 */
export function separarPendentes(texto: string) {
  const normalizado = normalizarNotacao(texto)
  const pendentes = normalizado.match(/(?:\d+[ca]?)+$/)?.[0] ?? ''
  return { completo: normalizado.slice(0, normalizado.length - pendentes.length), pendentes }
}

export function lerPendentes(pendentes: string): GrupoPendente[] {
  return [...pendentes.matchAll(/(\d+)([ca]?)/g)].map(([, digitos, marca]) => ({ digitos, marca }))
}

/** Aplica o naipe a todos os grupos pendentes: `999c12` + `p` → `999pc12p`. */
export function fecharPendentes(pendentes: string, naipe: string): string {
  return pendentes.replace(/(\d+)([ca]?)/g, (_grupo, digitos, marca) => digitos + naipe + marca)
}

/** Tipo do meld de um grupo pendente, ou `null` se o formato não fecha uma chamada. */
export function tipoDoGrupoPendente({ digitos, marca }: GrupoPendente): Meld['tipo'] | null {
  if (!marca) return null
  const { tiles, error } = parseHand(digitos + 'm')
  if (error) return null
  const meld = meldDoGrupo(tiles.map(pedraDoTile), marca, digitos + marca)
  return 'chave' in meld ? null : meld.tipo
}

/** Slots que os grupos sem naipe ocupam: número solto vale 1 e chamada vale 3 (kan também). */
export function slotsDosPendentes(pendentes: string): number {
  return lerPendentes(pendentes).reduce(
    (soma, grupo) => soma + (tipoDoGrupoPendente(grupo) ? 3 : grupo.digitos.length),
    0,
  )
}

/** Se o grupo inteiro cabe nos números pendentes (todos terão o mesmo naipe). */
export function grupoCabeNosPendentes(digitos: string, grupo: string): boolean {
  let acumulado = digitos
  for (const numero of grupo) {
    if (!podeDigitarNumero(acumulado, numero)) return false
    acumulado += numero
  }
  return true
}

/**
 * Sequências de chi que contêm o número (sem naipe), da menor para a maior:
 * `4` → `234`, `345`, `456`; `1` → só `123`. O 0 (5 vermelho) fica no lugar do 5.
 */
export function sequenciasChiComNumero(numero: string): string[] {
  const valor = numero === '0' ? 5 : Number(numero)
  const sequencias: string[] = []
  for (let inicio = valor - 2; inicio <= valor; inicio++) {
    if (inicio < 1 || inicio > 7) continue
    const valores = [inicio, inicio + 1, inicio + 2]
    sequencias.push(valores.map((atual) => (atual === valor ? numero : String(atual))).join(''))
  }
  return sequencias
}

/**
 * Grupo que a chamada marcada antes completa a partir de um número, ainda sem
 * naipe: Pon `8` → `888`, Kan `8` → `8888` (o 0 entra uma vez: Pon `0` → `055`).
 * Chi depende da sequência escolhida (`sequenciasChiComNumero`); aqui, `null`.
 */
export function grupoDaChamada(numero: string, tipo: Meld['tipo']): string | null {
  const base = numero === '0' ? '5' : numero
  if (tipo === 'pon') return numero + base.repeat(2)
  if (tipo === 'kanAberto' || tipo === 'kanFechado') return numero + base.repeat(3)
  return null
}

/**
 * Se mais um número cabe no grupo que ainda espera o naipe: cada valor no máximo
 * 4 vezes (o 0 conta como 5) e o 0 uma vez só, porque há um 5 vermelho por naipe.
 */
export function podeDigitarNumero(pendentes: string, numero: string): boolean {
  if (numero === '0' && pendentes.includes('0')) return false
  const base = numero === '0' ? '5' : numero
  const iguais = [...pendentes].filter((digito) => (digito === '0' ? '5' : digito) === base)
  return iguais.length < 4
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
