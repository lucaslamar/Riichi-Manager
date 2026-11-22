import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import CalculadoraMaoChinesa from '@/dominios/calculadora-mao-chinesa/interface/CalculadoraMaoChinesa'
import type { Vento } from '@/dominios/calculadora-mao-chinesa/logica/montagem'
import CalculadoraPontosSheet from '@/dominios/centerpiece/interface/componentes/CalculadoraPontosSheet'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { KANJI_VENTO, ORDEM_VENTOS, ventoDaCadeira } from '@/dominios/centerpiece/logica/partida'
import {
  CADEIRAS,
  dealerDaMao,
  MAOS_POR_RODADA,
  pontosDaMao,
  pontosDoFalsoHu,
  totais,
  TOTAL_MAOS,
  ventoDaRodada,
  type Cadeira,
  type MaoMcr,
} from '../logica/placar'
import {
  anotarFalsoHu,
  anotarMao,
  apagarFalsoHu,
  apagarMao,
  fecharMaoEscrita,
  podeAnotarMao,
  SUMULA_VAZIA,
  type RascunhoSumula,
} from '../logica/sumula'
import ModalBatidaMcr, { maoDaBatida, novaBatidaMcr, type BatidaMcr } from './ModalBatidaMcr'
import './sumula-mcr.css'

/** O que está aberto por cima da folha. */
type Etapa =
  | { tipo: 'folha' }
  | { tipo: 'vencedor'; indice?: number }
  | { tipo: 'forma'; vencedor: Cadeira; indice?: number }
  | { tipo: 'batida'; batida: BatidaMcr; indice?: number }
  | { tipo: 'escrita'; valores: (number | null)[]; editando?: Cadeira; indice?: number }
  | { tipo: 'falsoHu' }
  | { tipo: 'linha'; indice: number }
  | { tipo: 'falso'; indice: number }
  | { tipo: 'limpar' }

const VALORES_EM_BRANCO = [null, null, null, null]
/** Vento (0 Leste a 3 Norte) no id de pedra do motor MCR (28 a 31). */
const paraVentoMcr = (indice: number) => (28 + indice) as Vento

/**
 * A súmula no lugar do papel e caneta: uma linha por mão e uma coluna por
 * jogador. "Calcular mão" usa a batida do Placar (fan, pedras ou MPSZ) e já
 * desconta dos outros. "Escrever pontos" aceita a conta feita no papel.
 */
export default function SumulaMcr({
  sumula,
  nomes,
  vencedorInicial,
  aoMudar,
  aoMostrarCalculadora,
  aoFechar,
}: {
  sumula: RascunhoSumula
  nomes: readonly string[]
  /** Vindo do Calcular mão de um jogador: já começa pela batida dele. */
  vencedorInicial?: Cadeira
  aoMudar: (proxima: RascunhoSumula) => void
  /** A calculadora ocupa o lugar da tela de registro, como na mesa. */
  aoMostrarCalculadora: (aberta: boolean) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [etapa, setEtapa] = useState<Etapa>(() =>
    vencedorInicial !== undefined && podeAnotarMao(sumula)
      ? { tipo: 'forma', vencedor: vencedorInicial }
      : { tipo: 'folha' },
  )
  const calculadoraAberta = etapa.tipo === 'batida' && etapa.batida.calculadora !== null
  useEffect(() => {
    if (!calculadoraAberta) return
    aoMostrarCalculadora(true)
    return () => aoMostrarCalculadora(false)
  }, [calculadoraAberta, aoMostrarCalculadora])
  const voltar = () => setEtapa({ tipo: 'folha' })
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const classeDoValor = (valor: number) =>
    valor > 0 ? 'ptd-positivo' : valor < 0 ? 'ptd-negativo' : undefined
  const celulas = (valores: readonly number[]) =>
    CADEIRAS.map((cadeira) => (
      <td key={cadeira} className={classeDoValor(valores[cadeira])}>
        {valores[cadeira] === 0 ? '–' : comSinal(valores[cadeira])}
      </td>
    ))
  const rodadaDaMao = (indice: number) =>
    `${KANJI_VENTO[ORDEM_VENTOS[ventoDaRodada(indice)]]}${(indice % MAOS_POR_RODADA) + 1}`
  const anotar = (mao: MaoMcr, indice?: number) => {
    aoMudar(anotarMao(sumula, mao, indice))
    voltar()
  }
  const escolherJogador = (titulo: string, aoEscolher: (cadeira: Cadeira) => void) => (
    <Modal titulo={titulo} aoFechar={voltar} rotuloFechar={t('actions.close')} tamanho="pequena">
      <div className="ptd-lista-opcoes">
        {CADEIRAS.map((cadeira) => (
          <button
            key={cadeira}
            type="button"
            className="ptd-opcao"
            onClick={() => aoEscolher(cadeira)}
          >
            <span aria-hidden="true">{KANJI_VENTO[ORDEM_VENTOS[cadeira]]}</span>
            <span className="ptd-opcao-nome">{nomes[cadeira]}</span>
          </button>
        ))}
      </div>
    </Modal>
  )

  if (etapa.tipo === 'vencedor') {
    const { indice } = etapa
    return escolherJogador(t('placar.mcr.sumula.quemVenceu'), (vencedor) =>
      setEtapa({ tipo: 'forma', vencedor, indice }),
    )
  }

  if (etapa.tipo === 'forma') {
    const { vencedor, indice } = etapa
    return (
      <Modal
        titulo={t('placar.mcr.sumula.comoVenceu', { name: nomes[vencedor] })}
        aoFechar={voltar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
      >
        <div className="ptd-lista-opcoes">
          {(['tsumo', 'ron'] as const).map((forma) => (
            <button
              key={forma}
              type="button"
              className="ptd-opcao"
              onClick={() =>
                setEtapa({ tipo: 'batida', batida: novaBatidaMcr(forma, vencedor), indice })
              }
            >
              <span className="ptd-opcao-nome">{t(`calculator.${forma}`)}</span>
            </button>
          ))}
        </div>
      </Modal>
    )
  }

  if (etapa.tipo === 'batida') {
    const { batida, indice } = etapa
    const daLinha = indice ?? sumula.maos.length
    const dealer = dealerDaMao(daLinha)
    const mudarBatida = (proxima: BatidaMcr) =>
      setEtapa({ tipo: 'batida', batida: proxima, indice })

    if (!batida.calculadora) {
      return (
        <ModalBatidaMcr
          batida={batida}
          nomes={nomes}
          pontos={totais(sumula)}
          dealer={dealer}
          aoMudar={mudarBatida}
          aoAplicar={() => anotar(maoDaBatida(batida), indice)}
          aoFechar={voltar}
        />
      )
    }
    // O CSS das calculadoras conta com elas como filhas diretas do `main`.
    return createPortal(
      <CalculadoraMaoChinesa
        key={batida.calculadora}
        visivel
        titulo={`${nomes[batida.vencedor]} · ${t(`calculator.${batida.forma}`)}`}
        aoVoltar={() => mudarBatida({ ...batida, calculadora: null })}
        entradaInicial={batida.calculadora}
        condicoesIniciais={{
          forma: batida.forma,
          ventoRodada: paraVentoMcr(ventoDaRodada(daLinha)),
          ventoAssento: paraVentoMcr(ORDEM_VENTOS.indexOf(ventoDaCadeira(batida.vencedor, dealer))),
        }}
        aoUsarFan={(fan) =>
          mudarBatida({ ...batida, fan, calculadora: null, passo: 'confirmacao' })
        }
      />,
      document.querySelector('main.conteudo-principal') ?? document.body,
    )
  }

  if (etapa.tipo === 'escrita') {
    const { valores, editando, indice } = etapa
    const fechados = fecharMaoEscrita(valores)
    if (editando !== undefined) {
      const gravar = (valor: number | null) =>
        valores.map((atual, cadeira) => (cadeira === editando ? valor : atual))
      return (
        <CalculadoraPontosSheet
          cadeira={editando}
          nome={nomes[editando]}
          inicial={valores[editando] ?? 0}
          semCalcularMao
          aoFechar={() => setEtapa({ tipo: 'escrita', valores, indice })}
          aoConfirmar={(valor) => setEtapa({ tipo: 'escrita', valores: gravar(valor), indice })}
          aoNavegar={(passo, valor) =>
            setEtapa({
              tipo: 'escrita',
              valores: valor === undefined ? valores : gravar(valor),
              editando: ((editando + passo + 4) % 4) as Cadeira,
              indice,
            })
          }
        />
      )
    }
    return (
      <Modal
        titulo={t('placar.mcr.sumula.escrever')}
        aoFechar={voltar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
        rodape={
          <button
            type="button"
            className="btn-primario ptd-btn-largo"
            disabled={!fechados}
            onClick={() => fechados && anotar({ tipo: 'anotada', pontos: fechados }, indice)}
          >
            {t('placar.mcr.sumula.anotar')}
          </button>
        }
      >
        <div className="ptd-lista-opcoes">
          {CADEIRAS.map((cadeira) => {
            const valor = valores[cadeira] ?? fechados?.[cadeira] ?? null
            return (
              <button
                key={cadeira}
                type="button"
                className="ptd-opcao"
                onClick={() => setEtapa({ tipo: 'escrita', valores, editando: cadeira, indice })}
              >
                <span aria-hidden="true">{KANJI_VENTO[ORDEM_VENTOS[cadeira]]}</span>
                <span className="ptd-opcao-nome">{nomes[cadeira]}</span>
                <span
                  className={`ptd-opcao-valor${valores[cadeira] === null ? ' sumula-mcr__completado' : ''}`}
                >
                  {valor === null ? '–' : comSinal(valor)}
                </span>
              </button>
            )
          })}
        </div>
        <p className="sumula-mcr__ajuda">{t('placar.mcr.sumula.escreverAjuda')}</p>
      </Modal>
    )
  }

  if (etapa.tipo === 'falsoHu') {
    return escolherJogador(t('placar.mcr.falsoHu'), (cadeira) => {
      aoMudar(anotarFalsoHu(sumula, cadeira))
      voltar()
    })
  }

  if (etapa.tipo === 'linha') {
    const { indice } = etapa
    const mao = sumula.maos[indice]
    return (
      <Modal
        titulo={t('placar.mcr.sumula.mao', { numero: indice + 1 })}
        aoFechar={voltar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
      >
        <div className="ptd-lista-opcoes">
          <button
            type="button"
            className="ptd-opcao"
            onClick={() => setEtapa({ tipo: 'vencedor', indice })}
          >
            <i className="fas fa-calculator ptd-opcao-icone" aria-hidden="true" />
            <span className="ptd-opcao-nome">{t('placar.mcr.sumula.calcular')}</span>
          </button>
          <button
            type="button"
            className="ptd-opcao"
            onClick={() => setEtapa({ tipo: 'escrita', valores: pontosDaMao(mao), indice })}
          >
            <i className="fas fa-pen ptd-opcao-icone" aria-hidden="true" />
            <span className="ptd-opcao-nome">{t('placar.mcr.sumula.escrever')}</span>
          </button>
          <button
            type="button"
            className="ptd-opcao"
            onClick={() => {
              aoMudar(apagarMao(sumula, indice))
              voltar()
            }}
          >
            <i className="fas fa-trash ptd-opcao-icone" aria-hidden="true" />
            <span className="ptd-opcao-nome">{t('placar.mcr.sumula.apagarLinha')}</span>
          </button>
        </div>
      </Modal>
    )
  }

  if (etapa.tipo === 'falso') {
    const { indice } = etapa
    return (
      <ModalConfirmacao
        titulo={t('placar.mcr.sumula.apagarLinha')}
        texto={`${t('placar.mcr.falsoHu')}: ${nomes[sumula.falsosHu[indice].cadeira]}`}
        rotuloConfirmar={t('placar.mcr.sumula.apagarLinha')}
        perigo
        aoFechar={voltar}
        aoConfirmar={() => {
          aoMudar(apagarFalsoHu(sumula, indice))
          voltar()
        }}
      />
    )
  }

  if (etapa.tipo === 'limpar') {
    return (
      <ModalConfirmacao
        titulo={t('placar.mcr.sumula.limpar')}
        texto={t('placar.mcr.sumula.limparAjuda')}
        rotuloConfirmar={t('placar.mcr.sumula.limpar')}
        perigo
        aoFechar={voltar}
        aoConfirmar={() => {
          aoMudar({
            ...SUMULA_VAZIA,
            assentos: sumula.assentos,
            ...(sumula.convidados && { convidados: sumula.convidados }),
          })
          voltar()
        }}
      />
    )
  }

  const cheia = !podeAnotarMao(sumula)
  const falsosApos = (aposMao: number) =>
    sumula.falsosHu.map((falso, indice) =>
      falso.aposMao === aposMao ? (
        <tr key={`falso-${indice}`}>
          <th scope="row">
            <button
              type="button"
              className="sumula-mcr__linha"
              aria-label={`${t('placar.mcr.falsoHu')}: ${nomes[falso.cadeira]}`}
              onClick={() => setEtapa({ tipo: 'falso', indice })}
            >
              <i className="fas fa-triangle-exclamation" aria-hidden="true" />
            </button>
          </th>
          {celulas(pontosDoFalsoHu(falso.cadeira))}
        </tr>
      ) : null,
    )

  return (
    <Modal
      titulo={t('placar.mcr.sumula.titulo')}
      subtitulo={t('placar.mcr.sumula.contagem', {
        feitas: numero(sumula.maos.length),
        total: numero(TOTAL_MAOS),
      })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="sumula-mcr"
      acoes={
        <button
          type="button"
          className="modal-acao modal-acao--destrutiva"
          aria-label={t('placar.mcr.sumula.limpar')}
          title={t('placar.mcr.sumula.limpar')}
          onClick={() => setEtapa({ tipo: 'limpar' })}
        >
          <i className="fas fa-trash" aria-hidden="true" />
        </button>
      }
      rodape={
        <div className="sumula-mcr__acoes">
          <button
            type="button"
            className="btn-primario"
            disabled={cheia}
            onClick={() => setEtapa({ tipo: 'vencedor' })}
          >
            {t('placar.mcr.sumula.calcular')}
          </button>
          <button
            type="button"
            className="btn-contorno"
            disabled={cheia}
            onClick={() => setEtapa({ tipo: 'escrita', valores: VALORES_EM_BRANCO })}
          >
            {t('placar.mcr.sumula.escrever')}
          </button>
          <button
            type="button"
            className="btn-contorno"
            disabled={cheia}
            onClick={() => anotar({ tipo: 'empate' })}
          >
            {t('placar.mcr.empate')}
          </button>
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setEtapa({ tipo: 'falsoHu' })}
          >
            {t('placar.mcr.falsoHu')}
          </button>
        </div>
      }
    >
      <table className="sumula-mcr__folha">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">{t('placar.mcr.sumula.colunaMao')}</span>
            </th>
            {CADEIRAS.map((cadeira) => (
              <th key={cadeira} scope="col" title={nomes[cadeira]}>
                <span aria-hidden="true">{KANJI_VENTO[ORDEM_VENTOS[cadeira]]}</span>
                <span className="sumula-mcr__nome">{nomes[cadeira]}</span>
              </th>
            ))}
          </tr>
        </thead>
        {sumula.maos.map((mao, indice) => (
          <tbody key={indice}>
            {falsosApos(indice)}
            <tr>
              <th scope="row">
                <button
                  type="button"
                  className="sumula-mcr__linha"
                  aria-label={t('placar.mcr.sumula.corrigir', { numero: indice + 1 })}
                  onClick={() => setEtapa({ tipo: 'linha', indice })}
                >
                  {rodadaDaMao(indice)}
                  {mao.tipo === 'vitoria' && (
                    <small>{t('placar.mcr.qtdFan', { fan: numero(mao.fan) })}</small>
                  )}
                </button>
              </th>
              {celulas(pontosDaMao(mao))}
            </tr>
          </tbody>
        ))}
        <tbody>
          {falsosApos(sumula.maos.length)}
          {sumula.ajuste.some((valor) => valor !== 0) && (
            <tr>
              <th scope="row">
                <i className="fas fa-pen" role="img" aria-label={t('placar.mcr.sumula.digitado')} />
              </th>
              {celulas(sumula.ajuste)}
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{t('placar.mcr.sumula.total')}</th>
            {totais(sumula).map((valor, cadeira) => (
              <td key={cadeira} className={classeDoValor(valor)}>
                {comSinal(valor)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      <label className="sumula-mcr__notas">
        <span>{t('placar.mcr.sumula.notas')}</span>
        <textarea
          rows={4}
          value={sumula.notas}
          placeholder={t('placar.mcr.sumula.notasAjuda')}
          onChange={(evento) => aoMudar({ ...sumula, notas: evento.target.value })}
        />
      </label>
    </Modal>
  )
}
