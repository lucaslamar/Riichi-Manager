import { useEffect, useRef, type ReactNode } from 'react'
import AdSlot from '@/compartilhado/interface/componentes/AdSlot'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { PaginaFinalizacaoMao } from '../../finalizacao-mao/paginas/PaginaFinalizacaoMao'
import { PaginaMontagemMao } from '../../montagem-mao/paginas/PaginaMontagemMao'

interface PropsModoCompleto {
  estado: EstadoCalculadoraMao
  cabecalho: ReactNode
  aoAbrirRegras: () => void
}

/**
 * Organiza o modo completo em etapas internas: montar, finalizar e ver resultado.
 * A separacao e apenas de interface; o motor de calculo continua nos hooks/logica existentes.
 */
export default function ModoCompletoCalculadora({
  estado,
  cabecalho,
  aoAbrirRegras,
}: PropsModoCompleto) {
  const { t } = useI18n()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const finalizandoMao = estado.etapaFinalizacaoAtiva && estado.maoProntaParaFinalizar
  const mostrandoEsperas = estado.slotsUsados === 13
  const slotsEstruturais = Math.min(estado.slotsUsados, 14)
  const sufixoFisico =
    estado.totalPedras !== estado.slotsUsados
      ? ` • ${t('calculator.physicalTilesShort', { total: estado.totalPedras })}`
      : ''
  const rotuloMaoFinalizacao = `${t('calculator.completeHand')} ${slotsEstruturais}/14${sufixoFisico}`
  const acoesContextuais = [
    ...(finalizandoMao
      ? [
          {
            chave: 'editar',
            rotulo: t('actions.editHand'),
            icone: 'fa-pen',
            aoClicar: estado.voltarParaMontagem,
            destaque: true,
          },
        ]
      : []),
    { chave: 'regras', rotulo: t('actions.rules'), icone: 'fa-gear', aoClicar: aoAbrirRegras },
    { chave: 'limpar', rotulo: t('actions.clear'), icone: 'fa-broom', aoClicar: estado.limpar },
  ]

  useEffect(() => {
    if (!finalizandoMao) return
    window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [finalizandoMao])

  return (
    <div
      ref={cardRef}
      className={`card card-mao-completa fluxo-calculadora ${finalizandoMao ? 'etapa-finalizacao' : 'etapa-montagem'}`}
    >
      {cabecalho}

      {!finalizandoMao ? (
        <section className="calculadora-etapa calculadora-etapa-montagem" aria-labelledby="titulo-etapa-montagem">
          <h3 id="titulo-etapa-montagem" className="sr-only">{t('calculator.stepBuild')}</h3>
          <PaginaMontagemMao
            estado={estado}
            mostrandoEsperas={mostrandoEsperas}
            aoAbrirRegras={aoAbrirRegras}
          />
        </section>
      ) : (
        <section className="calculadora-etapa calculadora-etapa-finalizacao" aria-labelledby="titulo-etapa-finalizacao">
          <h3 id="titulo-etapa-finalizacao" className="sr-only">
            {rotuloMaoFinalizacao}
          </h3>
          <PaginaFinalizacaoMao
            estado={estado}
            acoesCabecalho={
              <div className="acoes-finalizacao-calculadora" aria-label={t('calculator.actionsMenu')}>
                {acoesContextuais.map((acao) => (
                  <button
                    key={acao.chave}
                    className={acao.destaque ? 'acao-finalizacao destaque' : 'acao-finalizacao'}
                    type="button"
                    title={acao.rotulo}
                    aria-label={acao.rotulo}
                    onClick={acao.aoClicar}
                  >
                    <i className={`fas ${acao.icone}`} aria-hidden="true" />
                  </button>
                ))}
              </div>
            }
          />
        </section>
      )}

      <AdSlot />
    </div>
  )
}
