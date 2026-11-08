import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { normalizarConfig } from '../../centerpiece/logica/configMesa'
import type { Partida } from '../../centerpiece/logica/partida'
import { migrarTorneiosV1, migrarTorneioV5 } from '../logica/migrarTorneioAntigo'
import type { ListaSalva, Temporada, Torneio } from '../logica/tipos'

const CHAVE = 'riichi-manager-torneios'
const CHAVE_V5 = 'riichi-manager-v5'
const CHAVE_LISTA = 'riichi-manager-torneio-lista'
const VERSAO = 2

export interface DadosTorneios {
  torneios: Torneio[]
  temporadas: Temporada[]
  listas: ListaSalva[]
}

interface ContextoCarga {
  idDoNome: (nomes: string[]) => string[]
  gerarId: () => string
  agora: Date
}

const VAZIO: DadosTorneios = { torneios: [], temporadas: [], listas: [] }

/**
 * Dados salvos. Na primeira vez, migra o que houver dos Torneios antigos; as chaves
 * antigas ficam intactas como cópia de segurança. `partidasNovas` são as mesas do
 * Torneio original, que precisam entrar no Centerpiece.
 */
export function carregarTorneios(
  armazenamento: ArmazenamentoChaveValor,
  contexto: ContextoCarga,
): DadosTorneios & { partidasNovas: Partida[] } {
  const salvo = armazenamento.ler(CHAVE)
  let lido: (Partial<DadosTorneios> & { versao?: number }) | null = null
  if (salvo) {
    try {
      lido = JSON.parse(salvo)
    } catch {
      return { ...VAZIO, partidasNovas: [] }
    }
  }

  if (lido?.versao === VERSAO) {
    return {
      torneios: (lido.torneios ?? []).map((torneio) => ({ ...torneio, config: normalizarConfig(torneio.config) })),
      temporadas: (lido.temporadas ?? []).map((temporada) => ({
        ...temporada,
        config: normalizarConfig(temporada.config),
      })),
      listas: lido.listas ?? [],
      partidasNovas: [],
    }
  }

  const torneios = lido ? migrarTorneiosV1(lido.torneios, contexto) : []
  const v5 = torneios.length === 0 ? migrarTorneioV5(armazenamento.ler(CHAVE_V5), contexto) : null
  const dados: DadosTorneios = { ...VAZIO, torneios: v5 ? [v5.torneio] : torneios }
  salvarTorneios(armazenamento, dados)
  return { ...dados, partidasNovas: v5?.partidas ?? [] }
}

export function salvarTorneios(armazenamento: ArmazenamentoChaveValor, dados: DadosTorneios) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, ...dados }))
}

/** Rascunho da Lista do torneio, um nome por linha. */
export function carregarLista(armazenamento: ArmazenamentoChaveValor) {
  return armazenamento.ler(CHAVE_LISTA) ?? ''
}

export function salvarLista(armazenamento: ArmazenamentoChaveValor, texto: string) {
  armazenamento.gravar(CHAVE_LISTA, texto)
}
