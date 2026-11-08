import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { faseDaRodada } from '../../logica/formatos/eliminatorio'
import { gradeDasRodadas, qualidadeDasRodadas } from '../../logica/formatos/rodizio/rodizio'
import DiagnosticoGrade from '../componentes/DiagnosticoGrade'
import { useTorneios } from '../hooks/useTorneios'
import PaginaListaTorneio from './PaginaListaTorneio'
import PaginaMesasTorneio, { type AcoesMesa } from './PaginaMesasTorneio'
import PaginaRankingTorneio from './PaginaRankingTorneio'
import '../torneio.css'

/** Torneio aberto: a Lista enquanto é rascunho, depois as Mesas sorteadas. */
export default function PaginaTorneio({
  torneioId,
  aoVoltar,
  aoAbrirTemporada,
  ...acoes
}: {
  torneioId: string
  aoVoltar: () => void
  aoAbrirTemporada: (temporadaId: string) => void
} & AcoesMesa) {
  const { t } = useI18n()
  const { torneios, temporadas } = useTorneios()
  const torneio = torneios.find((item) => item.id === torneioId)
  const { jogadores } = useJogadores()
  const [vendoRanking, setVendoRanking] = useState(false)
  const nomeDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : '?'
  }

  if (!torneio) {
    return (
      <section className="ptd-inicio trn-pagina">
        <TituloTela titulo={t('tournament.title')} aoVoltar={aoVoltar} />
      </section>
    )
  }

  if (torneio.status === 'rascunho') {
    return <PaginaListaTorneio torneio={torneio} aoVoltar={aoVoltar} aoSortear={() => undefined} />
  }

  if (vendoRanking) {
    return (
      <PaginaRankingTorneio
        torneio={torneio}
        aoVoltar={() => setVendoRanking(false)}
        aoAbrirTemporada={aoAbrirTemporada}
      />
    )
  }

  // A grade do Rodízio sai inteira no sorteio: o Diagnóstico só faz sentido nela.
  const { formato } = torneio
  const gradeRodizio =
    formato.tipo === 'rodizio'
      ? torneio.rodadas
      : formato.tipo === 'eliminatorio' && formato.classificatoria === 'rodizio'
        ? torneio.rodadas.filter((rodada) => faseDaRodada(rodada) === 0)
        : null

  return (
    <PaginaMesasTorneio
      torneio={torneio}
      aoVoltar={aoVoltar}
      aoAbrirRanking={() => setVendoRanking(true)}
      {...acoes}
      rodape={
        <>
          {formato.tipo === 'temporada' && (
            <button type="button" className="trn-card" onClick={() => aoAbrirTemporada(formato.temporadaId)}>
              <i className="fas fa-calendar-days" aria-hidden="true" />
              <strong>
                {temporadas.find((item) => item.id === formato.temporadaId)?.nome ?? t('tournament.season.title')}
              </strong>
              <span>{t('tournament.season.open')}</span>
            </button>
          )}
          {gradeRodizio && gradeRodizio.length > 0 && (
            <DiagnosticoGrade
              qualidade={qualidadeDasRodadas(gradeRodizio, torneio.jogadorIds.length)}
              grade={gradeDasRodadas(gradeRodizio)}
              nomeDe={nomeDe}
            />
          )}
        </>
      }
    />
  )
}
