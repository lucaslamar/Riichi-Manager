export function SeletorHan({
  han,
  fu,
  fuDisponiveis,
  kazoeYakuman,
  aoMudarHan,
  aoMudarFu,
}: {
  han: number
  fu: number
  fuDisponiveis: Map<number, number[]>
  kazoeYakuman: boolean
  aoMudarHan: (han: number) => void
  aoMudarFu: (fu: number) => void
}) {
  return (
    <div className="seletor-rapido">
      <div className="rotulo-seletor-rapido">Han</div>
      <div className="botoes-seletor-rapido">
        {[...fuDisponiveis.keys()].map((hanDisponivel) => (
          <button
            key={hanDisponivel}
            className={han === hanDisponivel ? 'btn-primario' : 'btn-contorno'}
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
            onClick={() => aoMudarHan(hanEspecial)}
          >
            {rotularHan(hanEspecial, kazoeYakuman)}
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
  patamar,
  aoMudarFu,
}: {
  han: number
  fu: number
  fuDisponiveis: Map<number, number[]>
  patamar: string | null
  aoMudarFu: (fu: number) => void
}) {
  const opcoes = fuDisponiveis.get(han) ?? []
  return (
    <div className="seletor-rapido">
      <div className="rotulo-seletor-rapido">Fu</div>
      {han >= 5 ? (
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          — {patamar ?? rotularHan(han, true)} não usa fu —
        </span>
      ) : (
        <div className="botoes-seletor-rapido">
          {opcoes.map((fuDisponivel) => (
            <button
              key={fuDisponivel}
              className={fu === fuDisponivel ? 'btn-primario' : 'btn-contorno'}
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
  patamar,
}: {
  resultado: any
  isOya: boolean
  agari: 'ron' | 'tsumo'
  han: number
  fu: number
  patamar: string | null
}) {
  const pts = resultado?.pontos
  if (!pts) return null
  return (
    <div className="resultado-calculadora resultado-rapido">
      <div
        style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 6,
          fontWeight: 800,
        }}
      >
        {patamar ?? `${han} Han ${fu} Fu`}
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
function rotularHan(han: number, kazoeYakuman: boolean): string {
  if (han >= 13) return kazoeYakuman ? 'Kazoe Yakuman' : 'Sanbaiman'
  if (han >= 11) return 'Sanbaiman'
  if (han >= 8) return 'Baiman'
  if (han >= 6) return 'Haneman'
  return 'Mangan'
}
