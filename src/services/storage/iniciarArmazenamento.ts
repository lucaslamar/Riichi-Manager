/**
 * Abre o banco local antes do app desenhar a primeira tela. Sem IndexedDB, ou
 * se algo falhar, o app segue no localStorage como antes, sem perder nada.
 */
import { definirArmazenamentoDeDados, localStorageDireto } from '@/compartilhado/persistencia/armazenamento'
import { abrirArmazenamentoDados, CHAVES_DE_DADOS, type ArmazenamentoDados } from './armazenamentoDados'
import { criarBancoDexie } from './bancoDexie'

/** Tempo máximo esperando o banco (Safari às vezes trava ao abrir o IndexedDB). */
const ESPERA_MAXIMA_MS = 4000

let ativo: ArmazenamentoDados | null = null

export async function iniciarArmazenamento(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  let desistiu = false
  const abertura = abrirArmazenamentoDados(criarBancoDexie(), localStorageDireto, {
    // Se o app já abriu com o localStorage, a cópia não apaga nada dele.
    podeApagarOrigem: () => !desistiu,
  })
    .then((armazenamento) => {
      if (desistiu) return
      ativo = armazenamento
      definirArmazenamentoDeDados(armazenamento, new Set(CHAVES_DE_DADOS))
    })
    .catch((erro) => console.error('Banco local indisponível; usando localStorage.', erro))

  const limite = new Promise<void>((resolver) =>
    window.setTimeout(() => {
      desistiu = !ativo
      resolver()
    }, ESPERA_MAXIMA_MS),
  )
  await Promise.race([abertura, limite])

  // Pede ao navegador para não apagar os dados sozinho quando faltar espaço.
  void navigator.storage?.persist?.().catch(() => false)
}

/** Espera as gravações pendentes chegarem ao banco (antes de recarregar o app). */
export function aguardarGravacoes(): Promise<void> {
  return ativo?.aguardar() ?? Promise.resolve()
}
