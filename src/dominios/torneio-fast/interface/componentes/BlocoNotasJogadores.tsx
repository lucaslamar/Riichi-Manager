import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { buscarJogadores, normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import { colarNaLinha, linhasRepetidas } from '../../logica/blocoNotas'

const MAXIMO_SUGESTOES = 4

/**
 * Página de bloco de notas: um nome por linha, sem caixa. Enter cria a próxima,
 * Backspace numa linha vazia volta para a anterior e colar uma lista quebra em linhas.
 */
export default function BlocoNotasJogadores({
  linhas,
  aoMudar,
}: {
  linhas: string[]
  aoMudar: (linhas: string[]) => void
}) {
  const { t } = useI18n()
  const { jogadores } = useJogadores()
  const entradas = useRef<(HTMLInputElement | null)[]>([])
  const [emFoco, setEmFoco] = useState<number | null>(null)
  const [focarLinha, setFocarLinha] = useState<number | null>(null)

  useEffect(() => {
    if (focarLinha === null) return
    entradas.current[focarLinha]?.focus()
    setFocarLinha(null)
  }, [focarLinha])

  const repetidas = useMemo(() => linhasRepetidas(linhas), [linhas])

  const textoAtual = emFoco === null ? '' : (linhas[emFoco] ?? '')
  const sugestoes = useMemo(() => {
    const busca = normalizarTexto(textoAtual)
    if (!busca) return []
    const usados = new Set(linhas.map(normalizarTexto))
    return buscarJogadores(
      jogadores.filter((jogador) => !jogador.arquivado && !usados.has(normalizarTexto(jogador.nome))),
      textoAtual,
    ).slice(0, MAXIMO_SUGESTOES)
  }, [textoAtual, linhas, jogadores])

  const mudarLinha = (indice: number, valor: string) =>
    aoMudar(linhas.map((linha, atual) => (atual === indice ? valor : linha)))

  const aoTeclar = (evento: KeyboardEvent<HTMLInputElement>, indice: number) => {
    if (evento.key === 'Enter') {
      evento.preventDefault()
      aoMudar([...linhas.slice(0, indice + 1), '', ...linhas.slice(indice + 1)])
      setFocarLinha(indice + 1)
    } else if (evento.key === 'Backspace' && linhas[indice] === '' && indice > 0) {
      evento.preventDefault()
      aoMudar(linhas.filter((_, atual) => atual !== indice))
      setFocarLinha(indice - 1)
    } else if (evento.key === 'ArrowUp' && indice > 0) {
      setFocarLinha(indice - 1)
    } else if (evento.key === 'ArrowDown' && indice < linhas.length - 1) {
      setFocarLinha(indice + 1)
    }
  }

  const aoColar = (evento: ClipboardEvent<HTMLInputElement>, indice: number) => {
    const texto = evento.clipboardData.getData('text')
    // Um nome só segue o colar normal do campo.
    if (!/\r?\n/.test(texto.trim())) return
    evento.preventDefault()
    const proximas = colarNaLinha(linhas, indice, texto)
    aoMudar([...proximas, ''])
    setFocarLinha(proximas.length)
  }

  return (
    <div className="trn-bloco">
      <ol className="trn-bloco-linhas">
        {linhas.map((linha, indice) => (
          // A posição é a identidade da linha: é um bloco de notas.
          <li key={indice} className="trn-bloco-linha">
            <span className="trn-bloco-numero" aria-hidden="true">
              {indice + 1}
            </span>
            <input
              ref={(elemento) => {
                entradas.current[indice] = elemento
              }}
              className={`trn-bloco-entrada${repetidas.has(indice) ? ' trn-bloco-entrada--repetida' : ''}`}
              type="text"
              value={linha}
              enterKeyHint="next"
              autoComplete="off"
              autoCapitalize="words"
              aria-label={t('tournament.notes.lineLabel', { line: indice + 1 })}
              aria-invalid={repetidas.has(indice)}
              placeholder={indice === 0 ? t('tournament.notes.placeholder') : undefined}
              onFocus={() => setEmFoco(indice)}
              onChange={(evento) => mudarLinha(indice, evento.target.value)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              onPaste={(evento) => aoColar(evento, indice)}
            />
          </li>
        ))}
      </ol>

      {sugestoes.length > 0 && emFoco !== null && (
        <div className="trn-sugestoes" role="group" aria-label={t('tournament.notes.suggestions')}>
          {sugestoes.map((jogador) => (
            <button
              key={jogador.id}
              type="button"
              className="trn-sugestao"
              // Sem isso o campo perde o foco e o teclado fecha antes do clique.
              onPointerDown={(evento) => evento.preventDefault()}
              onClick={() => mudarLinha(emFoco, jogador.nome)}
            >
              {jogador.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
