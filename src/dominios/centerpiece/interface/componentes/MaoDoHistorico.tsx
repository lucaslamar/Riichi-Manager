import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import ExibicaoCompleta from '@/dominios/calculadora-mao/interface/modais/resultado/ExibicaoCompleta'
import { nomeYakuExibido } from '@/dominios/calculadora-mao/logica/nomesYaku'
import { CADEIRAS, type Cadeira, type EventoPartida } from '../../logica/partida'
import type { MaoMontada } from '../../logica/tipos-integracao'
import LinhaPedras from './LinhaPedras'

/** Pedras da batida, separadas das outras; a batida em chamada já está no grupo. */
function partesDaMao({ mao }: MaoMontada) {
  const batida = mao.agariMeld ? undefined : mao.pedras[mao.indiceAgari]
  const pedras = mao.agariMeld
    ? mao.pedras
    : mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari)
  return { pedras, melds: mao.melds, batida }
}

/** Linha da mão no histórico; tocar abre o detalhe, sem recalcular nada. */
export default function MaoDoHistorico({
  montada,
  evento,
  cadeira,
  nomeDe,
}: {
  montada: MaoMontada
  evento: EventoPartida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
}) {
  const { t, idioma, numero } = useI18n()
  const [aberta, setAberta] = useState(false)
  const [yakuAberto, setYakuAberto] = useState<string | null>(null)
  const { resultado } = montada
  const yakus = resultado.yaku
    .map(([nome, valor]) => {
      const exibido = nomeYakuExibido(nome, idioma)
      return /dora/i.test(nome) ? `${exibido} ${valor}` : exibido
    })
    .join(' · ')
  const total =
    resultado.yakuman > 0
      ? t('hanFu.limitYakumanTimes', { count: resultado.yakuman })
      : t('calculator.hanFuSummary', { han: resultado.han, fu: resultado.fu })

  return (
    <>
      <button
        type="button"
        className="mao-historico"
        aria-label={t('match.hands.openDetail', { name: nomeDe(cadeira), summary: `${yakus} — ${total}` })}
        onClick={() => setAberta(true)}
      >
        <LinhaPedras {...partesDaMao(montada)} />
        <span className="mao-historico-yakus">
          {yakus} — {total}
        </span>
      </button>

      {aberta && (
        <Modal
          titulo={`${nomeDe(cadeira)} · ${t(`calculator.${evento.tipo}`)}`}
          aoFechar={() => setAberta(false)}
          rotuloFechar={t('actions.close')}
          tamanho="media"
          className="modal-folha modal-resultado"
        >
          <LinhaPedras {...partesDaMao(montada)} grande />
          <ExibicaoCompleta
            resultado={resultado}
            mao={montada.mao}
            yakuSelecionado={yakuAberto}
            aoSelecionarYaku={setYakuAberto}
          />
          <div className="divisor-resultado" />
          <ul className="ptd-linhas">
            {CADEIRAS.map((outra) => (
              <li key={outra}>
                <span>{nomeDe(outra)}</span>
                <strong className={evento.variacao[outra] < 0 ? 'ptd-negativo' : evento.variacao[outra] > 0 ? 'ptd-positivo' : undefined}>
                  {evento.variacao[outra] > 0 ? '+' : ''}
                  {numero(evento.variacao[outra])}
                </strong>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  )
}
