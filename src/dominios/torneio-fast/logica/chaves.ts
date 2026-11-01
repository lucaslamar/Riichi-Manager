/** Chave de mesa e formatação de duração. */

/** Rodada 0, mesa 2 → "0_2". */
export function chaveMesa(indiceRodada: number, indiceMesa: number): string {
  return `${indiceRodada}_${indiceMesa}`
}

/** 5400 → "01:30:00"; 90 → "01:30". */
export function formatarDuracao(totalSegundos: number): string {
  const segundosSeguros = Math.max(0, totalSegundos)
  const horas = Math.floor(segundosSeguros / 3600)
  const minutos = Math.floor((segundosSeguros % 3600) / 60)
  const segundos = segundosSeguros % 60
  const partes = [minutos, segundos].map((parte) => String(parte).padStart(2, '0'))
  return horas > 0 ? `${String(horas).padStart(2, '0')}:${partes.join(':')}` : partes.join(':')
}
