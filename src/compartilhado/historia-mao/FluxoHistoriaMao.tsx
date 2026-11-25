import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import type { DadosHistoria } from './comporHistoria'
import TelaCamera from './TelaCamera'
import TelaPrevia from './TelaPrevia'
import './historia-mao.css'

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
      <TelaPrevia foto={foto} dados={dados} aoRefazer={() => setFoto(null)} aoFechar={aoFechar} />
    ) : (
      <TelaCamera aoCapturar={setFoto} aoFechar={aoFechar} />
    ),
    document.body,
  )
}
