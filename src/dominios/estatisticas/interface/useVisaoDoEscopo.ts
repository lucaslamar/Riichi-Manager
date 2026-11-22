import { useMemo } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { regrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import { nomesNoRanking } from '@/dominios/centerpiece/interface/componentes/nomesNoRanking'
import { useRankingGeral } from '@/dominios/centerpiece/interface/hooks/useRankingGeral'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  useNomeNaTemporada,
  useNomeNoTorneio,
} from '@/dominios/torneio/interface/hooks/useNomeNoTorneio'
import { usePartidasDoTorneio } from '@/dominios/torneio/interface/hooks/usePartidasDoTorneio'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import { encontrosDaTemporada } from '@/dominios/torneio/logica/temporada'
import {
  visaoDaTemporada,
  visaoDoTorneio,
  visaoGeral,
  type EscopoEstatisticas,
  type VisaoDoEscopo,
} from '../logica/escopo'

const VAZIA: VisaoDoEscopo = { partidas: [], linhas: [], viradas: { tipo: 'projecao' } }

/** Liga o escopo aos dados do app. As contas ficam em `logica/escopo`. */
export function useVisaoDoEscopo(escopo: EscopoEstatisticas) {
  const { t } = useI18n()
  const modo = useModoJogoAtual()
  const { jogadores } = useJogadores()
  const { torneios, temporadas } = useTorneios()
  const { partidas: partidasTorneio } = usePartidasDoTorneio()
  const { partidas: partidasGeral, filtros } = useRankingGeral()
  const nomeDoTorneio = useNomeNoTorneio()
  const nomeDaTemporada = useNomeNaTemporada()

  const id = escopo.tipo === 'geral' ? '' : escopo.id
  const ateRodada = escopo.tipo === 'torneio' ? (escopo.ateRodada ?? null) : null
  const torneio = escopo.tipo === 'torneio' ? torneios.find((item) => item.id === id) : undefined

  const visao = useMemo(() => {
    const agora = new Date()
    if (escopo.tipo === 'torneio') {
      return torneio ? visaoDoTorneio(torneio, partidasTorneio, ateRodada) : VAZIA
    }
    if (escopo.tipo === 'temporada') {
      const temporada = temporadas.find((item) => item.id === id)
      const encontros = encontrosDaTemporada(torneios, id)
      return temporada ? visaoDaTemporada(temporada, encontros, partidasTorneio, agora) : VAZIA
    }
    return visaoGeral(partidasGeral, filtros, {
      modo,
      agora,
      existe: (jogadorId) => jogadores.some((jogador) => jogador.id === jogadorId),
    })
  }, [
    escopo.tipo,
    id,
    ateRodada,
    torneio,
    torneios,
    temporadas,
    partidasTorneio,
    partidasGeral,
    filtros,
    modo,
    jogadores,
  ])

  const nome = (jogadorId: string, guardado?: string) => {
    if (torneio) return nomeDoTorneio(torneio, jogadorId)
    if (escopo.tipo === 'temporada') return nomeDaTemporada(jogadorId)
    const jogador = jogadores.find((item) => item.id === jogadorId)
    if (jogador) return nomesNoRanking(jogador).principal
    return guardado ? t('players.deletedName', { name: guardado }) : '—'
  }

  return { visao, nome, regras: regrasDoModo(torneio?.jogo ?? modo) }
}
