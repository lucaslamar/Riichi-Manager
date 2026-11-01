import { useMemo, useState } from 'react'
import { exportarPdf } from '@/compartilhado/adaptadores/pdf'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { KANJI_VENTO, ORDEM_VENTOS, type Partida } from '@/dominios/centerpiece/logica/partida'
import { posicoesDoRanking } from '@/dominios/centerpiece/logica/ranking'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  acrescentarTempoGlobal,
  acrescentarTempoMesa,
  alternarTimer,
  resetarTimer,
  segundosRestantesBase,
  segundosRestantesMesa,
  selecionarRodadaTimer,
} from '../../logica/acoes'
import { chaveMesa, formatarDuracao } from '../../logica/chaves'
import { SEGUNDOS_ACRESCIMO_MESA, VENTOS } from '../../logica/constantes'
import type { Torneio } from '../../logica/tipos'
import {
  partidaDaMesa,
  pontosIniciaisDaMesa,
  progressoDaRodada,
  rankingDoTorneio,
  statusDaMesa,
} from '../../logica/torneio'
import DiagnosticoGrade from '../componentes/DiagnosticoGrade'
import { useRelogioTorneio } from '../hooks/useRelogioTorneio'
import { useTorneios } from '../hooks/useTorneios'

/** Circunferência do anel do timer (raio 44 no viewBox de 96). */
const CIRCUNFERENCIA = 2 * Math.PI * 44

export default function PainelTorneio({
  torneio,
  aoVoltar,
  aoAbrirPartida,
}: {
  torneio: Torneio
  aoVoltar: () => void
  aoAbrirPartida: (id: string) => void
}) {
  const { t, numero, idioma } = useI18n()
  const { atualizarTorneio, encerrar } = useTorneios()
  const { partidas } = usePartidas()
  const { jogadores } = useJogadores()
  const agora = useRelogioTorneio(torneio)
  const [abaAtiva, setAbaAtiva] = useState(torneio.timer.indiceRodada)
  const [confirmandoFim, setConfirmandoFim] = useState(false)
  const [erroPdf, setErroPdf] = useState(false)

  const nomeDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : '—'
  }
  const atualizar = (transformar: (atual: Torneio) => Torneio) =>
    atualizarTorneio(torneio.id, transformar)

  const linhas = useMemo(() => rankingDoTorneio(partidas, torneio), [partidas, torneio])
  const posicoes = useMemo(() => posicoesDoRanking(linhas), [linhas])
  const decimal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

  const aoExportar = async () => {
    const formato = new Intl.NumberFormat(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    const exportado = await exportarPdf({
      titulo: `${t('tournament.ranking.title')} - ${t('global.appName')}`,
      cabecalho: [t('tournament.ranking.position'), t('tournament.ranking.player'), t('tournament.ranking.points')],
      linhas: linhas.map((linha, indice) => [
        `${posicoes[indice]}º`,
        nomeDe(linha.jogadorId),
        `${linha.pontuacaoTotal > 0 ? '+' : ''}${formato.format(linha.pontuacaoTotal)}`,
      ]),
      nomeArquivo: 'ranking-riichi.pdf',
    })
    setErroPdf(!exportado)
  }

  const segundos = segundosRestantesBase(torneio.timer, agora)
  const fracao = torneio.timer.totalSegundos > 0 ? Math.min(1, segundos / torneio.timer.totalSegundos) : 0

  return (
    <section className="trn-painel">
      <TituloTela titulo={t('match.home.tournament')} aoVoltar={aoVoltar} />

      <section className="trn-bloco-painel trn-timer">
        <div className="trn-anel" role="timer" aria-label={t('tournament.timer.label', { round: torneio.timer.indiceRodada + 1 })}>
          <svg viewBox="0 0 96 96" aria-hidden="true">
            <circle className="ptd-timer-fundo" cx="48" cy="48" r="44" />
            <circle
              className="ptd-timer-progresso"
              cx="48"
              cy="48"
              r="44"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
            />
          </svg>
          <span>{formatarDuracao(segundos)}</span>
        </div>
        <div className="trn-timer-controles">
          <label className="trn-seletor-rodada">
            <span className="sr-only">{t('tournament.timer.round')}</span>
            <select
              value={torneio.timer.indiceRodada}
              onChange={(evento) =>
                atualizar((atual) => selecionarRodadaTimer(atual, Number(evento.target.value)))
              }
            >
              {torneio.grade.map((rodada, indice) => (
                <option key={rodada.id} value={indice}>
                  {t('tournament.grid.round', { number: rodada.id })}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-primario"
            onClick={() => atualizar((atual) => alternarTimer(atual, Date.now()))}
          >
            <i className={`fas ${torneio.timer.rodando ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
            {t(torneio.timer.rodando ? 'tournament.timer.pause' : 'tournament.timer.start')}
          </button>
          <div className="ptd-acoes-folha">
            <button
              type="button"
              className="btn-contorno"
              onClick={() => atualizar((atual) => acrescentarTempoGlobal(atual, Date.now()))}
            >
              {t('tournament.timer.addAll', { minutes: SEGUNDOS_ACRESCIMO_MESA / 60 })}
            </button>
            <button type="button" className="btn-contorno" onClick={() => atualizar(resetarTimer)}>
              {t('tournament.timer.reset')}
            </button>
          </div>
        </div>
      </section>

      <div className="trn-abas" role="tablist" aria-label={t('tournament.grid.rounds')}>
        {torneio.grade.map((rodada, indice) => {
          const progresso = progressoDaRodada(partidas, torneio, indice)
          return (
            <button
              key={rodada.id}
              type="button"
              role="tab"
              aria-selected={abaAtiva === indice}
              className={`trn-aba${abaAtiva === indice ? ' trn-aba--ativa' : ''}`}
              onClick={() => setAbaAtiva(indice)}
            >
              {t('tournament.grid.roundProgress', {
                number: rodada.id,
                done: progresso.guardadas,
                total: progresso.total,
              })}
            </button>
          )
        })}
      </div>

      <div className="trn-mesas" role="tabpanel">
        {torneio.grade[abaAtiva]?.mesas.map((mesa, indiceMesa) => (
          <CardMesa
            key={chaveMesa(abaAtiva, indiceMesa)}
            torneio={torneio}
            indiceRodada={abaAtiva}
            indiceMesa={indiceMesa}
            partida={partidaDaMesa(partidas, torneio.id, abaAtiva, indiceMesa)}
            nomeDe={nomeDe}
            segundos={segundosRestantesMesa(torneio.timer, abaAtiva, indiceMesa, agora)}
            rodadaNoTimer={torneio.timer.indiceRodada === abaAtiva}
            aoAbrirPartida={aoAbrirPartida}
          />
        ))}
      </div>

      <section className="trn-bloco-painel">
        <h3 className="trn-titulo-bloco">{t('tournament.ranking.title')}</h3>
        <div className="trn-tabela-rolagem trn-tabela-rolagem--ranking">
          <table className="trn-ranking">
            <thead>
              <tr>
                <th scope="col">{t('tournament.ranking.position')}</th>
                <th scope="col">{t('tournament.ranking.player')}</th>
                <th scope="col" className="trn-numero">{t('tournament.ranking.games')}</th>
                <th scope="col" className="trn-numero">{t('tournament.ranking.points')}</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, indice) => (
                <tr
                  key={linha.jogadorId}
                  className={linha.partidas > 0 && posicoes[indice] <= 3 ? `trn-top trn-top--${posicoes[indice]}` : undefined}
                >
                  <td>{posicoes[indice]}º</td>
                  <td>{nomeDe(linha.jogadorId)}</td>
                  <td className="trn-numero">{linha.partidas}</td>
                  <td
                    className={`trn-numero ${
                      linha.pontuacaoTotal < 0 ? 'ptd-negativo' : linha.pontuacaoTotal > 0 ? 'ptd-positivo' : ''
                    }`}
                  >
                    {decimal(linha.pontuacaoTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {erroPdf && (
          <p className="ptd-negativo" role="alert">
            {t('tournament.ranking.pdfError')}
          </p>
        )}
        <button type="button" className="btn-contorno ptd-btn-largo" onClick={aoExportar}>
          <i className="fas fa-file-pdf" aria-hidden="true" />
          {t('tournament.ranking.pdf')}
        </button>
      </section>

      {torneio.qualidade && (
        <DiagnosticoGrade qualidade={torneio.qualidade} grade={torneio.grade} nomeDe={nomeDe} />
      )}

      <button type="button" className="btn-contorno ptd-btn-largo" onClick={() => setConfirmandoFim(true)}>
        {t('tournament.finish.action')}
      </button>

      {confirmandoFim && (
        <ModalConfirmacao
          titulo={t('tournament.finish.title')}
          texto={t('tournament.finish.help')}
          rotuloConfirmar={t('tournament.finish.action')}
          perigo
          aoFechar={() => setConfirmandoFim(false)}
          aoConfirmar={() => {
            encerrar(torneio.id)
            setConfirmandoFim(false)
          }}
        />
      )}
    </section>
  )
}

function CardMesa({
  torneio,
  indiceRodada,
  indiceMesa,
  partida,
  nomeDe,
  segundos,
  rodadaNoTimer,
  aoAbrirPartida,
}: {
  torneio: Torneio
  indiceRodada: number
  indiceMesa: number
  partida: Partida | undefined
  nomeDe: (id: string) => string
  segundos: number
  rodadaNoTimer: boolean
  aoAbrirPartida: (id: string) => void
}) {
  const { t, numero } = useI18n()
  const { abrirMesa, guardarMesa, reabrirMesa, atualizarTorneio } = useTorneios()
  const status = statusDaMesa(partida)
  const mesa = torneio.grade[indiceRodada].mesas[indiceMesa]
  const assentos = [...mesa.assentos].sort((a, b) => VENTOS.indexOf(a.vento) - VENTOS.indexOf(b.vento))
  const [lancando, setLancando] = useState(false)
  const [confirmandoReabrir, setConfirmandoReabrir] = useState(false)

  const iniciais = pontosIniciaisDaMesa(partida, torneio.config)
  const [textos, setTextos] = useState<string[] | null>(null)
  const pontosTexto = textos ?? [iniciais[0], iniciais[1], iniciais[2], iniciais[3]].map(String)
  const pontos = pontosTexto.map((texto) => Number(texto) || 0) as [number, number, number, number]
  const soma = pontos.reduce((total, valor) => total + valor, 0)
  const esperado = torneio.config.pontosPartida * 4
  const mostraCampos = status === 'finalizada' || (status === 'nao_iniciada' && lancando)
  const acrescimos = torneio.timer.acrescimosPorMesa[chaveMesa(indiceRodada, indiceMesa)] ?? 0
  const placarVivo = status === 'em_andamento' && partida ? partida.placar : null

  const abrir = () => aoAbrirPartida(abrirMesa(torneio, indiceRodada, indiceMesa))

  return (
    <article className={`trn-mesa${status === 'guardada' ? ' trn-mesa--guardada' : ''}`}>
      <header className="trn-mesa-topo">
        <strong>{t('match.table.number', { number: mesa.id })}</strong>
        <span className={`trn-selo trn-selo--${status}`}>{t(`tournament.grid.status.${status}`)}</span>
        {placarVivo && (
          <span className="trn-mesa-mao" aria-label={t('tournament.grid.currentHand')}>
            {KANJI_VENTO[placarVivo.rodadaVento]}
            {placarVivo.rodadaNumero}
          </span>
        )}
      </header>

      {rodadaNoTimer && status !== 'guardada' && (
        <p className="trn-mesa-tempo">
          <i className="fas fa-clock" aria-hidden="true" /> {formatarDuracao(segundos)}
          {acrescimos > 0 && ` (+${(acrescimos * SEGUNDOS_ACRESCIMO_MESA) / 60} min)`}
        </p>
      )}

      <ul className="trn-mesa-assentos">
        {assentos.map((assento) => {
          const cadeira = VENTOS.indexOf(assento.vento) as 0 | 1 | 2 | 3
          const linhaFinal = partida?.resultado?.find((linha) => linha.cadeira === cadeira)
          return (
            <li key={assento.jogador}>
              <span className="trn-vento" aria-label={t(`winds.${['east', 'south', 'west', 'north'][cadeira]}`)}>
                {KANJI_VENTO[ORDEM_VENTOS[cadeira]]}
              </span>
              <span className="trn-mesa-nome">{nomeDe(assento.jogador)}</span>
              {mostraCampos ? (
                <input
                  className="cfg-entrada trn-mesa-pontos"
                  type="number"
                  step={100}
                  aria-label={t('tournament.grid.pointsOf', { name: nomeDe(assento.jogador) })}
                  value={pontosTexto[cadeira]}
                  onChange={(evento) =>
                    setTextos(pontosTexto.map((texto, indice) => (indice === cadeira ? evento.target.value : texto)))
                  }
                />
              ) : (
                <>
                  {placarVivo && <strong className="trn-numero">{numero(placarVivo.pontos[cadeira])}</strong>}
                  {status === 'guardada' && linhaFinal && (
                    <strong className="trn-numero">
                      {numero(linhaFinal.pontosBrutos)}{' '}
                      <span className={linhaFinal.final < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
                        ({linhaFinal.final > 0 ? '+' : ''}
                        {numero(linhaFinal.final)})
                      </span>
                    </strong>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>

      {mostraCampos && (
        <p className={soma === esperado ? 'ptd-apoio' : 'trn-alerta-soma'} role="status">
          {soma !== esperado && <i className="fas fa-triangle-exclamation" aria-hidden="true" />}{' '}
          {t('tournament.grid.sum', { sum: numero(soma), expected: numero(esperado) })}
        </p>
      )}

      <div className="trn-mesa-acoes">
        {(status === 'nao_iniciada' || status === 'em_andamento') && !lancando && (
          <button type="button" className="btn-primario" onClick={abrir}>
            {t(status === 'em_andamento' ? 'tournament.grid.resume' : 'tournament.grid.open')}
          </button>
        )}
        {status === 'nao_iniciada' && (
          <button type="button" className="btn-contorno" onClick={() => setLancando((atual) => !atual)}>
            {t(lancando ? 'actions.cancel' : 'tournament.grid.manual')}
          </button>
        )}
        {mostraCampos && (
          <button
            type="button"
            className="btn-primario"
            onClick={() => {
              guardarMesa(torneio, indiceRodada, indiceMesa, pontos)
              setLancando(false)
              setTextos(null)
            }}
          >
            {t('tournament.grid.save')}
          </button>
        )}
        {status === 'guardada' && (
          <button type="button" className="btn-contorno" onClick={() => setConfirmandoReabrir(true)}>
            {t('tournament.grid.reopen')}
          </button>
        )}
        {rodadaNoTimer && status !== 'guardada' && (
          <button
            type="button"
            className="btn-contorno"
            onClick={() =>
              atualizarTorneio(torneio.id, (atual) => acrescentarTempoMesa(atual, indiceRodada, indiceMesa))
            }
          >
            {t('tournament.grid.addTime', { minutes: SEGUNDOS_ACRESCIMO_MESA / 60 })}
          </button>
        )}
      </div>

      {confirmandoReabrir && (
        <ModalConfirmacao
          titulo={t('tournament.grid.reopenTitle', { number: mesa.id })}
          texto={t('tournament.grid.reopenHelp')}
          rotuloConfirmar={t('tournament.grid.reopen')}
          aoFechar={() => setConfirmandoReabrir(false)}
          aoConfirmar={() => {
            reabrirMesa(torneio, indiceRodada, indiceMesa)
            setTextos(null)
            setConfirmandoReabrir(false)
          }}
        />
      )}
    </article>
  )
}
