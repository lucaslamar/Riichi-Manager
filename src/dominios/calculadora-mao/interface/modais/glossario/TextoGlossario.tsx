import { Fragment, useContext, useMemo, useState, type MouseEvent } from 'react'
import { ContextoNavegacaoModal } from '@/compartilhado/interface/componentes/modal/navegacaoModal'
import { dividirTextoGlossario } from '../../../logica/glossario'
import ModalTermo, { ConteudoTermo, TituloTermo } from './ModalTermo'
import './texto-glossario.css'

/**
 * Texto de descrição com os termos do glossário virando links (só a primeira
 * ocorrência de cada um) e `**negrito**`. Tocar num termo abre a definição:
 * dentro de uma Modal, como uma tela dela que entra deslizando de lado (com
 * voltar); fora de modal, numa modal própria.
 *
 * Não viram link os termos em `ignorar` (ex.: o próprio verbete, o yaku do
 * cartão, os assuntos de uma ajuda "?").
 */
export default function TextoGlossario({
  texto,
  ignorar,
}: {
  texto: string
  ignorar?: (string | undefined)[]
}) {
  const abrirTela = useContext(ContextoNavegacaoModal)
  const [termoAberto, setTermoAberto] = useState<string | null>(null)
  const chaveIgnorar = ignorar?.join('|')
  const trechos = useMemo(
    () => dividirTextoGlossario(texto, chaveIgnorar?.split('|')),
    [texto, chaveIgnorar],
  )

  const abrir = (evento: MouseEvent, termo: string) => {
    evento.preventDefault()
    // Não aciona o que estiver em volta (ex.: o cartão do yaku que recolhe ao tocar).
    evento.stopPropagation()
    if (abrirTela) {
      abrirTela({
        titulo: <TituloTermo termo={termo} />,
        conteudo: <ConteudoTermo termo={termo} />,
      })
    } else setTermoAberto(termo)
  }

  return (
    <>
      {trechos.map(({ texto: trecho, negrito, termo }, indice) => {
        const conteudo = termo ? (
          <a
            href={`#glossario-${termo}`}
            className="termo-glossario"
            aria-label={`${trecho}, ver definição`}
            onClick={(evento) => abrir(evento, termo)}
          >
            {trecho}
          </a>
        ) : (
          trecho
        )
        return negrito ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: trechos fixos de um texto
          <strong key={indice}>{conteudo}</strong>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: trechos fixos de um texto
          <Fragment key={indice}>{conteudo}</Fragment>
        )
      })}
      {termoAberto && <ModalTermo termo={termoAberto} aoFechar={() => setTermoAberto(null)} />}
    </>
  )
}
