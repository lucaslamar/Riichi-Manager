/**
 * Fronteira entre a calculadora e o motor de fan: a interface não importa o motor.
 */
import { contarFan, ehBatida, idDoFan, nomeChinesDoFan, valorDoFan } from './motor/fan'
import type { MaoGb } from './motor/pedras'
import type { ResultadoFanMcr } from './tipos'

export const FAN_MINIMO_MCR = 8
export const MAXIMO_FLORES = 8

export function calcularFanMcr(mao: MaoGb, flores: number): ResultadoFanMcr {
  if (!ehBatida(mao)) {
    return { batida: false, fans: [], fanSemFlores: 0, flores, fanTotal: flores, valido: false }
  }
  const { fans, total } = contarFan(mao)
  return {
    batida: true,
    fans: fans
      .map(({ chave, vezes }) => ({
        id: idDoFan(chave),
        chave,
        vezes,
        valor: valorDoFan(chave),
        nomeChines: nomeChinesDoFan(chave),
      }))
      .sort((a, b) => b.valor - a.valor),
    fanSemFlores: total,
    flores,
    fanTotal: total + flores,
    valido: total >= FAN_MINIMO_MCR,
  }
}
