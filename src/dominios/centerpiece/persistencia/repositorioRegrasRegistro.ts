import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import type { ConfigMesa } from '../logica/configMesa'
import { lerRegraSaida, type RegraSaida } from '../logica/saidaDaPartida'
import { normalizarUma } from '../logica/uma'
import {
  CONJUNTOS_REGISTRO,
  regrasDoPreset,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../logica/regrasPontuacao'

const CHAVE = 'riichi-manager-regras-registro'
const VERSAO = 1

/**
 * Último conjunto escolhido em "Registrar partida finalizada", os valores do
 * Personalizado e o último tipo de partida (Leste apenas ou Hanchan).
 */
export interface RegrasRegistroSalvas {
  conjunto: ConjuntoRegistro
  personalizado: RegrasPontuacao | null
  tipoPartida?: ConfigMesa['tipoPartida']
  /** W.O. no meio da partida. Ausente: o padrão. */
  saida?: RegraSaida
}

const numeroValido = (valor: unknown): valor is number => typeof valor === 'number' && Number.isFinite(valor)

export function carregarRegrasRegistro(armazenamento: ArmazenamentoChaveValor): RegrasRegistroSalvas {
  const vazio: RegrasRegistroSalvas = { conjunto: 'padrao', personalizado: null }
  const salvo = armazenamento.ler(CHAVE)
  if (!salvo) return vazio
  try {
    const lido = (JSON.parse(salvo) as { dados?: Partial<RegrasRegistroSalvas> }).dados ?? {}
    const conjunto = CONJUNTOS_REGISTRO.includes(lido.conjunto as ConjuntoRegistro)
      ? (lido.conjunto as ConjuntoRegistro)
      : 'padrao'
    const bruto = lido.personalizado
    const clube = regrasDoPreset('padrao')
    const personalizado = bruto
      ? {
          pontosPartida: numeroValido(bruto.pontosPartida) ? bruto.pontosPartida : clube.pontosPartida,
          pontosRetorno: numeroValido(bruto.pontosRetorno) ? bruto.pontosRetorno : clube.pontosRetorno,
          uma: normalizarUma(bruto.uma, clube.uma),
          // Salvas antes do tobi: o Personalizado partia do Clube.
          tobi: typeof bruto.tobi === 'boolean' ? bruto.tobi : clube.tobi,
        }
      : null
    const tipoPartida = lido.tipoPartida === 'leste' || lido.tipoPartida === 'hanchan' ? lido.tipoPartida : null
    const saida = lerRegraSaida(lido.saida)
    // Personalizado sem valores guardados volta para o Clube.
    return {
      ...(saida ? { saida } : {}),
      conjunto: conjunto === 'personalizado' && !personalizado ? 'padrao' : conjunto,
      personalizado,
      ...(tipoPartida ? { tipoPartida } : {}),
    }
  } catch {
    return vazio
  }
}

export function salvarRegrasRegistro(armazenamento: ArmazenamentoChaveValor, dados: RegrasRegistroSalvas) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, dados }))
}
