import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import '@/dominios/centerpiece/interface/partida.css'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { colocacoes, totais, type PlacarMcr } from '../logica/placar'
import { nomeDaCadeira } from './nomes'
import NovoPlacarMcr from './NovoPlacarMcr'
import PlacarAberto from './PlacarAberto'
import TorneioMcrTela, { ModalNovoTorneioMcr } from './TorneioMcrTela'
import { acoesPlacaresMcr, usePlacaresMcr } from './usePlacaresMcr'
import { useTorneiosMcr } from './useTorneiosMcr'
import './placar-mcr.css'

type Vista =
  | { tipo: 'hub' }
  | { tipo: 'novo'; torneioId?: string }
  | { tipo: 'torneio'; id: string }
  | { tipo: 'lista'; quais: 'andamento' | 'historico' }
  | { tipo: 'placar'; id: string }

/** Entrada do hub: a mesma tela em cartões da Partida do Riichi. Novas entradas entram na lista. */
interface EntradaHub {
  chave: string
  icone: string
  titulo: string
  texto: string
  desabilitada?: boolean
  aoTocar: () => void
}

const ULTIMAS_NO_HUB = 3

/** Linha de uma partida nas listas: data, situação, mãos, o primeiro colocado e os totais. */
export function LinhaPlacar({ placar, aoAbrir }: { placar: PlacarMcr; aoAbrir: () => void }) {
  const { t, numero, idioma } = useI18n()
  const { jogadores } = useJogadores()
  const pontos = totais(placar)
  const primeiro = colocacoes(pontos).indexOf(1)
  const nome = (id: string) => nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido'))
  return (
    <li>
      <button type="button" className="card placar-mcr__item" onClick={aoAbrir}>
        <span className="placar-mcr__vento">
          {new Date(placar.finalizadoEm ?? placar.criadoEm).toLocaleDateString(idioma)} ·{' '}
          {t(placar.finalizadoEm ? 'placar.mcr.finalizada' : 'placar.mcr.emAndamento')} ·{' '}
          {placar.maos.length
            ? t('placar.mcr.qtdMaos', { count: placar.maos.length })
            : t('placar.mcr.nenhumaMao')}
        </span>
        {placar.maos.length > 0 && (
          <strong>
            {t('placar.mcr.primeiro', {
              nome: nome(placar.jogadorIds[primeiro]),
              pontos: (pontos[primeiro] > 0 ? '+' : '') + numero(pontos[primeiro]),
            })}
          </strong>
        )}
        <span className="placar-mcr__resumo">
          {placar.jogadorIds.map((id, cadeira) => (
            <span key={cadeira}>
              {nome(id)} {numero(pontos[cadeira])}
            </span>
          ))}
        </span>
      </button>
    </li>
  )
}

/**
 * Placar do modo Chinês, no mesmo formato da Partida do Riichi: o hub em cartões,
 * a Nova partida, a mesa e as listas. Os placares ficam numa tabela própria.
 */
export default function PaginaPlacarMcr() {
  const { t } = useI18n()
  const placares = usePlacaresMcr()
  const torneios = useTorneiosMcr()
  const [vista, setVista] = useState<Vista>({ tipo: 'hub' })
  const [criandoTorneio, setCriandoTorneio] = useState(false)
  const torneioAtivo = torneios.find((torneio) => !torneio.encerradoEm)
  const aberto =
    vista.tipo === 'placar' ? placares.find((placar) => placar.id === vista.id) : undefined
  const voltar = () => setVista({ tipo: 'hub' })
  const abrir = (id: string) => setVista({ tipo: 'placar', id })
  const emAndamento = placares.filter((placar) => !placar.finalizadoEm)
  const finalizados = placares
    .filter((placar) => placar.finalizadoEm)
    .sort((um, outro) => (outro.finalizadoEm ?? '').localeCompare(um.finalizadoEm ?? ''))

  // Nova partida e mesa ocupam a tela, como as do Riichi, com o próprio título.
  if (vista.tipo === 'novo') {
    const torneio = torneios.find((candidato) => candidato.id === vista.torneioId)
    return <NovoPlacarMcr aoCriar={abrir} aoVoltar={voltar} torneio={torneio} />
  }
  if (vista.tipo === 'torneio') {
    const torneio = torneios.find((candidato) => candidato.id === vista.id)
    if (torneio) {
      return (
        <TorneioMcrTela
          torneio={torneio}
          placares={placares}
          aoVoltar={voltar}
          aoNovaMesa={() => setVista({ tipo: 'novo', torneioId: torneio.id })}
          aoAbrirMesa={abrir}
          linha={LinhaPlacar}
        />
      )
    }
  }
  if (vista.tipo === 'placar' && aberto) return <PlacarAberto placar={aberto} aoVoltar={voltar} />

  if (vista.tipo === 'lista') {
    const lista = vista.quais === 'andamento' ? emAndamento : finalizados
    return (
      <section className="ptd-inicio">
        <TituloTela
          titulo={t(vista.quais === 'andamento' ? 'match.home.inProgress' : 'match.home.history')}
          aoVoltar={voltar}
        />
        {lista.length === 0 && (
          <p className="placar-mcr__ajuda">{t('placar.mcr.nenhumaPartida')}</p>
        )}
        <ul className="placar-mcr__lista">
          {lista.map((placar) => (
            <LinhaPlacar key={placar.id} placar={placar} aoAbrir={() => abrir(placar.id)} />
          ))}
        </ul>
        {vista.quais === 'historico' && finalizados.length > 0 && (
          <button
            type="button"
            className="btn-perigo placar-mcr__apagar-tudo"
            onClick={() => {
              if (
                !window.confirm(
                  t('placar.mcr.confirmarApagarHistorico', { count: finalizados.length }),
                )
              )
                return
              finalizados.forEach((placar) => acoesPlacaresMcr.excluir(placar.id))
            }}
          >
            {t('placar.mcr.apagarHistorico')}
          </button>
        )}
      </section>
    )
  }

  const entradas: EntradaHub[] = [
    {
      chave: 'nova',
      icone: 'fa-plus',
      titulo: t('match.home.newGame'),
      texto: t('placar.mcr.novaPartidaAjuda'),
      aoTocar: () => setVista({ tipo: 'novo' }),
    },
    {
      chave: 'torneio',
      icone: 'fa-trophy',
      titulo: t('tournament.title'),
      texto: torneioAtivo ? torneioAtivo.nome : t('placar.mcr.torneio.ajuda'),
      // Um torneio aberto por vez: o cartão volta para ele, senão cria um novo.
      aoTocar: () =>
        torneioAtivo ? setVista({ tipo: 'torneio', id: torneioAtivo.id }) : setCriandoTorneio(true),
    },
    {
      chave: 'andamento',
      icone: 'fa-hourglass-half',
      titulo: t('match.home.inProgress'),
      texto: t('match.home.inProgressCount', { count: emAndamento.length }),
      // Só uma partida aberta: vai direto para ela, como no Riichi.
      aoTocar: () =>
        emAndamento.length === 1
          ? abrir(emAndamento[0].id)
          : setVista({ tipo: 'lista', quais: 'andamento' }),
    },
    {
      chave: 'historico',
      icone: 'fa-clock-rotate-left',
      titulo: t('match.home.history'),
      texto: finalizados.length
        ? t('placar.mcr.qtdPartidas', { count: finalizados.length })
        : t('placar.mcr.nenhumaPartida'),
      aoTocar: () => setVista({ tipo: 'lista', quais: 'historico' }),
    },
  ]

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={t('menu.scoreMcr')} acoes={<BotaoConfiguracoes />} />
      <div className="ptd-cards">
        {entradas.map((entrada) => (
          <button
            key={entrada.chave}
            type="button"
            className="ptd-card-inicio"
            disabled={entrada.desabilitada}
            onClick={entrada.aoTocar}
          >
            <i className={`fas ${entrada.icone}`} aria-hidden="true" />
            <strong>{entrada.titulo}</strong>
            <span>{entrada.texto}</span>
          </button>
        ))}
      </div>

      <h3 className="placar-mcr__titulo placar-mcr__ultimas">{t('placar.mcr.ultimas')}</h3>
      {finalizados.length === 0 && (
        <p className="placar-mcr__ajuda">{t('placar.mcr.nenhumaPartida')}</p>
      )}
      <ul className="placar-mcr__lista">
        {finalizados.slice(0, ULTIMAS_NO_HUB).map((placar) => (
          <LinhaPlacar key={placar.id} placar={placar} aoAbrir={() => abrir(placar.id)} />
        ))}
      </ul>
      {finalizados.length > ULTIMAS_NO_HUB && (
        <button
          type="button"
          className="btn-contorno"
          onClick={() => setVista({ tipo: 'lista', quais: 'historico' })}
        >
          {t('placar.mcr.verHistorico')}
        </button>
      )}

      {criandoTorneio && (
        <ModalNovoTorneioMcr
          aoFechar={() => setCriandoTorneio(false)}
          aoCriar={(torneio) => {
            setCriandoTorneio(false)
            setVista({ tipo: 'torneio', id: torneio.id })
          }}
        />
      )}
    </section>
  )
}
