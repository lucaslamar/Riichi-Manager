import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BotaoTelaCheia from '@/compartilhado/interface/componentes/BotaoTelaCheia'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import MesaQuadrada from '@/dominios/centerpiece/interface/componentes/MesaQuadrada'
import PlacaJogador from '@/dominios/centerpiece/interface/componentes/PlacaJogador'
import { useRelogioVez } from '@/dominios/centerpiece/interface/hooks/useTimerVez'
import {
  CHAVE_VENTO,
  KANJI_VENTO,
  ORDEM_VENTOS,
  ventoDaCadeira,
} from '@/dominios/centerpiece/logica/partida'
import type { EstadoVez } from '@/dominios/centerpiece/logica/vez'
import '@/dominios/centerpiece/interface/partida.css'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  CADEIRAS,
  dealerDaMao,
  desfazerUltimaMao,
  finalizar,
  MAOS_POR_RODADA,
  pontosDaMao,
  registrarMao,
  TOTAL_MAOS,
  totais,
  ventoDaRodada,
  type Cadeira,
  type MaoMcr,
  type PlacarMcr,
} from '../logica/placar'
import ModalMaoMcr from './ModalMaoMcr'
import { nomeDaCadeira } from './nomes'
import { acoesPlacaresMcr } from './usePlacaresMcr'

/**
 * Mesa do placar MCR com o mesmo layout da mesa do Riichi: as placas dos
 * jogadores em volta, o centro com a rodada e o timer da vez. Muda só a regra:
 * 8 pontos obrigatórios, sem honba nem palitos, e o dealer passa a cada mão.
 */
export default function PlacarAberto({
  placar,
  aoVoltar,
}: {
  placar: PlacarMcr
  aoVoltar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const [vencedorEscolhido, setVencedorEscolhido] = useState<Cadeira | null>(null)
  const [maosAbertas, setMaosAbertas] = useState(false)
  const nomes = placar.jogadorIds.map((id) =>
    nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido'), placar.convidados),
  )
  const pontos = totais(placar)
  const indiceMao = placar.maos.length
  const emAndamento = !placar.finalizadoEm
  const dealer = dealerDaMao(indiceMao)
  const rodada = ORDEM_VENTOS[ventoDaRodada(indiceMao)]
  const numeroNaRodada = (Math.min(indiceMao, TOTAL_MAOS - 1) % MAOS_POR_RODADA) + 1
  const atualizar = (transformar: (atual: PlacarMcr) => PlacarMcr) =>
    acoesPlacaresMcr.atualizar(placar.id, transformar)

  const atualizarVez = useCallback(
    (transformar: (vez: EstadoVez) => EstadoVez) =>
      acoesPlacaresMcr.atualizar(placar.id, (atual) => ({ ...atual, vez: transformar(atual.vez) })),
    [placar.id],
  )
  const relogio = useRelogioVez(
    placar.vez,
    emAndamento ? placar.timerSegundos : 0,
    atualizarVez,
    vencedorEscolhido !== null,
  )

  const salvarMao = (mao: MaoMcr) => {
    atualizar((atual) => registrarMao(atual, mao))
    setVencedorEscolhido(null)
  }
  const confirmar = (chave: string) => window.confirm(t(chave))

  return (
    <section className="mesa-tela">
      <TituloTela titulo={t('menu.scoreMcr')} aoVoltar={aoVoltar} acoes={<BotaoTelaCheia />} />

      <p className="placar-mcr__situacao" aria-live="polite">
        {emAndamento
          ? t('placar.mcr.maoDe', {
              mao: numero(Math.min(indiceMao + 1, TOTAL_MAOS)),
              total: numero(TOTAL_MAOS),
            })
          : t('placar.mcr.finalizada')}
        {emAndamento && indiceMao >= TOTAL_MAOS && ` · ${t('placar.mcr.partidaCompleta')}`}
      </p>

      <div className="mesa-centro-tela">
        <MesaQuadrada
          cadeiraDealer={dealer}
          aoTocarMesa={relogio.ligado ? relogio.tocar : undefined}
          aoTocarDomo={relogio.ligado ? relogio.alternarPausa : undefined}
          rotuloDomo={t(relogio.contando ? 'match.timer.pause' : 'match.timer.resume')}
          domo={
            <>
              <span className="mesa-domo-rodada" aria-hidden="true">
                {KANJI_VENTO[rodada]}
                {numeroNaRodada}
              </span>
              <span className="sr-only">
                {t('match.table.round', { wind: t(CHAVE_VENTO[rodada]), number: numeroNaRodada })}
              </span>
              <span className="mesa-domo-info">
                {relogio.ligado && placar.vez.comecou && !relogio.contando && (
                  <i className="fas fa-pause" aria-hidden="true" />
                )}{' '}
                {t('placar.mcr.maoCurta', { mao: numero(Math.min(indiceMao + 1, TOTAL_MAOS)) })}
              </span>
            </>
          }
          lado={(cadeira) => ({
            placa: (
              <PlacaJogador
                nome={nomes[cadeira]}
                vento={ventoDaCadeira(cadeira, dealer)}
                pontos={pontos[cadeira]}
                emRiichi={false}
                timer={
                  relogio.ligado && placar.vez.cadeira === cadeira
                    ? {
                        segundos: relogio.segundos,
                        fracao: relogio.fracao,
                        esgotado: relogio.esgotado,
                      }
                    : undefined
                }
                daVez={placar.vez.cadeira === cadeira}
                // Tocar na placa: registrar a vitória desse jogador.
                aoAbrirMenu={() => emAndamento && setVencedorEscolhido(cadeira)}
                aoSegurar={() => undefined}
              />
            ),
          })}
        />
      </div>

      <div className="mesa-acoes">
        {emAndamento && (
          <>
            <button
              type="button"
              className="mesa-btn-principal"
              onClick={() => setVencedorEscolhido(placar.vez.cadeira as Cadeira)}
            >
              {t('placar.mcr.registrarVitoria')}
            </button>
            <button
              type="button"
              className="mesa-btn-principal"
              onClick={() => salvarMao({ tipo: 'empate' })}
            >
              {t('placar.mcr.empate')}
            </button>
          </>
        )}
        <div className="placar-mcr__acoes">
          <button
            type="button"
            className="btn-contorno"
            aria-expanded={maosAbertas}
            onClick={() => setMaosAbertas(!maosAbertas)}
          >
            {t('placar.mcr.maos')} ({numero(placar.maos.length)})
          </button>
          {emAndamento && placar.maos.length > 0 && (
            <button
              type="button"
              className="btn-contorno"
              onClick={() =>
                confirmar('placar.mcr.confirmarDesfazer') && atualizar(desfazerUltimaMao)
              }
            >
              {t('placar.mcr.desfazer')}
            </button>
          )}
          {emAndamento ? (
            <button
              type="button"
              className="btn-contorno"
              onClick={() =>
                confirmar('placar.mcr.confirmarFinalizar') &&
                atualizar((atual) => finalizar(atual, new Date().toISOString()))
              }
            >
              {t('placar.mcr.finalizar')}
            </button>
          ) : (
            <button
              type="button"
              className="btn-perigo"
              onClick={() => {
                if (!confirmar('placar.mcr.confirmarExcluir')) return
                acoesPlacaresMcr.excluir(placar.id)
                aoVoltar()
              }}
            >
              {t('placar.mcr.excluir')}
            </button>
          )}
        </div>

        {maosAbertas && (
          <ol className="placar-mcr__historico">
            {placar.maos.length === 0 && <li>{t('placar.mcr.semMaos')}</li>}
            {placar.maos.map((mao, indice) => {
              const deltas = pontosDaMao(mao)
              return (
                <li key={indice}>
                  <span>
                    {mao.tipo === 'empate'
                      ? t('placar.mcr.historicoEmpate')
                      : mao.forma === 'tsumo'
                        ? t('placar.mcr.historicoTsumo', {
                            nome: nomes[mao.vencedor],
                            fan: numero(mao.fan),
                          })
                        : t('placar.mcr.historicoRon', {
                            nome: nomes[mao.vencedor],
                            descartador: nomes[mao.descartador!],
                            fan: numero(mao.fan),
                          })}
                  </span>
                  {mao.tipo === 'vitoria' && (
                    <span className="placar-mcr__deltas">
                      {CADEIRAS.map((cadeira) => (
                        <span key={cadeira}>
                          {nomes[cadeira]}{' '}
                          {(deltas[cadeira] > 0 ? '+' : '') + numero(deltas[cadeira])}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {vencedorEscolhido !== null && (
        <ModalMaoMcr
          nomes={nomes}
          vencedorInicial={vencedorEscolhido}
          aoSalvar={salvarMao}
          aoFechar={() => setVencedorEscolhido(null)}
        />
      )}
    </section>
  )
}
