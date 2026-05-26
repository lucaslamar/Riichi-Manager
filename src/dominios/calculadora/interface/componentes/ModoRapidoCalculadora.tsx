import type { ReactNode } from 'react'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { ExibicaoRapida, SeletorFu, SeletorHan } from './CalculadoraRapida'
import { ToggleAgari } from './SeletoresMao'

interface PropsModoRapido {
  estado: EstadoCalculadoraMao
  cabecalho: ReactNode
}

/** Renderiza a calculadora por han/fu, sem montar a mao pedra por pedra. */
export default function ModoRapidoCalculadora({
  estado,
  cabecalho,
}: PropsModoRapido) {
  const {
    mao,
    atualizarMao,
    han,
    setHan,
    fu,
    setFu,
    fuDisponiveis,
    resultadoRapido,
    patamarRapido,
    configuracao,
  } = estado
  const honba = Number.isFinite(mao.honba) ? mao.honba : 0

  return (
    <div className="card card-calculadora-rapida">
      {cabecalho}
      <ExibicaoRapida
        resultado={resultadoRapido}
        isOya={mao.ventoRodada === '1'}
        agari={mao.agari}
        han={han}
        fu={fu}
        patamar={patamarRapido.nome}
      />

      <div className="seletores-rapidos-mao">
        <div className="campo-vitoria-mao">
          <span>É leste?</span>
          <div className="toggle-agari-mao">
            {[
              { valor: '1' as const, rotulo: 'Sim' },
              { valor: '2' as const, rotulo: 'Não' },
            ].map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                className={mao.ventoRodada === opcao.valor ? 'ativo' : undefined}
                onClick={() =>
                  atualizarMao((rascunho) => {
                    rascunho.ventoRodada = opcao.valor
                  })
                }
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="campo-vitoria-mao">
          <span>Vitória</span>
          <ToggleAgari mao={mao} atualizarMao={atualizarMao} />
        </div>

        <div className="contador-dora-manual contador-honba contador-honba-rapido">
          <span>Honba</span>
          <div>
            <button
              type="button"
              disabled={honba <= 0}
              onClick={() =>
                atualizarMao((rascunho) => {
                  const atual = Number.isFinite(rascunho.honba) ? rascunho.honba : 0
                  rascunho.honba = Math.max(0, atual - 1)
                })
              }
            >
              -
            </button>
            <strong>{honba}</strong>
            <button
              type="button"
              disabled={honba >= 99}
              onClick={() =>
                atualizarMao((rascunho) => {
                  const atual = Number.isFinite(rascunho.honba) ? rascunho.honba : 0
                  rascunho.honba = Math.min(99, atual + 1)
                })
              }
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="grade-calculadora-rapida">
        <SeletorHan
          han={han}
          fu={fu}
          fuDisponiveis={fuDisponiveis}
          kazoeYakuman={configuracao.kazoeYakuman}
          aoMudarHan={setHan}
          aoMudarFu={setFu}
        />
        <SeletorFu
          han={han}
          fu={fu}
          fuDisponiveis={fuDisponiveis}
          patamar={patamarRapido.nome}
          aoMudarFu={setFu}
        />
      </div>
    </div>
  )
}
