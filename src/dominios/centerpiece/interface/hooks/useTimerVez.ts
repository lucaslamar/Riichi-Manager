import { useEffect, useRef, useState } from 'react'
import { tocarAlarme } from '@/compartilhado/adaptadores/alarme'
import { vibrar } from '@/compartilhado/adaptadores/vibracao'
import type { Cadeira, Partida } from '../../logica/partida'
import {
  milissegundosRestantes,
  passarVezPara,
  pausarVez,
  retomarVez,
  tempoEsgotado,
  tocarTimer,
} from '../../logica/vez'

const INTERVALO_TELA_MS = 250
const INTERVALO_ALARME_MS = 2000

/**
 * Timer de vez da partida aberta: atualiza a tela, toca o alarme enquanto o tempo
 * estiver esgotado e pausa sozinho com modal aberta ou ao sair da mesa. O modal de
 * descarte não entra em `modalAberta`: é parte da vez, e o tempo segue correndo.
 * Com `alarmeUmaVez`, quem está descartando ouve um toque só, não a repetição.
 */
export function useTimerVez(
  partida: Partida,
  atualizar: (transformar: (partida: Partida) => Partida) => void,
  modalAberta: boolean,
  alarmeUmaVez: boolean,
) {
  const { vez, config } = partida
  const segundosTotais = config.timerVez
  const [relogio, setRelogio] = useState(Date.now)
  const contando = vez.contandoDesde !== null
  const agora = Math.max(relogio, vez.contandoDesde ?? 0)
  const esgotado = segundosTotais > 0 && tempoEsgotado(vez, agora)

  useEffect(() => {
    if (!contando) return
    const intervalo = window.setInterval(() => setRelogio(Date.now()), INTERVALO_TELA_MS)
    return () => window.clearInterval(intervalo)
  }, [contando])

  const silenciar = useRef(alarmeUmaVez)
  silenciar.current = alarmeUmaVez
  useEffect(() => {
    if (!esgotado) return
    const sinalizar = () => {
      tocarAlarme()
      vibrar([200, 100, 200])
    }
    sinalizar()
    const intervalo = window.setInterval(() => {
      if (!silenciar.current) sinalizar()
    }, INTERVALO_ALARME_MS)
    return () => window.clearInterval(intervalo)
  }, [esgotado])

  // Modal aberta pausa; ao fechar, só volta a contar se estava contando.
  const pausadoPelaModal = useRef(false)
  useEffect(() => {
    if (modalAberta && contando) {
      pausadoPelaModal.current = true
      atualizar((atual) => ({ ...atual, vez: pausarVez(atual.vez, Date.now()) }))
    } else if (!modalAberta && pausadoPelaModal.current) {
      pausadoPelaModal.current = false
      // A mão pode ter terminado com a modal aberta: a nova só conta no primeiro toque.
      atualizar((atual) =>
        atual.vez.comecou ? { ...atual, vez: retomarVez(atual.vez, Date.now()) } : atual,
      )
    }
  }, [modalAberta, contando, atualizar])

  // Sair da mesa (ou trocar de mesa) deixa o timer parado.
  useEffect(
    () => () => atualizar((atual) => ({ ...atual, vez: pausarVez(atual.vez, Date.now()) })),
    [atualizar],
  )

  return {
    ligado: segundosTotais > 0,
    contando,
    esgotado,
    segundos: Math.ceil(milissegundosRestantes(vez, agora) / 1000),
    fracao: segundosTotais > 0 ? milissegundosRestantes(vez, agora) / (segundosTotais * 1000) : 0,
    tocar: () =>
      atualizar((atual) => ({
        ...atual,
        vez: tocarTimer(atual.vez, atual.config.timerVez, Date.now()),
      })),
    passarPara: (cadeira: Cadeira) =>
      atualizar((atual) => ({
        ...atual,
        vez: passarVezPara(cadeira, atual.config.timerVez, Date.now()),
      })),
    alternarPausa: () =>
      atualizar((atual) => ({
        ...atual,
        vez:
          atual.vez.contandoDesde !== null
            ? pausarVez(atual.vez, Date.now())
            : retomarVez(atual.vez, Date.now()),
      })),
  }
}
