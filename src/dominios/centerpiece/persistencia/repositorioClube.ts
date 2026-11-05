import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import type { EncontroClube, SorteioClube } from '../logica/encontroClube'

const CHAVE_LISTA = 'riichi-manager-clube-lista'
const CHAVE_SORTEIO = 'riichi-manager-clube-sorteio'
const CHAVE_ENCONTROS = 'riichi-manager-clube-encontros'
const VERSAO = 1
/** Encontros antigos não servem para nada depois que as mesas acabam. */
const LIMITE_ENCONTROS = 30

export interface EstadoClube {
  /** Rascunho da lista de presença, um nome por linha. */
  lista: string
  sorteio: SorteioClube | null
  encontros: EncontroClube[]
}

function lerJson<T>(armazenamento: ArmazenamentoChaveValor, chave: string): T | null {
  const salvo = armazenamento.ler(chave)
  if (!salvo) return null
  try {
    return (JSON.parse(salvo) as { dados?: T }).dados ?? null
  } catch {
    return null
  }
}

function gravarJson(armazenamento: ArmazenamentoChaveValor, chave: string, dados: unknown) {
  armazenamento.gravar(chave, JSON.stringify({ versao: VERSAO, dados }))
}

export function carregarClube(armazenamento: ArmazenamentoChaveValor): EstadoClube {
  const sorteio = lerJson<SorteioClube>(armazenamento, CHAVE_SORTEIO)
  const encontros = lerJson<EncontroClube[]>(armazenamento, CHAVE_ENCONTROS)
  return {
    lista: armazenamento.ler(CHAVE_LISTA) ?? '',
    sorteio: sorteio && Array.isArray(sorteio.mesas) && sorteio.encontro ? sorteio : null,
    encontros: Array.isArray(encontros) ? encontros : [],
  }
}

export function salvarClube(armazenamento: ArmazenamentoChaveValor, estado: EstadoClube) {
  armazenamento.gravar(CHAVE_LISTA, estado.lista)
  if (estado.sorteio) gravarJson(armazenamento, CHAVE_SORTEIO, estado.sorteio)
  else armazenamento.remover?.(CHAVE_SORTEIO)
  gravarJson(armazenamento, CHAVE_ENCONTROS, estado.encontros.slice(-LIMITE_ENCONTROS))
}
