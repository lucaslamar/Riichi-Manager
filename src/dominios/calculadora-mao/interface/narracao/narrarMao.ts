import { useEffect, useRef } from 'react'
import { anunciar, type NomesPedrasNarracao } from '@/compartilhado/adaptadores/voz'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  useConfigNarracao,
  useLeituraSobDemanda,
  useNarrarMudanca,
} from '@/compartilhado/interface/narracao/useNarracao'
import { descreverPedra, type Tradutor } from '@/dominios/centerpiece/logica/descreverPedras'
import type { CodigoPedra, Mao } from '../../logica/tipos'

const NAIPES_JA: Record<string, string> = { m: 'Man', p: 'Pin', s: 'Sou' }
const HONRAS_JA = ['Ton', 'Nan', 'Shaa', 'Pei', 'Haku', 'Hatsu', 'Chun']

/** Nome falado da pedra: no idioma do app ou em japonês ("Sou 5 vermelho", "Chun"). */
export function descreverPedraNarracao(pedra: CodigoPedra, nomes: NomesPedrasNarracao, traduzir: Tradutor) {
  if (nomes !== 'ja') return descreverPedra(pedra, traduzir)
  const numero = Number(pedra[0])
  if (pedra[1] === 'z') return HONRAS_JA[numero - 1]
  return numero === 0 ? `${NAIPES_JA[pedra[1]]} 5 ${traduzir('narration.red')}` : `${NAIPES_JA[pedra[1]]} ${numero}`
}

function listar(pedras: CodigoPedra[], nomes: NomesPedrasNarracao, traduzir: Tradutor) {
  const faladas = pedras.map((pedra) => descreverPedraNarracao(pedra, nomes, traduzir))
  if (faladas.length < 2) return faladas.join('')
  return `${faladas.slice(0, -1).join(', ')} ${traduzir('spokenTiles.and')} ${faladas[faladas.length - 1]}`
}

/** O que está em `depois` e não em `antes`, contando repetidas. */
function sobra(antes: CodigoPedra[], depois: CodigoPedra[]) {
  const restantes = [...antes]
  return depois.filter((pedra) => {
    const indice = restantes.indexOf(pedra)
    if (indice < 0) return true
    restantes.splice(indice, 1)
    return false
  })
}

function descreverMelds(melds: Mao['melds'], nomes: NomesPedrasNarracao, traduzir: Tradutor) {
  return melds.map((meld) => {
    const base = meld.pedras[0].replace('0', '5')
    const iguais = meld.tipo !== 'chii' && meld.pedras.every((pedra) => pedra.replace('0', '5') === base)
    const pedras = iguais ? descreverPedraNarracao(base, nomes, traduzir) : listar(meld.pedras, nomes, traduzir)
    return traduzir('narration.meld', { call: traduzir(`narration.calls.${meld.tipo}`), tiles: pedras })
  })
}

function descreverMao(mao: Mao, nomes: NomesPedrasNarracao, traduzir: Tradutor) {
  if (mao.pedras.length === 0 && mao.melds.length === 0) return traduzir('narration.handEmpty')
  const frases = mao.pedras.length ? [traduzir('narration.hand', { tiles: listar(mao.pedras, nomes, traduzir) })] : []
  frases.push(...descreverMelds(mao.melds, nomes, traduzir))
  if (mao.dora.length) frases.push(traduzir('narration.dora', { tiles: listar(mao.dora, nomes, traduzir) }))
  return frases.join('. ')
}

/** Tudo saiu de uma vez (Limpar), não uma pedra só. */
const apagou = (antes: Mao, depois: Mao) => totalItens(antes) > 1 && totalItens(depois) === 0
const totalItens = (mao: Mao) => mao.pedras.length + mao.melds.length

/**
 * Narração da Calculadora de Mão: cada pedra escolhida ou tirada, chamadas, dora,
 * Riichi e ron/tsumo. Limpar a mão diz só "Mão apagada", com ou sem Narração.
 * Alt+M lê a mão inteira.
 */
export function useNarracaoMao(mao: Mao) {
  const { t } = useI18n()
  const { idiomaPedras: nomes } = useConfigNarracao().config

  useNarrarMudanca(mao, (antes, depois) => {
    if (apagou(antes, depois)) return []
    const frases: string[] = []
    const escolhidas = sobra(antes.pedras, depois.pedras)
    if (escolhidas.length) frases.push(t('narration.selected', { tiles: listar(escolhidas, nomes, t) }))
    else if (depois.pedras.length < antes.pedras.length && depois.melds.length === antes.melds.length) {
      frases.push(t('narration.removed', { tiles: listar(sobra(depois.pedras, antes.pedras), nomes, t) }))
    }
    if (depois.melds.length > antes.melds.length) {
      frases.push(...descreverMelds(depois.melds.slice(antes.melds.length), nomes, t))
    }
    const dora = sobra(antes.dora, depois.dora)
    if (dora.length) frases.push(t('narration.dora', { tiles: listar(dora, nomes, t) }))
    const uradora = sobra(antes.uradora, depois.uradora)
    if (uradora.length) frases.push(t('narration.uradora', { tiles: listar(uradora, nomes, t) }))
    if (depois.riichi && !antes.riichi) frases.push('Riichi')
    if (depois.agari !== antes.agari) frases.push(depois.agari === 'tsumo' ? 'Tsumo' : 'Ron')
    return frases
  })

  // Limpar a mão diz uma frase só, com ou sem Narração (o leitor de tela também ouve).
  const anterior = useRef(mao)
  useEffect(() => {
    if (apagou(anterior.current, mao)) anunciar(t('calculator.handCleared'))
    anterior.current = mao
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mao])

  useLeituraSobDemanda('mao', () => descreverMao(mao, nomes, t))
}
