import { useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import BotoesOpcao from '@/dominios/centerpiece/interface/componentes/BotoesOpcao'
import { divisaoAutomatica, lerDivisao, somaDe } from '../../logica/premiacao'
import { dataDoDia } from '../../logica/torneio'
import type { ConfigPremiacao } from '../../logica/tipos'
import { useDinheiro } from '../hooks/useDinheiro'
import QuadroPremiacao from './QuadroPremiacao'

const INSCRICOES: readonly number[] = [50, 100]
const PARCELAS: readonly number[] = [1, 2, 5]
const PARTES_DO_CLUBE: readonly number[] = [20, 25, 30]
const OUTRO = -1

/** Os campos da premiação, cada um com o porquê do padrão no ?, e a conta embaixo. */
export default function EditorPremiacao({
  config,
  jogadores,
  aoMudar,
}: {
  config: ConfigPremiacao
  jogadores: number
  aoMudar: (config: ConfigPremiacao) => void
}) {
  const { t, numero } = useI18n()
  const dinheiro = useDinheiro()
  const mudar = (parcial: Partial<ConfigPremiacao>) => aoMudar({ ...config, ...parcial })
  const { antecipada, divisao } = config
  const personalizada = typeof divisao === 'string' ? null : divisao.personalizada
  const [textoDivisao, setTextoDivisao] = useState(() => personalizada?.join(', ') ?? '')
  const soma = personalizada ? somaDe(personalizada) : 100

  return (
    <>
      <Grupo rotulo={t('tournament.prize.enable')}>
        <BotoesOpcao<'nao' | 'sim'>
          rotulo={t('tournament.prize.enable')}
          valor={config.ativa ? 'sim' : 'nao'}
          aoEscolher={(valor) => mudar({ ativa: valor === 'sim' })}
          opcoes={[
            { valor: 'nao', rotulo: t('tournament.settings.off') },
            { valor: 'sim', rotulo: t('tournament.settings.on') },
          ]}
        />
      </Grupo>

      {config.ativa && (
        <>
          <OpcaoNumero
            rotulo={t('tournament.prize.fee')}
            ajuda={t('tournament.prize.whyFee')}
            opcoes={INSCRICOES}
            valor={config.inscricao}
            texto={(valor) => dinheiro(valor, config.moeda)}
            aoMudar={(inscricao) => mudar({ inscricao })}
          />
          <OpcaoNumero
            rotulo={t('tournament.prize.installments')}
            ajuda={t('tournament.prize.whyInstallments')}
            opcoes={PARCELAS}
            valor={config.parcelas}
            texto={(valor) => `${numero(valor)}x`}
            aoMudar={(parcelas) => mudar({ parcelas })}
          />

          <Grupo rotulo={t('tournament.prize.early')} ajuda={t('tournament.prize.whyEarly')}>
            <BotoesOpcao<'nao' | 'sim'>
              rotulo={t('tournament.prize.early')}
              valor={antecipada ? 'sim' : 'nao'}
              aoEscolher={(valor) =>
                mudar({
                  antecipada:
                    valor === 'sim'
                      ? { valor: Math.round(config.inscricao * 0.8), ate: dataDoDia(new Date()), quantidade: 0 }
                      : undefined,
                })
              }
              opcoes={[
                { valor: 'nao', rotulo: t('tournament.settings.off') },
                { valor: 'sim', rotulo: t('tournament.settings.on') },
              ]}
            />
          </Grupo>
          {antecipada && (
            <div className="trn-premio-antecipada">
              <label className="cfg-campo">
                <span className="cfg-campo-rotulo">{t('tournament.prize.earlyValue')}</span>
                <CampoValor
                  valor={antecipada.valor}
                  aoMudar={(valor) => mudar({ antecipada: { ...antecipada, valor } })}
                />
              </label>
              <label className="cfg-campo">
                <span className="cfg-campo-rotulo">{t('tournament.prize.earlyCount')}</span>
                <CampoValor
                  valor={antecipada.quantidade}
                  aoMudar={(quantidade) => mudar({ antecipada: { ...antecipada, quantidade } })}
                />
              </label>
              <label className="cfg-campo trn-premio-ate">
                <span className="cfg-campo-rotulo">{t('tournament.prize.earlyUntil')}</span>
                <input
                  type="date"
                  className="trn-campo"
                  value={antecipada.ate}
                  onChange={(evento) => mudar({ antecipada: { ...antecipada, ate: evento.target.value } })}
                />
              </label>
            </div>
          )}

          <OpcaoNumero
            rotulo={t('tournament.prize.club')}
            ajuda={t('tournament.prize.whyClub')}
            opcoes={PARTES_DO_CLUBE}
            valor={Math.round(config.parteClube * 1000) / 10}
            texto={(valor) => `${numero(valor)}%`}
            aoMudar={(parte) => mudar({ parteClube: parte / 100 })}
          />

          <Grupo rotulo={t('tournament.prize.split')} ajuda={t('tournament.prize.whySplit')}>
            <BotoesOpcao<'automatica' | 'so-primeiro' | 'personalizada'>
              rotulo={t('tournament.prize.split')}
              valor={typeof divisao === 'string' ? divisao : 'personalizada'}
              aoEscolher={(valor) => {
                if (valor !== 'personalizada') return mudar({ divisao: valor })
                const atual = divisaoAutomatica(jogadores)
                setTextoDivisao(atual.join(', '))
                mudar({ divisao: { personalizada: atual } })
              }}
              opcoes={[
                { valor: 'automatica', rotulo: t('tournament.prize.splitAuto') },
                { valor: 'so-primeiro', rotulo: t('tournament.prize.splitFirst') },
                { valor: 'personalizada', rotulo: t('tournament.prize.splitCustom') },
              ]}
            />
          </Grupo>
          {personalizada && (
            <>
              <input
                className={`trn-campo${soma === 100 ? '' : ' trn-campo--erro'}`}
                aria-label={t('tournament.prize.splitList')}
                aria-invalid={soma !== 100}
                value={textoDivisao}
                placeholder="50, 30, 20"
                onChange={(evento) => {
                  setTextoDivisao(evento.target.value)
                  mudar({ divisao: { personalizada: lerDivisao(evento.target.value) } })
                }}
              />
              <p className={`cfg-ajuda${soma === 100 ? '' : ' trn-erro'}`} role="status">
                {soma === 100
                  ? t('tournament.prize.splitList')
                  : t('tournament.prize.sumMustBe100', { sum: `${numero(soma)}%` })}
              </p>
            </>
          )}

          <Grupo rotulo={t('tournament.prize.minimum')} ajuda={t('tournament.prize.whyMinimum')}>
            <CampoValor
              rotulo={t('tournament.prize.minimum')}
              valor={config.minimoJogadores}
              aoMudar={(minimoJogadores) => mudar({ minimoJogadores })}
            />
          </Grupo>

          <QuadroPremiacao config={config} jogadores={jogadores} />
        </>
      )}
    </>
  )
}

function Grupo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {rotulo}
        {ajuda && (
          <AjudaCampo rotulo={rotulo}>
            <p>{ajuda}</p>
          </AjudaCampo>
        )}
      </span>
      {children}
    </div>
  )
}

/** Vazio vale 0, que não deixa salvar onde 0 não serve. */
function CampoValor({ valor, rotulo, aoMudar }: { valor: number; rotulo?: string; aoMudar: (valor: number) => void }) {
  const [texto, setTexto] = useState(String(valor))
  return (
    <input
      className="trn-campo"
      type="number"
      inputMode="decimal"
      min={0}
      aria-label={rotulo}
      value={texto}
      onChange={(evento) => {
        setTexto(evento.target.value)
        aoMudar(Number(evento.target.value))
      }}
    />
  )
}

/** Botões dos valores comuns e Outro, que abre o campo. */
function OpcaoNumero({
  rotulo,
  ajuda,
  opcoes,
  valor,
  texto,
  aoMudar,
}: {
  rotulo: string
  ajuda: string
  opcoes: readonly number[]
  valor: number
  texto: (valor: number) => string
  aoMudar: (valor: number) => void
}) {
  const { t } = useI18n()
  const [outro, setOutro] = useState(() => !opcoes.includes(valor))
  return (
    <Grupo rotulo={rotulo} ajuda={ajuda}>
      <BotoesOpcao<number>
        rotulo={rotulo}
        valor={outro ? OUTRO : valor}
        aoEscolher={(escolhido) => {
          setOutro(escolhido === OUTRO)
          if (escolhido !== OUTRO) aoMudar(escolhido)
        }}
        opcoes={[
          ...opcoes.map((opcao) => ({ valor: opcao, rotulo: texto(opcao) })),
          { valor: OUTRO, rotulo: t('tournament.prize.other') },
        ]}
      />
      {outro && <CampoValor rotulo={rotulo} valor={valor} aoMudar={aoMudar} />}
    </Grupo>
  )
}
