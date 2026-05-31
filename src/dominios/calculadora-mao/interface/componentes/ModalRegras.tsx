import { useEffect, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { configuracaoPadrao, type ConfiguracaoCalculo } from '../../logica/mao'
import { CONFIGURACOES_REGRAS } from '../constantes'

const CHAVES_REGRAS: Record<
  keyof ConfiguracaoCalculo,
  { titulo: string; ajuda: string; ligado: string; desligado: string }
> = {
  akadora: {
    titulo: 'rulesModal.akadora.title',
    ajuda: 'rulesModal.akadora.help',
    ligado: 'rulesModal.akadora.on',
    desligado: 'rulesModal.akadora.off',
  },
  tanyaoAberto: {
    titulo: 'rulesModal.tanyaoAberto.title',
    ajuda: 'rulesModal.tanyaoAberto.help',
    ligado: 'rulesModal.tanyaoAberto.on',
    desligado: 'rulesModal.tanyaoAberto.off',
  },
  fuVentosDuplo: {
    titulo: 'rulesModal.fuVentosDuplo.title',
    ajuda: 'rulesModal.fuVentosDuplo.help',
    ligado: 'rulesModal.fuVentosDuplo.on',
    desligado: 'rulesModal.fuVentosDuplo.off',
  },
  fuRinshan: {
    titulo: 'rulesModal.fuRinshan.title',
    ajuda: 'rulesModal.fuRinshan.help',
    ligado: 'rulesModal.fuRinshan.on',
    desligado: 'rulesModal.fuRinshan.off',
  },
  kiriageMangan: {
    titulo: 'rulesModal.kiriageMangan.title',
    ajuda: 'rulesModal.kiriageMangan.help',
    ligado: 'rulesModal.kiriageMangan.on',
    desligado: 'rulesModal.kiriageMangan.off',
  },
  kazoeYakuman: {
    titulo: 'rulesModal.kazoeYakuman.title',
    ajuda: 'rulesModal.kazoeYakuman.help',
    ligado: 'rulesModal.kazoeYakuman.on',
    desligado: 'rulesModal.kazoeYakuman.off',
  },
  yakumanDuplo: {
    titulo: 'rulesModal.yakumanDuplo.title',
    ajuda: 'rulesModal.yakumanDuplo.help',
    ligado: 'rulesModal.yakumanDuplo.on',
    desligado: 'rulesModal.yakumanDuplo.off',
  },
  multiYakuman: {
    titulo: 'rulesModal.multiYakuman.title',
    ajuda: 'rulesModal.multiYakuman.help',
    ligado: 'rulesModal.multiYakuman.on',
    desligado: 'rulesModal.multiYakuman.off',
  },
}

function elementosFocaveis(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export default function ModalRegras({
  configuracao,
  aoMudar,
  aoFechar,
}: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const modalRef = useRef<HTMLDivElement | null>(null)
  const botaoFecharRef = useRef<HTMLButtonElement | null>(null)
  const focoAnteriorRef = useRef<HTMLElement | null>(null)
  const aoFecharRef = useRef(aoFechar)

  const alternar = (chave: keyof ConfiguracaoCalculo) => {
    aoMudar({ ...configuracao, [chave]: !configuracao[chave] })
  }

  useEffect(() => {
    aoFecharRef.current = aoFechar
  }, [aoFechar])

  /**
   * Prende o foco dentro da modal de regras e devolve o foco ao botao que a abriu.
   *
   * Chamado quando a engrenagem do teclado ou a acao Regras da finalizacao abre
   * as configuracoes. Nao altera regra de Mahjong; apenas controla acessibilidade.
   */
  useEffect(() => {
    focoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    botaoFecharRef.current?.focus()

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        aoFecharRef.current()
        return
      }

      const modal = modalRef.current
      if (evento.key !== 'Tab' || !modal) return

      const focaveis = elementosFocaveis(modal)
      if (focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)

    return () => {
      document.removeEventListener('keydown', aoPressionarTecla)
      focoAnteriorRef.current?.focus()
    }
  }, [])

  return (
    <div
      className="modal-regras-fundo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        ref={modalRef}
        className="modal-regras"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-regras"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <div className="modal-regras-cabecalho">
          <div>
            <h3 id="titulo-regras">{t('rulesModal.title')}</h3>
            <p>{t('rulesModal.help')}</p>
          </div>
          <button
            ref={botaoFecharRef}
            className="btn-icone"
            type="button"
            onClick={aoFechar}
            aria-label={t('rulesModal.close')}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <div className="lista-regras">
          {CONFIGURACOES_REGRAS.map((regra) => {
            const ativo = configuracao[regra.chave]
            const textos = CHAVES_REGRAS[regra.chave]
            const titulo = t(textos.titulo)
            const ajudaId = `ajuda-regra-${regra.chave}`

            return (
              <div className="linha-regra" key={regra.chave}>
                <div className="texto-regra">
                  <strong>{titulo}</strong>
                  <span id={ajudaId}>{t(textos.ajuda)}</span>
                </div>
                <div className="controle-regra" aria-label={titulo} aria-describedby={ajudaId}>
                  <button
                    type="button"
                    className={ativo ? 'ativo' : ''}
                    aria-pressed={ativo}
                    onClick={() => {
                      if (!ativo) alternar(regra.chave)
                    }}
                  >
                    {t(textos.ligado)}
                  </button>
                  <button
                    type="button"
                    className={!ativo ? 'ativo' : ''}
                    aria-pressed={!ativo}
                    onClick={() => {
                      if (ativo) alternar(regra.chave)
                    }}
                  >
                    {t(textos.desligado)}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="modal-regras-rodape">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => aoMudar(configuracaoPadrao)}
          >
            {t('rulesModal.restoreDefault')}
          </button>
          <button type="button" className="btn-primario" onClick={aoFechar}>
            {t('rulesModal.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}
