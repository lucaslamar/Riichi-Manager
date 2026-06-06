import type { EstadoCenterpiece } from '../logica/tipos'
import { criarMesaVazia } from '../logica/criarMesa'

const CHAVE_STORAGE = 'riichi-manager-centerpiece'

export function carregarMesa(): EstadoCenterpiece {
  const salvo = window.localStorage.getItem(CHAVE_STORAGE)
  if (!salvo) return criarMesaVazia()

  try {
    const lido = JSON.parse(salvo) as Partial<EstadoCenterpiece>
    const base = criarMesaVazia()
    return {
      ...base,
      ...lido,
      historico: Array.isArray(lido.historico) ? lido.historico : [],
    }
  } catch {
    return criarMesaVazia()
  }
}

export function salvarMesa(estado: EstadoCenterpiece): void {
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado))
}

export function apagarMesaSalva(): void {
  window.localStorage.removeItem(CHAVE_STORAGE)
}
