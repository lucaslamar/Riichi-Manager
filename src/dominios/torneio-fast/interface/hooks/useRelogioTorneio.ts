import { useEffect, useState } from 'react'
import { sincronizarTimerExpirado } from '../../logica/acoes'
import type { Torneio } from '../../logica/tipos'
import { useTorneios } from './useTorneios'

/** Hora atual enquanto o cronômetro corre; ao zerar, ele para no estado salvo. */
export function useRelogioTorneio(torneio: Torneio | undefined) {
  const { atualizarTorneio } = useTorneios()
  const [agora, setAgora] = useState(Date.now)
  const id = torneio?.id
  const rodando = !!torneio?.timer.rodando

  useEffect(() => {
    setAgora(Date.now())
    if (!id || !rodando) return
    const intervalo = window.setInterval(() => {
      const instante = Date.now()
      setAgora(instante)
      atualizarTorneio(id, (atual) => sincronizarTimerExpirado(atual, instante))
    }, 500)
    return () => window.clearInterval(intervalo)
  }, [id, rodando, atualizarTorneio])

  return Math.max(agora, torneio?.timer.iniciadoEm ?? 0)
}
