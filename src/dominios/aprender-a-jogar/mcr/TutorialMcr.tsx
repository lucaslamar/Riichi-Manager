import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { calcularPagamentoMcr } from '@/dominios/calculadora-mao-chinesa/logica/pontuacao-mcr'
import CreditosCmc from '@/dominios/guia-bolso/mcr/CreditosCmc'
import '@/dominios/guia-bolso/mcr/guia-bolso-mcr.css'
import {
  EXEMPLOS_PONTUACAO_MCR,
  SECOES_TUTORIAL_MCR,
  type BlocoTutorialMcr,
} from './conteudoTutorialMcr'
import './tutorial-mcr.css'

/** Tutorial do modo Chinês: as regras do MCR para quem já joga Riichi, uma seção por página. */
export default function TutorialMcr({
  aoFechar,
  aoAbrirGuiaBolso,
}: {
  aoFechar: () => void
  aoAbrirGuiaBolso: () => void
}) {
  const { t } = useI18n()
  const [pagina, setPagina] = useState(0)
  const secao = SECOES_TUTORIAL_MCR[pagina]

  return (
    <Modal
      titulo={t('tutorial.mcr.titulo')}
      subtitulo={secao.titulo}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="grande"
      paginacao={{
        total: SECOES_TUTORIAL_MCR.length,
        atual: pagina,
        aoMudar: setPagina,
        rotuloAnterior: t('tutorial.mcr.anterior'),
        rotuloProximo: t('tutorial.mcr.proxima'),
        rotuloPagina: (indice) => SECOES_TUTORIAL_MCR[indice].titulo,
      }}
    >
      <div className="tutorial-mcr">
        {secao.blocos.map((bloco, indice) => (
          <Bloco key={indice} bloco={bloco} aoAbrirGuiaBolso={aoAbrirGuiaBolso} />
        ))}
        <CreditosCmc />
      </div>
    </Modal>
  )
}

function Bloco({
  bloco,
  aoAbrirGuiaBolso,
}: {
  bloco: BlocoTutorialMcr
  aoAbrirGuiaBolso: () => void
}) {
  const { t } = useI18n()
  switch (bloco.tipo) {
    case 'paragrafo':
      return <p>{bloco.texto}</p>
    case 'lista':
      return (
        <ul>
          {bloco.itens.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'termos':
      return (
        <dl className="tutorial-mcr__termos">
          {bloco.itens.map(({ termo, definicao }) => (
            <div key={termo}>
              <dt>{termo}</dt>
              <dd>{definicao}</dd>
            </div>
          ))}
        </dl>
      )
    case 'riichi':
      return (
        <div className="tutorial-mcr__riichi">
          <span className="badge-diferente-riichi">{t('tutorial.mcr.diferenteRiichi')}</span>
          <p>{bloco.texto}</p>
        </div>
      )
    case 'exemplosPontuacao':
      return <TabelaExemplos />
    case 'linkGuiaBolso':
      return (
        <button type="button" className="btn-contorno" onClick={aoAbrirGuiaBolso}>
          {t('tutorial.mcr.abrirGuiaBolso')}
        </button>
      )
  }
}

function TabelaExemplos() {
  const { t, numero } = useI18n()
  return (
    <div className="tutorial-mcr__tabela">
      <table>
        <caption>{t('tutorial.mcr.exemplos')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('tutorial.mcr.exemplo')}</th>
            <th scope="col">{t('tutorial.mcr.quemPaga')}</th>
            <th scope="col">{t('tutorial.mcr.vencedorRecebe')}</th>
          </tr>
        </thead>
        <tbody>
          {EXEMPLOS_PONTUACAO_MCR.map(({ forma, pontos }) => {
            const { ganhadorRecebe, pagamentos } = calcularPagamentoMcr(pontos, forma)
            return (
              <tr key={`${forma}-${pontos}`}>
                <th scope="row">
                  {t(forma === 'ron' ? 'tutorial.mcr.exemploRon' : 'tutorial.mcr.exemploTsumo', {
                    pontos: numero(pontos),
                  })}
                </th>
                <td>
                  {forma === 'ron'
                    ? t('tutorial.mcr.pagaRon', {
                        descartador: numero(pagamentos[0].valor),
                        outro: numero(pagamentos[1].valor),
                      })
                    : t('tutorial.mcr.pagaTsumo', { valor: numero(pagamentos[0].valor) })}
                </td>
                <td>{numero(ganhadorRecebe)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
