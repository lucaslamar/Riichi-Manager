import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import type { DadosHistoria } from './comporHistoria'
import TelaCamera from './TelaCamera'
import TelaPrevia from './TelaPrevia'
import './historia-mao.css'

const CHAVE_DICA = 'riichi-manager-historia-mao-dica'
/** A dica do Link aparece nas 3 primeiras vezes que a tela abre. */
const VEZES_DICA = 3

function vezesQueAbriu(): number {
  try {
    return Number(localStorage.getItem(CHAVE_DICA)) || 0
  } catch {
    return VEZES_DICA
  }
}

/**
 * Compartilhar a mão: câmera → prévia → folha do sistema. Fica por cima do
 * Resultado (Riichi e MCR) e volta para ele ao fechar. A foto nunca sai do aparelho.
 */
export default function FluxoHistoriaMao({
  dados,
  aoFechar,
}: {
  dados: DadosHistoria
  aoFechar: () => void
}) {
  const [foto, setFoto] = useState<ImageBitmap | null>(null)
  const [mostrarDica] = useState(() => vezesQueAbriu() < VEZES_DICA)
  const contou = useRef(false)

  // Conta a abertura uma vez só (o StrictMode roda o efeito duas vezes).
  useEffect(() => {
    if (contou.current) return
    contou.current = true
    try {
      localStorage.setItem(CHAVE_DICA, String(vezesQueAbriu() + 1))
    } catch {
      // Sem armazenamento, a dica só não é contada.
    }
  }, [])

  // Camada no topo: o Esc e o Tab são daqui, não do Resultado embaixo.
  useEffect(() => {
    const camada = empilharCamada()
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && camada.noTopo()) {
        evento.stopPropagation()
        aoFechar()
      }
    }
    document.addEventListener('keydown', aoTeclar, true)
    return () => {
      document.removeEventListener('keydown', aoTeclar, true)
      camada.remover()
    }
  }, [aoFechar])

  useEffect(() => () => foto?.close(), [foto])

  return createPortal(
    foto ? (
      <TelaPrevia
        foto={foto}
        dados={dados}
        mostrarDica={mostrarDica}
        aoRefazer={() => setFoto(null)}
        aoFechar={aoFechar}
      />
    ) : (
      <TelaCamera aoCapturar={setFoto} aoFechar={aoFechar} />
    ),
    document.body,
  )
}
