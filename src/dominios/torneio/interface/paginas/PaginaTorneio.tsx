import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useTorneios } from '../hooks/useTorneios'
import { useSubtituloTorneio } from '../textoTorneio'
import PaginaListaTorneio from './PaginaListaTorneio'
import '../torneio.css'

/** Torneio aberto: a Lista enquanto é rascunho, depois as mesas (item 9). */
export default function PaginaTorneio({ torneioId, aoVoltar }: { torneioId: string; aoVoltar: () => void }) {
  const { t } = useI18n()
  const { torneios } = useTorneios()
  const subtitulo = useSubtituloTorneio()
  const torneio = torneios.find((item) => item.id === torneioId)

  if (torneio?.status === 'rascunho') {
    return (
      <PaginaListaTorneio
        torneio={torneio}
        aoVoltar={aoVoltar}
        aoConfigurar={() => undefined}
        aoSortear={() => undefined}
      />
    )
  }

  return (
    <section className="ptd-inicio trn-pagina">
      <TituloTela titulo={torneio?.nome ?? t('tournament.title')} aoVoltar={aoVoltar} />
      {torneio && <p className="ptd-vazio">{subtitulo(torneio)}</p>}
    </section>
  )
}
