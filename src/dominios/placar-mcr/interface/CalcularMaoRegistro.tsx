import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import CalculadoraMaoChinesa from '@/dominios/calculadora-mao-chinesa/interface/CalculadoraMaoChinesa'
import type { Cadeira, MaoMcr } from '../logica/placar'
import ModalBatidaMcr, { maoDaBatida, novaBatidaMcr, type BatidaMcr } from './ModalBatidaMcr'

/**
 * Calcular mão da calculadora de pontos no MCR: como o jogador venceu e a batida
 * do Placar (fan, pedras ou MPSZ). O pagamento já sai dos outros.
 */
export default function CalcularMaoRegistro({
  vencedor,
  nomes,
  pontos,
  aoSomar,
  aoMostrarCalculadora,
  aoFechar,
}: {
  vencedor: Cadeira
  nomes: readonly string[]
  pontos: readonly number[]
  aoSomar: (mao: MaoMcr) => void
  /** A calculadora ocupa o lugar da tela de registro, como na mesa. */
  aoMostrarCalculadora: (aberta: boolean) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [batida, setBatida] = useState<BatidaMcr | null>(null)
  const calculadoraAberta = !!batida?.calculadora

  useEffect(() => {
    if (!calculadoraAberta) return
    aoMostrarCalculadora(true)
    return () => aoMostrarCalculadora(false)
  }, [calculadoraAberta, aoMostrarCalculadora])

  if (!batida) {
    return (
      <Modal
        titulo={t('placar.mcr.registro.comoVenceu', { name: nomes[vencedor] })}
        aoFechar={aoFechar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
      >
        <div className="ptd-lista-opcoes">
          {(['tsumo', 'ron'] as const).map((forma) => (
            <button
              key={forma}
              type="button"
              className="ptd-opcao"
              onClick={() => setBatida(novaBatidaMcr(forma, vencedor))}
            >
              <span className="ptd-opcao-nome">{t(`calculator.${forma}`)}</span>
            </button>
          ))}
        </div>
      </Modal>
    )
  }

  if (!batida.calculadora) {
    return (
      <ModalBatidaMcr
        batida={batida}
        nomes={nomes}
        pontos={pontos}
        // Sem contar as mãos, os ventos mostrados são os do começo da partida.
        dealer={0}
        aoMudar={setBatida}
        aoAplicar={() => aoSomar(maoDaBatida(batida))}
        aoFechar={aoFechar}
      />
    )
  }

  // O CSS das calculadoras conta com elas como filhas diretas do `main`.
  return createPortal(
    <CalculadoraMaoChinesa
      key={batida.calculadora}
      visivel
      titulo={`${nomes[vencedor]} · ${t(`calculator.${batida.forma}`)}`}
      aoVoltar={() => setBatida({ ...batida, calculadora: null })}
      entradaInicial={batida.calculadora}
      // Os ventos da mão se escolhem na própria calculadora.
      condicoesIniciais={{ forma: batida.forma }}
      aoUsarFan={(fan) => setBatida({ ...batida, fan, calculadora: null, passo: 'confirmacao' })}
    />,
    document.querySelector('main.conteudo-principal') ?? document.body,
  )
}
