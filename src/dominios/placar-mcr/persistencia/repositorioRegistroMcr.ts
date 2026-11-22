import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import {
  normalizarRegistro,
  REGISTRO_EM_BRANCO,
  type RascunhoRegistro,
} from '../logica/registroFinalizado'

/**
 * Os totais em uso não se perdem se o app fechar no meio da partida. Há um
 * rascunho avulso e um por mesa sorteada de torneio ou de clube.
 */
const CHAVE_REGISTRO_MCR = 'riichi-manager-registro-mcr'
const VERSAO = 1

interface Salvo {
  avulso?: unknown
  mesas?: Record<string, unknown>
}

function lerSalvo(armazenamento: ArmazenamentoChaveValor): Salvo {
  const salvo = armazenamento.ler(CHAVE_REGISTRO_MCR)
  if (!salvo) return {}
  try {
    return (JSON.parse(salvo) as Salvo | null) ?? {}
  } catch (erro) {
    console.error('Registro MCR ilegível', erro)
    return {}
  }
}

/** O rascunho daquela mesa sorteada, ou null se ela ainda não tem um. */
export function carregarRegistroDaMesa(
  armazenamento: ArmazenamentoChaveValor,
  mesa: string,
): RascunhoRegistro | null {
  const salvo = lerSalvo(armazenamento).mesas?.[mesa]
  return salvo ? normalizarRegistro(salvo) : null
}

export function carregarRegistroMcr(armazenamento: ArmazenamentoChaveValor): RascunhoRegistro {
  const { avulso } = lerSalvo(armazenamento)
  return avulso ? normalizarRegistro(avulso) : REGISTRO_EM_BRANCO
}

/** `null` apaga o rascunho (a partida foi registrada). */
export function salvarRegistroMcr(
  armazenamento: ArmazenamentoChaveValor,
  registro: RascunhoRegistro | null,
  mesa?: string,
) {
  const salvo = lerSalvo(armazenamento)
  const mesas = { ...salvo.mesas }
  if (mesa) {
    if (registro) mesas[mesa] = registro
    else delete mesas[mesa]
  }
  const avulso = mesa ? salvo.avulso : registro
  armazenamento.gravar(CHAVE_REGISTRO_MCR, JSON.stringify({ versao: VERSAO, avulso, mesas }))
}
