import { useVoltarPorDeslize } from '@/compartilhado/interface/hooks/voltarInterno'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import DetalhesSorteio from '@/compartilhado/interface/componentes/sorteio/DetalhesSorteio'
import { estatisticaDoTorneio } from '../../logica/estatisticaGrade'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { regrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import { nomeApp } from '@/compartilhado/marca/nome-app'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { useAviso } from '@/dominios/centerpiece/interface/hooks/useAviso'
import { usePartidasDoTorneio } from '@/dominios/torneio/interface/hooks/usePartidasDoTorneio'
import { candidatosAoPrimeiro, distanciasDoPodio, type DistanciaAlvo } from '../../logica/distanciaPodio'
import {
  chaveAcompanhar,
  FILTROS_PADRAO_TORNEIO,
  filtrosAtivos,
  type FiltrosRankingTorneio,
} from '../../logica/filtrosRankingTorneio'
import { mudancasDoRanking, rankingDoTorneio, recorteAteRodada, textoDaSeta } from '../../logica/ranking'
import { premiacaoDe, premioDaPosicao } from '../../logica/premiacao'
import { blocoDaPremiacao, relatorioDaDisputa, relatorioDoJogador, relatorioDoRanking } from '../../logica/relatorios'
import FolhaPremiacao from '../componentes/FolhaPremiacao'
import { useDinheiro } from '../hooks/useDinheiro'
import FolhaDistanciaPodio from '../componentes/FolhaDistanciaPodio'
import ModalFiltrosRankingTorneio from '../componentes/ModalFiltrosRankingTorneio'
import ResumoDisputa from '../componentes/ResumoDisputa'
import { useTextosDistancia } from '../hooks/useTextosDistancia'
import '@/dominios/centerpiece/interface/componentes/ranking-filtros.css'
import FolhaCompartilhar from '../componentes/FolhaCompartilhar'
import SetaPosicao from '../componentes/SetaPosicao'
import { nomeDeArquivo, type Relatorio } from '@/compartilhado/relatorio/relatorio'
import type { Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'
import '../torneio.css'
import { podeEncerrar } from '../../logica/torneio'
import { useNomeNoTorneio } from '../hooks/useNomeNoTorneio'

/**
 * Ranking do torneio: posição, jogador, pontos, média de colocação e partidas.
 * Top 3 em destaque. No Eliminatório, a fase em que cada um parou.
 * Na visão Disputa do pódio, as distâncias. Tocar na linha abre a do jogador.
 */
export default function PaginaRankingTorneio({
  torneio,
  aoVoltar,
  aoAbrirTemporada,
}: {
  torneio: Torneio
  aoVoltar: () => void
  aoAbrirTemporada: (temporadaId: string) => void
}) {
  const { t, idioma, numero } = useI18n()
  const nomeDoApp = nomeApp(useModoJogoAtual())
  // Deslizar para qualquer lado volta para a tela do torneio.
  useVoltarPorDeslize(aoVoltar)
  const { partidas } = usePartidasDoTorneio()
  const nomeDoTorneio = useNomeNoTorneio()
  const { finalizar, salvar } = useTorneios()
  const emMoeda = useDinheiro()
  const [vendoPremiacao, setVendoPremiacao] = useState(false)
  const { aviso, mostrar } = useAviso()
  const [encerrando, setEncerrando] = useState(false)
  const [compartilhando, setCompartilhando] = useState<{ relatorio: () => Relatorio; arquivo: string } | null>(null)
  const [filtros, setFiltros] = useState<FiltrosRankingTorneio>(() => {
    const salvo = armazenamentoLocal.ler(chaveAcompanhar(torneio.id))
    const acompanharId = salvo && torneio.jogadorIds.includes(salvo) ? salvo : null
    return { ...FILTROS_PADRAO_TORNEIO, acompanharId }
  })
  const [filtrando, setFiltrando] = useState(false)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [linhaSeguida, setLinhaSeguida] = useState<HTMLTableRowElement | null>(null)
  const [seguidoForaDaTela, setSeguidoForaDaTela] = useState(false)
  const recorte = useMemo(
    () => recorteAteRodada(torneio, partidas, filtros.ateRodada),
    [torneio, partidas, filtros.ateRodada],
  )
  const linhas = useMemo(() => rankingDoTorneio(recorte.torneio, recorte.partidas), [recorte])
  const mudancas = useMemo(() => mudancasDoRanking(recorte.torneio, recorte.partidas), [recorte])
  const distancias = useMemo(() => distanciasDoPodio(linhas), [linhas])
  const rodadasComResultado = useMemo(() => {
    const numeros = partidas.flatMap(({ status, vinculoTorneio }) =>
      status === 'finalizada' && vinculoTorneio?.torneioId === torneio.id ? [vinculoTorneio.rodada + 1] : [],
    )
    return [...new Set(numeros)].sort((a, b) => a - b)
  }, [torneio.id, partidas])

  useEffect(() => {
    setSeguidoForaDaTela(false)
    if (!linhaSeguida) return
    // Atrás do cabeçalho ou da navegação também é fora da tela.
    const observador = new IntersectionObserver(
      (entradas) => setSeguidoForaDaTela(!entradas[entradas.length - 1].isIntersecting),
      { rootMargin: '-56px 0px -64px 0px' },
    )
    observador.observe(linhaSeguida)
    return () => observador.disconnect()
  }, [linhaSeguida])
  const mudancaDe = (id: string) => mudancas?.jogadores.find((item) => item.jogadorId === id)
  const estatistica = useMemo(() => estatisticaDoTorneio(torneio), [torneio])
  const [vendoEstatistica, setVendoEstatistica] = useState(false)
  const eliminatorio = torneio.formato.tipo === 'eliminatorio'

  const nomeDe = (id: string) => nomeDoTorneio(torneio, id)
  const pontos = (valor: number) =>
    `${valor > 0 ? '+' : ''}${new Intl.NumberFormat(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(valor)}`
  const media = (valor: number) =>
    valor ? new Intl.NumberFormat(idioma, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor) : '–'
  const fase = (valor: number) =>
    valor === 0 ? t('tournament.ranking.phaseQualifier') : t('tournament.ranking.phaseCut', { number: valor })

  const regras = regrasDoModo(torneio.jogo ?? 'riichi')
  const textos = useTextosDistancia(regras, filtros.unidade, nomeDe)
  const jaJogaram = linhas.some((linha) => linha.partidas > 0)
  const disputa = jaJogaram && filtros.visao === 'disputa'
  const seguida = linhas.find((linha) => linha.jogadorId === filtros.acompanharId)
  const quantosFiltros = filtrosAtivos(filtros)
  const colunaFase = eliminatorio && !disputa
  const aplicar = (novos: FiltrosRankingTorneio) => {
    setFiltros(novos)
    const chave = chaveAcompanhar(torneio.id)
    if (novos.acompanharId) armazenamentoLocal.gravar(chave, novos.acompanharId)
    else armazenamentoLocal.remover?.(chave)
  }

  const formatoCurto = t(`tournament.formatsShort.${torneio.formato.tipo}`)
  const ateRodada =
    filtros.ateRodada === null ? null : t('tournament.share.untilRound', { round: filtros.ateRodada })
  const subtituloDe = (...partes: (string | null)[]) => [...partes, formatoCurto, ateRodada].filter(Boolean).join(' · ')
  const chamada = t('tournament.share.ctaRace', { app: nomeDoApp })

  // O encontro de temporada não tem prêmio próprio: ele é da Temporada.
  const premiacao = torneio.formato.tipo === 'temporada' ? undefined : torneio.premiacao
  const premio = premiacaoDe(premiacao, torneio.jogadorIds.length)
  const premios = premio ? premioDaPosicao(premio, linhas) : null
  const dinheiro = (valor: number) => emMoeda(valor, premiacao?.moeda ?? 'BRL')
  const premioEmJogo = (acima: number, abaixo: number) => {
    if (!premio) return null
    const valorDe = (posicao: number) => premio.posicoes[posicao - 1]?.valor ?? 0
    const diferenca = valorDe(acima) - valorDe(abaixo)
    return diferenca > 0 ? t('tournament.prize.atStake', { value: dinheiro(diferenca) }) : null
  }
  const comPremio = (base: Relatorio): Relatorio =>
    premio
      ? {
          ...base,
          blocos: [
            ...base.blocos,
            blocoDaPremiacao(premio, { titulo: t('tournament.prize.byPlace'), lugar: textos.lugar, dinheiro }),
          ],
        }
      : base

  const relatorioDisputa = () =>
    relatorioDaDisputa(recorte.torneio, recorte.partidas, linhas, filtros.acompanharId, {
      ...textos,
      titulo: torneio.nome,
      subtitulo: subtituloDe(t('tournament.podiumGap.race')),
      chamada,
      nome: nomeDe,
      pontos,
      podio: t('tournament.podiumGap.podium'),
      candidatos: t('tournament.podiumGap.contenders'),
      fundo: t('tournament.share.bottom'),
      versus: (a, b) => t('tournament.podiumGap.versus', { a, b }),
      soComAjuda: t('tournament.podiumGap.needsHelp'),
      vantagemNoFundo: (value) => t('tournament.share.bottomLead', { value }),
      paraSair: (value) => t('tournament.share.bottomLeave', { value }),
    })

  const compartilharJogador = (id: string, comparadoId: string | undefined) => {
    const linha = linhas.find((item) => item.jogadorId === id)
    if (!linha) return
    setCompartilhando({
      arquivo: nomeDeArquivo(torneio.nome, nomeDe(id)),
      relatorio: () =>
        relatorioDoJogador(linhas, id, comparadoId, {
          ...textos,
          titulo: `${nomeDe(id)}, ${textos.lugar(linha.posicao)} (${pontos(linha.pontos)})`,
          subtitulo: subtituloDe(torneio.nome),
          chamada,
          nome: nomeDe,
          pontos,
        }),
    })
  }

  const celulaDistancia = (alvo: DistanciaAlvo | null | undefined, vantagem = false) =>
    alvo ? (
      <>
        <span aria-hidden="true">
          {vantagem && alvo.diferenca > 0 ? '+' : ''}
          {textos.celula(alvo)}
        </span>
        <span className="sr-only">
          {textos.rotulo(alvo)}: {textos.resumo(alvo)}
        </span>
      </>
    ) : (
      '–'
    )

  /** A classificação, para a área Exportar. */
  const relatorio = () =>
    relatorioDoRanking(linhas, {
      titulo: torneio.nome,
      subtitulo: subtituloDe(t('tournament.ranking.title')),
      nome: nomeDe,
      colunas: [
        ` # ${t('tournament.ranking.player')}`,
        t('tournament.ranking.pointsShort'),
        t('tournament.ranking.averagePlaceShort'),
        t('tournament.ranking.gamesShort'),
        ...(eliminatorio ? [t('tournament.ranking.phase')] : []),
      ],
      valores: (linha) => [
        pontos(linha.pontos),
        media(linha.mediaColocacao),
        numero(linha.partidas),
        ...(eliminatorio ? [fase(linha.fase ?? 0)] : []),
      ],
      pontos,
      seta: (id) => textoDaSeta(mudancaDe(id)),
    })

  return (
    <section className="ptd-inicio trn-pagina trn-ranking">
      <TituloTela
        titulo={t('tournament.ranking.title')}
        aoVoltar={aoVoltar}
        acoes={
          <span className="clb-acoes-titulo trn-acoes-rodada">
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.share.title')}
              title={t('tournament.share.title')}
              aria-haspopup="dialog"
              onClick={() =>
                setCompartilhando({
                  relatorio: () => comPremio(disputa ? relatorioDisputa() : relatorio()),
                  arquivo: nomeDeArquivo(
                    torneio.nome,
                    t(disputa ? 'tournament.podiumGap.race' : 'tournament.ranking.title'),
                  ),
                })
              }
            >
              <i className="fas fa-share-nodes" aria-hidden="true" />
            </button>
            {estatistica && (
              <button
                type="button"
                className="cm-btn-icone"
                aria-label={t('tournament.gridStats.openStats')}
                title={t('tournament.gridStats.openStats')}
                aria-haspopup="dialog"
                onClick={() => setVendoEstatistica(true)}
              >
                <i className="fas fa-chart-simple" aria-hidden="true" />
              </button>
            )}
            {podeEncerrar(torneio) && (
              <button
                type="button"
                className="cm-btn-icone"
                aria-label={t('tournament.ranking.finish')}
                title={t('tournament.ranking.finish')}
                aria-haspopup="dialog"
                onClick={() => setEncerrando(true)}
              >
                <i className="fas fa-flag-checkered" aria-hidden="true" />
              </button>
            )}
          </span>
        }
      />
      {/* Mesma faixa de título das Mesas do torneio. */}
      <p className="ptd-faixa-titulo">
        <i className="fas fa-trophy" aria-hidden="true" />
        <span>{torneio.nome}</span>
        <small>{t(`tournament.formatsShort.${torneio.formato.tipo}`)}</small>
        <small>{torneio.status === 'finalizado' ? t('match.club.meetingDone') : t('match.types.inProgressTag')}</small>
      </p>

      {torneio.formato.tipo === 'temporada' && (
        <button
          type="button"
          className="trn-card"
          onClick={() => torneio.formato.tipo === 'temporada' && aoAbrirTemporada(torneio.formato.temporadaId)}
        >
          <i className="fas fa-calendar-days" aria-hidden="true" />
          <strong>{t('tournament.ranking.seasonRanking')}</strong>
          <span>{t('tournament.ranking.seasonRankingHelp')}</span>
        </button>
      )}

      {premio && (
        <button type="button" className="trn-premio-resumo" aria-haspopup="dialog" onClick={() => setVendoPremiacao(true)}>
          <i className="fas fa-gift" aria-hidden="true" />
          <span>{t('tournament.prize.pool')}</span>
          <strong>{dinheiro(premio.premio)}</strong>
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>
      )}

      {jaJogaram && (
        <div className="rkf-barra trn-barra-ranking">
          <button
            type="button"
            className="trn-alternar-visao"
            aria-pressed={disputa}
            onClick={() => aplicar({ ...filtros, visao: disputa ? 'classificacao' : 'disputa' })}
          >
            <i className="fas fa-ranking-star" aria-hidden="true" />
            {t('tournament.podiumGap.race')}
          </button>
          {ateRodada && <span className="trn-ate-rodada">{ateRodada}</span>}
          <span className="rkf-espaco" aria-hidden="true" />
          <button
            type="button"
            className={`rkf-icone${quantosFiltros ? ' rkf-icone--ativo' : ''}`}
            aria-label={t('tournament.rankingFilters.open')}
            title={t('tournament.rankingFilters.open')}
            aria-haspopup="dialog"
            onClick={() => setFiltrando(true)}
          >
            <i className="fas fa-filter" aria-hidden="true" />
            {quantosFiltros > 0 && <span className="rkf-contagem">{quantosFiltros}</span>}
          </button>
        </div>
      )}

      {disputa && (
        <ResumoDisputa
          distancias={distancias}
          candidatos={candidatosAoPrimeiro(recorte.torneio, recorte.partidas, linhas)}
          acompanhadoId={filtros.acompanharId}
          textos={textos}
          nome={nomeDe}
          pontos={pontos}
          premioEmJogo={premioEmJogo}
        />
      )}

      <div className="trn-tabela-rolagem">
        <table className={`trn-tabela-temporada trn-tabela-ranking${disputa ? ' trn-tabela-disputa' : ''}`}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t('tournament.ranking.player')}</th>
              <th scope="col">{t('tournament.ranking.points')}</th>
              {disputa ? (
                <>
                  <th scope="col">{t('tournament.podiumGap.toThird')}</th>
                  <th scope="col">{t('tournament.podiumGap.toFirst')}</th>
                </>
              ) : (
                <>
                  <th scope="col">
                    <abbr title={t('tournament.ranking.averagePlace')}>{t('tournament.ranking.averagePlaceShort')}</abbr>
                  </th>
                  <th scope="col">
                    <abbr title={t('tournament.ranking.games')}>{t('tournament.ranking.gamesShort')}</abbr>
                  </th>
                </>
              )}
              {colunaFase && <th scope="col">{t('tournament.ranking.phase')}</th>}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => {
              const classes = [
                linha.partidas > 0 && linha.posicao <= 3 && `trn-podio trn-podio--${linha.posicao}`,
                linha.partidas > 0 && 'trn-linha-toque',
                linha.jogadorId === filtros.acompanharId && 'trn-linha-seguida',
              ].filter(Boolean)
              const distancia = distancias.porJogador.get(linha.jogadorId)
              const valorPremio = premios?.get(linha.jogadorId)
              const premioDele = valorPremio ? dinheiro(valorPremio) : null
              return (
                // Quem ainda não jogou não tem posição: sem isso, todos empatavam em 1º.
                <tr
                  key={linha.jogadorId}
                  className={classes.join(' ') || undefined}
                  ref={linha.jogadorId === filtros.acompanharId ? setLinhaSeguida : undefined}
                  onClick={linha.partidas > 0 ? () => setAbertoId(linha.jogadorId) : undefined}
                >
                  <td>
                    {linha.partidas === 0 ? (
                      '–'
                    ) : linha.posicao <= 3 ? (
                      <span className="trn-medalha" aria-label={t('tournament.ranking.place', { place: linha.posicao })}>
                        {linha.posicao}
                      </span>
                    ) : (
                      linha.posicao
                    )}
                    <SetaPosicao mudanca={mudancaDe(linha.jogadorId)} />
                  </td>
                  <td>
                    {linha.partidas > 0 ? (
                      // O toque é da linha inteira. O botão dá o foco e o nome ao leitor de tela.
                      <button
                        type="button"
                        className="trn-nome-ranking"
                        aria-label={[t('tournament.podiumGap.open', { name: nomeDe(linha.jogadorId) }), premioDele]
                          .filter(Boolean)
                          .join(', ')}
                        aria-haspopup="dialog"
                      >
                        {nomeDe(linha.jogadorId)}
                        {premioDele && <small className="trn-premio-linha">{premioDele}</small>}
                      </button>
                    ) : (
                      nomeDe(linha.jogadorId)
                    )}
                  </td>
                  <td className={linha.pontos > 0 ? 'trn-positivo' : linha.pontos < 0 ? 'trn-negativo' : undefined}>
                    {pontos(linha.pontos)}
                  </td>
                  {disputa ? (
                    <>
                      <td className={distancia?.sobreOQuarto ? 'trn-positivo' : undefined}>
                        {celulaDistancia(distancia?.sobreOQuarto ?? distancia?.paraTerceiro, !!distancia?.sobreOQuarto)}
                      </td>
                      <td>{celulaDistancia(distancia?.paraPrimeiro)}</td>
                    </>
                  ) : (
                    <>
                      <td>{media(linha.mediaColocacao)}</td>
                      <td>{numero(linha.partidas)}</td>
                    </>
                  )}
                  {colunaFase && <td className="trn-fase">{fase(linha.fase ?? 0)}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {disputa && (
        <p className="cfg-ajuda trn-legenda-setas">
          {t('tournament.podiumGap.leadLegend')}
          {filtros.unidade !== 'pontos' &&
            ` ${t('tournament.podiumGap.inUnit', { unit: t(`tournament.podiumGap.units.${filtros.unidade}`) })}`}
        </p>
      )}
      {mudancas && (
        <p className="cfg-ajuda trn-legenda-setas">
          {t('tournament.positionChange.legend', { round: mudancas.desde })}
        </p>
      )}

      {seguida && seguidoForaDaTela && (
        <button
          type="button"
          className="trn-seguido-fixo"
          disabled={seguida.partidas === 0}
          onClick={() => setAbertoId(seguida.jogadorId)}
        >
          <span>{seguida.partidas > 0 ? textos.lugar(seguida.posicao) : '–'}</span>
          <strong>{nomeDe(seguida.jogadorId)}</strong>
          <span>{pontos(seguida.pontos)}</span>
        </button>
      )}

      {vendoPremiacao && premiacao && (
        <FolhaPremiacao
          inicial={premiacao}
          jogadores={torneio.jogadorIds.length}
          aoSalvar={
            torneio.transferidoEm || torneio.status === 'finalizado'
              ? undefined
              : (nova) => salvar({ ...torneio, premiacao: nova })
          }
          aoFechar={() => setVendoPremiacao(false)}
        />
      )}

      {filtrando && (
        <ModalFiltrosRankingTorneio
          filtros={filtros}
          regras={regras}
          jogadorIds={torneio.jogadorIds}
          rodadas={rodadasComResultado}
          nome={nomeDe}
          aoAplicar={aplicar}
          aoFechar={() => setFiltrando(false)}
        />
      )}

      {abertoId && (
        <FolhaDistanciaPodio
          linhas={linhas}
          jogadorId={abertoId}
          regras={regras}
          textos={textos}
          nome={nomeDe}
          pontos={pontos}
          coberta={compartilhando !== null}
          aoNavegar={setAbertoId}
          aoCompartilhar={(comparadoId) => compartilharJogador(abertoId, comparadoId)}
          aoFechar={() => setAbertoId(null)}
        />
      )}

      {/* Compartilhar o que está aberto (classificação, disputa ou um jogador), em texto ou imagem. */}
      {compartilhando && (
        <FolhaCompartilhar
          relatorio={compartilhando.relatorio}
          nomeArquivo={compartilhando.arquivo}
          aoAvisar={mostrar}
          aoFechar={() => setCompartilhando(null)}
        />
      )}

      {vendoEstatistica && estatistica && (
        <DetalhesSorteio estatistica={estatistica} nomeDe={nomeDe} aoFechar={() => setVendoEstatistica(false)} />
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {encerrando && (
        <ModalConfirmacao
          titulo={t('tournament.ranking.finishTitle')}
          texto={t('tournament.ranking.finishHelp')}
          rotuloConfirmar={t('tournament.ranking.finish')}
          aoFechar={() => setEncerrando(false)}
          aoConfirmar={() => {
            finalizar(torneio.id)
            setEncerrando(false)
            aoVoltar()
          }}
        />
      )}
    </section>
  )
}
