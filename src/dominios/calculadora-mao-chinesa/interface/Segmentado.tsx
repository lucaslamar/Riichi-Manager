import { useId } from 'react'
import '@/dominios/configuracoes/interface/pagina-regras.css'

/** O mesmo controle segmentado do Tema e das Pedras nos Ajustes. */
export default function Segmentado<Valor extends string | number>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string
  opcoes: { valor: Valor; rotulo: string }[]
  valor: Valor
  aoMudar: (valor: Valor) => void
}) {
  const nome = useId()
  return (
    <div className="segmentos-tema" role="radiogroup" aria-label={rotulo}>
      {opcoes.map((opcao) => (
        <label key={opcao.valor} className="segmento-tema">
          <input
            type="radio"
            name={nome}
            value={opcao.valor}
            checked={valor === opcao.valor}
            onChange={() => aoMudar(opcao.valor)}
          />
          <span>{opcao.rotulo}</span>
        </label>
      ))}
    </div>
  )
}
