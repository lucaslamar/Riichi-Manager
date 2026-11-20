import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { BotaoAcao } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/Botoes'
import type { Acao } from '@/dominios/calculadora-mao/logica/mao'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { maoCompleta, pedrasContadas, type TipoChamada } from '../logica/montagem'
import '../estilos/calculadora-mao-chinesa.css'
import ControlesCondicoes from './ControlesCondicoes'
import MaoChinesaAtual from './MaoChinesaAtual'
import ModalResultadoMcr from './ModalResultadoMcr'
import TecladoChines from './TecladoChines'
import { useCalculadoraMaoChinesa } from './useCalculadoraMaoChinesa'

const CHAMADAS: { tipo: TipoChamada; acao: Acao['tipo']; chave: string; chaveCompacta: string }[] =
  [
    { tipo: 'chi', acao: 'chii', chave: 'melds.chii', chaveCompacta: 'melds.chii' },
    { tipo: 'pon', acao: 'pon', chave: 'melds.pon', chaveCompacta: 'melds.pon' },
    {
      tipo: 'kanAberto',
      acao: 'kanAberto',
      chave: 'melds.kanAberto',
      chaveCompacta: 'melds.kanCompact',
    },
    {
      tipo: 'kanFechado',
      acao: 'kanFechado',
      chave: 'melds.kanFechado',
      chaveCompacta: 'melds.kanClosedCompact',
    },
  ]
/**
 * Calculadora de Mão Chinesa (MCR / Guobiao), com o mesmo layout da japonesa:
 * montar a mão no teclado e, com 14 pedras, finalizar com as condições e calcular.
 */
export default function CalculadoraMaoChinesa({ visivel }: { visivel: boolean }) {
  const { t } = useI18n()
  const calc = useCalculadoraMaoChinesa()
  const { mao } = calc
  const completa = maoCompleta(mao)

  // Escondida, a mão continua no estado (como na japonesa), mas nada vai para a tela.
  if (!visivel) return null

  const botoesAcao = (compacto: boolean) => (
    <>
      {CHAMADAS.map(({ tipo, acao, chave, chaveCompacta }) => (
        <BotaoAcao
          key={tipo}
          tipo={acao}
          rotulo={t(compacto ? chaveCompacta : chave)}
          ativo={calc.acao === tipo}
          desabilitado={calc.acao !== tipo && !calc.podeChamarAlguma(tipo)}
          aoClicar={() => calc.alternarAcao(tipo)}
        />
      ))}
    </>
  )

  return (
    <div className="mcr-calculadora">
      <TituloTela titulo={t('menu.handCalculatorChinese')} acoes={<BotaoConfiguracoes />} />

      <div
        className={`card card-mao-completa fluxo-calculadora ${calc.finalizando ? 'etapa-finalizacao' : 'etapa-montagem'}`}
      >
        {!calc.finalizando ? (
          <section
            className="calculadora-etapa calculadora-etapa-montagem"
            aria-labelledby="mcr-etapa-montagem"
          >
            <h3 id="mcr-etapa-montagem" className="sr-only">
              {t('calculator.stepBuild')}
            </h3>
            <div className="layout-montagem-calculadora sem-esperas">
              <div className="construtor-mao construtor-mao-montagem">
                <MaoChinesaAtual
                  mao={mao}
                  contexto="montagem"
                  aoTocarPedra={calc.selecionandoBatida ? calc.escolherBatida : calc.removerPedra}
                  selecionandoBatida={calc.selecionandoBatida}
                  aoRemoverChamada={calc.removerChamada}
                  aoRemoverFlor={calc.removerFlor}
                  aoLimpar={calc.limpar}
                />
                <div className="acoes-construtor-mao mcr-acoes-construtor">{botoesAcao(false)}</div>
                <div className="painel-teclado-calculadora">
                  <div
                    className="menu-acoes-teclado-mobile"
                    aria-label={t('calculator.actionsMenu')}
                  >
                    <div className="opcoes-acoes-mao-mobile opcoes-acoes-mao-mobile--mcr">
                      {botoesAcao(true)}
                    </div>
                  </div>
                  <TecladoChines
                    acao={calc.acao}
                    podeTocarPedra={calc.podeTocarPedra}
                    temFlor={calc.temFlor}
                    chiPendente={calc.chiPendente}
                    maoPronta={completa && !calc.acao}
                    aoTocarPedra={calc.tocarPedra}
                    aoTocarFlor={calc.adicionarFlor}
                    aoEscolherChi={calc.escolherChi}
                    aoFinalizar={calc.finalizar}
                    selecionandoBatida={calc.selecionandoBatida}
                    aoAlternarSelecaoBatida={calc.alternarSelecaoBatida}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            className="calculadora-etapa calculadora-etapa-finalizacao"
            aria-labelledby="mcr-etapa-finalizacao"
          >
            <h3 id="mcr-etapa-finalizacao" className="sr-only">
              {`${t('calculator.completeHand')} ${pedrasContadas(mao)}/14`}
            </h3>
            <div className="pagina-finalizacao-mao">
              <div className="layout-finalizacao-calculadora">
                <div className="coluna-finalizacao-mao">
                  <div className="construtor-mao construtor-mao-finalizacao">
                    <MaoChinesaAtual
                      mao={mao}
                      contexto="finalizacao"
                      acoesCabecalho={
                        <div
                          className="acoes-finalizacao-calculadora"
                          aria-label={t('calculator.actionsMenu')}
                        >
                          <button
                            className="acao-finalizacao destaque"
                            type="button"
                            title={t('actions.editHand')}
                            aria-label={t('actions.editHand')}
                            onClick={calc.voltarParaMontagem}
                          >
                            <i className="fas fa-pen" aria-hidden="true" />
                          </button>
                        </div>
                      }
                      aoTocarPedra={calc.escolherBatida}
                      aoRemoverChamada={() => undefined}
                      aoRemoverFlor={calc.removerFlor}
                      aoLimpar={calc.limpar}
                    />
                  </div>
                </div>
                <div className="coluna-finalizacao-opcoes">
                  <ControlesCondicoes condicoes={calc.condicoes} aoMudar={calc.alterarCondicao} />
                  <div className="acao-calcular-mao acao-calcular-mao-ativa rodape-finalizacao-mao">
                    <button
                      className="btn-calcular-mao botao-calcular-finalizacao"
                      type="button"
                      disabled={calc.erro !== null}
                      onClick={calc.calcular}
                    >
                      {t('actions.calculate')}
                    </button>
                    {calc.erro && (
                      <span className="status-finalizacao-mao">{t(`mcr.erros.${calc.erro}`)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {calc.resultado && (
        <ModalResultadoMcr
          mao={mao}
          condicoes={calc.condicoes}
          resultado={calc.resultado}
          aoFechar={calc.fecharResultado}
          aoNovaMao={calc.limpar}
        />
      )}
    </div>
  )
}
