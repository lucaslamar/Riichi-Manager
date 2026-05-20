export function SeletorHan({
  han,
  fu,
  fuDisponiveis,
  aoMudarHan,
  aoMudarFu,
}: {
  han: number
  fu: number
  fuDisponiveis: Map<number, number[]>
  aoMudarHan: (han: number) => void
  aoMudarFu: (fu: number) => void
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 900,
          color: '#607080',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Han
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          justifyContent: 'center',
          maxWidth: 300,
        }}
      >
        {[...fuDisponiveis.keys()].map((hanDisponivel) => (
          <button
            key={hanDisponivel}
            className={han === hanDisponivel ? 'btn-primario' : 'btn-contorno'}
            style={{ minHeight: 40, padding: '6px 14px' }}
            onClick={() => {
              aoMudarHan(hanDisponivel)
              const fus = fuDisponiveis.get(hanDisponivel)!
              if (!fus.includes(fu)) aoMudarFu(fus[0])
            }}
          >
            {hanDisponivel} Han
          </button>
        ))}
        {/* Patamar especial */}
        {[5, 6, 8, 11, 13].map((hanEspecial) => (
          <button
            key={`sp${hanEspecial}`}
            className={han === hanEspecial ? 'btn-primario' : 'btn-contorno'}
            style={{ minHeight: 40, padding: '6px 14px' }}
            onClick={() => aoMudarHan(hanEspecial)}
          >
            {rotularHan(hanEspecial)}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Seletor de Fu na calculadora rápida. */
export function SeletorFu({
  han,
  fu,
  fuDisponiveis,
  aoMudarFu,
}: {
  han: number
  fu: number
  fuDisponiveis: Map<number, number[]>
  aoMudarFu: (fu: number) => void
}) {
  const opcoes = fuDisponiveis.get(han) ?? []
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 900,
          color: '#607080',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Fu
      </div>
      {han >= 5 ? (
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>— {rotularHan(han)} não usa fu —</span>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
            maxWidth: 300,
          }}
        >
          {opcoes.map((fuDisponivel) => (
            <button
              key={fuDisponivel}
              className={fu === fuDisponivel ? 'btn-primario' : 'btn-contorno'}
              style={{ minHeight: 40, padding: '6px 14px' }}
              onClick={() => aoMudarFu(fuDisponivel)}
            >
              {fuDisponivel} Fu
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Exibição de pontos na calculadora rápida. */
export function ExibicaoRapida({
  resultado,
  isOya,
  agari,
  han,
  fu,
}: {
  resultado: any
  isOya: boolean
  agari: 'ron' | 'tsumo'
  han: number
  fu: number
}) {
  const pts = resultado?.pontos
  if (!pts) return null
  return (
    <div className="resultado-calculadora" style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 6,
          fontWeight: 800,
        }}
      >
        {han >= 5 ? rotularHan(han) : `${han} Han ${fu} Fu`}
      </div>
      <div className="pontos-totais">{pts.total.toLocaleString('pt-BR')}</div>
      <div className="detalhe-pontos">
        {agari === 'tsumo'
          ? isOya
            ? `All ${pts.oya?.ko ?? 0}`
            : `Oya ${pts.ko?.oya ?? 0} / Ko ${pts.ko?.ko ?? 0}`
          : isOya
            ? `Ron ${pts.oya?.ron ?? 0}`
            : `Ron ${pts.ko?.ron ?? 0}`}
      </div>
    </div>
  )
}

/** Rótulo legível para patamar especial de han. */
function rotularHan(han: number): string {
  if (han >= 13) return 'Yakuman'
  if (han >= 11) return 'Sanbaiman'
  if (han >= 8) return 'Baiman'
  if (han >= 6) return 'Haneman'
  return 'Mangan'
}
