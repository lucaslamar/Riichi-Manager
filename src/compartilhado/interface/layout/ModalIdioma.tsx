import { useI18n, type IdiomaSuportado } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import Modal from '../componentes/modal/Modal'
import { useDeslizeHorizontal } from '../hooks/useDeslizeHorizontal'

interface PropsModalIdioma {
  aoFechar: () => void
  /** Idioma é parada do carrossel: dedo para a esquerda segue para a tela seguinte. */
  aoProximaTela?: () => void
}

/** Lista de idiomas, aberta pela barra de navegação ou deslizando a partir das Configurações. */
export default function ModalIdioma({ aoFechar, aoProximaTela }: PropsModalIdioma) {
  const { t, idioma, idiomas, alterarIdioma } = useI18n()

  // Dedo para a direita volta para a tela de baixo; para a esquerda, a seguinte.
  useDeslizeHorizontal({
    dentroDaCamada: true,
    aoDeslizarDireita: aoFechar,
    aoDeslizarEsquerda: aoProximaTela ?? aoFechar,
  })

  const escolher = (opcao: IdiomaSuportado) => {
    alterarIdioma(opcao)
    aoFechar()
  }

  return (
    <Modal
      titulo={t('menu.language')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
    >
      <div className="lista-idiomas" role="radiogroup" aria-label={t('menu.language')}>
        {idiomas.map((opcao) => (
          <button
            key={opcao}
            type="button"
            role="radio"
            aria-checked={opcao === idioma}
            className={`item-idioma${opcao === idioma ? ' ativo' : ''}`}
            lang={opcao}
            onClick={() => escolher(opcao)}
          >
            <span>{ROTULOS_IDIOMA[opcao]}</span>
            {opcao === idioma && <i className="fas fa-check" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </Modal>
  )
}
