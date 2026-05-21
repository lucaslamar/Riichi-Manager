import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import ExibicaoCompleta from './ExibicaoCompleta'
import { PedraSvg, PedrasMeld } from './PedraSvg'

interface PropsResultadoMao {
  estado: EstadoCalculadoraMao
}

/** Resultado da mão montada, incluindo yaku, fu e mensagem de invalidez. */
export default function ResultadoMaoCalculada({ estado }: PropsResultadoMao) {
  const { mao, maoCompleta, resultado, slotsUsados, esperasPossiveis, calculandoEsperas } = estado
  const mostrarEsperas = slotsUsados === 13

  return (
    <>
      {/* Card 3: resultado */}
      <div className="resultado-calculadora">
        {mostrarEsperas ? (
          <div className="resultado-esperas">
            <strong>Esperas que validam a mao</strong>
            {calculandoEsperas ? (
              <p>Calculando pedras vencedoras...</p>
            ) : esperasPossiveis.length > 0 ? (
              <>
                <div className="lista-esperas-resultado">
                  {esperasPossiveis.map((espera) => (
                    <span key={espera.pedra} className="espera-resultado">
                      <span className="chip-pedra mini">
                        <PedraSvg pedra={espera.pedra} />
                      </span>
                      <small>{espera.semYaku ? 'sem yaku' : `${espera.han} han`}</small>
                    </span>
                  ))}
                </div>
                <p>
                  {esperasPossiveis.some((espera) => !espera.semYaku)
                    ? 'Essas pedras fecham uma mao valida com yaku nas opcoes atuais.'
                    : 'Essas pedras fecham a forma, mas ainda falta yaku para vencer.'}
                </p>
              </>
            ) : (
              <p>Nenhuma pedra restante fecha uma mao valida agora.</p>
            )}
          </div>
        ) : !maoCompleta ? (
          <div style={{ opacity: 0.5 }}>
            <i
              className="fas fa-calculator"
              style={{ fontSize: '2rem', marginBottom: 8, display: 'block' }}
            />
            Monte 14 slots (kans contam como 3) para calcular
          </div>
        ) : resultado?.agari != null && (resultado?.pontos?.total ?? 0) > 0 ? (
          <>
            <div className="mao-calculada">
              {mao.pedras.map((pedra, indice) => (
                <span
                  key={`${pedra}-${indice}`}
                  className={`chip-pedra mini ${indice === mao.indiceAgari ? 'agari' : ''}`}
                >
                  <PedraSvg pedra={pedra} />
                </span>
              ))}
              {mao.melds.map((meld, indice) => (
                <span key={`${meld.tipo}-${indice}`} className="resumo-meld resultado">
                  <PedrasMeld meld={meld} />
                </span>
              ))}
            </div>
            <ExibicaoCompleta resultado={resultado} />
          </>
        ) : (
          <div>
            <i
              className="fas fa-times-circle"
              style={{ fontSize: '2rem', color: '#ef5350', marginBottom: 8, display: 'block' }}
            />
            <strong>Sem Yaku — Mão inválida</strong>
            <p style={{ opacity: 0.7, margin: '4px 0 0', fontSize: '0.9rem' }}>
              {resultado?.semYaku
                ? 'A mão não tem yaku válido (ex: Ron sem Haitei/Houtei).'
                : resultado == null
                  ? 'A combinação de pedras não forma uma mão válida.'
                  : 'Mão sem yaku: adicione Riichi, Tanyao ou outro yaku.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
