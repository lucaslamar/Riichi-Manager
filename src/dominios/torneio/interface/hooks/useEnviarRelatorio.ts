import { useState } from 'react'
import { salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { nomeApp } from '@/compartilhado/marca/nome-app'
import { URL_DO_APP } from '@/compartilhado/marca/url-app'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import { imagemDoRelatorio } from '@/compartilhado/relatorio/imagemRelatorio'
import { textoDoRelatorio, type Relatorio } from '@/compartilhado/relatorio/relatorio'

/** Manda um relatório em texto ou imagem, na folha Compartilhar e no menu ⋮ do torneio. */
export function useEnviarRelatorio({
  relatorio,
  nomeArquivo,
  aoAvisar,
  aoFechar,
}: {
  /** Montado só ao tocar, com os dados do momento. */
  relatorio: () => Relatorio
  /** Sem extensão: vira "<nome>.png". */
  nomeArquivo: string
  aoAvisar: (mensagem: string) => void
  /** Chamado quando enviou ou falhou. Se a pessoa cancelou, continua aberto. */
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [gerando, setGerando] = useState(false)
  const { qrNasImagens } = usePreferencias()
  const nomeDoApp = nomeApp(useModoJogoAtual())

  const texto = async () => {
    const atual = relatorio()
    const resultado = await compartilharTexto(
      textoDoRelatorio(atual, t('tournament.share.linkLine', { app: nomeDoApp, url: URL_DO_APP })),
      atual.titulo,
    )
    if (resultado === 'copiado') aoAvisar(t('match.club.copied'))
    if (resultado === 'falhou') aoAvisar(t('match.club.shareFailed'))
    if (resultado !== 'cancelado') aoFechar()
  }

  const imagem = async () => {
    setGerando(true)
    try {
      const atual = relatorio()
      const blob = await imagemDoRelatorio(
        { ...atual, chamada: atual.chamada ?? t('tournament.share.ctaResults', { app: nomeDoApp }) },
        { nomeDoApp, comQr: qrNasImagens },
      )
      const resultado = await salvarArquivo(`${nomeArquivo}.png`, blob, 'image/png')
      if (resultado === 'baixado') aoAvisar(t('tournament.share.imageSaved'))
      if (resultado === 'falhou') aoAvisar(t('tournament.share.imageError'))
      if (resultado !== 'cancelado') aoFechar()
    } catch {
      aoAvisar(t('tournament.share.imageError'))
    } finally {
      setGerando(false)
    }
  }

  return { texto, imagem, gerando }
}
