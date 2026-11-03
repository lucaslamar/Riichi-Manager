import '@/dominios/calculadora-mao/interface/modais/regras/modal-regras.css'
import '../config-mesa.css'

/** Escolha de uma entre poucas opções, no mesmo controle das regras de cálculo. */
export default function BotoesOpcao<Valor extends string | number>({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
  empilhado = false,
}: {
  rotulo: string
  opcoes: readonly { valor: Valor; rotulo: string }[]
  valor: Valor
  aoEscolher: (valor: Valor) => void
  /** Rótulos longos: uma opção por linha. */
  empilhado?: boolean
}) {
  return (
    <div
      className={`controle-regra cfg-opcoes${empilhado ? ' cfg-opcoes--empilhado' : ''}`}
      style={{ gridTemplateColumns: `repeat(${empilhado ? 1 : opcoes.length}, minmax(0, 1fr))` }}
      role="group"
      aria-label={rotulo}
    >
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          className={opcao.valor === valor ? 'ativo' : ''}
          aria-pressed={opcao.valor === valor}
          onClick={() => {
            if (opcao.valor !== valor) aoEscolher(opcao.valor)
          }}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}
