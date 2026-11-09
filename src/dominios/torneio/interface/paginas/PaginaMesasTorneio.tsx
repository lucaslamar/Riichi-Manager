import { useEffect, useState, type ReactNode } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import AnelTimer from '@/dominios/centerpiece/interface/componentes/AnelTimer'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { useAviso } from '@/dominios/centerpiece/interface/hooks/useAviso'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { CHAVE_VENTO, KANJI_VENTO, ORDEM_VENTOS, type Partida } from '@/dominios/centerpiece/logica/partida'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { deveLembrarBackup } from '../../logica/exportacao'
import { ACRESCIMO_SEGUNDOS } from '../../logica/configuracao'
import { proximaRodada, rodadaFechada } from '../../logica/formatos'
import { ehMesaFinal } from '../../logica/formatos/eliminatorio'
import {
  maoAtual,
  podeSortearDeNovo,
  relogioDaMesa,
  relogioDaRodada,
  reiniciarSorteio,
  sortearDeNovo,
  textoDaRodada,
  trocarMesa,
  trocarRodada,
} from '../../logica/mesas'
import {
  acabou,
  acrescentar,
  estaRodando,
  formatarRelogio,
  fracaoRestante,
  iniciar,
  pausar,
  segundosRestantes,
} from '../../logica/relogio'
import { abortarTorneio, sorteiaVentos, partidaDaMesa, progressoDaRodada, rodadaAtual, statusDaMesa, totalDeRodadas } from '../../logica/torneio'
import type { MesaTorneio, Relogio, RodadaTorneio, Torneio } from '../../logica/tipos'
import FolhaExportar from '../componentes/FolhaExportar'
import { useTorneios } from '../hooks/useTorneios'
import '@/dominios/centerpiece/interface/clube.css'
import '../torneio.css'
import { nomeNoTorneio } from '../../logica/torneio'

/** Agora, atualizado a cada segundo enquanto algum relógio corre. */
function useAgora(ativo: boolean) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!ativo) return
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(intervalo)
  }, [ativo])
  return ativo ? agora : Date.now()
}

export interface AcoesMesa {
  /** Registrar partida finalizada com a mesa travada; `corrigir` traz a partida a substituir. */
  aoLancarResultado: (rodada: RodadaTorneio, mesa: MesaTorneio, corrigir?: Partida) => void
}

/**
 * Mesas sorteadas do torneio: abas por rodada, timer geral, um card por mesa com
 * os quatro ventos, o status ao vivo e o registro do resultado.
 */
export default function PaginaMesasTorneio({
  torneio,
  aoVoltar,
  aoLancarResultado,
  rodape,
  aoAbrirRanking,
}: { torneio: Torneio; aoVoltar: () => void; rodape?: ReactNode; aoAbrirRanking: () => void } & AcoesMesa) {
  const { t, idioma, numero } = useI18n()
  const { salvar, definirLista, marcarTransferido } = useTorneios()
  const { partidas, descartarDoTorneio } = usePartidas()
  const { jogadores } = useJogadores()
  const { aviso, mostrar } = useAviso()
  const emJogo = rodadaAtual(torneio, partidas)
  const [abaRodada, setAbaRodada] = useState(emJogo?.numero ?? 1)
  const rodada = torneio.rodadas.find((item) => item.numero === abaRodada) ?? emJogo
  const [refazendo, setRefazendo] = useState(false)
  const [abortando, setAbortando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [menu, setMenu] = useState(false)
  const [reiniciando, setReiniciando] = useState(false)
  /** Rodada cujo lembrete de backup já foi dispensado. */
  const [lembreteDispensado, setLembreteDispensado] = useState<number>()

  const algumRodando =
    !!rodada &&
    (estaRodando(relogioDaRodada(torneio, rodada)) ||
      rodada.mesas.some((mesa) => {
        const relogio = relogioDaMesa(torneio, mesa)
        return !!relogio && estaRodando(relogio)
      }))
  const agora = useAgora(algumRodando)

  // Rodada nova gerada: a aba acompanha.
  useEffect(() => {
    if (emJogo) setAbaRodada(emJogo.numero)
  }, [emJogo?.numero]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!rodada) return null

  const nomeDe = (id: string) => nomeNoTorneio(torneio, jogadores, id)
  const total = totalDeRodadas(torneio.formato)
  const titulo = total
    ? t('tournament.tables.roundOf', { round: rodada.numero, total })
    : t('tournament.tables.round', { round: rodada.numero })
  const dataHora = new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(rodada.geradaEm),
  )
  const somenteLeitura = !!torneio.transferidoEm || torneio.status === 'finalizado'

  const salvarRelogioRodada = (relogio: Relogio) =>
    salvar(trocarRodada(torneio, rodada.numero, (atual) => ({ ...atual, relogio })))
  const salvarRelogioMesa = (mesa: MesaTorneio, relogio: Relogio) =>
    salvar(trocarMesa(torneio, rodada.numero, mesa.numero, (atual) => ({ ...atual, relogio })))

  const relogioGeral = relogioDaRodada(torneio, rodada)
  /** Ventos na mesa: o card mostra só os quatro nomes. */
  const comVentos = sorteiaVentos(torneio)

  const compartilhar = async () => {
    const texto = textoDaRodada(rodada, {
      titulo: `*${torneio.nome}* · ${titulo}`,
      mesa: (numeroMesa) => t('match.table.number', { number: numeroMesa }),
      vento: (vento) => t(CHAVE_VENTO[vento]),
      nome: nomeDe,
      ventos: comVentos,
    })
    const resultado = await compartilharTexto(texto, torneio.nome)
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  const fechada = rodadaFechada(torneio, partidas) && rodada.numero === torneio.rodadas.length
  const proxima = fechada && !somenteLeitura ? proximaRodada(torneio, partidas, new Date().toISOString()) : null

  return (
    <section className="ptd-inicio clb-resultado trn-mesas">
      <TituloTela
        titulo={titulo}
        aoVoltar={aoVoltar}
        acoes={
          <span className="clb-acoes-titulo">
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.ranking.title')}
              title={t('tournament.ranking.title')}
              onClick={aoAbrirRanking}
            >
              <i className="fas fa-ranking-star" aria-hidden="true" />
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
              aria-label={t('tournament.tables.more')}
              title={t('tournament.tables.more')}
              onClick={() => setMenu(true)}
            >
              <i className="fas fa-ellipsis-vertical" aria-hidden="true" />
            </button>
          </span>
        }
      />

      <p className="clb-encontro-data">
        {torneio.nome} · <time dateTime={rodada.geradaEm}>{dataHora}</time>
      </p>

      {torneio.transferidoEm && (
        <p className="cfg-aviso" role="status">
          <i className="fas fa-lock" aria-hidden="true" />{' '}
          {t('tournament.tables.transferred', {
            date: new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
              new Date(torneio.transferidoEm),
            ),
          })}{' '}
          <button type="button" className="trn-link" onClick={() => marcarTransferido(torneio.id, null)}>
            {t('tournament.tables.undoTransfer')}
          </button>
        </p>
      )}

      {torneio.rodadas.length > 1 && (
        <div className="trn-abas-rodadas" role="tablist" aria-label={t('tournament.tables.rounds')}>
          {torneio.rodadas.map((item) => {
            const { finalizadas, total: mesas } = progressoDaRodada(partidas, torneio, item)
            return (
              <button
                key={item.numero}
                type="button"
                role="tab"
                aria-selected={item.numero === rodada.numero}
                className={item.numero === rodada.numero ? 'ativo' : ''}
                onClick={() => setAbaRodada(item.numero)}
              >
                {t('tournament.tables.roundTab', { round: item.numero, done: finalizadas, total: mesas })}
              </button>
            )
          })}
        </div>
      )}

      {torneio.status !== 'finalizado' && (
        <div className="trn-timer-geral">
          <AnelTimer
            segundos={segundosRestantes(relogioGeral, agora)}
            fracao={fracaoRestante(relogioGeral, agora)}
            esgotado={acabou(relogioGeral, agora)}
            className="trn-anel"
          >
            <span aria-hidden="true">{formatarRelogio(segundosRestantes(relogioGeral, agora))}</span>
          </AnelTimer>
          <div className="trn-timer-acoes">
            <button
              type="button"
              className="btn-contorno"
              disabled={somenteLeitura || acabou(relogioGeral, agora)}
              onClick={() =>
                salvarRelogioRodada(
                  estaRodando(relogioGeral) ? pausar(relogioGeral, Date.now()) : iniciar(relogioGeral, Date.now()),
                )
              }
            >
              <i className={`fas ${estaRodando(relogioGeral) ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />{' '}
              {t(estaRodando(relogioGeral) ? 'tournament.tables.pause' : 'tournament.tables.start')}
            </button>
            <button
              type="button"
              className="btn-contorno"
              disabled={somenteLeitura}
              aria-label={t('tournament.tables.addTimeAll')}
              onClick={() => salvarRelogioRodada(acrescentar(relogioGeral, ACRESCIMO_SEGUNDOS))}
            >
              +5 min
            </button>
          </div>
          {acabou(relogioGeral, agora) && <p className="trn-tempo-acabou">{t('tournament.tables.timeUp')}</p>}
        </div>
      )}

      {/* Diagnóstico da Grade (e a temporada) antes das mesas. */}
      {rodape}

      <ul className="clb-mesas">
        {rodada.mesas.map((mesa) => {
          const partida = partidaDaMesa(partidas, torneio.id, rodada.numero, mesa.numero)
          const status = statusDaMesa(partida)
          const rotulo = t('match.table.number', { number: mesa.numero })
          const relogio = relogioDaMesa(torneio, mesa)
          const final = ehMesaFinal(torneio, rodada)
          const resultadoDe = (cadeira: number) => partida?.resultado?.find((linha) => linha.cadeira === cadeira)
          return (
            <li key={mesa.numero} className={`clb-mesa trn-mesa trn-mesa--${status}${final ? ' trn-mesa--final' : ''}`}>
              <div className="trn-mesa-topo">
                <h3 className="clb-mesa-titulo">
                  {final && <i className="fas fa-crown" aria-hidden="true" />} {final ? t('tournament.tables.finalTable') : rotulo}
                </h3>
                <span className={`trn-status trn-status--${status}`}>
                  {status === 'em_andamento' && partida
                    ? `${t('tournament.tables.status.em_andamento')} · ${maoAtual(partida)}`
                    : t(`tournament.tables.status.${status}`)}
                </span>
              </div>

              <ul className="clb-mesa-assentos" aria-label={rotulo}>
                {mesa.assentos.map((jogadorId, indice) => {
                  const vento = ORDEM_VENTOS[indice]
                  const linha = resultadoDe(indice)
                  return (
                    <li key={vento} className="clb-assento">
                      {comVentos ? (
                        <>
                          <span className={`clb-assento-kanji trn-kanji trn-kanji--${vento}`} aria-hidden="true">
                            {KANJI_VENTO[vento]}
                          </span>
                          <span className="clb-assento-vento">{t(CHAVE_VENTO[vento])}</span>
                          <span className="sr-only">: </span>
                        </>
                      ) : (
                        <span className="clb-assento-kanji trn-sem-vento" aria-hidden="true">
                          <i className="fas fa-user" />
                        </span>
                      )}
                      <strong className="clb-assento-nome">{nomeDe(jogadorId)}</strong>
                      {status === 'em_andamento' && partida && (
                        <span className="trn-assento-pontos">{numero(partida.placar.pontos[indice as 0 | 1 | 2 | 3])}</span>
                      )}
                      {linha && (
                        <span className={`trn-assento-pontos ${linha.final >= 0 ? 'trn-positivo' : 'trn-negativo'}`}>
                          {t('tournament.tables.place', { place: linha.colocacao })} ·{' '}
                          {linha.final > 0 ? '+' : ''}
                          {new Intl.NumberFormat(idioma, { maximumFractionDigits: 1 }).format(linha.final)}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>

              {relogio && status !== 'finalizada' && (
                <div className="trn-timer-mesa">
                  <i className="fas fa-clock" aria-hidden="true" />
                  <span role="timer" className={acabou(relogio, agora) ? 'trn-erro' : undefined}>
                    {formatarRelogio(segundosRestantes(relogio, agora))}
                  </span>
                  <button
                    type="button"
                    className="cm-btn-icone"
                    disabled={somenteLeitura}
                    aria-label={t(estaRodando(relogio) ? 'tournament.tables.pauseTable' : 'tournament.tables.startTable', { table: mesa.numero })}
                    onClick={() =>
                      salvarRelogioMesa(mesa, estaRodando(relogio) ? pausar(relogio, Date.now()) : iniciar(relogio, Date.now()))
                    }
                  >
                    <i className={`fas ${estaRodando(relogio) ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-contorno trn-mais-5"
                    disabled={somenteLeitura}
                    aria-label={t('tournament.tables.addTimeTable', { table: mesa.numero })}
                    onClick={() => salvarRelogioMesa(mesa, acrescentar(relogio, ACRESCIMO_SEGUNDOS))}
                  >
                    +5 min
                  </button>
                </div>
              )}

              {!somenteLeitura && (
                <button
                  type="button"
                  className="btn-contorno clb-mesa-botao"
                  aria-label={`${t(status === 'finalizada' ? 'tournament.tables.fix' : 'match.club.registerResult')}, ${rotulo}`}
                  // O adm lança o resultado final. Mesa já registrada: a correção substitui a partida.
                  onClick={() => aoLancarResultado(rodada, mesa, partida)}
                >
                  <i className={`fas ${status === 'finalizada' ? 'fa-pen' : 'fa-clipboard-check'}`} aria-hidden="true" />{' '}
                  {t(status === 'finalizada' ? 'tournament.tables.fix' : 'match.club.registerResult')}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {proxima && (
        <button
          type="button"
          className="btn-primario ptd-btn-largo trn-proxima"
          onClick={() => salvar({ ...torneio, rodadas: [...torneio.rodadas, proxima] })}
        >
          <i className="fas fa-forward" aria-hidden="true" />{' '}
          {proxima.fase && proxima.fase !== rodada.fase
            ? t('tournament.tables.nextPhase', { round: proxima.numero })
            : t('tournament.tables.nextRound', { round: proxima.numero })}
        </button>
      )}

      {fechada && !proxima && torneio.status === 'em_andamento' && !somenteLeitura && (
        <button type="button" className="btn-primario ptd-btn-largo trn-proxima" onClick={aoAbrirRanking}>
          <i className="fas fa-flag-checkered" aria-hidden="true" /> {t('tournament.tables.toFinish')}
        </button>
      )}

      {/* Lembrete de backup ao fechar a rodada: um botão logo abaixo de Gerar rodada. */}
      {deveLembrarBackup(torneio, fechada, lembreteDispensado) && (
        <button
          type="button"
          className="btn-contorno ptd-btn-largo trn-backup"
          aria-description={t('tournament.tables.backupReminder')}
          onClick={() => {
            setLembreteDispensado(torneio.rodadas.length)
            setExportando(true)
          }}
        >
          <i className="fas fa-floppy-disk" aria-hidden="true" /> {t('tournament.tables.backupAction')}
        </button>
      )}



      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {menu && (
        <Modal titulo={torneio.nome} aoFechar={() => setMenu(false)} rotuloFechar={t('actions.close')} tamanho="pequena">
          <ul className="trn-menu">
          {podeSortearDeNovo(torneio, partidas) && rodada.numero === torneio.rodadas.length && !somenteLeitura && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  setRefazendo(true)
                }}
              >
                <i className="fas fa-rotate" aria-hidden="true" />
                <span>{t('tournament.tables.redraw')}</span>
              </button>
            </li>
          )}
          {torneio.status === 'em_andamento' && !somenteLeitura && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  setReiniciando(true)
                }}
              >
                <i className="fas fa-shuffle" aria-hidden="true" />
                <span>{t('tournament.tables.restart')}</span>
              </button>
            </li>
          )}
          <li>
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  setExportando(true)
                }}
              >
                <i className="fas fa-file-export" aria-hidden="true" />
                <span>{t('tournament.export.button')}</span>
              </button>
            </li>
          {torneio.status === 'em_andamento' && !somenteLeitura && (
            <li>
              <button
                type="button"
                className="trn-menu--perigo"
                onClick={() => {
                  setMenu(false)
                  setAbortando(true)
                }}
              >
                <i className="fas fa-ban" aria-hidden="true" />
                <span>{t('tournament.tables.abort')}</span>
              </button>
            </li>
          )}
          </ul>
        </Modal>
      )}

      {reiniciando && (
        <ModalConfirmacao
          titulo={t('tournament.tables.restartTitle')}
          texto={t('tournament.tables.restartHelp')}
          rotuloConfirmar={t('tournament.tables.restart')}
          aoFechar={() => setReiniciando(false)}
          aoConfirmar={() => {
            descartarDoTorneio(torneio.id)
            salvar(reiniciarSorteio(torneio, new Date().toISOString()))
            setAbaRodada(1)
            setReiniciando(false)
          }}
        />
      )}

      {exportando && <FolhaExportar torneio={torneio} aoFechar={() => setExportando(false)} />}

      {abortando && (
        <ModalConfirmacao
          titulo={t('tournament.tables.abortTitle')}
          texto={t('tournament.tables.abortHelp')}
          rotuloConfirmar={t('tournament.tables.abort')}
          aoFechar={() => setAbortando(false)}
          aoConfirmar={() => {
            // A lista volta com os mesmos jogadores, prontos para editar e sortear de novo.
            definirLista(torneio.jogadorIds.map(nomeDe).join('\n'))
            descartarDoTorneio(torneio.id)
            salvar(abortarTorneio(torneio, new Date().toISOString()))
            setAbortando(false)
          }}
        />
      )}

      {refazendo && (
        <ModalConfirmacao
          titulo={t('tournament.tables.redrawTitle')}
          texto={t('tournament.tables.redrawHelp')}
          rotuloConfirmar={t('tournament.tables.redraw')}
          aoFechar={() => setRefazendo(false)}
          aoConfirmar={() => {
            salvar(sortearDeNovo(torneio, partidas, new Date().toISOString()))
            setRefazendo(false)
          }}
        />
      )}
    </section>
  )
}
