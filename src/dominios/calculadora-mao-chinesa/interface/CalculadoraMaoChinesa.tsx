import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { pedrasContadas, pedrasDaChamada, PEDRAS_MCR, type ModoEntrada } from '../logica/montagem'
import '../estilos/calculadora-mao-chinesa.css'
import ControlesCondicoes from './ControlesCondicoes'
import { codigoPedra, nomePedra } from './pedras'
import ResultadoFan from './ResultadoFan'
import Segmentado from './Segmentado'
import { useCalculadoraMaoChinesa } from './useCalculadoraMaoChinesa'

const MODOS: ModoEntrada[] = ['mao', 'chi', 'pon', 'kanAberto', 'kanFechado']
/** Linhas do teclado: caracteres, bambus, círculos e honras. */
const LINHAS_TECLADO = [PEDRAS_MCR.slice(0, 9), PEDRAS_MCR.slice(9, 18), PEDRAS_MCR.slice(18, 27), PEDRAS_MCR.slice(27)]

/** Calculadora de Mão Chinesa (MCR / Guobiao): monta a mão, conta os fan e mostra os pagamentos. */
export default function CalculadoraMaoChinesa({ visivel }: { visivel: boolean }) {
  const { t, numero } = useI18n()
  const calc = useCalculadoraMaoChinesa()
  const { mao } = calc
  const ultima = mao.pedras.length - 1

  return (
    <div className="mcr-calculadora" hidden={!visivel}>
      {visivel && <TituloTela titulo={t('menu.handCalculatorChinese')} />}

      <section className="card mcr-secao" aria-labelledby="mcr-mao-titulo">
        <div className="mcr-secao__cabecalho">
          <h3 id="mcr-mao-titulo" className="mcr-secao__titulo">
            {t('mcr.entrada.titulo')}
          </h3>
          <span className="mcr-contador">{t('mcr.entrada.contador', { total: numero(pedrasContadas(mao)) })}</span>
          <button
            type="button"
            className="btn-contorno mcr-limpar"
            aria-label={t('mcr.entrada.limpar')}
            title={t('mcr.entrada.limpar')}
            disabled={pedrasContadas(mao) === 0}
            onClick={calc.limpar}
          >
            <i className="fas fa-trash-can" aria-hidden="true" />
          </button>
        </div>

        {pedrasContadas(mao) === 0 && <p className="mcr-ajuda">{t('mcr.entrada.vazia')}</p>}
        <div className="mcr-mao">
          {mao.chamadas.map((chamada, indice) => {
            const nome = `${t(`mcr.entrada.${chamada.tipo}`)} ${nomePedra(chamada.meio)}`
            return (
              <button
                key={`c${indice}`}
                type="button"
                className="mcr-chamada"
                aria-label={t('mcr.entrada.removerChamada', { chamada: nome })}
                onClick={() => calc.removerChamada(indice)}
              >
                {pedrasDaChamada(chamada).map((id, i) => (
                  <PedraSvg key={i} pedra={codigoPedra(id)} virada={chamada.tipo === 'kanFechado' && (i === 0 || i === 3)} />
                ))}
              </button>
            )
          })}
          {mao.pedras.map((id, indice) => (
            <button
              key={`p${indice}`}
              type="button"
              className={`mcr-pedra ${indice === ultima ? 'mcr-pedra--batida' : ''}`}
              aria-label={`${t('mcr.entrada.removerPedra', { pedra: nomePedra(id) })}${
                indice === ultima ? `, ${t('mcr.entrada.pedraBatida')}` : ''
              }`}
              onClick={() => calc.removerPedra(indice)}
            >
              <PedraSvg pedra={codigoPedra(id)} />
            </button>
          ))}
        </div>
        <p className="mcr-ajuda">{t('mcr.entrada.ajuda')}</p>

        <span className="mcr-rotulo">{t('mcr.entrada.modo')}</span>
        <Segmentado
          rotulo={t('mcr.entrada.modo')}
          valor={calc.modo}
          aoMudar={calc.setModo}
          opcoes={MODOS.map((modo) => ({ valor: modo, rotulo: t(`mcr.entrada.${modo}`) }))}
        />

        <div className="mcr-teclado" role="group" aria-label={t('mcr.entrada.teclado')}>
          {LINHAS_TECLADO.map((linha, i) => (
            <div key={i} className="mcr-teclado__linha">
              {linha.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="mcr-tecla"
                  aria-label={nomePedra(id)}
                  disabled={!calc.podeAdicionar(id)}
                  onClick={() => calc.adicionarPedra(id)}
                >
                  <PedraSvg pedra={codigoPedra(id)} />
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <ControlesCondicoes condicoes={calc.condicoes} aoMudar={calc.alterarCondicao} />

      <div className="mcr-calcular">
        {calc.erro && <p className="mcr-ajuda">{t(`mcr.erros.${calc.erro}`)}</p>}
        <button type="button" className="btn-primario" disabled={calc.erro !== null} onClick={calc.calcular}>
          {t('mcr.resultado.calcular')}
        </button>
      </div>

      {calc.resultado && <ResultadoFan resultado={calc.resultado} />}
    </div>
  )
}
