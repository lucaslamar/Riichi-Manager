import { useId, useState, useContext } from 'react'
import { ContextoNavegacaoModal } from '@/compartilhado/interface/componentes/modal/navegacaoModal'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  buscarFansMcr,
  CATEGORIAS_FAN_MCR,
  FANS_MCR,
  fanMcrPorId,
  PATAMARES_FAN_MCR,
  YAKUS_SEM_EQUIVALENTE_MCR,
  type CategoriaFanMcr,
  type FanMcr,
} from '@/compartilhado/mahjong/mcr/fans-mcr'
import { SECOES_GLOSSARIO_MCR } from '@/dominios/aprender-a-jogar/conteudo/mcr/glossario'
import AbaGlossario from '@/dominios/calculadora-mao/interface/modais/yakus/AbaGlossario'
import ExemploFanMcr from './ExemploFanMcr'
import './guia-bolso-mcr.css'

export type AbaGuiaMcr = 'glossario' | 'pontos' | CategoriaFanMcr | 'riichi'

export const ABAS_GUIA_MCR: AbaGuiaMcr[] = [
  'glossario',
  'pontos',
  ...(Object.keys(CATEGORIAS_FAN_MCR) as CategoriaFanMcr[]),
  'riichi',
]

export const idCartaoFan = (id: number) => `fan-mcr-${id}`

/**
 * Cartão de um fan no Guia de bolso, com as classes do cartão de yaku do Riichi:
 * nome do CMC e 汉字 no título, pontos no selo, inglês, descrição, equivalente no
 * Riichi e, ao abrir os detalhes, o que não combina com ele.
 */
function CartaoFanMcr({ fan, aoIrPara }: { fan: FanMcr; aoIrPara: (id: number) => void }) {
  const { t, numero } = useI18n()
  // Fan citado (também conta, não combina): abre como tela do Guia, com voltar, sem perder o lugar.
  const abrirTela = useContext(ContextoNavegacaoModal)
  const irPara = (id: number) => {
    const outro = fanMcrPorId(id)
    if (!abrirTela || !outro) {
      aoIrPara(id)
      return
    }
    abrirTela({
      titulo: (
        <span>
          {outro.pt}{' '}
          <span className="yaku-card__kanji" lang="zh-Hans">
            {outro.hanzi}
          </span>
        </span>
      ),
      conteudo: <CartaoFanMcr fan={outro} aoIrPara={aoIrPara} />,
    })
  }
  const [aberto, setAberto] = useState(false)
  const idDetalhes = useId()
  const temDetalhes = Boolean(fan.naoCombina?.length || fan.observacao)

  return (
    <article id={idCartaoFan(fan.id)} className="yaku-card fan-mcr" tabIndex={-1}>
      <header className="yaku-card__topo">
        <h4 className="yaku-card__nome">
          {fan.pt}{' '}
          <span className="yaku-card__kanji" lang="zh-Hans">
            {fan.hanzi}
          </span>
        </h4>
        <span className="yaku-badge">
          <strong>{t('guiaBolso.mcr.pontosFan', { pontos: numero(fan.pontos) })}</strong>
        </span>
      </header>
      <p className="yaku-card__pt">
        <span lang="en">{fan.en}</span> · {t('guiaBolso.mcr.numero', { id: numero(fan.id) })}
      </p>
      <p className="yaku-card__descricao">{fan.descricao}</p>
      <ExemploFanMcr fan={fan} aoIrPara={irPara} />
      {fan.yakuRiichi && (
        <span className="fan-mcr__riichi">
          {t('guiaBolso.mcr.riichi', { yaku: fan.yakuRiichi })}
        </span>
      )}
      {temDetalhes && (
        <>
          <button
            type="button"
            className="fan-mcr__expandir"
            aria-expanded={aberto}
            aria-controls={idDetalhes}
            onClick={() => setAberto(!aberto)}
          >
            <i
              className={`fas ${aberto ? 'fa-chevron-down' : 'fa-chevron-right'}`}
              aria-hidden="true"
            />
            {t('guiaBolso.mcr.detalhes')}
          </button>
          <div id={idDetalhes} className="fan-mcr__detalhes" hidden={!aberto}>
            {fan.naoCombina?.length ? (
              <>
                <strong>{t('guiaBolso.mcr.naoCombina')}</strong>
                <ul className="fan-mcr__lista-exclusoes">
                  {fan.naoCombina.map((id) => {
                    const outro = fanMcrPorId(id)
                    if (!outro) return null
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="fan-mcr__link"
                          aria-label={t('guiaBolso.mcr.irPara', { nome: outro.pt })}
                          onClick={() => irPara(id)}
                        >
                          {outro.pt} · {t('guiaBolso.mcr.numero', { id: numero(id) })}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : null}
            {fan.observacao && <p className="fan-mcr__observacao">{fan.observacao}</p>}
          </div>
        </>
      )}
    </article>
  )
}

function ListaPorPatamar({ fans, aoIrPara }: { fans: FanMcr[]; aoIrPara: (id: number) => void }) {
  const { t, numero } = useI18n()
  return (
    <>
      {PATAMARES_FAN_MCR.map((patamar) => {
        const doPatamar = fans.filter((fan) => fan.pontos === patamar)
        if (!doPatamar.length) return null
        return (
          <section key={patamar} className="yaku-grupo">
            <h3 className="yaku-grupo__titulo">
              {t('guiaBolso.mcr.pontosFan', { pontos: numero(patamar) })}
            </h3>
            <div className="yaku-lista">
              {doPatamar.map((fan) => (
                <CartaoFanMcr key={fan.id} fan={fan} aoIrPara={aoIrPara} />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}

/** Busca do Guia de bolso no MCR: o mesmo campo do Riichi, com o texto do MCR. */
export function CampoBuscaGuiaMcr({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (valor: string) => void
}) {
  const { t } = useI18n()
  return (
    <CampoBusca
      valor={valor}
      aoMudar={aoMudar}
      rotulo={t('guiaBolso.mcr.rotuloBusca')}
      placeholder={t('guiaBolso.mcr.busca')}
      rotuloLimpar={t('pocketGuide.search.clear')}
    />
  )
}

/** Conteúdo de uma aba (ou da busca) do Guia de bolso no modo Chinês. */
export function ConteudoGuiaMcr({
  aba,
  busca,
  aoIrPara,
}: {
  aba: AbaGuiaMcr
  busca: string
  aoIrPara: (id: number) => void
}) {
  const { t } = useI18n()
  if (busca.trim()) {
    const encontrados = buscarFansMcr(FANS_MCR, busca)
    return (
      <div aria-live="polite">
        {encontrados.length === 0 && (
          <p className="busca-guia__vazio">
            {t('pocketGuide.search.nothingFound', { busca: busca.trim() })}
          </p>
        )}
        <ListaPorPatamar fans={encontrados} aoIrPara={aoIrPara} />
      </div>
    )
  }
  if (aba === 'glossario') return <AbaGlossario secoes={SECOES_GLOSSARIO_MCR} />
  if (aba === 'riichi') {
    return (
      <>
        <section className="yaku-grupo guia-mcr__sem-equivalente">
          <h3 className="yaku-grupo__titulo">{t('guiaBolso.mcr.semEquivalenteTitulo')}</h3>
          <p>
            {t('guiaBolso.mcr.semEquivalenteExato', {
              lista: YAKUS_SEM_EQUIVALENTE_MCR.semEquivalenteExato.join(', '),
            })}
          </p>
          <p>
            {t('guiaBolso.mcr.naoExistem', {
              lista: YAKUS_SEM_EQUIVALENTE_MCR.naoExistem.join(', '),
            })}
          </p>
        </section>
        <ListaPorPatamar fans={FANS_MCR.filter((fan) => fan.yakuRiichi)} aoIrPara={aoIrPara} />
      </>
    )
  }
  const fans = aba === 'pontos' ? FANS_MCR : FANS_MCR.filter((fan) => fan.categoria === aba)
  return (
    <>
      <ListaPorPatamar fans={fans} aoIrPara={aoIrPara} />
    </>
  )
}

/** Rótulo curto da aba (o nome completo da categoria fica no guia do CMC). */
export const rotuloAbaGuiaMcr = (aba: AbaGuiaMcr, t: (chave: string) => string) =>
  aba === 'glossario'
    ? t('pocketGuide.tabs.glossary')
    : aba === 'pontos'
      ? t('guiaBolso.mcr.porPontos')
      : aba === 'riichi'
        ? t('guiaBolso.mcr.abaRiichi')
        : t(`guiaBolso.mcr.abas.${aba}`)
