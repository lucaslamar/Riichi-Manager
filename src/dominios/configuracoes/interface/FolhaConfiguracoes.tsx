import { useId, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import ListaAjustesApp from './ListaAjustesApp'
import './folha-configuracoes.css'

/** Aba da tela (ex.: Regras de cálculo), antes da "Ajustes do app". */
export interface AbaConfiguracoes {
  id: string
  rotulo: string
  /** Subtítulo da folha enquanto esta aba está aberta. */
  subtitulo?: string
  conteudo: ReactNode
  /** Rodapé só desta aba (ex.: Restaurar padrão e Aplicar). */
  rodape?: ReactNode
}

function movimentoReduzido(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Folha "Configurações" das telas principais: as abas da própria tela (se houver)
 * e, por último, "Ajustes do app", que vale na hora. Troca de aba tocando nela ou
 * deslizando o dedo para o lado: o trilho é um scroll horizontal com snap, então o
 * conteúdo e o indicador da aba acompanham o dedo, e cada aba rola na vertical
 * sozinha. Abre sempre na primeira aba.
 */
export default function FolhaConfiguracoes({
  abas = [],
  aoFechar,
  className,
}: {
  abas?: readonly AbaConfiguracoes[]
  aoFechar: () => void
  /** Classe a mais na Modal (ex.: a da folha de regras, para o rodapé dela). */
  className?: string
}) {
  const { t } = useI18n()
  const id = useId()
  const trilhoRef = useRef<HTMLDivElement>(null)
  const indicadorRef = useRef<HTMLSpanElement>(null)
  const [ativa, setAtiva] = useState(0)

  const todas: AbaConfiguracoes[] = [
    ...abas,
    {
      id: 'app',
      rotulo: t('settingsSheet.appTab'),
      subtitulo: t('settingsSheet.appHelp'),
      conteudo: (
        <div className="folha-cfg__ajustes">
          <ListaAjustesApp />
        </div>
      ),
    },
  ]
  const total = todas.length
  const atual = todas[Math.min(ativa, total - 1)]

  // O indicador anda junto com o scroll (estilo direto, sem render a cada quadro)
  // e a aba ativa muda quando o trilho passa da metade do caminho.
  const aoRolar = () => {
    const trilho = trilhoRef.current
    if (!trilho) return
    const progresso = trilho.scrollLeft / (trilho.clientWidth || 1)
    if (indicadorRef.current) indicadorRef.current.style.transform = `translateX(${progresso * 100}%)`
    const indice = Math.max(0, Math.min(total - 1, Math.round(progresso)))
    if (indice !== ativa) setAtiva(indice)
  }

  const irPara = (indice: number) => {
    const trilho = trilhoRef.current
    if (!trilho) return
    trilho.scrollTo({ left: indice * trilho.clientWidth, behavior: movimentoReduzido() ? 'auto' : 'smooth' })
    setAtiva(indice)
  }

  // Setas do teclado na fileira de abas, como num tablist.
  const aoTeclar = (evento: React.KeyboardEvent) => {
    if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return
    evento.preventDefault()
    const destino = (ativa + (evento.key === 'ArrowRight' ? 1 : -1) + total) % total
    irPara(destino)
    document.getElementById(`${id}-aba-${destino}`)?.focus()
  }

  return (
    <Modal
      titulo={t('menu.rules')}
      subtitulo={atual.subtitulo}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="grande"
      className={['folha-cfg', className].filter(Boolean).join(' ')}
      rodape={atual.rodape}
    >
      {total > 1 && (
        <div
          className="folha-cfg__abas"
          role="tablist"
          aria-label={t('settingsSheet.tabs')}
          onKeyDown={aoTeclar}
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {todas.map((aba, indice) => (
            <button
              key={aba.id}
              id={`${id}-aba-${indice}`}
              type="button"
              role="tab"
              aria-selected={indice === ativa}
              aria-controls={`${id}-painel-${indice}`}
              tabIndex={indice === ativa ? 0 : -1}
              className={`folha-cfg__aba${indice === ativa ? ' folha-cfg__aba--ativa' : ''}`}
              onClick={() => irPara(indice)}
            >
              {aba.rotulo}
            </button>
          ))}
          <span
            ref={indicadorRef}
            className="folha-cfg__indicador"
            aria-hidden="true"
            style={{ width: `${100 / total}%` }}
          />
        </div>
      )}
      <div ref={trilhoRef} className="folha-cfg__trilho" onScroll={aoRolar}>
        {todas.map((aba, indice) => (
          <section
            key={aba.id}
            id={`${id}-painel-${indice}`}
            className="folha-cfg__painel"
            role={total > 1 ? 'tabpanel' : undefined}
            aria-labelledby={total > 1 ? `${id}-aba-${indice}` : undefined}
            aria-hidden={indice !== ativa || undefined}
            // Fora da aba aberta: sai do Tab e do leitor de tela, mas continua visível no deslize.
            {...(indice !== ativa ? { inert: '' } : {})}
          >
            {aba.conteudo}
          </section>
        ))}
      </div>
    </Modal>
  )
}
