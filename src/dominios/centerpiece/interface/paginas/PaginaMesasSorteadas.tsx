import '@/dominios/torneio/interface/torneio.css'
import { useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import QualidadeSorteio from '@/compartilhado/interface/componentes/sorteio/QualidadeSorteio'
import { situacaoDoDia, type MesaDoSorteio } from '../../logica/encontroClube'
import { chaveDaEntrada, textoDasMesas } from '../../logica/listaClube'
import { CHAVE_VENTO, KANJI_VENTO } from '../../logica/partida'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { usePartidas } from '../hooks/usePartidas'

/**
 * Resultado do sorteio: um card por mesa, com os ventos já definidos. As partidas
 * são jogadas na mesa física; aqui o organizador só registra o resultado de cada uma.
 */
export default function PaginaMesasSorteadas({
  aoVoltar,
  aoRegistrarMesa,
}: {
  aoVoltar: () => void
  /** Abre o registro de partida finalizada com os quatro desta mesa. */
  aoRegistrarMesa: (mesa: MesaDoSorteio) => void
}) {
  const { t, idioma } = useI18n()
  const { sorteio, encontros, sortearDeNovo, abortarEncontro, comecarDoZero } = useClube()
  const [menu, setMenu] = useState(false)
  const [zerando, setZerando] = useState(false)
  const [abortandoEncontro, setAbortandoEncontro] = useState(false)
  const { partidas: partidasRiichi } = usePartidas()
  // MCR: as mesas são placares, registradas quando a partida termina.
  const chines = useModoJogoAtual() === 'mcr'
  const placaresMcr = usePlacaresMcr()
  const partidas = chines
    ? placaresMcr.filter((placar) => placar.finalizadoEm !== null)
    : partidasRiichi
  const { aviso, mostrar } = useAviso()
  const [refazendo, setRefazendo] = useState(false)

  if (!sorteio) {
    return (
      <section className="ptd-inicio">
        <TituloTela titulo={t('match.club.resultTitle')} aoVoltar={aoVoltar} />
        <p className="ptd-vazio">{t('match.club.noDraw')}</p>
      </section>
    )
  }

  const dataHora = new Intl.DateTimeFormat(idioma, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(sorteio.encontro.criadoEm))
  const data = new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(
    new Date(sorteio.encontro.criadoEm),
  )

  /** A mesa conta como registrada enquanto a partida dela existir no histórico. */
  const registrada = (mesa: MesaDoSorteio) =>
    !!mesa.partidaId && partidas.some((partida) => partida.id === mesa.partidaId)

  const jogadas: readonly { encontro?: { id: string } }[] = chines ? placaresMcr : partidasRiichi
  const dia = situacaoDoDia(sorteio, encontros, jogadas, new Date())
  const nomes = new Map(sorteio.encontro.jogadores.map((entrada) => [chaveDaEntrada(entrada), entrada.nome]))
  const pessoas = sorteio.encontro.jogadores.length
  const dica = dia.proxima > 1 ? t('match.clubDay.newDrawHint', { n: dia.proxima }) : undefined

  const compartilhar = async () => {
    const texto = textoDasMesas(sorteio.mesas, {
      titulo: t('match.club.shareTitle', { date: data }),
      mesa: (numero) => t('match.table.number', { number: numero }),
      vento: (vento) => t(CHAVE_VENTO[vento]),
    })
    const resultado = await compartilharTexto(texto, t('match.club.resultTitle'))
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  return (
    <section className="ptd-inicio clb-resultado">
      <TituloTela
        titulo={t('match.club.resultTitle')}
        aoVoltar={aoVoltar}
        acoes={
          <span className="clb-acoes-titulo trn-acoes-rodada">
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('match.club.redraw')}
              title={dica ?? t('match.club.redraw')}
              aria-description={dica}
              onClick={() => setRefazendo(true)}
            >
              <i className="fas fa-rotate" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('match.club.abortMeeting')}
              title={t('match.club.abortMeeting')}
              onClick={() => setAbortandoEncontro(true)}
            >
              <i className="fas fa-ban" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('match.club.share')}
              title={t('match.club.share')}
              onClick={compartilhar}
            >
              <i className="fas fa-share-nodes" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('match.clubDay.more')}
              title={t('match.clubDay.more')}
              aria-haspopup="dialog"
              onClick={() => setMenu(true)}
            >
              <i className="fas fa-ellipsis-vertical" aria-hidden="true" />
            </button>
          </span>
        }
      />

      {/* Selo como o do torneio em jogo: o encontro, a data e se ainda falta registrar mesa. */}
      <p className="ptd-faixa-titulo">
        <i className="fas fa-people-group" aria-hidden="true" />
        <span>
          {t('match.club.meeting')} · <time dateTime={sorteio.encontro.criadoEm}>{dataHora}</time>
        </span>
        <small>
          {sorteio.mesas.every(registrada)
            ? t('match.club.meetingDone')
            : t('match.types.inProgressTag')}
        </small>
      </p>

      {dia.estatistica && (
        <QualidadeSorteio
          key={sorteio.encontro.id}
          estatistica={dia.estatistica}
          nomeDe={(chave) => nomes.get(chave) ?? '?'}
          antesDeJogar={jogadas.every((jogada) => jogada.encontro?.id !== sorteio.encontro.id)}
          rotulo={t('match.clubDay.roundOfDay', { n: dia.numero })}
          dica={pessoas === 8 || pessoas === 12 ? t(`tournament.idealRounds.short${pessoas}`) : undefined}
        />
      )}

      <ul className="clb-mesas">
        {sorteio.mesas.map((mesa) => {
          const rotulo = t('match.table.number', { number: mesa.numero })
          return (
            <li key={mesa.numero} className="clb-mesa">
              <h3 className="clb-mesa-titulo">{rotulo}</h3>
              <ul className="clb-mesa-assentos" aria-label={rotulo}>
                {mesa.assentos.map(({ vento, jogador }) => (
                  <li key={vento} className="clb-assento">
                    <span className="clb-assento-kanji" aria-hidden="true">
                      {KANJI_VENTO[vento]}
                    </span>
                    <span className="clb-assento-vento">{t(CHAVE_VENTO[vento])}</span>
                    <span className="sr-only">: </span>
                    <strong className="clb-assento-nome">
                      {jogador.nome}
                      {!jogador.jogadorId && (
                        <span className="clb-convidado" aria-label={t('match.club.guestShort')}>
                          <i className="far fa-user" aria-hidden="true" />
                        </span>
                      )}
                    </strong>
                  </li>
                ))}
              </ul>
              {registrada(mesa) ? (
                <p className="clb-mesa-feita" role="status">
                  <i className="fas fa-circle-check" aria-hidden="true" />{' '}
                  {t('match.club.tableRegistered')}
                </p>
              ) : (
                <button
                  type="button"
                  className="btn-contorno clb-mesa-botao"
                  aria-label={`${t('match.club.registerResult')}, ${rotulo}`}
                  onClick={() => aoRegistrarMesa(mesa)}
                >
                  <i className="fas fa-clipboard-check" aria-hidden="true" />{' '}
                  {t('match.club.registerResult')}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {menu && (
        <Modal
          titulo={t('match.club.meeting')}
          aoFechar={() => setMenu(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <ul className="trn-menu">
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  setZerando(true)
                }}
              >
                <i className="fas fa-arrow-rotate-left" aria-hidden="true" />
                <span>{t('match.clubDay.resetDay')}</span>
              </button>
            </li>
          </ul>
        </Modal>
      )}

      {zerando && (
        <ModalConfirmacao
          titulo={t('match.clubDay.resetDayTitle')}
          texto={t('match.clubDay.resetDayHelp')}
          rotuloConfirmar={t('match.clubDay.resetDay')}
          aoFechar={() => setZerando(false)}
          aoConfirmar={() => {
            comecarDoZero()
            setZerando(false)
            mostrar(t('match.clubDay.resetDone'))
          }}
        />
      )}

      {abortandoEncontro && (
        <ModalConfirmacao
          titulo={t('match.club.abortMeetingTitle')}
          texto={t('match.club.abortMeetingHelp')}
          rotuloConfirmar={t('match.club.abortMeeting')}
          perigo
          aoFechar={() => setAbortandoEncontro(false)}
          aoConfirmar={() => {
            setAbortandoEncontro(false)
            abortarEncontro()
            aoVoltar()
          }}
        />
      )}

      {refazendo && (
        <ModalConfirmacao
          titulo={t('match.club.redrawTitle')}
          texto={[t('match.club.redrawHelp'), ...(dica ? [`${dica}.`] : [])].join(' ')}
          rotuloConfirmar={t('match.club.redraw')}
          aoFechar={() => setRefazendo(false)}
          aoConfirmar={() => {
            sortearDeNovo(sorteio.encontro.id)
            setRefazendo(false)
          }}
        />
      )}
    </section>
  )
}
