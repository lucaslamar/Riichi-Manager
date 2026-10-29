/**
 * @fileoverview Adaptador entre a notação digitada (`2388m447p2458889s`) e as
 * pedras da calculadora (`CodigoPedra`, ex.: "5m", "0p" para o 5 vermelho).
 *
 * O parser (`parseHand`) não conhece melds nem regras; aqui ficam as checagens
 * que dependem da mão atual: limite de 14 slots, cópias somadas aos melds e Aka dora.
 */
import { parseHand, type Tile } from './parseHand'
import { contarSlotsLogicos } from './ordenacao'
import type { CodigoPedra, Meld } from './tipos'

export interface ErroNotacao {
  /** Chave de i18n em `notation.errors`. */
  chave: string
  parametros?: Record<string, string | number>
}

export interface ResultadoNotacao {
  /** Pedras na ordem digitada. */
  pedras: CodigoPedra[]
  erro: ErroNotacao | null
}

/** `red: true` vira o 5 vermelho ("0m"); honras usam 1z–7z (E S W N, branco, verde, vermelho). */
export function pedraDoTile(tile: Tile): CodigoPedra {
  return tile.red ? `0${tile.suit}` : `${tile.num}${tile.suit}`
}

/** Aceita maiúsculas e espaços antes de passar ao parser: "2388M 447P" vira "2388m447p". */
export function normalizarNotacao(texto: string): string {
  return texto.toLowerCase().replace(/\s+/g, '')
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

  if (!contexto.akadora && pedras.some((pedra) => pedra[0] === '0')) {
    return { pedras, erro: { chave: 'notation.errors.akaDisabled' } }
  }

  const copias = new Map<string, number>()
  const akas = new Map<string, number>()
  for (const pedra of [...contexto.melds.flatMap((meld) => meld.pedras), ...pedras]) {
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
