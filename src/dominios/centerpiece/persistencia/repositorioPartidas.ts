import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { normalizarSimples, SIMPLES_INICIAL, type EstadoSimples } from '../logica/centerpieceSimples'
import { migrarMesaAntiga } from '../logica/migrarMesaAntiga'
import type { Partida } from '../logica/partida'
import { pausarVez } from '../logica/vez'

const CHAVE_PARTIDAS = 'riichi-manager-partidas'
const CHAVE_MESA_ANTIGA = 'riichi-manager-centerpiece'
const CHAVE_SIMPLES = 'riichi-manager-centerpiece-simples'
const VERSAO = 1

interface ContextoMigracao {
  idDoNome: (nomes: string[]) => string[]
  gerarId: () => string
  agora: number
}

/**
 * Lista salva. Na primeira vez sem ela, migra a mesa antiga; a chave antiga fica
 * intacta como cópia de segurança. Um timer que contava ao fechar volta parado.
 */
export function carregarPartidas(
  armazenamento: ArmazenamentoChaveValor,
  migracao: ContextoMigracao,
): Partida[] {
  const salvo = armazenamento.ler(CHAVE_PARTIDAS)
  if (salvo) {
    try {
      const lido = JSON.parse(salvo) as { partidas?: Partida[] }
      if (Array.isArray(lido.partidas)) {
        return lido.partidas.map((partida) => ({
          ...partida,
          vez: pausarVez(partida.vez, migracao.agora),
        }))
      }
    } catch {
      return []
    }
  }

  const migrada = migrarMesaAntiga(armazenamento.ler(CHAVE_MESA_ANTIGA), migracao.idDoNome, {
    gerarId: migracao.gerarId,
    agora: new Date(migracao.agora).toISOString(),
  })
  const partidas = migrada ? [migrada] : []
  salvarPartidas(armazenamento, partidas)
  return partidas
}

export function salvarPartidas(armazenamento: ArmazenamentoChaveValor, partidas: Partida[]) {
  armazenamento.gravar(CHAVE_PARTIDAS, JSON.stringify({ versao: VERSAO, partidas }))
}

export function carregarSimples(armazenamento: ArmazenamentoChaveValor): EstadoSimples {
  const salvo = armazenamento.ler(CHAVE_SIMPLES)
  if (!salvo) return SIMPLES_INICIAL
  try {
    return normalizarSimples((JSON.parse(salvo) as { estado?: unknown }).estado)
  } catch {
    return SIMPLES_INICIAL
  }
}

export function salvarSimples(armazenamento: ArmazenamentoChaveValor, estado: EstadoSimples) {
  armazenamento.gravar(CHAVE_SIMPLES, JSON.stringify({ versao: VERSAO, estado }))
}
