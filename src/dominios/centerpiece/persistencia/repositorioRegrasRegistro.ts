import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { normalizarUma } from '../logica/uma'
import {
  CONJUNTOS_REGISTRO,
  regrasDoPreset,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../logica/regrasPontuacao'

const CHAVE = 'riichi-manager-regras-registro'
const VERSAO = 1

/** Último conjunto escolhido em "Registrar partida finalizada" e os valores do Personalizado. */
export interface RegrasRegistroSalvas {
  conjunto: ConjuntoRegistro
  personalizado: RegrasPontuacao | null
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
        }
      : null
    // Personalizado sem valores guardados volta para o Clube.
    return { conjunto: conjunto === 'personalizado' && !personalizado ? 'padrao' : conjunto, personalizado }
  } catch {
    return vazio
  }
}

export function salvarRegrasRegistro(armazenamento: ArmazenamentoChaveValor, dados: RegrasRegistroSalvas) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, dados }))
}
