import { useCallback, useEffect, useRef, useState } from 'react'
import { VENTOS, sortearVento } from '../../logica/sortearVento'
import type { CodigoVento, VentoMesa, VentoSorteado } from '../../logica/tipos'

const CICLOS_ANIMACAO = 11
const INTERVALO_ANIMACAO_MS = 80
const DELAY_AUTO_REVELAR_MS = 500

export function useSorteadorVentos() {
  const [ventosDisponiveis, setVentosDisponiveis] = useState<VentoMesa[]>([...VENTOS])
  const [ventosSorteados, setVentosSorteados] = useState<VentoSorteado[]>([])
  const [ventoAnimado, setVentoAnimado] = useState<CodigoVento | null>(null)
  const [sorteando, setSorteando] = useState(false)

  const intervaloRef = useRef<number | null>(null)
  const autoRevelarRef = useRef<number | null>(null)
  const ventosDisponiveisRef = useRef(ventosDisponiveis)
  const ventosSorteadosRef = useRef(ventosSorteados)
  const sorteandoRef = useRef(sorteando)

  ventosDisponiveisRef.current = ventosDisponiveis
  ventosSorteadosRef.current = ventosSorteados
  sorteandoRef.current = sorteando

  const limparTimers = useCallback(() => {
    if (intervaloRef.current !== null) {
      window.clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
    if (autoRevelarRef.current !== null) {
      window.clearTimeout(autoRevelarRef.current)
      autoRevelarRef.current = null
    }
  }, [])

  useEffect(() => () => limparTimers(), [limparTimers])

  const executarSorteio = useCallback(
    (disponiveis: VentoMesa[], sorteados: VentoSorteado[]) => {
      const vencedor = sortearVento(disponiveis)
      if (!vencedor) return

      setSorteando(true)

      let ciclo = 0

      intervaloRef.current = window.setInterval(() => {
        ciclo++

        if (ciclo < CICLOS_ANIMACAO) {
          const idx = Math.floor(Math.random() * disponiveis.length)
          setVentoAnimado(disponiveis[idx].codigo)
        } else {
          window.clearInterval(intervaloRef.current!)
          intervaloRef.current = null

          const novosSorteados: VentoSorteado[] = [
            ...sorteados,
            { vento: vencedor, ordem: sorteados.length + 1 },
          ]
          const novosDisponiveis = disponiveis.filter((vento) => vento.codigo !== vencedor.codigo)

          setVentoAnimado(null)
          setVentosSorteados(novosSorteados)
          setVentosDisponiveis(novosDisponiveis)
          setSorteando(false)

          if (novosDisponiveis.length === 1) {
            autoRevelarRef.current = window.setTimeout(() => {
              executarSorteio(novosDisponiveis, novosSorteados)
            }, DELAY_AUTO_REVELAR_MS)
          }
        }
      }, INTERVALO_ANIMACAO_MS)
    },
    [],
  )

  const sortearProximoVento = useCallback(() => {
    if (sorteandoRef.current || ventosDisponiveisRef.current.length === 0) return
    executarSorteio(ventosDisponiveisRef.current, ventosSorteadosRef.current)
  }, [executarSorteio])

  const reiniciarSorteio = useCallback(() => {
    limparTimers()
    setVentosDisponiveis([...VENTOS])
    setVentosSorteados([])
    setVentoAnimado(null)
    setSorteando(false)
  }, [limparTimers])

  const sorteioCompleto = ventosSorteados.length === VENTOS.length

  return {
    ventos: VENTOS,
    ventosDisponiveis,
    ventosSorteados,
    ventoAnimado,
    sorteando,
    sorteioCompleto,
    sortearProximoVento,
    reiniciarSorteio,
  }
}
