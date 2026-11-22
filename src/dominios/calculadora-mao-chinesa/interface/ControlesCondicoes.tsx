import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useAvancoAutomatico } from '@/dominios/calculadora-mao/interface/finalizacao-mao/hooks/useAvancoAutomatico'
import BotaoAjuda from '@/dominios/calculadora-mao/interface/modais/ajuda-secoes/BotaoAjuda'
import { BotaoToggle } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/Botoes'
import { GradeVentos } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/GradeVentos'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '@/dominios/calculadora-mao/interface/constantes'
import { ContadorOpcao } from '@/dominios/calculadora-mao/interface/finalizacao-mao/componentes/ContadorOpcao'
import type { VentoMao } from '@/dominios/calculadora-mao/logica/mao'
import type { CondicoesMcr, Flor, Vento } from '../logica/montagem'
import { PedraFlor } from './PedraChinesa'

const TODAS_AS_FLORES: Flor[] = [1, 2, 3, 4, 5, 6, 7, 8]

const paraVento = (valor: VentoMao) => (27 + Number(valor)) as Vento
const paraVentoMao = (vento: Vento) => String(vento - 27) as VentoMao

type CondicaoLigavel = 'ultimaPedra' | 'kan' | 'ultimaDoTipo'

/**
 * Finalização da mão no MCR com os mesmos blocos da japonesa: flores no lugar
 * das doras, vitória, ventos em pedras e condições especiais de batida.
 */
export default function ControlesCondicoes({
  condicoes,
  aoMudar,
  flores,
  aoMudarFlores,
  aoAlternarFlor,
}: {
  condicoes: CondicoesMcr
  aoMudar: <Chave extends keyof CondicoesMcr>(chave: Chave, valor: CondicoesMcr[Chave]) => void
  flores: readonly Flor[]
  aoMudarFlores: (variacao: number) => void
  /** Escolher (ou tirar) uma flor específica, pelo painel da flor. */
  aoAlternarFlor: (flor: Flor) => void
}) {
  const { t } = useI18n()
  // Como o dragão das Doras no Riichi: a flor abre as 8 pedras para escolher.
  const [escolhendoFlores, setEscolhendoFlores] = useState(false)
  // Como no Riichi: a batida leva aos ventos, e o seu vento leva ao Calcular.
  const avancar = useAvancoAutomatico()
  const tsumo = condicoes.forma === 'tsumo'
  const ventoDuplo = condicoes.ventoRodada === condicoes.ventoAssento

  const especiais: { chave: CondicaoLigavel; rotulo: string }[] = [
    {
      chave: 'ultimaPedra',
      rotulo: t(tsumo ? 'mcr.condicoes.ultimaParede' : 'mcr.condicoes.ultimoDescarte'),
    },
    { chave: 'kan', rotulo: t(tsumo ? 'mcr.condicoes.reposicaoKan' : 'mcr.condicoes.rouboKan') },
    { chave: 'ultimaDoTipo', rotulo: t('mcr.condicoes.ultimaDoTipo') },
  ]

  return (
    <div className="opcoes-mao-embutidas mcr-opcoes-finalizacao">
      <section className="grupo-opcoes-mao grupo-opcoes-dora etapa-opcoes-mao etapa-opcoes-ativa">
        <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
          {t('mcr.entrada.flores')}
          <BotaoAjuda topico="mcrFlores" />
        </span>
        <div
          className={`contadores-dora-honba${escolhendoFlores ? ' contadores-dora-honba--com-painel' : ''}`}
        >
          <ContadorOpcao
            className="contador-dora-manual"
            rotulo={
              <span className="rotulo-contador-com-ajuda">
                {t('mcr.entrada.flores')}
                <button
                  type="button"
                  className={`btn-expandir-indicadores-dora${escolhendoFlores ? ' ativo' : ''}`}
                  aria-label={t('mcr.entrada.escolherFlores')}
                  aria-expanded={escolhendoFlores}
                  aria-pressed={escolhendoFlores}
                  onClick={() => setEscolhendoFlores(!escolhendoFlores)}
                >
                  <i className="fas fa-spa" aria-hidden="true" />
                </button>
              </span>
            }
            rotuloMenos={`${t('mcr.entrada.flores')} -`}
            rotuloMais={`${t('mcr.entrada.flores')} +`}
            valor={flores.length}
            anunciarValor
            desabilitarMenos={flores.length <= 0}
            desabilitarMais={flores.length >= 8}
            aoDiminuir={() => aoMudarFlores(-1)}
            aoAumentar={() => aoMudarFlores(1)}
          />
          {escolhendoFlores && (
            <div
              className="painel-contextual-finalizacao mcr-escolha-flores"
              role="group"
              aria-label={t('mcr.entrada.escolherFlores')}
            >
              {TODAS_AS_FLORES.map((flor) => {
                const escolhida = flores.includes(flor)
                const nome = t(`mcr.entrada.opcaoFlor.${flor}`)
                return (
                  <button
                    key={flor}
                    type="button"
                    className="chip-pedra mcr-opcao-flor"
                    aria-pressed={escolhida}
                    aria-label={escolhida ? t('mcr.entrada.florEscolhida', { flor: nome }) : nome}
                    title={t(`mcr.flores.${flor}`)}
                    onClick={() => aoAlternarFlor(flor)}
                  >
                    <PedraFlor flor={flor} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="campo-vitoria-mao etapa-opcoes-mao etapa-opcoes-ativa">
        <span className="rotulo-com-ajuda">
          {t('calculator.victory')}
          <BotaoAjuda topico="mcrBatida" />
        </span>
        <div className="toggle-agari-mao">
          {(['tsumo', 'ron'] as const).map((forma) => (
            <button
              key={forma}
              type="button"
              className={condicoes.forma === forma ? 'ativo' : undefined}
              aria-pressed={condicoes.forma === forma}
              onClick={() => {
                aoMudar('forma', forma)
                avancar('secao-ventos')
              }}
            >
              {t(forma === 'ron' ? 'calculator.ron' : 'calculator.tsumo')}
            </button>
          ))}
        </div>
      </div>

      <div className="colunas-assuntos-finalizacao">
        <section
          id="secao-ventos"
          className="grupo-opcoes-mao grupo-opcoes-ventos etapa-opcoes-mao etapa-opcoes-ativa"
        >
          <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
            {t('calculator.winds')}
            <BotaoAjuda topico="mcrVentos" />
          </span>
          <div className="seletores-vento-mao">
            <GradeVentos
              titulo={t('calculator.seatWind')}
              opcoes={VENTOS_ASSENTO}
              selecionado={paraVentoMao(condicoes.ventoAssento)}
              destacarIgual={ventoDuplo}
              rotuloAcessivel={(wind) => t('calculator.chooseSeatWind', { wind })}
              aoEscolher={(valor) => {
                aoMudar('ventoAssento', paraVento(valor))
                avancar('secao-calcular', 'base')
              }}
            />
            <GradeVentos
              titulo={t('calculator.roundWind')}
              opcoes={VENTOS_RODADA}
              selecionado={paraVentoMao(condicoes.ventoRodada)}
              destacarIgual={ventoDuplo}
              rotuloAcessivel={(wind) => t('calculator.chooseRoundWind', { wind })}
              aoEscolher={(valor) => aoMudar('ventoRodada', paraVento(valor))}
            />
          </div>
        </section>

        <div className="grupos-opcoes-mao grupos-opcoes-ativos">
          <section className="grupo-opcoes-mao etapa-opcoes-mao etapa-opcoes-ativa">
            <span className="rotulo-bloco-opcoes rotulo-com-ajuda">
              {t('calculator.specialConditions')}
              <BotaoAjuda topico="mcrCondicoes" />
            </span>
            <div className="linha-opcoes-mao linha-condicoes-especiais">
              {especiais.map(({ chave, rotulo }) => (
                <BotaoToggle
                  key={chave}
                  rotulo={rotulo}
                  ativo={condicoes[chave]}
                  desabilitado={false}
                  aoClicar={() => aoMudar(chave, !condicoes[chave])}
                />
              ))}
            </div>
            <p className="aviso-opcao-indisponivel">{t('mcr.condicoes.ultimaDoTipoAjuda')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
