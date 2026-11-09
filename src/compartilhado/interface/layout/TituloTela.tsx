import { useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { traduzirGlobal } from '@/compartilhado/i18n/tradutorGlobal'

/** Espaço no Cabecalho que recebe o título da tela aberta. */
export const ID_TITULO_TELA = 'cabecalho-tela'

/**
 * Coloca o título da tela no cabeçalho do app. Com `aoVoltar`, a seta e o título
 * ficam no lugar da marca; sem ele, o título aparece ao lado da marca. Sem título,
 * só as ações vão para o cabeçalho (ex.: a engrenagem da Han e Fu).
 */
export default function TituloTela({
  titulo,
  aoVoltar,
  acoes,
}: {
  titulo?: ReactNode
  aoVoltar?: () => void
  /** Botões à direita do título. */
  acoes?: ReactNode
}) {
  const [destino, setDestino] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setDestino(document.getElementById(ID_TITULO_TELA))
  }, [])

  if (!destino) return null

  return createPortal(
    <>
      {aoVoltar && (
        <button
          type="button"
          className="botao-voltar-tela"
          aria-label={traduzirGlobal('actions.back')}
          title={traduzirGlobal('actions.back')}
          onClick={aoVoltar}
        >
          <i className="fas fa-arrow-left" aria-hidden="true" />
        </button>
      )}
      {titulo && <h2 className="titulo-tela">{titulo}</h2>}
      {acoes}
    </>,
    destino,
  )
}
