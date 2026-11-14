import { useRef, type ReactNode } from 'react'
import { KANJI_VENTO, ORDEM_VENTOS, type Cadeira } from '../../logica/partida'

/** Tempo do toque longo, em ms. */
const TOQUE_LONGO_MS = 550

/**
 * Card quadrado de assento (Nova partida e mesa do Torneio): o kanji do vento
 * grande, o nome embaixo e, opcional, uma linha de destaque (os pontos).
 * Borda tracejada até ser atribuído; contínua quando `ocupado`.
 */
export default function CardAssento({
  cadeira,
  principal,
  apoio,
  destaque,
  ocupado,
  rotulo,
  aoTocar,
  aoTocarLongo,
}: {
  cadeira: Cadeira
  /** Apelido (ou nome) em destaque. */
  principal: ReactNode
  /** Nome completo embaixo do apelido. */
  apoio?: ReactNode
  /** Linha extra abaixo do nome, como os pontos. */
  destaque?: ReactNode
  ocupado: boolean
  rotulo: string
  aoTocar: () => void
  aoTocarLongo?: () => void
}) {
  const temporizador = useRef<number | null>(null)
  const disparouLongo = useRef(false)
  const cancelar = () => {
    if (temporizador.current !== null) window.clearTimeout(temporizador.current)
    temporizador.current = null
  }

  return (
    <button
      type="button"
      className={`ptd-assento${ocupado ? ' ptd-assento--ocupado' : ''}`}
      aria-label={rotulo}
      onPointerDown={
        aoTocarLongo
          ? () => {
              disparouLongo.current = false
              cancelar()
              temporizador.current = window.setTimeout(() => {
                disparouLongo.current = true
                aoTocarLongo()
              }, TOQUE_LONGO_MS)
            }
          : undefined
      }
      onPointerUp={aoTocarLongo ? cancelar : undefined}
      onPointerLeave={aoTocarLongo ? cancelar : undefined}
      onPointerCancel={aoTocarLongo ? cancelar : undefined}
      onContextMenu={aoTocarLongo ? (evento) => evento.preventDefault() : undefined}
      onClick={() => {
        // O toque longo já abriu a troca: o clique que vem junto não conta.
        if (disparouLongo.current) {
          disparouLongo.current = false
          return
        }
        aoTocar()
      }}
    >
      <span className="ptd-assento-kanji" aria-hidden="true">
        {KANJI_VENTO[ORDEM_VENTOS[cadeira]]}
      </span>
      <span className="ptd-assento-nomes">
        <span className="ptd-assento-nome">{principal}</span>
        {apoio && <span className="ptd-assento-apoio">{apoio}</span>}
      </span>
      {destaque}
    </button>
  )
}
