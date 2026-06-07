import { useCallback, useEffect, useRef, useState } from 'react'
import type { EstadoCenterpiece, EntradaSetupCenterpiece, ResultadoRon, ResultadoTsumo } from '../../logica/tipos'
import { criarMesaVazia } from '../../logica/criarMesa'
import { sortearVentosJogadores } from '../../logica/sortearVentosJogadores'
import { aplicarResultadoRon } from '../../logica/aplicarResultadoRon'
import { aplicarResultadoTsumo } from '../../logica/aplicarResultadoTsumo'
import { aplicarRiichi } from '../../logica/aplicarRiichi'
import { aplicarRyukyoku } from '../../logica/aplicarRyukyoku'
import { aplicarChomboPadrao, aplicarChombo } from '../../logica/aplicarChombo'
import { desfazerUltimaAcao } from '../../logica/historico'
import { carregarMesa, salvarMesa, apagarMesaSalva } from '../../persistencia/storageCenterpiece'

export type ModalCenterpiece = 'batida' | 'riichi' | 'ryukyoku' | 'chombo' | null

export function useCenterpiece() {
  const [estado, setEstadoInterno] = useState<EstadoCenterpiece>(carregarMesa)
  const [modalAberto, setModalAberto] = useState<ModalCenterpiece>(null)
  const [mensagemDesfazer, setMensagemDesfazer] = useState<string | null>(null)

  const definirEstado = useCallback((proximo: EstadoCenterpiece) => {
    setEstadoInterno(proximo)
    salvarMesa(proximo)
  }, [])

  const iniciarMesa = useCallback(
    (entrada: EntradaSetupCenterpiece) => {
      const jogadores = sortearVentosJogadores(entrada)
      const novo: EstadoCenterpiece = {
        ...criarMesaVazia(),
        iniciada: true,
        jogadores,
        pontosIniciais: entrada.pontosIniciais,
      }
      definirEstado(novo)
    },
    [definirEstado],
  )

  const registrarRon = useCallback(
    (resultado: ResultadoRon) => {
      definirEstado(aplicarResultadoRon(estado, resultado))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const registrarTsumo = useCallback(
    (resultado: ResultadoTsumo) => {
      definirEstado(aplicarResultadoTsumo(estado, resultado))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const declararRiichi = useCallback(
    (jogadorId: string) => {
      definirEstado(aplicarRiichi(estado, jogadorId))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const registrarRyukyoku = useCallback(
    (tenpaiIds: string[]) => {
      definirEstado(aplicarRyukyoku(estado, tenpaiIds))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const registrarChomboPadrao = useCallback(
    (jogadorId: string) => {
      definirEstado(aplicarChomboPadrao(estado, jogadorId))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const registrarChomboManual = useCallback(
    (jogadorId: string, valorPorJogador: number) => {
      definirEstado(aplicarChombo(estado, jogadorId, valorPorJogador))
      setModalAberto(null)
    },
    [estado, definirEstado],
  )

  const timeoutDesfazerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const desfazer = useCallback(() => {
    definirEstado(desfazerUltimaAcao(estado))
    setMensagemDesfazer('Última ação desfeita.')
    if (timeoutDesfazerRef.current) clearTimeout(timeoutDesfazerRef.current)
    timeoutDesfazerRef.current = setTimeout(() => setMensagemDesfazer(null), 2500)
  }, [estado, definirEstado])

  useEffect(() => () => {
    if (timeoutDesfazerRef.current) clearTimeout(timeoutDesfazerRef.current)
  }, [])

  const reiniciarMesa = useCallback(() => {
    apagarMesaSalva()
    definirEstado(criarMesaVazia())
  }, [definirEstado])

  return {
    estado,
    modalAberto,
    setModalAberto,
    mensagemDesfazer,
    iniciarMesa,
    registrarRon,
    registrarTsumo,
    declararRiichi,
    registrarRyukyoku,
    registrarChomboPadrao,
    registrarChomboManual,
    desfazer,
    reiniciarMesa,
  }
}
