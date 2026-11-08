import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { gradeDasRodadas, qualidadeDasRodadas } from '../../logica/formatos/rodizio/rodizio'
import DiagnosticoGrade from '../componentes/DiagnosticoGrade'
import { useTorneios } from '../hooks/useTorneios'
import { useSubtituloTorneio } from '../textoTorneio'
import PaginaListaTorneio from './PaginaListaTorneio'
import '../torneio.css'

/** Torneio aberto: a Lista enquanto é rascunho, depois as mesas (item 9). */
export default function PaginaTorneio({
  torneioId,
  aoVoltar,
  aoAbrirTemporada,
}: {
  torneioId: string
  aoVoltar: () => void
  aoAbrirTemporada: (temporadaId: string) => void
}) {
  const { t } = useI18n()
  const { torneios, temporadas } = useTorneios()
  const subtitulo = useSubtituloTorneio()
  const torneio = torneios.find((item) => item.id === torneioId)
  const { jogadores } = useJogadores()
  const nomeDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : '?'
  }

  if (torneio?.status === 'rascunho') {
    return (
      <PaginaListaTorneio
        torneio={torneio}
        aoVoltar={aoVoltar}
        aoSortear={() => undefined}
      />
    )
  }

  return (
    <section className="ptd-inicio trn-pagina">
      <TituloTela titulo={torneio?.nome ?? t('tournament.title')} aoVoltar={aoVoltar} />
      {torneio && <p className="ptd-vazio">{subtitulo(torneio)}</p>}
      {torneio?.formato.tipo === 'temporada' && (
        <button
          type="button"
          className="trn-card"
          onClick={() => torneio.formato.tipo === 'temporada' && aoAbrirTemporada(torneio.formato.temporadaId)}
        >
          <i className="fas fa-calendar-days" aria-hidden="true" />
          <strong>
            {temporadas.find((item) => torneio.formato.tipo === 'temporada' && item.id === torneio.formato.temporadaId)?.nome ??
              t('tournament.season.title')}
          </strong>
          <span>{t('tournament.season.open')}</span>
        </button>
      )}
      {torneio && torneio.rodadas.length > 0 && (
        <DiagnosticoGrade
          qualidade={qualidadeDasRodadas(torneio.rodadas, torneio.jogadorIds.length)}
          grade={gradeDasRodadas(torneio.rodadas)}
          nomeDe={nomeDe}
        />
      )}
    </section>
  )
}
