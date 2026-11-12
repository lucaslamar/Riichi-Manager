import { useMemo, useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import HistoricoTorneios from '@/dominios/torneio/interface/componentes/HistoricoTorneios'
import type { Torneio } from '@/dominios/torneio/logica/tipos'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import type { Cadeira, Partida } from '../../logica/partida'
import { partidasDoHistorico } from '../../logica/ranking'
import { cadeirasDaPartida } from '../../logica/partida'
import { filtrarHistorico, type FiltroTipoMesa } from '../../logica/tipoDaMesa'
import BotoesOpcao from '../componentes/BotoesOpcao'
import FiltroTipo from '../componentes/FiltroTipo'
import CardMesa from '../componentes/CardMesa'
import ListaResultado from '../componentes/ListaResultado'
import { ListaMaos, ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import ModalHistoricoAcoes from '../componentes/ModalHistoricoAcoes'
import { historicoDe } from '../../logica/historicoAcoes'
import { usePartidas } from '../hooks/usePartidas'
import { nomeDoAssento } from '../nomeDoAssento'
import { textoDaPartida } from '../textoPartida'

/** Partidas finalizadas e, na outra aba, os torneios finalizados. */
export default function PaginaHistorico({
  aoVoltar,
  aoAbrirTorneio,
  aoAbrirTemporada,
}: {
  aoVoltar: () => void
  aoAbrirTorneio: (torneio: Torneio) => void
  aoAbrirTemporada: (temporadaId: string) => void
}) {
  const { t, idioma, numero } = useI18n()
  const { partidas, descartar } = usePartidas()
  const { jogadores } = useJogadores()
  const { aviso, mostrar } = useAviso()
  const [abertaId, setAbertaId] = useState<string | null>(null)
  const [paraExcluir, setParaExcluir] = useState<string | null>(null)
  const [acoesAbertas, setAcoesAbertas] = useState(false)
  const [aba, setAba] = useState<'partidas' | 'torneios'>('partidas')
  const [tipo, setTipo] = useState<FiltroTipoMesa>('todas')
  const [busca, setBusca] = useState('')
  const { torneios } = useTorneios()

  // Quem saiu do cadastro aparece com o nome guardado na partida.
  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoAssento(jogadores, partida.assentos[cadeira], (nome) =>
      t('players.deletedName', { name: nome }),
    )
  /** Onde a busca procura: os jogadores e, nas de torneio, o nome do torneio. */
  const nomesParaBusca = (partida: Partida) => [
    ...cadeirasDaPartida(partida).map(nomeNa(partida)),
    ...cadeirasDaPartida(partida).flatMap((cadeira) => {
      const jogador = jogadores.find((item) => item.id === partida.assentos[cadeira].jogadorId)
      return jogador ? [jogador.nome, jogador.apelido ?? ''] : []
    }),
    torneios.find((torneio) => torneio.id === partida.vinculoTorneio?.torneioId)?.nome ?? '',
  ]

  const historico = useMemo(() => partidasDoHistorico(partidas), [partidas])
  const filtrado = filtrarHistorico(historico, { tipo, busca }, nomesParaBusca)
  const aberta = historico.find((partida) => partida.id === abertaId)
  const data = (iso: string | undefined) =>
    iso
      ? new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
          new Date(iso),
        )
      : ''
  /** Torneio com rodada e mesa, mesa do encontro do clube, ou o tipo da avulsa. */
  const tituloDa = (partida: Partida) => {
    const vinculo = partida.vinculoTorneio
    if (vinculo) {
      const nome = torneios.find((torneio) => torneio.id === vinculo.torneioId)?.nome
      return nome ?? t('match.types.torneio')
    }
    if (partida.encontro)
      return `${t('match.club.meeting')} · ${t('match.table.number', { number: partida.encontro.mesa })}`
    return t(
      partida.config.tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan',
    )
  }

  /** Rodada e mesa do torneio, na linha da data. */
  const apoioDa = (partida: Partida) => {
    const vinculo = partida.vinculoTorneio
    return vinculo ? t('match.types.roundTable', { round: vinculo.rodada + 1, table: vinculo.mesa + 1 }) : undefined
  }

  const compartilhar = async (partida: Partida) => {
    const cabecalho = [tituloDa(partida), apoioDa(partida), data(partida.finalizadaEm)].filter(Boolean).join(' · ')
    const resultado = await compartilharTexto(
      textoDaPartida(partida, cabecalho, nomeNa(partida), t, numero),
    )
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  if (aberta) {
    return (
      <section className="ptd-inicio ptd-detalhe-historico">
        <TituloTela titulo={data(aberta.finalizadaEm)} aoVoltar={() => setAbertaId(null)} />
        <ListaResultado linhas={aberta.resultado ?? []} nomeDe={nomeNa(aberta)} />
        <h3 className="ptd-rotulo">{t('match.hands.title')}</h3>
        {aberta.registradaManual ? (
          <p className="ptd-vazio">{t('match.manual.noHands')}</p>
        ) : (
          <>
            <ListaMaos partida={aberta} nomeDe={nomeNa(aberta)} />
            {/* O histórico de ações fica salvo com a partida. */}
            <button type="button" className="btn-contorno ptd-btn-largo" onClick={() => setAcoesAbertas(true)}>
              <i className="fas fa-list-ul" aria-hidden="true" /> {t('match.history.title')}
            </button>
          </>
        )}
        {acoesAbertas && (
          <ModalHistoricoAcoes
            historico={historicoDe(aberta)}
            nomeDe={nomeNa(aberta)}
            aoFechar={() => setAcoesAbertas(false)}
          />
        )}
      </section>
    )
  }

  return (
    <section className="ptd-inicio cm-pagina">
      <TituloTela titulo={t('match.home.history')} aoVoltar={aoVoltar} />
      <BotoesOpcao
        rotulo={t('match.home.history')}
        opcoes={[
          { valor: 'partidas', rotulo: t('match.history.tabMatches') },
          { valor: 'torneios', rotulo: t('match.history.tabTournaments') },
        ]}
        valor={aba}
        aoEscolher={setAba}
      />
      {aba === 'torneios' ? (
        <HistoricoTorneios aoAbrir={aoAbrirTorneio} aoAbrirTemporada={aoAbrirTemporada} />
      ) : historico.length === 0 ? (
        <p className="ptd-vazio">{t('match.history.empty')}</p>
      ) : (
        <>
          <div className="ptd-filtro-historico">
            <CampoBusca
              valor={busca}
              aoMudar={setBusca}
              rotulo={t('match.history.search')}
              placeholder={t('match.history.search')}
              rotuloLimpar={t('actions.clear')}
            />
            <FiltroTipo valor={tipo} aoMudar={setTipo} />
          </div>
          {filtrado.length === 0 && <p className="ptd-vazio">{t('match.history.noMatch')}</p>}
          <ul className="cm-lista ptd-lista-historico">
            {filtrado.map((partida) => (
              <li key={partida.id}>
                <CardMesa
                  partida={partida}
                  modo="historico"
                  titulo={tituloDa(partida)}
                apoio={apoioDa(partida)}
                  nomeDe={nomeNa(partida)}
                  aoAbrir={() => setAbertaId(partida.id)}
                  aoCompartilhar={() => void compartilhar(partida)}
                  aoExcluir={() => setParaExcluir(partida.id)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {paraExcluir && (
        <ModalConfirmacao
          titulo={t('match.cards.deleteTitle')}
          texto={t('match.cards.deleteHelp')}
          rotuloConfirmar={t('players.delete')}
          perigo
          aoFechar={() => setParaExcluir(null)}
          aoConfirmar={() => {
            descartar(paraExcluir)
            setParaExcluir(null)
          }}
        />
      )}
    </section>
  )
}

