import { useState, useCallback } from 'react'
import type { EstadoTorneio } from '../../logica/tipos'
import { parsearJogadores, validarJogadores } from '../../logica/jogadores'
import { embaralhar } from '../../logica/aleatorio'
import { gerarGrade } from '../../logica/sorteio'
import { criarTimerVazio } from '../../persistencia/armazenamento'

interface PropsConfiguracaoTorneio {
  aoIniciar: (torneio: EstadoTorneio) => void
  aoVoltar: () => void
}

/**
 * Card de configuração onde o juiz cola a lista de jogadores.
 *
 * `useState` com string vazia: o valor inicial do textarea.
 * Sempre que `texto` muda, React re-renderiza o componente.
 *
 * @param props - aoIniciar (callback com torneio montado) e aoVoltar.
 */
export function ConfiguracaoTorneio({ aoIniciar, aoVoltar }: PropsConfiguracaoTorneio) {
  // `texto` é o estado local — só existe neste componente.
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')

  const handleIniciar = useCallback(() => {
    const jogadores = parsearJogadores(texto)
    const mensagemErro = validarJogadores(jogadores)

    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    const embaralhados = embaralhar(jogadores)
    const grade = gerarGrade(embaralhados)

    // Monta o estado inicial do torneio e avisa o pai.
    aoIniciar({
      jogadores: embaralhados,
      grade: grade.rodadas,
      qualidade: grade.qualidade,
      classificacao: Object.fromEntries(embaralhados.map((j) => [j, 0])),
      mesasConcluidas: {},
      pontuacoesPorMesa: {},
      timer: criarTimerVazio(),
    })
  }, [texto, aoIniciar])

  return (
    <section className="card" aria-label="Configurar torneio fast">
      <div className="cabecalho-secao">
        <i className="fas fa-bolt icone-secao" aria-hidden="true" />
        <div>
          <h2>Torneio Fast</h2>
          <p className="subtitulo-secao">Cole ou digite os nomes, um por linha.</p>
        </div>
      </div>

      {/* O valor do textarea é controlado pelo estado `texto` */}
      <textarea
        value={texto}
        onChange={(evento) => {
          setTexto(evento.target.value)
          setErro('')
        }}
        placeholder={
          'Shigeru Akagi\nKaiji Itou\nSaki Miyanaga\nNodoka Haramura\nToyotomi Hidezoshi\nWashizu Iwao\nTetsuya Asada\nKei Shirogane'
        }
        aria-label="Lista de jogadores"
      />

      {/* Renderização condicional: só aparece se `erro` for truthy */}
      {erro && (
        <div
          className="alerta-info"
          style={{
            borderLeftColor: '#ef5350',
            background: '#fff5f5',
            color: '#b71c1c',
            marginBottom: 16,
          }}
        >
          <i className="fas fa-exclamation-circle" /> {erro}
        </div>
      )}

      <div className="acoes">
        <button className="btn-contorno" type="button" onClick={aoVoltar}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        <button className="btn-primario" type="button" onClick={handleIniciar}>
          <i className="fas fa-play" /> Gerar torneio
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RANKING GERAL
// ═══════════════════════════════════════════════════════════════════════════════
