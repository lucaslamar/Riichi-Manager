import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import ExibicaoCompleta from './ExibicaoCompleta'

interface PropsResultadoMao {
  estado: EstadoCalculadoraMao
}

/** Resultado da mão montada, incluindo yaku, fu e mensagem de invalidez. */
export default function ResultadoMaoCalculada({ estado }: PropsResultadoMao) {
  const { maoCompleta, resultado } = estado

  return (
    <>
      {/* Card 3: resultado */}
      <div className="resultado-calculadora">
        {!maoCompleta ? (
          <div style={{ opacity: 0.5 }}>
            <i
              className="fas fa-calculator"
              style={{ fontSize: '2rem', marginBottom: 8, display: 'block' }}
            />
            Monte 14 slots (kans contam como 3) para calcular
          </div>
        ) : resultado?.agari != null && (resultado?.pontos?.total ?? 0) > 0 ? (
          <ExibicaoCompleta resultado={resultado} />
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
