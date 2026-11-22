import { useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import '@/dominios/centerpiece/interface/partida.css'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import PaginaTemporada from '@/dominios/torneio/interface/paginas/PaginaTemporada'
import PaginaTorneio from '@/dominios/torneio/interface/paginas/PaginaTorneio'
import { criarRascunho } from '@/dominios/torneio/logica/torneio'
import type { MesaTorneio, RodadaTorneio } from '@/dominios/torneio/logica/tipos'
import { novoPlacar, TIMER_PADRAO_SEGUNDOS } from '../logica/placar'
import PaginaEmAndamento from '@/dominios/centerpiece/interface/paginas/PaginaEmAndamento'
import RegistrarFinalizada from '@/dominios/centerpiece/interface/paginas/RegistrarFinalizada'
import PaginaListaClube from '@/dominios/centerpiece/interface/paginas/PaginaListaClube'
import PaginaMesasSorteadas from '@/dominios/centerpiece/interface/paginas/PaginaMesasSorteadas'
import { acoesClubeMcr, assentosDaMesa } from '@/dominios/centerpiece/interface/hooks/useClube'
import { mesasRegistradas, type MesaDoSorteio } from '@/dominios/centerpiece/logica/encontroClube'
import { useClube } from '@/dominios/centerpiece/interface/hooks/useClube'
import HistoricoPlacarMcr from './HistoricoPlacarMcr'
import NovoPlacarMcr from './NovoPlacarMcr'
import PlacarAberto from './PlacarAberto'
import { acoesPlacaresMcr, usePlacaresMcr } from './usePlacaresMcr'
import './placar-mcr.css'

type Vista =
  | { tipo: 'hub' }
  | { tipo: 'novo' }
  | { tipo: 'registrar' }
  | { tipo: 'torneio'; id: string }
  | { tipo: 'temporada'; id: string }
  | { tipo: 'listaClube' }
  | { tipo: 'mesasClube' }
  | { tipo: 'lista'; quais: 'andamento' | 'historico' }
  /** `torneioId`: mesa aberta pelo torneio, para onde o voltar leva. */
  | { tipo: 'placar'; id: string; torneioId?: string }

/** Entrada do hub: a mesma tela em cartões da Partida do Riichi. Novas entradas entram na lista. */
interface EntradaHub {
  chave: string
  icone: string
  titulo: string
  texto: string
  desabilitada?: boolean
  aoTocar: () => void
}

/**
 * Placar do modo Chinês, no mesmo formato da Partida do Riichi: o hub em cartões,
 * a Nova partida, a mesa e as listas. Os placares ficam numa tabela própria.
 */
export default function PaginaPlacarMcr() {
  const { t, idioma } = useI18n()
  const placares = usePlacaresMcr()
  const { torneios, salvar: salvarTorneio } = useTorneios()
  const { sorteio } = useClube()
  /** Mesa do clube: abre o placar dela, ou cria um com os assentos do sorteio. */
  const abrirMesaDoClube = (mesa: MesaDoSorteio) => {
    if (!sorteio) return
    const existente = placares.find((placar) => placar.id === mesa.partidaId)
    if (existente) {
      setVista({ tipo: 'placar', id: existente.id })
      return
    }
    const { ids, nomes } = assentosDaMesa(mesa)
    const id = gerarId()
    const convidados = Object.fromEntries(
      ids.flatMap((jogadorId, indice) =>
        mesa.assentos[indice].jogador.jogadorId ? [] : [[jogadorId, nomes[indice]]],
      ),
    )
    acoesPlacaresMcr.criar({
      ...novoPlacar(
        id,
        [...ids] as [string, string, string, string],
        TIMER_PADRAO_SEGUNDOS,
        new Date().toISOString(),
      ),
      encontro: { id: sorteio.encontro.id, mesa: mesa.numero },
      ...(Object.keys(convidados).length ? { convidados } : {}),
    })
    acoesClubeMcr.marcarRegistrada(mesa.numero, id)
    setVista({ tipo: 'placar', id })
  }
  const [vista, setVista] = useState<Vista>({ tipo: 'hub' })
  // O mesmo Torneio do Riichi: continua no que está em jogo ou no rascunho, senão cria um.
  const torneioAtivo = [...torneios]
    .filter((torneio) => torneio.status !== 'finalizado' && !torneio.transferidoEm)
    .sort((um, outro) => outro.atualizadoEm.localeCompare(um.atualizadoEm))[0]
  const criarTorneio = () => {
    const agora = new Date()
    const data = new Intl.DateTimeFormat(idioma, { day: '2-digit', month: '2-digit' }).format(agora)
    const novo = criarRascunho({
      id: gerarId(),
      agora,
      nome: t('tournament.defaultName', { date: data }),
    })
    salvarTorneio(novo)
    return novo.id
  }
  /** Mesa do torneio: abre o placar dela, ou cria um com os assentos do sorteio. */
  const abrirMesaDoTorneio = (torneioId: string, rodada: RodadaTorneio, mesa: MesaTorneio) => {
    const vinculo = { id: torneioId, rodada: rodada.numero - 1, mesa: mesa.numero - 1 }
    const existente = placares.find(
      (placar) =>
        placar.torneio?.id === torneioId &&
        placar.torneio.rodada === vinculo.rodada &&
        placar.torneio.mesa === vinculo.mesa,
    )
    const id = existente?.id ?? gerarId()
    if (!existente) {
      acoesPlacaresMcr.criar({
        ...novoPlacar(id, mesa.assentos, TIMER_PADRAO_SEGUNDOS, new Date().toISOString()),
        torneio: vinculo,
        convidados: torneios.find((torneio) => torneio.id === torneioId)?.convidados,
      })
    }
    setVista({ tipo: 'placar', id, torneioId })
  }
  const aberto =
    vista.tipo === 'placar' ? placares.find((placar) => placar.id === vista.id) : undefined
  const voltar = () => setVista({ tipo: 'hub' })
  const abrir = (id: string) => setVista({ tipo: 'placar', id })
  // Como no Riichi: as mesas avulsas abertas e os torneios em jogo (as mesas deles ficam no torneio).
  const emAndamento = placares.filter((placar) => !placar.finalizadoEm && !placar.torneio)
  const torneiosEmJogo = torneios.filter(
    (torneio) => torneio.status === 'em_andamento' && !torneio.transferidoEm,
  )
  // O encontro do clube com mesa sem resultado conta, como no Riichi.
  const clubePendente =
    sorteio &&
    mesasRegistradas(
      sorteio,
      placares.filter((placar) => placar.finalizadoEm),
    ) < sorteio.mesas.length
      ? 1
      : 0
  const totalEmAndamento = emAndamento.length + torneiosEmJogo.length + clubePendente
  const finalizados = placares
    .filter((placar) => placar.finalizadoEm)
    .sort((um, outro) => (outro.finalizadoEm ?? '').localeCompare(um.finalizadoEm ?? ''))

  // Nova partida e mesa ocupam a tela, como as do Riichi, com o próprio título.
  if (vista.tipo === 'novo') {
    return <NovoPlacarMcr aoCriar={abrir} aoVoltar={voltar} />
  }
  if (vista.tipo === 'registrar') {
    return (
      <RegistrarFinalizada
        aoVoltar={voltar}
        aoRegistrar={() => setVista({ tipo: 'lista', quais: 'historico' })}
      />
    )
  }
  if (vista.tipo === 'torneio') {
    return (
      <PaginaTorneio
        key={vista.id}
        torneioId={vista.id}
        aoVoltar={voltar}
        aoAbrirTorneio={(id) => setVista({ tipo: 'torneio', id })}
        aoAbrirTemporada={(id) => setVista({ tipo: 'temporada', id })}
        aoLancarResultado={(rodada, mesa) => abrirMesaDoTorneio(vista.id, rodada, mesa)}
      />
    )
  }
  // Clube: as mesmas telas do Riichi. Cada mesa sorteada vira um placar MCR.
  if (vista.tipo === 'listaClube') {
    return <PaginaListaClube aoVoltar={voltar} aoSortear={() => setVista({ tipo: 'mesasClube' })} />
  }
  if (vista.tipo === 'mesasClube') {
    return <PaginaMesasSorteadas aoVoltar={voltar} aoRegistrarMesa={abrirMesaDoClube} />
  }
  if (vista.tipo === 'temporada') {
    return (
      <PaginaTemporada
        temporadaId={vista.id}
        aoVoltar={voltar}
        aoAbrirEncontro={(encontro) => setVista({ tipo: 'torneio', id: encontro.id })}
      />
    )
  }
  if (vista.tipo === 'placar' && aberto) {
    const { torneioId } = vista
    return (
      <PlacarAberto
        placar={aberto}
        aoVoltar={torneioId ? () => setVista({ tipo: 'torneio', id: torneioId }) : voltar}
      />
    )
  }

  if (vista.tipo === 'lista' && vista.quais === 'historico') {
    return (
      <HistoricoPlacarMcr
        finalizados={finalizados}
        aoVoltar={voltar}
        aoAbrir={abrir}
        aoAbrirTorneio={(id) => setVista({ tipo: 'torneio', id })}
        aoAbrirTemporada={(id) => setVista({ tipo: 'temporada', id })}
      />
    )
  }
  if (vista.tipo === 'lista') {
    // A mesma tela Em andamento do Riichi, com os placares MCR e os torneios em jogo.
    return (
      <PaginaEmAndamento
        aoVoltar={voltar}
        aoAbrirMesa={abrir}
        aoAbrirSorteio={() => setVista({ tipo: 'mesasClube' })}
        aoAbrirTorneio={(id) => setVista({ tipo: 'torneio', id })}
      />
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
      texto: torneioAtivo ? torneioAtivo.nome : t('tournament.create'),
      aoTocar: () => setVista({ tipo: 'torneio', id: torneioAtivo?.id ?? criarTorneio() }),
    },
    {
      chave: 'clube',
      icone: 'fa-table-cells-large',
      titulo: t('match.home.clubTitle'),
      texto: t('match.home.clubHelp'),
      aoTocar: () => setVista({ tipo: 'listaClube' }),
    },
    {
      chave: 'andamento',
      icone: 'fa-hourglass-half',
      titulo: t('match.home.inProgress'),
      texto: t('match.home.inProgressCount', { count: totalEmAndamento }),
      // Só uma partida aberta e nada mais: vai direto para ela, como no Riichi.
      aoTocar: () =>
        emAndamento.length === 1 && totalEmAndamento === 1
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
    {
      chave: 'registrar',
      icone: 'fa-clipboard-check',
      titulo: t('match.manual.title'),
      texto: t('placar.mcr.sumula.cartao'),
      aoTocar: () => setVista({ tipo: 'registrar' }),
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
    </section>
  )
}
