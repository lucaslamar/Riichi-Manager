/**
 * Relógios do torneio (rodada e mesa). Guardam o instante do início em vez de
 * descontar a cada segundo, então seguem contando com o app fechado e depois de
 * importar em outro celular.
 */
import type { Relogio } from './tipos'

export function segundosCorridos(relogio: Relogio, agora: number): number {
  const rodando = relogio.iniciadoEm === null ? 0 : Math.max(0, (agora - relogio.iniciadoEm) / 1000)
  return relogio.corridoSegundos + rodando
}

export function segundosRestantes(relogio: Relogio, agora: number): number {
  return Math.max(0, Math.ceil(relogio.totalSegundos + relogio.acrescimoSegundos - segundosCorridos(relogio, agora)))
}

/** 0 a 1, para o anel: quanto ainda falta do total com acréscimos. */
export function fracaoRestante(relogio: Relogio, agora: number): number {
  const total = relogio.totalSegundos + relogio.acrescimoSegundos
  return total > 0 ? segundosRestantes(relogio, agora) / total : 0
}

export const estaRodando = (relogio: Relogio) => relogio.iniciadoEm !== null
export const acabou = (relogio: Relogio, agora: number) => segundosRestantes(relogio, agora) === 0

export function iniciar(relogio: Relogio, agora: number): Relogio {
  return relogio.iniciadoEm === null ? { ...relogio, iniciadoEm: agora } : relogio
}

export function pausar(relogio: Relogio, agora: number): Relogio {
  if (relogio.iniciadoEm === null) return relogio
  return { ...relogio, corridoSegundos: segundosCorridos(relogio, agora), iniciadoEm: null }
}

export function acrescentar(relogio: Relogio, segundos: number): Relogio {
  return { ...relogio, acrescimoSegundos: relogio.acrescimoSegundos + segundos }
}

/** 5400 → "1:30:00"; 90 → "1:30". */
export function formatarRelogio(totalSegundos: number): string {
  const seguro = Math.max(0, Math.round(totalSegundos))
  const horas = Math.floor(seguro / 3600)
  const minutos = Math.floor((seguro % 3600) / 60)
  const segundos = seguro % 60
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return horas > 0 ? `${horas}:${doisDigitos(minutos)}:${doisDigitos(segundos)}` : `${minutos}:${doisDigitos(segundos)}`
}
