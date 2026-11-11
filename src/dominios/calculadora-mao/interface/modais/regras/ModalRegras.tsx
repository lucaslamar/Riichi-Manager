import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { configuracaoPadrao, type ConfiguracaoCalculo } from '../../../logica/mao'
import { CONFIGURACOES_REGRAS } from '../../constantes'
import { useId, useState } from 'react'
import AbasModal from '@/compartilhado/interface/componentes/modal/AbasModal'
import { useConfigSanma } from '@/compartilhado/configuracoes/useConfigSanma'
import { REGRAS_SANMA_PADRAO, type RegrasSanma, type Variante } from '@/compartilhado/mahjong/variante'
import TextoGlossario from '../glossario/TextoGlossario'
import './modal-regras.css'

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
  doraFlamejante: {
    titulo: 'rulesModal.doraFlamejante.title',
    ajuda: 'rulesModal.doraFlamejante.help',
    ligado: 'rulesModal.doraFlamejante.on',
    desligado: 'rulesModal.doraFlamejante.off',
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
  basengo: {
    titulo: 'rulesModal.basengo.title',
    ajuda: 'rulesModal.basengo.help',
    ligado: 'rulesModal.basengo.on',
    desligado: 'rulesModal.basengo.off',
  },
  chomboMangan: {
    titulo: 'rulesModal.chomboMangan.title',
    ajuda: 'rulesModal.chomboMangan.help',
    ligado: 'rulesModal.chomboMangan.on',
    desligado: 'rulesModal.chomboMangan.off',
  },
}

/** Regras que só valem com outra ligada (Dora flamejante precisa do 5 vermelho). */
const DEPENDENCIAS_REGRAS: Partial<Record<keyof ConfiguracaoCalculo, keyof ConfiguracaoCalculo>> = {
  doraFlamejante: 'akadora',
}

/**
 * Modal de Regras de cálculo. Construída sobre a Modal base; aqui ficam só a
 * lista de regras (liga/desliga) e o rodapé com Restaurar padrão / Aplicar.
 * As mudanças valem na hora; "Aplicar" apenas fecha.
 */
export default function ModalRegras({
  configuracao,
  aoMudar,
  aoFechar,
  variante,
  aoMudarVariante,
}: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
  /** Com o Sanma ligado, a primeira regra é 4 ou 3 jogadores. */
  variante?: Variante
  aoMudarVariante?: (variante: Variante) => void
}) {
  const { t } = useI18n()
  const { setRegrasSanma } = useConfigSanma()
  const [aba, setAba] = useState<'regras' | 'sanma'>('regras')
  const comSanma = !!variante && !!aoMudarVariante
  // Restaurar padrão vale para a aba aberta.
  const restaurar = (config: ConfiguracaoCalculo) =>
    aba === 'sanma' ? setRegrasSanma({ ...REGRAS_SANMA_PADRAO, uma: [...REGRAS_SANMA_PADRAO.uma] }) : aoMudar(config)

  return (
    <Modal
      titulo={t('rulesModal.title')}
      subtitulo={t('rulesModal.help')}
      aoFechar={aoFechar}
      rotuloFechar={t('rulesModal.close')}
      tamanho="grande"
      className="modal-regras"
      rodape={<RodapeRegras aoMudar={restaurar} aoFechar={aoFechar} />}
    >
      {comSanma && variante && aoMudarVariante ? (
        <AbasModal
          abas={[
            { chave: 'regras', rotulo: t('rulesModal.title') },
            { chave: 'sanma', rotulo: t('sanma.sanma') },
          ]}
          ativa={aba}
          aoEscolher={setAba}
          rotulo={t('rulesModal.title')}
        >
          {aba === 'regras' ? (
            <ListaRegrasCalculo configuracao={configuracao} aoMudar={aoMudar} />
          ) : (
            <ListaRegrasSanma variante={variante} aoMudarVariante={aoMudarVariante} />
          )}
        </AbasModal>
      ) : (
        <ListaRegrasCalculo configuracao={configuracao} aoMudar={aoMudar} />
      )}
    </Modal>
  )
}

/** Uma regra de duas (ou mais) opções, no mesmo desenho das Regras de cálculo. */
export function LinhaRegraOpcoes<T extends string | boolean>({
  titulo,
  ajuda,
  valor,
  opcoes,
  aoMudar,
}: {
  titulo: string
  ajuda: string
  valor: T
  opcoes: { valor: T; rotulo: string }[]
  aoMudar: (valor: T) => void
}) {
  const ajudaId = useId()
  return (
    <div className="linha-regra">
      <div className="texto-regra">
        <strong>{titulo}</strong>
        <span id={ajudaId}>
          <TextoGlossario texto={ajuda} />
        </span>
      </div>
      <div className="controle-regra" role="group" aria-label={titulo} aria-describedby={ajudaId}>
        {opcoes.map((opcao) => (
          <button
            key={String(opcao.valor)}
            type="button"
            className={valor === opcao.valor ? 'ativo' : ''}
            aria-pressed={valor === opcao.valor}
            onClick={() => {
              if (valor !== opcao.valor) aoMudar(opcao.valor)
            }}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Honba no Sanma: um número por linha, no mesmo desenho das regras. */
function LinhaRegraNumero({
  titulo,
  ajuda,
  valor,
  passo,
  aoMudar,
}: {
  titulo: string
  ajuda: string
  valor: number
  passo: number
  aoMudar: (valor: number) => void
}) {
  const ajudaId = useId()
  return (
    <div className="linha-regra">
      <div className="texto-regra">
        <strong>{titulo}</strong>
        <span id={ajudaId}>{ajuda}</span>
      </div>
      <input
        className="campo-regra-numero"
        type="number"
        inputMode="numeric"
        min={0}
        step={passo}
        value={valor}
        aria-label={titulo}
        aria-describedby={ajudaId}
        onChange={(evento) => {
          const novo = Number(evento.target.value)
          if (evento.target.value.trim() !== '' && Number.isFinite(novo) && novo >= 0) aoMudar(novo)
        }}
      />
    </div>
  )
}

/**
 * Aba Sanma: Jogadores (4 ou 3) e, em 3, só as regras que mudam o cálculo da mão
 * (Kita, Norte como yakuhai, pagamento do Tsumo e honba). Valem em todo o app.
 */
export function ListaRegrasSanma({
  variante,
  aoMudarVariante,
}: {
  variante: Variante
  aoMudarVariante: (variante: Variante) => void
}) {
  const { t } = useI18n()
  const { regrasSanma, setRegrasSanma } = useConfigSanma()
  const mudar = (parcial: Partial<RegrasSanma>) => setRegrasSanma({ ...regrasSanma, ...parcial })
  const ligado = [
    { valor: true, rotulo: t('rulesModal.akadora.on') },
    { valor: false, rotulo: t('rulesModal.akadora.off') },
  ]
  return (
    <div className="lista-regras lista-regras--variante">
      <LinhaRegraOpcoes<Variante>
        titulo={t('sanma.jogadoresTitulo')}
        ajuda={t('sanma.jogadoresAjuda')}
        valor={variante}
        aoMudar={aoMudarVariante}
        opcoes={[
          { valor: 'yonma', rotulo: t('sanma.variante4') },
          { valor: 'sanma', rotulo: t('sanma.variante3') },
        ]}
      />
      {variante === 'sanma' && (
        <>
          <LinhaRegraOpcoes
            titulo={t('sanma.kitaNukidora')}
            ajuda={t('sanma.kitaAjuda')}
            valor={regrasSanma.kitaNukidora}
            aoMudar={(kitaNukidora) => mudar({ kitaNukidora })}
            opcoes={ligado}
          />
          <LinhaRegraOpcoes
            titulo={t('sanma.norteYakuhai')}
            ajuda={t('sanma.norteYakuhaiAjuda')}
            valor={regrasSanma.norteYakuhai}
            aoMudar={(norteYakuhai) => mudar({ norteYakuhai })}
            opcoes={ligado}
          />
          <LinhaRegraOpcoes<RegrasSanma['pagamentoTsumo']>
            titulo={t('sanma.pagamentoTsumo')}
            ajuda={t('sanma.pagamentoTsumoAjuda')}
            valor={regrasSanma.pagamentoTsumo}
            aoMudar={(pagamentoTsumo) => mudar({ pagamentoTsumo })}
            opcoes={[
              { valor: 'tsumo-son', rotulo: t('sanma.tsumoSonCurto') },
              { valor: 'divisao-norte', rotulo: t('sanma.divisaoNorteCurto') },
            ]}
          />
          <LinhaRegraNumero
            titulo={t('sanma.honbaRon')}
            ajuda={t('sanma.honbaAjuda')}
            valor={regrasSanma.honbaRon}
            passo={100}
            aoMudar={(honbaRon) => mudar({ honbaRon })}
          />
          <LinhaRegraNumero
            titulo={t('sanma.honbaTsumo')}
            ajuda={t('sanma.honbaAjuda')}
            valor={regrasSanma.honbaTsumoPorJogador}
            passo={100}
            aoMudar={(honbaTsumoPorJogador) => mudar({ honbaTsumoPorJogador })}
          />
        </>
      )}
    </div>
  )
}

/** Restaurar padrão e Aplicar (as mudanças já valem; Aplicar só fecha). */
export function RodapeRegras({
  aoMudar,
  aoFechar,
}: {
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  return (
    <>
      <button type="button" className="btn-contorno" onClick={() => aoMudar(configuracaoPadrao)}>
        {t('rulesModal.restoreDefault')}
      </button>
      <button type="button" className="btn-primario" onClick={aoFechar}>
        {t('rulesModal.apply')}
      </button>
    </>
  )
}

/** A lista de regras, igual na calculadora e nas Configurações de mesa. */
export function ListaRegrasCalculo({
  configuracao,
  aoMudar,
  semChombo = false,
  mostrar,
}: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  /** A mesa tem o próprio chombo. */
  semChombo?: boolean
  /** Filtro da busca, com o texto de cada regra. */
  mostrar?: (texto: string) => boolean
}) {
  const { t } = useI18n()

  const alternar = (chave: keyof ConfiguracaoCalculo) => {
    aoMudar({ ...configuracao, [chave]: !configuracao[chave] })
  }
  const regras = CONFIGURACOES_REGRAS.filter((regra) => !semChombo || regra.chave !== 'chomboMangan')

  return (
      <div className="lista-regras">
        {regras.map((regra) => {
          const dependencia = DEPENDENCIAS_REGRAS[regra.chave]
          // Sem a regra de que depende: fica apagada e vale desligada, mas a
          // escolha guardada volta quando a dependência for religada.
          const desabilitada = dependencia !== undefined && !configuracao[dependencia]
          const ativo = configuracao[regra.chave] && !desabilitada
          const textos = CHAVES_REGRAS[regra.chave]
          const titulo = t(textos.titulo)
          if (mostrar && !mostrar(`${titulo} ${t(textos.ajuda)}`)) return null
          const ajudaId = `ajuda-regra-${regra.chave}`

          return (
            <div
              className={`linha-regra${desabilitada ? ' linha-regra--desabilitada' : ''}`}
              key={regra.chave}
            >
              <div className="texto-regra">
                <strong>{titulo}</strong>
                <span id={ajudaId}>
                  <TextoGlossario texto={t(textos.ajuda)} />
                </span>
              </div>
              <div
                className="controle-regra"
                role="group"
                aria-label={titulo}
                aria-describedby={ajudaId}
                aria-disabled={desabilitada || undefined}
              >
                <button
                  type="button"
                  className={ativo ? 'ativo' : ''}
                  aria-pressed={ativo}
                  disabled={desabilitada}
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
                  disabled={desabilitada}
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
  )
}
