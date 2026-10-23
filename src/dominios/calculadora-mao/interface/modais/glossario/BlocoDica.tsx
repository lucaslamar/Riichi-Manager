import TextoGlossario from './TextoGlossario'
import './bloco-dica.css'

/**
 * Bloco de dica ou aviso em cinza com ícone de info (ex.: "Dora não é yaku",
 * a dica do Chiitoitsu). Serve em qualquer cartão de yaku ou verbete; o texto
 * ganha os links do glossário como as descrições.
 */
export default function BlocoDica({
  texto,
  ignorar,
  className,
}: {
  texto: string
  ignorar?: (string | undefined)[]
  className?: string
}) {
  return (
    <p className={['bloco-dica', className].filter(Boolean).join(' ')}>
      <i className="fas fa-circle-info" aria-hidden="true" />{' '}
      <TextoGlossario texto={texto} ignorar={ignorar} />
    </p>
  )
}
