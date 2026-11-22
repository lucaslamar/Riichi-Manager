import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { Relatorio } from '@/compartilhado/relatorio/relatorio'
import { useEnviarRelatorio } from '../hooks/useEnviarRelatorio'

/** Opção a mais da folha (ex.: PDF no Ranking, Transferir torneio nas Mesas). */
interface OpcaoCompartilhar {
  icone: string
  rotulo: string
  ajuda?: string
  aoTocar: () => void
}

/**
 * Folha do botão Compartilhar (topo das Mesas e do Ranking): o relatório como texto
 * para o WhatsApp ou como imagem PNG, e as opções da tela logo abaixo.
 */
export default function FolhaCompartilhar({
  relatorio,
  nomeArquivo,
  aoAvisar,
  aoFechar,
  extras = [],
}: {
  /** Montado só ao tocar, com os dados do momento. */
  relatorio: () => Relatorio
  /** Sem extensão: vira "<nome>.png". */
  nomeArquivo: string
  aoAvisar: (mensagem: string) => void
  aoFechar: () => void
  extras?: readonly OpcaoCompartilhar[]
}) {
  const { t } = useI18n()
  const { texto, imagem, gerando } = useEnviarRelatorio({ relatorio, nomeArquivo, aoAvisar, aoFechar })

  const opcoes: OpcaoCompartilhar[] = [
    { icone: 'fab fa-whatsapp', rotulo: t('tournament.share.text'), ajuda: t('tournament.share.textHelp'), aoTocar: texto },
    { icone: 'fas fa-image', rotulo: t('tournament.share.image'), ajuda: t('tournament.share.imageHelp'), aoTocar: imagem },
    ...extras,
  ]

  return (
    <Modal titulo={t('tournament.share.title')} aoFechar={aoFechar} rotuloFechar={t('actions.close')} tamanho="pequena">
      <ul className="trn-menu trn-compartilhar">
        {opcoes.map((opcao) => (
          <li key={opcao.rotulo}>
            <button type="button" onClick={opcao.aoTocar} disabled={gerando}>
              <i className={opcao.icone.includes(' ') ? opcao.icone : `fas ${opcao.icone}`} aria-hidden="true" />
              <span>
                {opcao.rotulo}
                {opcao.ajuda && <small>{opcao.ajuda}</small>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
