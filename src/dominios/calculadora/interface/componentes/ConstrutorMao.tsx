import { ESTILO_MELD, HONRAS, NAIPES, codigoBase, proximaDoraIndicada } from '../constantes'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { BotaoAcao } from './Botoes'
import { PedraSvg, PedrasMeld } from './PedraSvg'

interface PropsConstrutorMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
}

/** Área para montar a mão completa pedra por pedra. */
export default function ConstrutorMao({ estado, embutido = false }: PropsConstrutorMao) {
  const {
    mao,
    atualizarMao,
    acaoPendente,
    configuracao,
    totalPedras,
    slotsUsados,
    maoCompleta,
    contarCodigo,
    contarAka,
    podeSelecionarPedra,
    adicionarPedra,
    removerPedra,
    removerMeld,
    limpar,
    alternarAcao,
    podeMeld,
    podeKanFechado,
  } = estado
  const dorasReais = new Set(
    [...mao.dora, ...mao.uradora].map((indicador) => codigoBase(proximaDoraIndicada(indicador))),
  )

  return (
    <>
      {/* Card 1: construtor de mão */}
      <div className={embutido ? undefined : 'card'}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <h3
            style={{
              margin: 0,
              flex: 1,
              fontSize: '0.88rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: '#607080',
            }}
          >
            <i className="fas fa-layer-group" style={{ marginRight: 6 }} />
            Mão ({totalPedras} pedras · {slotsUsados}/14 slots)
          </h3>
          {totalPedras > 0 && (
            <button
              className="btn-contorno"
              type="button"
              onClick={limpar}
              style={{
                minHeight: 34,
                padding: '4px 12px',
                fontSize: '0.82rem',
                color: '#ef5350',
                borderColor: '#ef5350',
              }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Área de pedras e melds */}
        <div className="pedras-selecionadas">
          {mao.pedras.map((pedra, i) => (
            <button
              key={i}
              className={`chip-pedra ${i === mao.indiceAgari ? 'agari' : ''}`}
              type="button"
              title={
                i === mao.indiceAgari
                  ? 'Pedra de agari — clique para remover'
                  : 'Clique para remover'
              }
              onClick={() => removerPedra(i)}
            >
              <PedraSvg pedra={pedra} />
            </button>
          ))}

          {/* Melds com cores distintas e rótulo de tipo */}
          {mao.melds.map((meld, i) => {
            const estilo = ESTILO_MELD[meld.tipo]
            return (
              <button
                key={`meld-${i}`}
                type="button"
                title={`${estilo.rotulo} — clique para remover`}
                onClick={() => removerMeld(i)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: `2px solid ${estilo.borda}`,
                  background: '#ffffff',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    color: estilo.borda,
                    marginRight: 2,
                    letterSpacing: 0,
                  }}
                >
                  {estilo.rotulo}
                </span>
                <PedrasMeld meld={meld} />
              </button>
            )
          })}

          {totalPedras === 0 && (
            <span style={{ color: '#bbb', fontSize: '0.85rem', alignSelf: 'center' }}>
              Clique nas pedras abaixo para montar a mão
            </span>
          )}
        </div>

        {/* Dora e Uradora exibidos */}
        {(mao.dora.length > 0 || mao.uradora.length > 0) && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            {mao.dora.length > 0 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#be185d' }}>
                  INDICADOR DE DORA:
                </span>
                {mao.dora.map((pedraDora, i) => (
                  <button
                    key={i}
                    className="chip-pedra dora"
                    type="button"
                    onClick={() =>
                      atualizarMao((rascunho) => {
                        rascunho.dora.splice(i, 1)
                      })
                    }
                  >
                    <PedraSvg pedra={pedraDora} />
                  </button>
                ))}
              </div>
            )}
            {mao.uradora.length > 0 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#be185d' }}>
                  INDICADOR DE URADORA:
                </span>
                {mao.uradora.map((pedraUradora, i) => (
                  <button
                    key={i}
                    className="chip-pedra dora"
                    type="button"
                    onClick={() =>
                      atualizarMao((rascunho) => {
                        rascunho.uradora.splice(i, 1)
                      })
                    }
                  >
                    <PedraSvg pedra={pedraUradora} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botões de ação com cores distintas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          <BotaoAcao
            tipo="chii"
            rotulo="Chii"
            cor="#4caf50"
            ativo={acaoPendente?.tipo === 'chii'}
            desabilitado={!podeMeld}
            aoClicar={() => alternarAcao('chii')}
          />
          <BotaoAcao
            tipo="pon"
            rotulo="Pon"
            cor="#2196f3"
            ativo={acaoPendente?.tipo === 'pon'}
            desabilitado={!podeMeld}
            aoClicar={() => alternarAcao('pon')}
          />
          <BotaoAcao
            tipo="kanAberto"
            rotulo="Kan (aberto)"
            cor="#ba68c8"
            ativo={acaoPendente?.tipo === 'kanAberto'}
            desabilitado={!podeMeld}
            aoClicar={() => alternarAcao('kanAberto')}
          />
          <BotaoAcao
            tipo="kanFechado"
            rotulo="Kan (fechado)"
            cor="#9c27b0"
            ativo={acaoPendente?.tipo === 'kanFechado'}
            desabilitado={!podeKanFechado}
            aoClicar={() => alternarAcao('kanFechado')}
          />
          <BotaoAcao
            tipo="dora"
            rotulo="Indicador de Dora"
            cor="#ec4899"
            ativo={acaoPendente?.tipo === 'dora'}
            desabilitado={mao.dora.length >= 5}
            aoClicar={() => alternarAcao('dora')}
          />
        </div>

        {/* Teclado de pedras */}
        <div className="teclado-pedras">
          {NAIPES.map(({ naipe, rotulo }) => (
            <div key={naipe}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#aaa',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {rotulo}
              </div>
              <div className="linha-naipe">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((numero) => {
                  const codigo = `${numero}${naipe}`
                  const esgotada = contarCodigo(codigo) >= 4
                  const cheiaESemAcao = maoCompleta && !acaoPendente
                  const invalidaParaAcao = !podeSelecionarPedra(codigo)
                  const ehDoraReal = dorasReais.has(codigoBase(codigo))
                  return (
                    <button
                      key={codigo}
                      className={`btn-pedra ${ehDoraReal ? 'dora-real' : ''}`}
                      type="button"
                      disabled={esgotada || cheiaESemAcao || invalidaParaAcao}
                      onClick={() => adicionarPedra(codigo)}
                    >
                      <PedraSvg pedra={codigo} />
                    </button>
                  )
                })}
                {configuracao.akadora &&
                  (() => {
                    const codigo = `0${naipe}`
                    const esgotada = contarAka(codigo) >= 1 || contarCodigo(codigo) >= 4
                    const cheiaESemAcao = maoCompleta && !acaoPendente
                    const invalidaParaAcao = !podeSelecionarPedra(codigo)
                    const ehDoraReal = dorasReais.has(codigoBase(codigo))
                    return (
                      <button
                        key={codigo}
                        className={`btn-pedra btn-pedra-aka ${ehDoraReal ? 'dora-real' : ''}`}
                        type="button"
                        title="5 vermelho (aka dora)"
                        disabled={esgotada || cheiaESemAcao || invalidaParaAcao}
                        onClick={() => adicionarPedra(codigo)}
                      >
                        <PedraSvg pedra={codigo} />
                      </button>
                    )
                  })()}
              </div>
            </div>
          ))}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#aaa',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Honras (Jihai / Kazehai)
            </div>
            <div className="linha-naipe">
              {HONRAS.map((codigo) => {
                const ehDoraReal = dorasReais.has(codigoBase(codigo))
                return (
                  <button
                    key={codigo}
                    className={`btn-pedra ${ehDoraReal ? 'dora-real' : ''}`}
                    type="button"
                    disabled={
                      contarCodigo(codigo) >= 4 ||
                      (maoCompleta && !acaoPendente) ||
                      !podeSelecionarPedra(codigo)
                    }
                    onClick={() => adicionarPedra(codigo)}
                  >
                    <PedraSvg pedra={codigo} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
