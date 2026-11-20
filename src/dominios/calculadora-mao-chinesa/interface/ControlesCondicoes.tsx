import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { BotaoToggle } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/Botoes'
import { GradeVentos } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/GradeVentos'
import { VENTOS_ASSENTO, VENTOS_RODADA } from '@/dominios/calculadora-mao/interface/constantes'
import { ContadorOpcao } from '@/dominios/calculadora-mao/interface/finalizacao-mao/componentes/ContadorOpcao'
import type { VentoMao } from '@/dominios/calculadora-mao/logica/mao'
import type { CondicoesMcr, Vento } from '../logica/montagem'

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
}: {
  condicoes: CondicoesMcr
  aoMudar: <Chave extends keyof CondicoesMcr>(chave: Chave, valor: CondicoesMcr[Chave]) => void
  flores: number
  aoMudarFlores: (variacao: number) => void
}) {
  const { t } = useI18n()
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
        <span className="rotulo-bloco-opcoes">{t('mcr.entrada.flores')}</span>
        <div className="contadores-dora-honba">
          <ContadorOpcao
            className="contador-dora-manual"
            rotulo={<span>{t('mcr.entrada.flores')}</span>}
            rotuloMenos={`${t('mcr.entrada.flores')} -`}
            rotuloMais={`${t('mcr.entrada.flores')} +`}
            valor={flores}
            anunciarValor
            desabilitarMenos={flores <= 0}
            desabilitarMais={flores >= 8}
            aoDiminuir={() => aoMudarFlores(-1)}
            aoAumentar={() => aoMudarFlores(1)}
          />
        </div>
      </section>

      <div className="campo-vitoria-mao etapa-opcoes-mao etapa-opcoes-ativa">
        <span className="rotulo-com-ajuda">{t('calculator.victory')}</span>
        <div className="toggle-agari-mao">
          {(['tsumo', 'ron'] as const).map((forma) => (
            <button
              key={forma}
              type="button"
              className={condicoes.forma === forma ? 'ativo' : undefined}
              aria-pressed={condicoes.forma === forma}
              onClick={() => aoMudar('forma', forma)}
            >
              {t(forma === 'ron' ? 'calculator.ron' : 'calculator.tsumo')}
            </button>
          ))}
        </div>
      </div>

      <div className="colunas-assuntos-finalizacao">
        <section className="grupo-opcoes-mao grupo-opcoes-ventos etapa-opcoes-mao etapa-opcoes-ativa">
          <span className="rotulo-bloco-opcoes">{t('calculator.winds')}</span>
          <div className="seletores-vento-mao">
            <GradeVentos
              titulo={t('calculator.seatWind')}
              opcoes={VENTOS_ASSENTO}
              selecionado={paraVentoMao(condicoes.ventoAssento)}
              destacarIgual={ventoDuplo}
              rotuloAcessivel={(wind) => t('calculator.chooseSeatWind', { wind })}
              aoEscolher={(valor) => aoMudar('ventoAssento', paraVento(valor))}
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
            <span className="rotulo-bloco-opcoes">{t('calculator.specialConditions')}</span>
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
