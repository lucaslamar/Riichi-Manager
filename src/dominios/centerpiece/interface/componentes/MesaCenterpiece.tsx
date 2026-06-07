import { useState } from 'react'
import type { EstadoCenterpiece, ResultadoRon, ResultadoTsumo, TipoVitoria } from '../../logica/tipos'
import type { ModalCenterpiece } from '../hooks/useCenterpiece'
import CardJogadorMesa from './CardJogadorMesa'
import PainelCentralMesa from './PainelCentralMesa'
import MenuAcaoJogador from './MenuAcaoJogador'
import ModalRegistrarBatida, { type ContextoCalcMao } from './ModalRegistrarBatida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'
import ModalRiichi from './ModalRiichi'
import ModalRyukyoku from './ModalRyukyoku'
import ModalChombo from './ModalChombo'

interface PropsMesaCenterpiece {
  estado: EstadoCenterpiece
  modalAberto: ModalCenterpiece
  mensagemDesfazer: string | null
  aoAbrirModal: (modal: ModalCenterpiece) => void
  aoRegistrarRon: (r: ResultadoRon) => void
  aoRegistrarTsumo: (r: ResultadoTsumo) => void
  aoDeclararRiichi: (jogadorId: string) => void
  aoRegistrarRyukyoku: (tenpaiIds: string[]) => void
  aoRegistrarChomboPadrao: (jogadorId: string) => void
  aoRegistrarChomboManual: (jogadorId: string, valorPorJogador: number) => void
  aoDesfazer: () => void
  aoReiniciar: () => void
  aoAbrirCalculadoraMao: (contexto: ContextoCalcMao, aoReceberResultado: (r: ResultadoCalculoParaCenterpiece) => void) => void
}

/**
 * Encontra o jogador pela POSIÇÃO FÍSICA na mesa.
 * Posição nunca muda durante a partida — só o vento muda.
 * NUNCA usar vento para decidir onde renderizar.
 */
function jogadorNaPosicao(
  jogadores: EstadoCenterpiece['jogadores'],
  posicao: EstadoCenterpiece['jogadores'][number]['posicao'],
) {
  return jogadores.find((j) => j.posicao === posicao)
}

export default function MesaCenterpiece({
  estado,
  modalAberto,
  mensagemDesfazer,
  aoAbrirModal,
  aoRegistrarRon,
  aoRegistrarTsumo,
  aoDeclararRiichi,
  aoRegistrarRyukyoku,
  aoRegistrarChomboPadrao,
  aoRegistrarChomboManual,
  aoDesfazer,
  aoReiniciar,
  aoAbrirCalculadoraMao,
}: PropsMesaCenterpiece) {
  const topo     = jogadorNaPosicao(estado.jogadores, 'topo')
  const direita  = jogadorNaPosicao(estado.jogadores, 'direita')
  const baixo    = jogadorNaPosicao(estado.jogadores, 'baixo')
  const esquerda = jogadorNaPosicao(estado.jogadores, 'esquerda')

  const [jogadorMenuId, setJogadorMenuId] = useState<string | null>(null)
  const [batidaInicial, setBatidaInicial] = useState<{ vencedorId: string; tipoVitoria: TipoVitoria } | null>(null)
  const [chomboInicialId, setChomboInicialId] = useState<string | null>(null)

  const jogadorMenu = jogadorMenuId ? estado.jogadores.find((j) => j.id === jogadorMenuId) : null

  const aoAbrirMenuCard = (jogadorId: string) => setJogadorMenuId(jogadorId)
  const aoFecharMenu = () => setJogadorMenuId(null)

  const aoGanhouRon = (jogadorId: string) => {
    setBatidaInicial({ vencedorId: jogadorId, tipoVitoria: 'ron' })
    aoAbrirModal('batida')
    setJogadorMenuId(null)
  }

  const aoGanhouTsumo = (jogadorId: string) => {
    setBatidaInicial({ vencedorId: jogadorId, tipoVitoria: 'tsumo' })
    aoAbrirModal('batida')
    setJogadorMenuId(null)
  }

  const aoDeuChombo = (jogadorId: string) => {
    setChomboInicialId(jogadorId)
    aoAbrirModal('chombo')
    setJogadorMenuId(null)
  }

  const aoRiichiPeloMenu = (jogadorId: string) => {
    aoDeclararRiichi(jogadorId)
    setJogadorMenuId(null)
  }

  const aoFecharBatida = () => {
    aoAbrirModal(null)
    setBatidaInicial(null)
  }

  const aoFecharChombo = () => {
    aoAbrirModal(null)
    setChomboInicialId(null)
  }

  return (
    <div className="centerpiece-mesa">
      <div className="cp-compass">
        <div className="cp-area-topo">
          {topo && (
            <CardJogadorMesa
              jogador={topo}
              aoDeclararRiichi={aoDeclararRiichi}
              aoClicar={aoAbrirMenuCard}
            />
          )}
        </div>
        <div className="cp-area-esquerda">
          {esquerda && (
            <CardJogadorMesa
              jogador={esquerda}
              aoDeclararRiichi={aoDeclararRiichi}
              aoClicar={aoAbrirMenuCard}
            />
          )}
        </div>
        <div className="cp-area-centro">
          <PainelCentralMesa
            estado={estado}
            podDesfazer={estado.historico.length > 0}
            mensagemDesfazer={mensagemDesfazer}
            aoAbrirModal={aoAbrirModal}
            aoDesfazer={aoDesfazer}
            aoReiniciar={aoReiniciar}
          />
        </div>
        <div className="cp-area-direita">
          {direita && (
            <CardJogadorMesa
              jogador={direita}
              aoDeclararRiichi={aoDeclararRiichi}
              aoClicar={aoAbrirMenuCard}
            />
          )}
        </div>
        <div className="cp-area-baixo">
          {baixo && (
            <CardJogadorMesa
              jogador={baixo}
              aoDeclararRiichi={aoDeclararRiichi}
              aoClicar={aoAbrirMenuCard}
            />
          )}
        </div>
      </div>

      {jogadorMenu && (
        <MenuAcaoJogador
          jogador={jogadorMenu}
          aoGanhouRon={() => aoGanhouRon(jogadorMenu.id)}
          aoGanhouTsumo={() => aoGanhouTsumo(jogadorMenu.id)}
          aoDeuChombo={() => aoDeuChombo(jogadorMenu.id)}
          aoDeclararRiichi={() => aoRiichiPeloMenu(jogadorMenu.id)}
          aoFechar={aoFecharMenu}
        />
      )}

      {modalAberto === 'batida' && (
        <ModalRegistrarBatida
          estado={estado}
          aoRegistrarRon={aoRegistrarRon}
          aoRegistrarTsumo={aoRegistrarTsumo}
          initialVencedorId={batidaInicial?.vencedorId}
          initialTipoVitoria={batidaInicial?.tipoVitoria}
          aoFechar={aoFecharBatida}
          aoAbrirCalculadoraMao={aoAbrirCalculadoraMao}
        />
      )}
      {modalAberto === 'riichi' && (
        <ModalRiichi
          estado={estado}
          aoConfirmar={aoDeclararRiichi}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
      {modalAberto === 'ryukyoku' && (
        <ModalRyukyoku
          estado={estado}
          aoConfirmar={aoRegistrarRyukyoku}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
      {modalAberto === 'chombo' && (
        <ModalChombo
          estado={estado}
          aoConfirmarPadrao={aoRegistrarChomboPadrao}
          aoConfirmarManual={aoRegistrarChomboManual}
          initialJogadorId={chomboInicialId ?? undefined}
          aoFechar={aoFecharChombo}
        />
      )}
    </div>
  )
}
