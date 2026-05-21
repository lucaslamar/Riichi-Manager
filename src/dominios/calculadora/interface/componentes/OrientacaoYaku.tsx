import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { PedraSvg } from './PedraSvg'

interface PropsOrientacaoYaku {
  estado: EstadoCalculadoraMao
}

const ROTULO_ESTADO = {
  bom: 'Caminho seguro',
  atencao: 'Observe antes de abrir',
  cuidado: 'Rota dificil',
}

export default function OrientacaoYaku({ estado }: PropsOrientacaoYaku) {
  const { orientacao, slotsUsados, esperasPossiveis, calculandoEsperas, calcularEsperas } = estado
  const mostrarVazio = slotsUsados < 5
  const podeCalcularEsperas = slotsUsados === 13

  return (
    <div className="card orientacao-yaku">
      <div className="orientacao-yaku-cabecalho">
        <div>
          <h3>
            <i className="fas fa-route" aria-hidden="true" /> Caminhos de yaku
          </h3>
          <p>Ajuda para decidir se vale abrir a mao e quais esperas procurar.</p>
        </div>
        <span>{slotsUsados}/14</span>
      </div>

      {mostrarVazio ? (
        <div className="orientacao-vazia">
          Monte algumas pedras para o Riichi Manager sugerir rotas de yaku.
        </div>
      ) : (
        <>
          {podeCalcularEsperas && (
            <section className="bloco-esperas">
              <div className="linha-esperas-topo">
                <div>
                  <div className="rotulo-bloco">Esperas possiveis</div>
                  <small>Aparecem tambem no resultado principal em 13/14.</small>
                </div>
                <button
                  className="btn-contorno"
                  type="button"
                  disabled={calculandoEsperas || esperasPossiveis.length > 0}
                  onClick={calcularEsperas}
                >
                  <i className="fas fa-magnifying-glass" aria-hidden="true" />{' '}
                  {calculandoEsperas
                    ? 'Calculando...'
                    : esperasPossiveis.length > 0
                      ? 'Esperas abaixo'
                      : 'Ver esperas'}
                </button>
              </div>

              {esperasPossiveis.length > 0 && (
                <div className="lista-esperas">
                  {esperasPossiveis.map((espera) => (
                    <div key={espera.pedra} className="espera-card">
                      <span className="chip-pedra mini">
                        <PedraSvg pedra={espera.pedra} />
                      </span>
                      <div>
                        <strong>
                          {espera.semYaku
                            ? 'Fecha forma, mas sem yaku'
                            : espera.yakus.slice(0, 2).join(' + ') || 'Yaku por opcao marcada'}
                        </strong>
                        <small>
                          {espera.semYaku
                            ? 'Procure Riichi, Tsumo, Yakuhai ou outra condicao.'
                            : `${espera.han} han / ${espera.fu} fu antes de bonus finais`}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <div className="rotulo-bloco">Rotas provaveis</div>
            {orientacao.caminhos.length === 0 ? (
              <div className="orientacao-vazia">
                Ainda nao ha uma rota clara. Priorize blocos completos e evite abrir sem yaku.
              </div>
            ) : (
              <div className="lista-caminhos-yaku">
                {orientacao.caminhos.map((caminho) => (
                  <article key={`${caminho.titulo}-${caminho.resumo}`} className="caminho-yaku">
                    <div className="caminho-yaku-topo">
                      <strong>{caminho.titulo}</strong>
                      <span className={`selo-caminho ${caminho.estado}`}>
                        {ROTULO_ESTADO[caminho.estado]}
                      </span>
                    </div>
                    <p>{caminho.resumo}</p>
                    <small>{caminho.detalhe}</small>
                    {caminho.pedras.length > 0 && (
                      <div className="pedras-caminho">
                        {caminho.pedras.map((pedra, indice) => (
                          <span key={`${pedra}-${indice}`} className="chip-pedra mini">
                            <PedraSvg pedra={pedra} />
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
