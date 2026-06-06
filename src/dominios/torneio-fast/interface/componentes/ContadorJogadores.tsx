import { parsearJogadores } from '../../logica/jogadores'

interface PropsContadorJogadores {
  texto: string
}

function proximoMultiploValido(n: number): number {
  if (n < 8) return 8
  const resto = n % 4
  return resto === 0 ? n : n + (4 - resto)
}

export function ContadorJogadores({ texto }: PropsContadorJogadores) {
  const jogadores = parsearJogadores(texto)
  const total = jogadores.length
  const valido = total >= 8 && total % 4 === 0
  const proximo = proximoMultiploValido(total + 1)
  const mesas = total / 4

  let cor: string
  let mensagem: string
  let progresso: number

  if (total === 0) {
    cor = '#90a4ae'
    mensagem = 'Adicione pelo menos 8 jogadores'
    progresso = 0
  } else if (total < 8) {
    const faltam = 8 - total
    cor = '#ef5350'
    mensagem = `Faltam ${faltam} jogador${faltam > 1 ? 'es' : ''} — mínimo 8`
    progresso = total / 8
  } else if (!valido) {
    const faltam = proximo - total
    cor = '#ff9800'
    mensagem = `Faltam ${faltam} jogador${faltam > 1 ? 'es' : ''} para fechar múltiplo de 4. Próximo válido: ${proximo}`
    const base = proximo - 4
    progresso = (total - base) / 4
  } else {
    cor = '#4caf50'
    mensagem = `${total} jogadores — ${mesas} mesa${mesas > 1 ? 's' : ''} por rodada ✓`
    progresso = 1
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          height: 4,
          borderRadius: 4,
          background: '#e0e0e0',
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(progresso * 100, 100)}%`,
            background: cor,
            borderRadius: 4,
            transition: 'width 0.2s ease, background 0.2s ease',
          }}
        />
      </div>
      <p
        style={{
          margin: 0,
          color: cor,
          fontSize: '0.85rem',
          fontWeight: 800,
          transition: 'color 0.2s ease',
        }}
      >
        {mensagem}
      </p>
    </div>
  )
}
