import { useCallback, useEffect, useState } from 'react'
import { exportarPdf } from '@/compartilhado/adaptadores/pdf'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  carregarTorneio,
  criarTorneioVazio,
  salvarTorneio,
} from '../../persistencia/armazenamento'
import type { EstadoTorneio } from '../../logica/tipos'
import { segundosRestantesBase, sincronizarTimerExpirado } from '../../logica/acoes'
import {
  ConfiguracaoTorneio,
  GradeRodadas,
  PainelQualidade,
  RankingGeral,
  TimerRodada,
} from '../componentes'

function torneioAtivo(torneio: EstadoTorneio) {
  return torneio.jogadores.length > 0 && torneio.grade.length > 0
}

/** Estado do torneio (salvo a cada mudança) e a tela certa para ele. */
export default function PaginaTorneio({ aoVoltar }: { aoVoltar: () => void }) {
  const { t, idioma } = useI18n()
  const [torneio, setTorneio] = useState<EstadoTorneio>(carregarTorneio)
  const [agora, setAgora] = useState(Date.now)
  const [erroPdf, setErroPdf] = useState(false)

  const definirTorneio = useCallback((proximo: EstadoTorneio) => {
    setTorneio(proximo)
    salvarTorneio(proximo)
  }, [])

  const atualizarTorneio = useCallback(
    (transformar: (torneioAtual: EstadoTorneio) => EstadoTorneio) => {
      setTorneio((anterior) => {
        const proximo = transformar(anterior)
        salvarTorneio(proximo)
        return proximo
      })
    },
    [],
  )

  useEffect(() => {
    setAgora(Date.now())
    if (!torneio.timer.rodando) return

    const intervalo = window.setInterval(() => {
      const proximoAgora = Date.now()
      setAgora(proximoAgora)

      if (segundosRestantesBase(torneio.timer, proximoAgora) === 0) {
        atualizarTorneio(sincronizarTimerExpirado)
      }
    }, 500)

    return () => window.clearInterval(intervalo)
  }, [torneio.timer, atualizarTorneio])

  const aoExportarPdf = async () => {
    const formatoPontos = new Intl.NumberFormat(idioma, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    const linhas = Object.entries(torneio.classificacao)
      .sort(([, pontosA], [, pontosB]) => pontosB - pontosA)
      .map(([jogador, pontos], indice) => [
        `${indice + 1}º`,
        jogador,
        `${pontos > 0 ? '+' : ''}${formatoPontos.format(pontos)}`,
      ])
    const exportado = await exportarPdf({
      titulo: `${t('centerpiece.tournament.ranking')} - ${t('global.appName')}`,
      cabecalho: [
        t('centerpiece.tournament.position'),
        t('centerpiece.tournament.player'),
        t('centerpiece.tournament.points'),
      ],
      linhas,
      nomeArquivo: 'ranking-riichi.pdf',
    })
    setErroPdf(!exportado)
  }

  if (!torneioAtivo(torneio)) {
    return <ConfiguracaoTorneio aoIniciar={definirTorneio} aoVoltar={aoVoltar} />
  }

  return (
    <div className="torneio-fast">
      <RankingGeral
        torneio={torneio}
        aoReiniciar={() => definirTorneio(criarTorneioVazio())}
        aoExportarPdf={aoExportarPdf}
      />
      {erroPdf && (
        <p className="card" role="alert">
          {t('centerpiece.tournament.pdfError')}
        </p>
      )}
      <TimerRodada torneio={torneio} atualizarTorneio={atualizarTorneio} agora={agora} />
      <PainelQualidade torneio={torneio} atualizarTorneio={atualizarTorneio} />
      <GradeRodadas torneio={torneio} atualizarTorneio={atualizarTorneio} agora={agora} />
    </div>
  )
}
