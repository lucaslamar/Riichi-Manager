/**
 * Converte o torneio salvo em `riichi-manager-v5`: nomes viram jogadores do cadastro
 * e cada mesa concluída vira uma partida guardada. A base 30k e a uma 8/4 fixas de
 * antes viram a config do torneio, para os pontos continuarem os mesmos.
 */
import { alterarConfig, configDoPreset } from '@/dominios/centerpiece/logica/configMesa'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { criarTimerVazio } from './acoes'
import { chaveMesa } from './chaves'
import { VENTOS } from './constantes'
import { avaliarGrade } from './qualidade'
import { criarPartidaManual, gradeComIds, guardarPartida } from './torneio'
import type { Rodada, TimerRodada, Torneio } from './tipos'

interface TorneioAntigo {
  jogadores?: string[]
  grade?: Rodada[]
  mesasConcluidas?: Record<string, boolean>
  pontuacoesPorMesa?: Record<string, string[]>
  timer?: Partial<TimerRodada>
}

const lerPontos = (texto: string) => Number.parseInt(String(texto).replace(/[.,\s]/g, ''), 10) || 0

export function migrarTorneioAntigo(
  textoSalvo: string | null,
  idDoNome: (nomes: string[]) => string[],
  contexto: { gerarId: () => string; agora: string },
): { torneio: Torneio; partidas: Partida[] } | null {
  if (!textoSalvo) return null
  let antigo: TorneioAntigo
  try {
    antigo = JSON.parse(textoSalvo) as TorneioAntigo
  } catch {
    return null
  }
  const nomes = antigo.jogadores
  if (!Array.isArray(nomes) || nomes.length === 0 || !Array.isArray(antigo.grade)) return null
  if (antigo.grade.length === 0) return null

  const ids = idDoNome(nomes)
  const grade = gradeComIds(antigo.grade, new Map(nomes.map((nome, indice) => [nome, ids[indice]])))
  const base = criarTimerVazio()
  const torneio: Torneio = {
    id: contexto.gerarId(),
    criadoEm: contexto.agora,
    status: 'em_andamento',
    config: alterarConfig(configDoPreset('padrao'), {
      pontosPartida: 30000,
      pontosRetorno: 30000,
      uma: [8, 4, -4, -8],
    }),
    jogadorIds: ids,
    grade,
    qualidade: avaliarGrade(grade, ids.length),
    timer: {
      ...base,
      ...antigo.timer,
      // Um cronômetro que estava correndo volta parado no que faltava.
      rodando: false,
      iniciadoEm: null,
      acrescimosPorMesa: antigo.timer?.acrescimosPorMesa ?? {},
    },
  }

  const partidas: Partida[] = []
  grade.forEach((rodada, indiceRodada) => {
    rodada.mesas.forEach((_, indiceMesa) => {
      const chave = chaveMesa(indiceRodada, indiceMesa)
      const salvos = antigo.pontuacoesPorMesa?.[chave]
      if (!antigo.mesasConcluidas?.[chave] || salvos?.length !== 4) return
      // Os pontos antigos seguem a ordem salva dos assentos; a partida usa a dos ventos.
      const pontos = VENTOS.map((vento) => {
        const indice = rodada.mesas[indiceMesa].assentos.findIndex((item) => item.vento === vento)
        return salvos[indice] ?? '0'
      })
      partidas.push(
        guardarPartida(
          criarPartidaManual(
            torneio,
            indiceRodada,
            indiceMesa,
            [lerPontos(pontos[0]), lerPontos(pontos[1]), lerPontos(pontos[2]), lerPontos(pontos[3])],
            { id: contexto.gerarId(), agora: contexto.agora },
          ),
        ),
      )
    })
  })

  return { torneio, partidas }
}
