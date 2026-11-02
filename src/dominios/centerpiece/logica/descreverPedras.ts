/**
 * Frases por extenso de pedras, rios e furiten, prontas para o leitor de tela e
 * para um futuro modo falado. Recebem o tradutor do idioma ativo, como `descreverDados`.
 */
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { pedraBase, type LanceDescarte } from './descartes'
import type { EstadoFuriten, TipoFuriten } from './furiten'
import type { Cadeira } from './partida'

export type Tradutor = (chave: string, parametros?: Record<string, string | number>) => string

const NAIPE: Record<string, string> = { m: 'man', p: 'pin', s: 'sou' }
const HONRA: Record<string, string> = {
  '1z': 'east',
  '2z': 'south',
  '3z': 'west',
  '4z': 'north',
  '5z': 'white',
  '6z': 'green',
  '7z': 'redDragon',
}

/** "3 de caracteres", "5 vermelho de bambu", "vento Leste", "dragão branco". */
export function descreverPedra(pedra: CodigoPedra, t: Tradutor): string {
  if (pedra[1] === 'z') return t(`spokenTiles.${HONRA[pedra]}`)
  if (pedra[0] === '0') return t(`spokenTiles.red.${NAIPE[pedra[1]]}`)
  return t(`spokenTiles.${NAIPE[pedra[1]]}`, { number: pedra[0] })
}

function juntar(itens: string[], t: Tradutor) {
  if (itens.length < 2) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} ${t('spokenTiles.and')} ${itens[itens.length - 1]}`
}

/** Agrupa por naipe: "3 e 6 de bambu, vento Leste". */
export function descreverEsperas(esperas: readonly CodigoPedra[], t: Tradutor): string {
  const bases = [...new Set(esperas.map(pedraBase))]
  const grupos = ['m', 'p', 's'].flatMap((naipe) => {
    const numeros = bases.filter((pedra) => pedra[1] === naipe).map((pedra) => pedra[0])
    return numeros.length > 0
      ? [t(`spokenTiles.${NAIPE[naipe]}`, { number: juntar(numeros, t) })]
      : []
  })
  const honras = bases.filter((pedra) => pedra[1] === 'z').map((pedra) => descreverPedra(pedra, t))
  return [...grupos, ...honras].join(', ')
}

function descreverDescarte(
  descarte: LanceDescarte,
  nomeDe: (cadeira: Cadeira) => string,
  t: Tradutor,
) {
  const marcas = [
    ...(descarte.riichi ? [t('spokenTiles.riichiMark')] : []),
    ...(descarte.chamadaPor
      ? [
          t('spokenTiles.calledMark', {
            name: nomeDe(descarte.chamadaPor.cadeira),
            call: t(`match.discards.call.${descarte.chamadaPor.tipo}`),
          }),
        ]
      : []),
  ]
  const pedra = descreverPedra(descarte.pedra, t)
  return marcas.length > 0 ? `${pedra} (${marcas.join(', ')})` : pedra
}

/** "Fulano descartou: 3 de caracteres, vento Leste (Riichi)." */
export function descreverRio(
  nome: string,
  descartes: readonly LanceDescarte[],
  nomeDe: (cadeira: Cadeira) => string,
  t: Tradutor,
): string {
  if (descartes.length === 0) return t('spokenTiles.noDiscards', { name: nome })
  return t('spokenTiles.river', {
    name: nome,
    tiles: descartes.map((descarte) => descreverDescarte(descarte, nomeDe, t)).join(', '),
  })
}

export const CHAVE_DESCRICAO_FURITEN: Record<TipoFuriten, string> = {
  riichi: 'match.furiten.riichi',
  descartes: 'match.furiten.discards',
  temporario: 'match.furiten.temporary',
}

/** "Furiten temporário · espera 3 e 6 de bambu · até seu próximo descarte". */
export function descreverFuriten(
  estado: EstadoFuriten,
  esperas: readonly CodigoPedra[],
  t: Tradutor,
): string {
  if (!estado.principal) return ''
  const chave = CHAVE_DESCRICAO_FURITEN[estado.principal]
  return [
    t(`${chave}.title`),
    t('match.furiten.waiting', { tiles: descreverEsperas(esperas, t) }),
    t(`${chave}.until`),
  ].join(' · ')
}
