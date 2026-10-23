import type { ReactNode } from 'react'
import './caixa-formula.css'

/**
 * Texto de fórmula com uma marcação mínima, para os textos virem do i18n:
 * `*Han*` vira variável em itálico e `^{2 + *Han*}` vira expoente (<sup>),
 * que pode ter variáveis dentro.
 */
export function TextoFormula({ texto }: { texto: string }) {
  return <>{renderizarFormula(texto)}</>
}

function renderizarFormula(texto: string): ReactNode[] {
  const nos: ReactNode[] = []
  let trecho = ''
  let indice = 0
  const fecharTrecho = () => {
    if (trecho) nos.push(trecho)
    trecho = ''
  }

  while (indice < texto.length) {
    if (texto.startsWith('^{', indice)) {
      const fim = fechamentoChave(texto, indice + 2)
      fecharTrecho()
      nos.push(<sup key={indice}>{renderizarFormula(texto.slice(indice + 2, fim))}</sup>)
      indice = fim + 1
    } else if (texto[indice] === '*' && texto.indexOf('*', indice + 1) > indice) {
      const fim = texto.indexOf('*', indice + 1)
      fecharTrecho()
      nos.push(<i key={indice}>{texto.slice(indice + 1, fim)}</i>)
      indice = fim + 1
    } else {
      trecho += texto[indice]
      indice += 1
    }
  }
  fecharTrecho()
  return nos
}

/** Posição do `}` que fecha a chave aberta antes de `inicio` (aceita chaves dentro). */
function fechamentoChave(texto: string, inicio: number): number {
  let nivel = 1
  for (let indice = inicio; indice < texto.length; indice += 1) {
    if (texto[indice] === '{') nivel += 1
    if (texto[indice] === '}') nivel -= 1
    if (nivel === 0) return indice
  }
  return texto.length
}

/**
 * Conta passo a passo, uma etapa por linha, na fonte da fórmula. Cada linha
 * do texto é uma etapa; um TAB separa o lado esquerdo do direito (linha sem
 * TAB ocupa a largura toda) e `_` no começo marca a linha do total, com um
 * traço em cima. Alinhamento:
 * - `conta`: os dois lados à direita (os "=" em coluna e os números de uma
 *   soma alinhados);
 * - `equacao`: esquerdo à direita, direito à esquerda;
 * - `soma`: rótulo à esquerda, número à direita (ex.: as parcelas do fu).
 */
export function ContaPassos({
  texto,
  alinhar = 'conta',
}: {
  texto: string
  alinhar?: 'conta' | 'equacao' | 'soma'
}) {
  return (
    <div className={`conta-passos conta-passos--${alinhar}`}>
      {texto.split('\n').map((linhaTexto, indice) => {
        const total = linhaTexto.startsWith('_')
        const [esquerda, direita] = (total ? linhaTexto.slice(1) : linhaTexto).split('\t')
        return direita === undefined ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: etapas fixas de uma conta
          <span key={indice} className="conta-passos__linha-inteira">
            <TextoFormula texto={esquerda} />
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: etapas fixas de uma conta
          <span
            key={indice}
            className={`conta-passos__linha${total ? ' conta-passos__linha--total' : ''}`}
          >
            <span>
              <TextoFormula texto={esquerda} />
            </span>
            <span>
              <TextoFormula texto={direita} />
            </span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * Caixa de fórmula de livro didático: borda fina contínua na cor de destaque,
 * fundo bem suave, largura do conteúdo e centralizada. Sem rótulo: o texto em
 * volta já diz o que ela é. Serve a qualquer tutorial.
 */
export default function CaixaFormula({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="caixa-formula-linha">
      <div className={['caixa-formula', className].filter(Boolean).join(' ')}>{children}</div>
    </div>
  )
}
