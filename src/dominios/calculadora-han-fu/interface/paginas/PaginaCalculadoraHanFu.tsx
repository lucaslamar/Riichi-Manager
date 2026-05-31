import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import { ExibicaoRapida, SeletorFu, SeletorHan } from '../componentes/ControlesHanFu'
import { useCalculadoraHanFu } from '../hooks/useCalculadoraHanFu'

/** Renderiza a calculadora direta por Han/Fu, sem montar a mao pedra por pedra. */
export default function PaginaCalculadoraHanFu() {
  const {
    agari,
    setAgari,
    configuracao,
    fu,
    setFu,
    fuDisponiveis,
    han,
    setHan,
    honba,
    setHonba,
    isOya,
    setIsOya,
    patamar,
    resultado,
  } = useCalculadoraHanFu()

  return (
    <div className="card card-calculadora-rapida">
      <BarraCalculadora modo="rapido" />
      <ExibicaoRapida
        resultado={resultado}
        isOya={isOya}
        agari={agari}
        han={han}
        fu={fu}
        patamar={patamar.nome}
      />

      <div className="seletores-rapidos-mao">
        <div className="campo-vitoria-mao">
          <span>É leste?</span>
          <div className="toggle-agari-mao">
            {[
              { valor: true, rotulo: 'Sim' },
              { valor: false, rotulo: 'Não' },
            ].map((opcao) => (
              <button
                key={String(opcao.valor)}
                type="button"
                className={isOya === opcao.valor ? 'ativo' : undefined}
                onClick={() => setIsOya(opcao.valor)}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="campo-vitoria-mao">
          <span>Vitória</span>
          <div className="toggle-agari-mao">
            {(['tsumo', 'ron'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={agari === tipo ? 'ativo' : undefined}
                aria-pressed={agari === tipo}
                onClick={() => setAgari(tipo)}
              >
                {tipo === 'ron' ? 'Ron' : 'Tsumo'}
              </button>
            ))}
          </div>
        </div>

        <div className="contador-dora-manual contador-honba contador-honba-rapido">
          <span>Honba</span>
          <div>
            <button
              type="button"
              disabled={honba <= 0}
              onClick={() => setHonba((atual) => Math.max(0, atual - 1))}
            >
              -
            </button>
            <strong>{honba}</strong>
            <button
              type="button"
              disabled={honba >= 99}
              onClick={() => setHonba((atual) => Math.min(99, atual + 1))}
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
          patamar={patamar.nome}
          aoMudarFu={setFu}
        />
      </div>
    </div>
  )
}
