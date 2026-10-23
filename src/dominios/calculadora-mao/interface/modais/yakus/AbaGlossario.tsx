import { useRef } from 'react'
import { SECOES_GLOSSARIO } from '../../../logica/glossario'
import BlocoGlossario from '../glossario/BlocoGlossario'
import './aba-glossario.css'

/** Respiro entre a fileira de abas (presa no topo) e o título do assunto. */
const RESPIRO_ROLAGEM = 8

/**
 * Glossário por assunto (pedras, formação da mão, chamadas, vitória, dora,
 * pontuação, mesa…), um bloco por assunto. Os textos vêm de
 * `logica/glossario.ts`, a mesma fonte da tela de termo.
 *
 * No topo, o sumário: um link por assunto que rola até o bloco. A busca é do
 * Guia de bolso inteiro (ModalYakus).
 */
export default function AbaGlossario() {
  const raizRef = useRef<HTMLDivElement>(null)

  const irPara = (secao: string) => {
    const raiz = raizRef.current
    const corpo = raiz?.closest('.modal-corpo')
    const bloco = raiz?.querySelector(`[data-secao="${secao}"]`)
    if (!corpo || !bloco) return
    const abas = corpo.querySelector('.abas-modal__topo')?.getBoundingClientRect().height ?? 0
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    corpo.scrollTo({
      top:
        corpo.scrollTop +
        bloco.getBoundingClientRect().top -
        corpo.getBoundingClientRect().top -
        abas -
        RESPIRO_ROLAGEM,
      behavior: reduzir ? 'auto' : 'smooth',
    })
  }

  return (
    <div ref={raizRef} className="aba-glossario">
      <nav className="aba-glossario__sumario" aria-label="Assuntos do glossário">
        <span className="aba-glossario__sumario-rotulo" aria-hidden="true">
          Sumário:
        </span>
        {SECOES_GLOSSARIO.map((secao) => (
          <button key={secao.id} type="button" onClick={() => irPara(secao.id)}>
            {secao.titulo}
          </button>
        ))}
      </nav>
      {SECOES_GLOSSARIO.map((secao) => (
        <BlocoGlossario key={secao.id} secao={secao} />
      ))}
    </div>
  )
}
