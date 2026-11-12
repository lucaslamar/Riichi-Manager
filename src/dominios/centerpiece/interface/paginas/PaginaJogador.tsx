import { useMemo, useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { svgParaPng } from '@/compartilhado/adaptadores/imagem'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { useEu } from '@/dominios/jogadores/interface/hooks/useEu'
import FormJogador from '@/dominios/jogadores/interface/componentes/FormJogador'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { partidasFiltradas } from '../../logica/filtrosRanking'
import {
  comparacaoDeFormatos,
  detalheDoConfronto,
  distribuicaoDeColocacoes,
  evolucaoDaPontuacao,
  maisJogouCom,
  mediaPorMes,
  mediaPorVento,
  redeDeConfrontos,
  resumoDoJogador,
} from '../../logica/analiseJogador'
import { usePartidas } from '../hooks/usePartidas'
import { useRankingGeral } from '../hooks/useRankingGeral'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import MapaConfrontos from '../componentes/analise/MapaConfrontos'
import { corDoSaldo } from '../componentes/analise/formatacao'
import FolhaConfronto from '../componentes/analise/FolhaConfronto'
import {
  CardGrafico,
  GraficoBarras,
  GraficoBarrasHorizontais,
  GraficoLinha,
} from '../componentes/analise/graficos'
import '../componentes/analise/analise.css'

/** Densidade do mapa: mínimo de partidas juntos para o adversário aparecer. */
const DENSIDADES = [
  { chave: 'low', minimo: 5 },
  { chave: 'normal', minimo: 3 },
  { chave: 'high', minimo: 1 },
] as const

/**
 * Tela do jogador analisado: mapa de confrontos e gráficos, tudo do ponto de
 * vista dele e respeitando os filtros do ranking (período, duração, origem).
 */
export default function PaginaJogador({
  jogadorId,
  aoVoltar,
  aoTrocarJogador,
}: {
  jogadorId: string
  aoVoltar: () => void
  aoTrocarJogador: (id: string) => void
}) {
  const { t, numero, idioma } = useI18n()
  const { jogadores, editar, favoritar } = useJogadores()
  const { euId, definirEu } = useEu()
  const [editando, setEditando] = useState(false)
  const jogador = jogadores.find((item) => item.id === jogadorId)
  const souEu = euId === jogadorId
  const { partidas } = usePartidas()
  const { filtros } = useRankingGeral()
  const [densidade, setDensidade] = useState<(typeof DENSIDADES)[number]['chave']>('normal')
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const mapa = useRef<SVGSVGElement>(null)

  const nomes = (id: string) => nomesNoRanking(jogadores.find((jogador) => jogador.id === id))
  const nome = nomes(jogadorId)
  // Os filtros do ranking, menos o de jogador (o analisado é este).
  const filtradas = useMemo(
    () => partidasFiltradas(partidas, filtros, new Date(), false),
    [partidas, filtros],
  )
  const resumo = resumoDoJogador(filtradas, jogadorId)
  const minimo = DENSIDADES.find((opcao) => opcao.chave === densidade)!.minimo
  const rede = useMemo(
    () => redeDeConfrontos(filtradas, jogadorId, minimo),
    [filtradas, jogadorId, minimo],
  )
  const evolucao = evolucaoDaPontuacao(filtradas, jogadorId)
  const distribuicao = distribuicaoDeColocacoes(filtradas, jogadorId)
  const porMes = mediaPorMes(filtradas, jogadorId)
  const porVento = mediaPorVento(filtradas, jogadorId)
  const formatos = comparacaoDeFormatos(filtradas, jogadorId)
  const parceiros = maisJogouCom(filtradas, jogadorId)

  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const vazio = t('match.player.empty')
  const formatoMes = new Intl.DateTimeFormat(idioma, { month: 'short', year: '2-digit' })
  const mesCurto = (mes: string) => formatoMes.format(new Date(`${mes}-15T12:00:00`))

  const compartilhar = async () => {
    if (!mapa.current) return
    try {
      const png = await svgParaPng(mapa.current)
      const resultado = await salvarArquivo(
        `mojoca-confrontos-${nome.principal}.png`,
        png,
        'image/png',
      )
      setAviso(resultado === 'falhou' ? t('match.player.shareFailed') : null)
    } catch {
      setAviso(t('match.player.shareFailed'))
    }
  }

  return (
    <section className="ptd-inicio anl-tela">
      <TituloTela titulo={nome.principal} aoVoltar={aoVoltar} />

      <header className="anl-cabecalho">
        <span className="anl-avatar" aria-hidden="true">
          {nome.principal.slice(0, 1).toUpperCase()}
        </span>
        <span className="anl-cabecalho-texto">
          {/* Nome e lápis num botão só: tocar no nome também edita. */}
          {jogador ? (
            <button
              type="button"
              className="anl-nome"
              aria-label={t('players.renameNamed', { name: nome.principal })}
              title={t('players.rename')}
              aria-haspopup="dialog"
              onClick={() => setEditando(true)}
            >
              <strong>{nome.principal}</strong>
              <i className="fas fa-pen" aria-hidden="true" />
            </button>
          ) : (
            <strong>{nome.principal}</strong>
          )}
          {nome.apoio && <small>{nome.apoio}</small>}
          <span className="anl-resumo">
            {t('match.player.summary', {
              count: resumo.partidas,
              average: resumo.mediaColocacao === null ? '—' : numero(resumo.mediaColocacao),
              score: comSinal(resumo.pontuacaoTotal),
            })}
          </span>
          <span className="anl-marcas">
            {/* "Este sou eu": fica em evidência no Ranking e no seletor. */}
            <button
              type="button"
              className={`anl-sou-eu${souEu ? ' anl-sou-eu--ativo' : ''}`}
              aria-pressed={souEu}
              onClick={() => definirEu(souEu ? null : jogadorId)}
            >
              <i className={`fas ${souEu ? 'fa-user-check' : 'fa-user'}`} aria-hidden="true" />
              {t(souEu ? 'players.itsMe' : 'players.markAsMe')}
            </button>
            {/* Favorito: aparece no grupo Favoritos ao escolher jogador. */}
            {jogador && (
              <button
                type="button"
                className={`anl-sou-eu${jogador.favorito ? ' anl-sou-eu--ativo' : ''}`}
                aria-pressed={!!jogador.favorito}
                onClick={() => favoritar(jogador.id, !jogador.favorito)}
              >
                <i className={`${jogador.favorito ? 'fas' : 'far'} fa-star`} aria-hidden="true" />
                {t(jogador.favorito ? 'players.favorited' : 'players.favoriteShort')}
              </button>
            )}
          </span>
        </span>
      </header>

      {editando && jogador && (
        <Modal
          titulo={t('players.rename')}
          aoFechar={() => setEditando(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <FormJogador
            inicial={jogador}
            aoSalvar={(dados) => {
              const resultado = editar(jogador.id, dados)
              if (resultado.ok) setEditando(false)
              return resultado
            }}
            aoCancelar={() => setEditando(false)}
          />
        </Modal>
      )}

      <section className="anl-card">
        <header className="anl-card-topo">
          <i className="fas fa-diagram-project" aria-hidden="true" />
          <h3>{t('match.player.map.title')}</h3>
        </header>
        <div
          className="ptd-segmentos anl-densidade"
          role="group"
          aria-label={t('match.player.map.density')}
        >
          {DENSIDADES.map((opcao) => (
            <button
              key={opcao.chave}
              type="button"
              className={`ptd-segmento${densidade === opcao.chave ? ' ptd-segmento--ativo' : ''}`}
              aria-pressed={densidade === opcao.chave}
              onClick={() => {
                setDensidade(opcao.chave)
                setSelecionado(null)
              }}
            >
              {t(`match.player.map.${opcao.chave}`)}
            </button>
          ))}
        </div>
        {rede.nos.length === 0 ? (
          <p className="anl-vazio">{t('match.player.map.empty')}</p>
        ) : (
          <>
            <MapaConfrontos
              ref={mapa}
              rede={rede}
              centro={{ id: jogadorId, nome: nome.principal }}
              nomeDe={(id) => nomes(id).principal}
              selecionado={selecionado}
              aoTocar={(id) => setSelecionado(id)}
              descricao={t('match.player.map.description', {
                name: nome.principal,
                count: rede.nos.length,
              })}
            />
            <ul className="anl-legenda">
              <li>
                <span style={{ background: corDoSaldo(-1) }} />
                {t('match.player.map.rival')}
              </li>
              <li>
                <span style={{ background: corDoSaldo(1) }} />
                {t('match.player.map.customer')}
              </li>
              <li>
                <span style={{ background: corDoSaldo(0) }} />
                {t('match.player.map.even')}
              </li>
            </ul>
            <button type="button" className="btn-contorno anl-compartilhar" onClick={compartilhar}>
              <i className="fas fa-share-nodes" aria-hidden="true" /> {t('match.player.share')}
            </button>
            {aviso && (
              <p className="anl-vazio" role="alert">
                {aviso}
              </p>
            )}
          </>
        )}
      </section>

      <CardGrafico
        titulo={t('match.player.charts.evolution')}
        icone="fa-chart-line"
        ajuda={t('match.player.charts.evolutionHelp')}
        vazio={evolucao.length < 2}
        textoVazio={vazio}
      >
        <GraficoLinha
          pontos={evolucao.map((ponto) => ({
            x: String(ponto.indice),
            y: ponto.acumulado,
            dica: `${ponto.indice}ª · ${comSinal(ponto.acumulado)}`,
          }))}
          zero
          formatar={(valor) => numero(Math.round(valor))}
          rotuloX={(indice) =>
            indice === 0 || indice === evolucao.length - 1 ? String(indice + 1) : null
          }
          descricao={t('match.player.charts.evolution')}
        />
      </CardGrafico>

      <CardGrafico
        titulo={t('match.player.charts.places')}
        icone="fa-chart-column"
        ajuda={t('match.player.charts.placesHelp')}
        vazio={resumo.partidas === 0}
        textoVazio={vazio}
      >
        <GraficoBarras
          barras={distribuicao.map((quantas, indice) => ({
            rotulo: t('match.result.place', { place: indice + 1 }),
            valor: quantas,
            texto: numero(quantas),
            dica: `${t('match.result.place', { place: indice + 1 })}: ${numero(quantas)}`,
          }))}
          descricao={t('match.player.charts.places')}
        />
      </CardGrafico>

      <CardGrafico
        titulo={t('match.player.charts.monthly')}
        icone="fa-calendar-days"
        ajuda={t('match.player.charts.monthlyHelp')}
        vazio={porMes.length === 0}
        textoVazio={vazio}
      >
        <GraficoLinha
          pontos={porMes.map((item) => ({
            x: mesCurto(item.mes),
            y: item.media,
            dica: `${mesCurto(item.mes)} · ${numero(item.media)} · ${t('match.ranking.rivals.together', { count: item.partidas })}`,
          }))}
          dominio={[1, 4]}
          marcas={[1, 2, 3, 4]}
          invertido
          formatar={(valor) => t('match.result.place', { place: Math.round(valor) })}
          rotuloX={(indice) =>
            porMes.length <= 6 || indice % Math.ceil(porMes.length / 6) === 0
              ? mesCurto(porMes[indice].mes)
              : null
          }
          descricao={t('match.player.charts.monthly')}
        />
      </CardGrafico>

      <CardGrafico
        titulo={t('match.player.charts.wind')}
        icone="fa-wind"
        ajuda={t('match.player.charts.windHelp')}
        vazio={resumo.partidas === 0}
        textoVazio={vazio}
      >
        <GraficoBarras
          barras={porVento.map((item) => ({
            rotulo: t(`match.player.winds.${item.vento}`),
            valor: item.media,
            texto: item.media === null ? '—' : numero(item.media),
            dica: `${t(`match.player.winds.${item.vento}`)}: ${item.media === null ? '—' : numero(item.media)} · ${t('match.ranking.rivals.together', { count: item.partidas })}`,
          }))}
          maximo={4}
          descricao={t('match.player.charts.wind')}
        />
      </CardGrafico>

      <CardGrafico
        titulo={t('match.player.charts.formats')}
        icone="fa-stopwatch"
        ajuda={t('match.player.charts.formatsHelp')}
        vazio={resumo.partidas === 0}
        textoVazio={vazio}
      >
        <div className="anl-formatos">
          {formatos.map((item) => (
            <div key={item.formato} className="anl-formato">
              <strong>
                {t(
                  `match.ranking.filters.durations.${item.formato === 'leste' ? 'leste' : 'hanchan'}`,
                )}
              </strong>
              <span className="anl-formato-partidas">
                {t('match.ranking.rivals.together', { count: item.partidas })}
              </span>
              <dl>
                <div>
                  <dt>{t('match.ranking.averagePlace')}</dt>
                  <dd>{item.media === null ? '—' : numero(item.media)}</dd>
                </div>
                <div>
                  <dt>{t('match.ranking.first')}</dt>
                  <dd>
                    {item.percentualPrimeiro === null ? '—' : `${numero(item.percentualPrimeiro)}%`}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </CardGrafico>

      <CardGrafico
        titulo={t('match.player.charts.partners')}
        icone="fa-user-group"
        ajuda={t('match.player.charts.partnersHelp')}
        vazio={parceiros.length === 0}
        textoVazio={vazio}
      >
        <GraficoBarrasHorizontais
          barras={parceiros.map((item) => ({
            rotulo: nomes(item.adversarioId).principal,
            valor: item.partidas,
            texto: `${numero(item.partidas)} · ${numero(item.vitorias)}–${numero(item.derrotas)}`,
            dica: `${nomes(item.adversarioId).principal}: ${t('match.ranking.rivals.together', { count: item.partidas })}, ${numero(item.vitorias)}–${numero(item.derrotas)}`,
          }))}
          descricao={t('match.player.charts.partners')}
        />
      </CardGrafico>

      {selecionado && (
        <FolhaConfronto
          eu={nome.principal}
          outro={nomes(selecionado).principal}
          detalhe={detalheDoConfronto(filtradas, jogadorId, selecionado)}
          aoAnalisar={() => {
            const proximo = selecionado
            setSelecionado(null)
            aoTrocarJogador(proximo)
          }}
          aoFechar={() => setSelecionado(null)}
        />
      )}
    </section>
  )
}
