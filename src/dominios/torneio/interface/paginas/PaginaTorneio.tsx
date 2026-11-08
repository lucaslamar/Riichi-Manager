import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import type { Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import { useSubtituloTorneio } from '../textoTorneio'
import '../torneio.css'

/** Torneio aberto. A Lista do torneio (item 2) e as mesas (item 9) entram aqui. */
export default function PaginaTorneio({ torneioId, aoVoltar }: { torneioId: string; aoVoltar: () => void }) {
  const { t } = useI18n()
  const { torneios } = useTorneios()
  const subtitulo = useSubtituloTorneio()
  const torneio: Torneio | undefined = torneios.find((item) => item.id === torneioId)

  return (
    <section className="ptd-inicio trn-pagina">
      <TituloTela titulo={torneio?.nome ?? t('tournament.title')} aoVoltar={aoVoltar} />
      {torneio && <p className="ptd-vazio">{subtitulo(torneio)}</p>}
    </section>
  )
}
