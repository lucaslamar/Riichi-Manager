/**
 * @fileoverview Persistência do estado do torneio no localStorage.
 *
 * O localStorage é um mini banco de dados no próprio navegador.
 * Ele guarda texto (strings), então convertemos o objeto com JSON.stringify
 * e recuperamos com JSON.parse.
 *
 * IMPORTANTE: O localStorage sobrevive a reloads da página, mas é apagado
 * se o usuário limpar os dados do navegador ou usar modo anônimo.
 */

import { CHAVE_STORAGE, SEGUNDOS_RODADA_PADRAO } from './constantes'
import type { EstadoTorneio, TimerRodada } from './tipos'

/**
 * Cria um timer de rodada zerado (parado, sem acréscimos).
 *
 * @param indiceRodada - Qual rodada está sendo cronometrada (base zero).
 * @param segundosBase - Duração configurada para esta rodada.
 * @param acrescimosPorMesa - Acréscimos já dados a mesas anteriores.
 * @returns Objeto TimerRodada pronto para uso.
 */
export function criarTimerVazio(
  indiceRodada = 0,
  segundosBase = SEGUNDOS_RODADA_PADRAO,
  acrescimosPorMesa: Record<string, number> = {},
): TimerRodada {
  return {
    totalSegundos: segundosBase,
    segundosRestantes: segundosBase,
    indiceRodada,
    rodando: false,
    iniciadoEm: null,
    acrescimosPorMesa,
  }
}

/**
 * Monta o estado completamente vazio usado na primeira vez que o app carrega
 * ou quando o usuário reinicia um torneio.
 *
 * @returns EstadoTorneio sem jogadores, grade ou resultados.
 */
export function criarTorneioVazio(): EstadoTorneio {
  return {
    jogadores: [],
    grade: [],
    qualidade: null,
    classificacao: {},
    mesasConcluidas: {},
    pontuacoesPorMesa: {},
    timer: criarTimerVazio(),
  }
}

/**
 * Lê o torneio salvo no localStorage.
 * Se não houver save válido, retorna um torneio vazio.
 *
 * A lógica de "merge" com o estado vazio serve para compatibilidade:
 * se adicionarmos um campo novo no futuro, saves antigos não vão quebrar.
 *
 * @returns O torneio recuperado ou um estado inicial limpo.
 */
export function carregarTorneio(): EstadoTorneio {
  const salvo = window.localStorage.getItem(CHAVE_STORAGE)

  if (!salvo) {
    return criarTorneioVazio()
  }

  try {
    const lido = JSON.parse(salvo) as Partial<EstadoTorneio>
    const base = criarTorneioVazio()

    // Fazemos merge: campos novos usam valor padrão se não existirem no save antigo.
    return {
      ...base,
      ...lido,
      classificacao: lido.classificacao ?? {},
      mesasConcluidas: lido.mesasConcluidas ?? {},
      pontuacoesPorMesa: lido.pontuacoesPorMesa ?? {},
      timer: {
        ...criarTimerVazio(),
        ...(lido.timer ?? {}),
        acrescimosPorMesa: lido.timer?.acrescimosPorMesa ?? {},
      },
    }
  } catch {
    // JSON corrompido → começa do zero em vez de travar.
    return criarTorneioVazio()
  }
}

/**
 * Salva o estado completo do torneio no localStorage.
 * Chamada a cada mudança de estado para que reloads não percam dados.
 *
 * @param torneio - Estado atual do torneio para persistir.
 */
export function salvarTorneio(torneio: EstadoTorneio): void {
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(torneio))
}

/**
 * Remove o save do localStorage — usado ao reiniciar o torneio.
 */
export function apagarTorneioSalvo(): void {
  window.localStorage.removeItem(CHAVE_STORAGE)
}
