import { useState, useCallback } from 'react'
import type { EstadoTorneio } from '../../logica/tipos'
import { parsearJogadores } from '../../logica/jogadores'
import { embaralhar } from '../../logica/aleatorio'
import { gerarGrade } from '../../logica/sorteio'
import { criarTimerVazio } from '../../persistencia/armazenamento'
import { ContadorJogadores } from './ContadorJogadores'

interface PropsConfiguracaoTorneio {
  aoIniciar: (torneio: EstadoTorneio) => void
  aoVoltar?: () => void
}

/**
 * Card de configuração onde o juiz cola a lista de jogadores.
 *
 * `useState` com string vazia: o valor inicial do textarea.
 * Sempre que `texto` muda, React re-renderiza o componente.
 *
 * @param props - aoIniciar (callback com torneio montado) e aoVoltar.
 */
export function ConfiguracaoTorneio({ aoIniciar }: PropsConfiguracaoTorneio) {
  const [texto, setTexto] = useState('')

  const jogadores = parsearJogadores(texto)
  const valido = jogadores.length >= 8 && jogadores.length % 4 === 0

  const handleIniciar = useCallback(() => {
    if (!valido) return

    const embaralhados = embaralhar(jogadores)
    const grade = gerarGrade(embaralhados)

    aoIniciar({
      jogadores: embaralhados,
      grade: grade.rodadas,
      qualidade: grade.qualidade,
      classificacao: Object.fromEntries(embaralhados.map((j) => [j, 0])),
      mesasConcluidas: {},
      pontuacoesPorMesa: {},
      timer: criarTimerVazio(),
    })
  }, [texto, aoIniciar, valido, jogadores])

  return (
    <section className="card" aria-label="Configurar torneio">
      <div className="cabecalho-secao">
        <i className="fas fa-bolt icone-secao" aria-hidden="true" />
        <div>
          <h2>Torneio</h2>
          <p className="subtitulo-secao">Cole ou digite os nomes, um por linha.</p>
        </div>
      </div>

      <textarea
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder={
          'Shigeru Akagi\nKaiji Itou\nSaki Miyanaga\nNodoka Haramura\nToyotomi Hidezoshi\nWashizu Iwao\nTetsuya Asada\nKei Shirogane'
        }
        aria-label="Lista de jogadores"
      />

      <ContadorJogadores texto={texto} />

      <div className="acoes">
        <button className="btn-primario" type="button" onClick={handleIniciar} disabled={!valido}>
          <i className="fas fa-play" /> Gerar torneio
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RANKING GERAL
// ═══════════════════════════════════════════════════════════════════════════════
