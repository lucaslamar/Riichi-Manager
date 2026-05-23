import { useEffect, useState } from 'react'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { ESTILO_MELD } from '../constantes'
import ExibicaoCompleta from './ExibicaoCompleta'
import { PedraSvg, PedrasMeld } from './PedraSvg'

interface PropsResultadoMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
}

/** Resultado da mão montada, incluindo yaku, fu e mensagem de invalidez. */
export default function ResultadoMaoCalculada({ estado, embutido = false }: PropsResultadoMao) {
  const {
    mao,
    maoCompleta,
    resultado,
    furitenRonCompleto,
    slotsUsados,
    esperasPossiveis,
    calculandoEsperas,
  } = estado
  const mostrarEsperas = slotsUsados === 13
  const temEsperaComYaku = esperasPossiveis.some((espera) => !espera.semYaku)
  const temFuriten = esperasPossiveis.some((espera) => !espera.semYaku && espera.furiten)
  const resultadoValido = resultado?.agari != null && (resultado?.pontos?.total ?? 0) > 0 && !furitenRonCompleto
  const assinaturaResultado = resultadoValido
    ? JSON.stringify({
        pedras: mao.pedras,
        melds: mao.melds,
        agari: mao.agari,
        indiceAgari: mao.indiceAgari,
        honba: mao.honba,
        doraManual: mao.doraManual,
        dora: mao.dora,
        uradora: mao.uradora,
        ventoRodada: mao.ventoRodada,
        ventoAssento: mao.ventoAssento,
        total: resultado.pontos.total,
      })
    : null
  const [modalResultadoAberto, setModalResultadoAberto] = useState(false)
  const [ultimoModalAberto, setUltimoModalAberto] = useState<string | null>(null)

  useEffect(() => {
    if (!assinaturaResultado || assinaturaResultado === ultimoModalAberto) return
    setModalResultadoAberto(true)
    setUltimoModalAberto(assinaturaResultado)
  }, [assinaturaResultado, ultimoModalAberto])

  const pedraAgari = mao.pedras[mao.indiceAgari]
  const pedrasFechadas = mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari)

  const maoRenderizada = (
    <div className="mao-calculada resultado-composicao-mao">
      {mao.pedras.length > 0 && (
        <div className="resultado-grupo-mao resultado-grupo-fechado" aria-label="Pedras da mao">
          {pedrasFechadas.map((pedra, indice) => (
            <span
              key={`${pedra}-${indice}`}
              className="chip-pedra resultado-pedra"
            >
              <PedraSvg pedra={pedra} />
            </span>
          ))}
          {pedraAgari && (
            <span className="chip-pedra resultado-pedra agari">
              <PedraSvg pedra={pedraAgari} />
            </span>
          )}
        </div>
      )}
      {mao.melds.map((meld, indice) => (
        <span
          key={`${meld.tipo}-${indice}`}
          className={`resultado-meld resultado-meld-${meld.tipo}`}
          style={{ borderColor: ESTILO_MELD[meld.tipo].borda }}
          aria-label={ESTILO_MELD[meld.tipo].rotulo}
        >
          <PedrasMeld meld={meld} />
        </span>
      ))}
    </div>
  )

  return (
    <>
      {/* Card 3: resultado */}
      <div
        className={`resultado-calculadora resultado-principal ${embutido ? 'resultado-calculadora-embutido' : ''} ${
          furitenRonCompleto ? 'resultado-furiten-chombo' : ''
        } ${!mostrarEsperas && !maoCompleta ? 'resultado-montagem' : ''}`}
      >
        {mostrarEsperas ? (
          <div className="resultado-esperas">
            <strong>Esperas que validam a mao</strong>
            {calculandoEsperas ? (
              <p>Calculando pedras vencedoras...</p>
            ) : esperasPossiveis.length > 0 ? (
              <>
                <div className="lista-esperas-resultado">
                  {esperasPossiveis.map((espera) => (
                    <span
                      key={espera.pedra}
                      className={`espera-resultado ${espera.furiten ? 'furiten' : ''}`}
                    >
                      <span className="chip-pedra mini">
                        <PedraSvg pedra={espera.pedra} />
                      </span>
                      <small>
                        {espera.semYaku
                          ? 'sem yaku'
                          : `${espera.yakuman > 0 ? `${espera.yakuman}x Yakuman` : `${espera.han} han`}${
                              espera.furiten ? ' - furiten' : ''
                            }`}
                      </small>
                    </span>
                  ))}
                </div>
                <p>
                  {temEsperaComYaku
                    ? 'Essas pedras fecham uma mao valida com yaku nas opcoes atuais.'
                    : 'Essas pedras fecham a forma, mas ainda falta yaku para vencer.'}
                </p>
                {temFuriten && (
                  <p className="aviso-furiten">
                    Furiten: esperas que ja estao no seu descarte nao podem vencer por Ron. Se
                    declarar Ron nelas, confira a penalidade de chombo da mesa.
                  </p>
                )}
              </>
            ) : (
              <p>Nenhuma pedra restante fecha uma mao valida agora.</p>
            )}
          </div>
        ) : !maoCompleta ? (
          <div className="resultado-montagem-conteudo">
            <strong>{slotsUsados}/14 slots</strong>
            <span>Monte a mão para calcular</span>
          </div>
        ) : resultado?.agari != null && (resultado?.pontos?.total ?? 0) > 0 ? (
          <>
            {maoRenderizada}
            {furitenRonCompleto ? (
              <div className="resultado-chombo-furiten">
                <strong>Chombo por Ron em furiten</strong>
                <div className="pontos-chombo">-8.000</div>
                <span>
                  Uma das esperas esta no seu descarte. Ron em furiten nao vence a mao e gera
                  penalidade de chombo pela regra da mesa.
                </span>
              </div>
            ) : (
              <ExibicaoCompleta resultado={resultado} mao={mao} />
            )}
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

      {resultadoValido && modalResultadoAberto && (
        <div
          className="modal-resultado-mobile-fundo"
          role="presentation"
          onClick={() => setModalResultadoAberto(false)}
        >
          <div
            className="modal-resultado-mobile"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-resultado-mobile"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="modal-resultado-mobile-cabecalho">
              <strong id="titulo-resultado-mobile">Resultado</strong>
              <button
                className="btn-fechar-resultado-mobile"
                type="button"
                aria-label="Fechar resultado"
                onClick={() => setModalResultadoAberto(false)}
              >
                ×
              </button>
            </div>
            {maoRenderizada}
            <ExibicaoCompleta resultado={resultado} mao={mao} />
          </div>
        </div>
      )}
    </>
  )
}
