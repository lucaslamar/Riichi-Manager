import { useCallback, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useRelogioVez } from '@/dominios/centerpiece/interface/hooks/useTimerVez'
import type { EstadoVez } from '@/dominios/centerpiece/logica/vez'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  CADEIRAS,
  colocacoes,
  dealerDaMao,
  desfazerUltimaMao,
  finalizar,
  pontosDaMao,
  registrarMao,
  TOTAL_MAOS,
  totais,
  ventoDaRodada,
  type MaoMcr,
  type PlacarMcr,
} from '../logica/placar'
import ModalMaoMcr from './ModalMaoMcr'
import { CHAVES_VENTO, nomeDaCadeira } from './nomes'
import { acoesPlacaresMcr } from './usePlacaresMcr'

/** Placar em andamento (ou finalizado): totais, timer da vez, mãos e ações. */
export default function PlacarAberto({
  placar,
  aoVoltar,
}: {
  placar: PlacarMcr
  aoVoltar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const [registrando, setRegistrando] = useState(false)
  const nomes = placar.jogadorIds.map((id) =>
    nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido')),
  )
  const pontos = totais(placar)
  const lugares = colocacoes(pontos)
  const indiceMao = placar.maos.length
  const emAndamento = !placar.finalizadoEm
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
    registrando,
  )

  const salvarMao = (mao: MaoMcr) => {
    atualizar((atual) => registrarMao(atual, mao))
    setRegistrando(false)
  }
  const confirmar = (chave: string) => window.confirm(t(chave))

  return (
    <div className="placar-mcr__aberto">
      <section className="card placar-mcr__secao" aria-labelledby="placar-mcr-situacao">
        <h3 id="placar-mcr-situacao" className="placar-mcr__titulo">
          {emAndamento
            ? t('placar.mcr.maoDe', {
                mao: numero(Math.min(indiceMao + 1, TOTAL_MAOS)),
                total: numero(TOTAL_MAOS),
              })
            : t('placar.mcr.finalizada')}
        </h3>
        {emAndamento && (
          <p className="placar-mcr__ajuda">
            {t('placar.mcr.rodadaDealer', {
              vento: t(CHAVES_VENTO[ventoDaRodada(indiceMao)]),
              dealer: nomes[dealerDaMao(indiceMao)],
            })}
          </p>
        )}
        {emAndamento && indiceMao >= TOTAL_MAOS && (
          <p className="placar-mcr__ajuda">{t('placar.mcr.partidaCompleta')}</p>
        )}

        <div className="placar-mcr__jogadores">
          {CADEIRAS.map((cadeira) => {
            const daVez = relogio.ligado && placar.vez.cadeira === cadeira
            return (
              <button
                key={cadeira}
                type="button"
                className={`placar-mcr__jogador${daVez ? ' placar-mcr__jogador--vez' : ''}${daVez && relogio.esgotado ? ' placar-mcr__jogador--esgotado' : ''}`}
                aria-label={t('placar.mcr.passarVezPara', { nome: nomes[cadeira] })}
                disabled={!relogio.ligado}
                onClick={() => relogio.passarPara(cadeira)}
              >
                <span className="placar-mcr__vento">
                  {t(CHAVES_VENTO[cadeira])}
                  {emAndamento &&
                    dealerDaMao(indiceMao) === cadeira &&
                    ` · ${t('placar.mcr.dealer')}`}
                </span>
                <span className="placar-mcr__nome">{nomes[cadeira]}</span>
                <strong className="placar-mcr__total">{numero(pontos[cadeira])}</strong>
                <span className="placar-mcr__lugar">
                  {t('placar.mcr.lugar', { lugar: numero(lugares[cadeira]) })}
                </span>
                {daVez && (
                  <span
                    className={`placar-mcr__timer${relogio.esgotado ? ' placar-mcr__timer--esgotado' : ''}`}
                    role="timer"
                    aria-label={t('match.timer.remaining', { seconds: relogio.segundos })}
                  >
                    <i className="fas fa-stopwatch" aria-hidden="true" /> {numero(relogio.segundos)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {relogio.ligado && (
          <div className="placar-mcr__acoes">
            <button type="button" className="btn-primario" onClick={relogio.tocar}>
              {t(placar.vez.comecou ? 'placar.mcr.proximaVez' : 'placar.mcr.comecarVez')}
            </button>
            {placar.vez.comecou && (
              <button type="button" className="btn-contorno" onClick={relogio.alternarPausa}>
                {t(relogio.contando ? 'placar.mcr.pausar' : 'placar.mcr.retomar')}
              </button>
            )}
          </div>
        )}

        {emAndamento && (
          <div className="placar-mcr__acoes">
            <button type="button" className="btn-primario" onClick={() => setRegistrando(true)}>
              {t('placar.mcr.registrarVitoria')}
            </button>
            <button
              type="button"
              className="btn-contorno"
              onClick={() => salvarMao({ tipo: 'empate' })}
            >
              {t('placar.mcr.empate')}
            </button>
          </div>
        )}
      </section>

      <section className="card placar-mcr__secao" aria-labelledby="placar-mcr-maos">
        <h3 id="placar-mcr-maos" className="placar-mcr__titulo">
          {t('placar.mcr.maos')}
        </h3>
        {placar.maos.length === 0 && <p className="placar-mcr__ajuda">{t('placar.mcr.semMaos')}</p>}
        <ol className="placar-mcr__historico">
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
      </section>

      <div className="placar-mcr__acoes">
        <button type="button" className="btn-contorno" onClick={aoVoltar}>
          {t('placar.mcr.voltarLista')}
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
        {emAndamento && (
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
        )}
        {!emAndamento && (
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

      {registrando && (
        <ModalMaoMcr nomes={nomes} aoSalvar={salvarMao} aoFechar={() => setRegistrando(false)} />
      )}
    </div>
  )
}
