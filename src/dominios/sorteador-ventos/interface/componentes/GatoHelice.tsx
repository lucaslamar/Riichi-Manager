import type { CSSProperties, RefObject } from 'react'
import type { VentoMao } from '../../../calculadora-mao/logica/mao'
import { PedraVento } from '../../../calculadora-mao/interface/compartilhado/componentes/PedraVento'
import { VENTOS_MESA } from '../../logica/sortearVento'
import { anguloPa } from '../hooks/useSorteadorVentos'

interface PropsGatoHelice {
  rotorRef: RefObject<HTMLDivElement>
  /** Ventos que já saíram: as pás deles ficam apagadas. */
  ventosApagados: VentoMao[]
  /** Vento que acabou de parar no alto da hélice, em destaque. */
  escolhido: VentoMao | null
  /** Sorteio terminado: o gato mostra a língua. */
  linguaDeFora: boolean
  /** Palavra escrita em granulado no pirulito ("REINICIAR"). */
  textoPirulito: string
  rotuloPirulito: string
  /** O pirulito reinicia o sorteio a qualquer momento. */
  aoTocarPirulito: () => void
}

/** Cores do granulado, alternadas letra a letra. */
const CORES_GRANULADO = ['#ffffff', '#ff80ab', '#b3e5fc', '#fff59d']

/** Olho do Gato de Botas: pupila enorme e brilhos. */
function Olho({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="31" fill="#d9a520" />
      <circle cx={cx} cy={cy + 1} r="27" fill="#0d0d10" />
      <circle cx={cx - 10} cy={cy - 11} r="10" fill="#ffffff" />
      <circle cx={cx + 11} cy={cy + 9} r="5" fill="#ffffff" />
      <circle cx={cx - 2} cy={cy + 15} r="2.5" fill="#ffffff" opacity="0.8" />
      <path
        d={`M${cx - 22} ${cy + 12} A24 24 0 0 0 ${cx + 22} ${cy + 12}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </g>
  )
}

/**
 * O meme do clube: gato de boné de hélice segurando um pirulito. Cada pá leva
 * uma pedra de vento e a que para no alto da hélice é a sorteada.
 * O giro vem de `--giro` no rotor, escrito pelo hook a cada quadro.
 */
export default function GatoHelice({
  rotorRef,
  ventosApagados,
  escolhido,
  linguaDeFora,
  textoPirulito,
  rotuloPirulito,
  aoTocarPirulito,
}: PropsGatoHelice) {
  return (
    <div className="gato-helice">
      <svg className="gato-helice__desenho" viewBox="0 0 320 400" aria-hidden="true">
        <defs>
          <clipPath id="gato-helice-copa">
            <path d="M44 262 C44 150 276 150 276 262 Z" />
          </clipPath>
        </defs>

        {/* Cabeça */}
        <ellipse cx="160" cy="318" rx="138" ry="80" fill="#2c2c30" />
        <path d="M262 268 L282 244 L290 290 Z" fill="#f1f1f1" />

        <Olho cx={108} cy={298} />
        <Olho cx={212} cy={298} />

        {/* Focinho branco, nariz e língua */}
        <ellipse cx="136" cy="352" rx="32" ry="21" fill="#f4f4f4" />
        <ellipse cx="184" cy="352" rx="32" ry="21" fill="#f4f4f4" />
        <path d="M151 333 H169 L160 344 Z" fill="#141416" />
        {linguaDeFora ? (
          <g className="gato-helice__lingua">
            <path d="M142 368 H178 V382 A18 18 0 0 1 142 382 Z" fill="#e98fa0" />
            <path d="M160 370 V390" stroke="#c96b7e" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          <ellipse cx="160" cy="376" rx="12" ry="9" fill="#e98fa0" />
        )}

        {/* Bigodes */}
        <g stroke="#e8e8e8" strokeWidth="1.6" strokeLinecap="round">
          <path d="M212 348 L294 336" />
          <path d="M212 356 L296 362" />
          <path d="M108 348 L84 345" />
          <path d="M108 356 L86 358" />
        </g>

        {/* Boné: copa em gomos coloridos e aba verde */}
        <g clipPath="url(#gato-helice-copa)">
          <rect x="40" y="150" width="56" height="120" fill="#e53935" />
          <rect x="96" y="150" width="64" height="120" fill="#fbc02d" />
          <rect x="160" y="150" width="64" height="120" fill="#43a047" />
          <rect x="224" y="150" width="66" height="120" fill="#1e3fae" />
          <g stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6">
            <path d="M96 180 V262" />
            <path d="M160 172 V262" />
            <path d="M224 180 V262" />
          </g>
        </g>
        <path d="M30 258 Q160 238 290 258 L296 284 Q160 268 24 286 Z" fill="#0f9d6b" />
        <rect x="156" y="152" width="8" height="26" rx="3" fill="#fbc02d" />

        {/* Pirulito na patinha */}
        <g className="gato-helice__pirulito">
          <path d="M44 304 L64 398" stroke="#f5f5f5" strokeWidth="7" strokeLinecap="round" />
          <circle cx="42" cy="292" r="36" fill="#e53935" />
          <circle cx="42" cy="292" r="30" fill="#fb8c00" />
          <circle cx="42" cy="292" r="24" fill="#fbc02d" />
          <circle cx="42" cy="292" r="18" fill="#43a047" />
          <circle cx="42" cy="292" r="12" fill="#1e88e5" />
          <circle cx="42" cy="292" r="6" fill="#8e24aa" />
          {/* "REINICIAR" em granulado: cada letra de uma cor, seguindo a borda de cima. */}
          <path id="gato-helice-arco-pirulito" d="M14 292 A28 28 0 1 1 70 292" fill="none" />
          <text className="gato-helice__granulado" fontSize="10.5">
            <textPath href="#gato-helice-arco-pirulito" startOffset="50%" textAnchor="middle">
              {[...textoPirulito].map((letra, indice) => (
                <tspan key={indice} fill={CORES_GRANULADO[indice % CORES_GRANULADO.length]}>
                  {letra}
                </tspan>
              ))}
            </textPath>
          </text>
          {/* Granulado solto na metade de baixo. */}
          <g strokeWidth="2.6" strokeLinecap="round">
            <path d="M28 302 l4 3" stroke="#ffffff" />
            <path d="M52 304 l-3 4" stroke="#ff80ab" />
            <path d="M36 314 l5 -1" stroke="#b3e5fc" />
            <path d="M58 296 l2 4" stroke="#fff59d" />
            <path d="M24 290 l1 5" stroke="#ff80ab" />
            <path d="M45 318 l4 2" stroke="#ffffff" />
          </g>
          {/* Patinha branca de gato frajola segurando o palito */}
          <ellipse cx="58" cy="372" rx="25" ry="19" fill="#f4f4f4" />
          <g stroke="#c9c9c9" strokeWidth="1.6" strokeLinecap="round">
            <path d="M46 356 V364" />
            <path d="M58 354 V362" />
            <path d="M70 356 V364" />
          </g>
        </g>
      </svg>

      {/* Área de toque do pirulito (o desenho fica no SVG acima). */}
      <button
        type="button"
        className="gato-helice__botao-pirulito"
        aria-label={rotuloPirulito}
        title={rotuloPirulito}
        onClick={(evento) => {
          // Não deixa o toque chegar na página (que sortearia ou passaria a vez).
          evento.stopPropagation()
          aoTocarPirulito()
        }}
      />

      {/* Ponto da boca: de onde saem voando os balõezinhos dos resultados. */}
      <span className="gato-helice__boca" />

      {/* Hélice: gira por cima do boné */}
      <div ref={rotorRef} className="gato-helice__rotor">
        {VENTOS_MESA.map((vento) => (
          <span
            key={`pa-${vento}`}
            className="gato-helice__pa"
            style={{ '--pa': `${anguloPa(vento)}deg` } as CSSProperties}
          />
        ))}
        {VENTOS_MESA.map((vento) => {
          const apagado = ventosApagados.includes(vento) && vento !== escolhido
          return (
            <span
              key={`pedra-${vento}`}
              className={`gato-helice__pedra${apagado ? ' gato-helice__pedra--usada' : ''}${
                vento === escolhido ? ' gato-helice__pedra--escolhida' : ''
              }`}
              style={{ '--pa': `${anguloPa(vento)}deg` } as CSSProperties}
            >
              <PedraVento vento={vento} mostrarNome={false} />
            </span>
          )
        })}
        <span className="gato-helice__cubo" />
      </div>
    </div>
  )
}
