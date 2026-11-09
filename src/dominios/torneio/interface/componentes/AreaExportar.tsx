import { useState, type ReactNode } from 'react'
import { salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { imagemDoRelatorio } from '@/compartilhado/relatorio/imagemRelatorio'
import { textoDoRelatorio, type Relatorio } from '@/compartilhado/relatorio/relatorio'

/**
 * Área Exportar no fim das Mesas e do Ranking: o mesmo relatório como texto (para
 * colar no WhatsApp, com negrito) ou como imagem PNG. `extras` entra ao lado (ex.: PDF).
 */
export default function AreaExportar({
  ajuda,
  relatorio,
  nomeArquivo,
  aoAvisar,
  extras,
}: {
  ajuda: string
  /** Montado só ao tocar, com os dados do momento. */
  relatorio: () => Relatorio
  /** Sem extensão: vira "<nome>.png". */
  nomeArquivo: string
  aoAvisar: (mensagem: string) => void
  extras?: ReactNode
}) {
  const { t } = useI18n()
  const [gerando, setGerando] = useState(false)

  const texto = async () => {
    const atual = relatorio()
    const resultado = await compartilharTexto(textoDoRelatorio(atual), atual.titulo)
    if (resultado === 'copiado') aoAvisar(t('match.club.copied'))
    if (resultado === 'falhou') aoAvisar(t('match.club.shareFailed'))
  }

  const imagem = async () => {
    setGerando(true)
    try {
      const blob = await imagemDoRelatorio(relatorio(), 'Mojoca')
      const resultado = await salvarArquivo(`${nomeArquivo}.png`, blob, 'image/png')
      if (resultado === 'baixado') aoAvisar(t('tournament.share.imageSaved'))
      if (resultado === 'falhou') aoAvisar(t('tournament.share.imageError'))
    } catch {
      aoAvisar(t('tournament.share.imageError'))
    } finally {
      setGerando(false)
    }
  }

  return (
    <section className="trn-exportar" aria-labelledby="trn-exportar-titulo">
      <h3 id="trn-exportar-titulo" className="trn-exportar__titulo">
        <i className="fas fa-share-nodes" aria-hidden="true" /> {t('tournament.share.title')}
      </h3>
      <p className="cfg-ajuda">{ajuda}</p>
      <div className="trn-exportar__botoes">
        <button type="button" className="btn-contorno" onClick={texto}>
          <i className="fab fa-whatsapp" aria-hidden="true" /> {t('tournament.share.text')}
        </button>
        <button type="button" className="btn-contorno" onClick={imagem} disabled={gerando}>
          <i className="fas fa-image" aria-hidden="true" /> {t('tournament.share.image')}
        </button>
        {extras}
      </div>
    </section>
  )
}

