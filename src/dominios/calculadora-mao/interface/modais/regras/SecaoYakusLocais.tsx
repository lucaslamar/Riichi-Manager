import { useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useYakusLocais, type VariacaoPaarenchan } from '@/compartilhado/configuracoes/useYakusLocais'
import { YAKUS_LOCAIS, textoYakuLocal, type YakuLocal } from '../../../logica/yakusLocais'
import { LinhaRegraOpcoes } from './ModalRegras'
import { PedrasExemplo } from '../yakus/PedrasExemplo'
import { parseMpszGrupos } from '../../../logica/yakus'
import { EXEMPLOS_YAKUS_LOCAIS } from '../../../logica/exemplosYakusLocais'


/** "Yakus locais" sublinhado como termo do glossário: abre a lista de todos. */
export function TermoYakusLocais({ rotulo }: { rotulo?: string }) {
  const { t } = useI18n()
  const [aberta, setAberta] = useState(false)
  return (
    <>
      <a
        href="#yakus-locais"
        className="termo-glossario"
        aria-label={t('pocketGuide.seeDefinition', { termo: rotulo ?? t('localYaku.title') })}
        onClick={(evento) => {
          evento.preventDefault()
          evento.stopPropagation()
          setAberta(true)
        }}
      >
        {rotulo ?? t('localYaku.title')}
      </a>
      {aberta && <ModalListaYakusLocais aoFechar={() => setAberta(false)} />}
    </>
  )
}

/** Todos os yakus locais: nome, kanji, valor e descrição curta. */
export function ModalListaYakusLocais({ aoFechar }: { aoFechar: () => void }) {
  const { t, idioma } = useI18n()
  return (
    <Modal titulo={t('localYaku.title')} subtitulo={t('localYaku.listHelp')} aoFechar={aoFechar} rotuloFechar={t('actions.close')} tamanho="media">
      <ul className="lista-yakus-locais">
        {YAKUS_LOCAIS.map((yaku) => {
          const texto = textoYakuLocal(yaku, idioma)
          return (
            <li key={yaku.id}>
              <div className="lista-yakus-locais__topo">
                <strong>{yaku.nome}</strong>
                <span lang="ja">{yaku.kanji}</span>
              </div>
              <small>{texto.valor}</small>
              <p>{texto.descricao}</p>
              {EXEMPLOS_YAKUS_LOCAIS[yaku.id] && (
                <PedrasExemplo
                  grupos={parseMpszGrupos(EXEMPLOS_YAKUS_LOCAIS[yaku.id])}
                  rotulo={t('pocketGuide.example', { exemplo: EXEMPLOS_YAKUS_LOCAIS[yaku.id] })}
                />
              )}
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

/**
 * Seção Yakus locais das Regras de cálculo: um liga/desliga por yaku (todos
 * desligados por padrão), Ativar todos / Desativar todos, e as opções do
 * Paarenchan e do Renhou quando eles estão ligados.
 */
export default function SecaoYakusLocais({ mostrar }: { mostrar?: (texto: string) => boolean }) {
  const { t, idioma } = useI18n()
  const { yakusLocais, mudarYakusLocais, alternarYakuLocal } = useYakusLocais()
  const ativos = new Set(yakusLocais.ativos)
  const todosLigados = ativos.size === YAKUS_LOCAIS.length
  const ligado = [
    { valor: true, rotulo: t('rulesModal.akadora.on') },
    { valor: false, rotulo: t('rulesModal.akadora.off') },
  ]

  const textoDe = (yaku: YakuLocal) => {
    const texto = textoYakuLocal(yaku, idioma)
    return `${yaku.nome} ${yaku.kanji} ${texto.traducao} ${texto.descricao}`
  }
  const visiveis = YAKUS_LOCAIS.filter((yaku) => !mostrar || mostrar(textoDe(yaku)))
  const tituloCasa = !mostrar || mostrar(`${t('localYaku.title')} ${t('localYaku.help')}`)
  if (visiveis.length === 0 && !tituloCasa) return null

  return (
    <section id="regra-yakusLocais" className="secao-yakus-locais" aria-labelledby="titulo-yakus-locais">
      <div className="secao-yakus-locais__cabecalho">
        <h3 id="titulo-yakus-locais">
          <TermoYakusLocais />
        </h3>
        <button
          type="button"
          className="btn-contorno"
          onClick={() => mudarYakusLocais({ ativos: todosLigados ? [] : YAKUS_LOCAIS.map((yaku) => yaku.id) })}
        >
          {t(todosLigados ? 'localYaku.disableAll' : 'localYaku.enableAll')}
        </button>
      </div>
      <p className="secao-yakus-locais__ajuda">{t('localYaku.help')}</p>

      <div className="lista-regras">
        {visiveis.map((yaku) => {
          const texto = textoYakuLocal(yaku, idioma)
          const ativo = ativos.has(yaku.id)
          return (
            <div key={yaku.id}>
              {/* Caixa de seleção com a explicação ao lado: a lista é longa. */}
              <label className={`yaku-local-check${ativo ? ' yaku-local-check--ativo' : ''}`}>
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(evento) => alternarYakuLocal(yaku.id, evento.target.checked)}
                />
                <span className="yaku-local-check__texto">
                  <span className="yaku-local-check__topo">
                    <strong>{yaku.nome}</strong>
                    <span lang="ja">{yaku.kanji}</span>
                    <em>{texto.valor}</em>
                  </span>
                  <small>
                    {texto.descricao}
                    {yaku.situacao && <> {t('localYaku.conditionNote')}</>}
                  </small>
                  {EXEMPLOS_YAKUS_LOCAIS[yaku.id] && (
                    <PedrasExemplo
                      grupos={parseMpszGrupos(EXEMPLOS_YAKUS_LOCAIS[yaku.id])}
                      rotulo={t('pocketGuide.example', { exemplo: EXEMPLOS_YAKUS_LOCAIS[yaku.id] })}
                    />
                  )}
                </span>
              </label>
              {yaku.id === 'paarenchan' && ativo && (
                <div className="sub-regras">
                  <LinhaRegraOpcoes<'1' | '2' | '3'>
                    titulo={t('localYaku.paarenchan.variation')}
                    ajuda={t(`localYaku.paarenchan.variation${yakusLocais.paarenchan.variacao}`)}
                    valor={String(yakusLocais.paarenchan.variacao) as '1' | '2' | '3'}
                    aoMudar={(valor) =>
                      mudarYakusLocais({
                        paarenchan: { ...yakusLocais.paarenchan, variacao: Number(valor) as VariacaoPaarenchan },
                      })
                    }
                    opcoes={(['1', '2', '3'] as const).map((valor) => ({ valor, rotulo: valor }))}
                  />
                  <LinhaRegraOpcoes
                    titulo={t('localYaku.paarenchan.shibari')}
                    ajuda={t('localYaku.paarenchan.shibariHelp')}
                    valor={yakusLocais.paarenchan.ryanhanShibari}
                    aoMudar={(ryanhanShibari) => mudarYakusLocais({ paarenchan: { ...yakusLocais.paarenchan, ryanhanShibari } })}
                    opcoes={ligado}
                  />
                  <LinhaRegraOpcoes<'passa' | 'continua'>
                    titulo={t('localYaku.paarenchan.after')}
                    ajuda={t('localYaku.paarenchan.afterHelp')}
                    valor={yakusLocais.paarenchan.depois}
                    aoMudar={(depois) => mudarYakusLocais({ paarenchan: { ...yakusLocais.paarenchan, depois } })}
                    opcoes={[
                      { valor: 'passa', rotulo: t('localYaku.paarenchan.dealerPasses') },
                      { valor: 'continua', rotulo: t('localYaku.paarenchan.dealerStays') },
                    ]}
                  />
                </div>
              )}
              {yaku.id === 'renhou' && ativo && (
                <div className="sub-regras">
                  <LinhaRegraOpcoes<'mangan' | 'baiman' | 'yakuman'>
                    titulo={t('localYaku.renhouValue')}
                    ajuda={t('localYaku.renhouValueHelp')}
                    valor={yakusLocais.renhou}
                    aoMudar={(renhou) => mudarYakusLocais({ renhou })}
                    opcoes={[
                      { valor: 'mangan', rotulo: 'Mangan' },
                      { valor: 'baiman', rotulo: 'Baiman' },
                      { valor: 'yakuman', rotulo: 'Yakuman' },
                    ]}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
