import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import '@/dominios/centerpiece/interface/config-mesa.css'
import { premiacaoValida } from '../../logica/premiacao'
import type { ConfigPremiacao } from '../../logica/tipos'
import EditorPremiacao from './EditorPremiacao'
import QuadroPremiacao from './QuadroPremiacao'

/** Premiação fora das configurações: no Ranking e na Temporada, onde ela muda com o torneio andando. */
export default function FolhaPremiacao({
  inicial,
  jogadores,
  aoSalvar,
  aoFechar,
}: {
  inicial: ConfigPremiacao
  jogadores: number
  /** Ausente: só consulta. */
  aoSalvar?: (config: ConfigPremiacao) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [config, setConfig] = useState(inicial)

  return (
    <Modal
      titulo={t('tournament.prize.tab')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="config-mesa"
      rodape={
        aoSalvar && (
          <div className="cfg-acoes">
            <button type="button" className="btn-contorno" onClick={aoFechar}>
              {t('actions.cancel')}
            </button>
            <button
              type="button"
              className="btn-primario"
              disabled={!premiacaoValida(config)}
              onClick={() => {
                aoSalvar(config)
                aoFechar()
              }}
            >
              {t('tournament.settings.save')}
            </button>
          </div>
        )
      }
    >
      <div className="cfg-corpo">
        <section className="cfg-secao">
          {aoSalvar ? (
            <EditorPremiacao config={config} jogadores={jogadores} aoMudar={setConfig} />
          ) : (
            <QuadroPremiacao config={config} jogadores={jogadores} />
          )}
        </section>
      </div>
    </Modal>
  )
}
