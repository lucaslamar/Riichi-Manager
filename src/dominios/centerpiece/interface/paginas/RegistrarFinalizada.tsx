import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { calcularOka, somaUma, type ConfigMesa } from '../../logica/configMesa'
import { criarPartidaManual } from '../../logica/partidaManual'
import { carregarUltimaConfig } from '../../persistencia/repositorioConfigMesa'
import ListaResultado from '../componentes/ListaResultado'
import { usePartidas } from '../hooks/usePartidas'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
const CHAVE_LUGAR = ['tableConfig.uma1', 'tableConfig.uma2', 'tableConfig.uma3', 'tableConfig.uma4']

/** Só dígitos e um sinal na frente: o teclado numérico do celular não tem o menos. */
const limparNumero = (texto: string) => {
  const negativo = texto.trim().startsWith('-')
  return `${negativo ? '-' : ''}${texto.replace(/\D/g, '')}`
}

function CampoNumerico({
  rotulo,
  valor,
  aoMudar,
  comSinal = true,
}: {
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  comSinal?: boolean
}) {
  const { t } = useI18n()
  return (
    <div className="fin-campo">
      <input
        className="cfg-entrada"
        type="text"
        inputMode="numeric"
        pattern="-?[0-9]*"
        aria-label={rotulo}
        autoComplete="off"
        value={valor}
        onChange={(evento) => aoMudar(limparNumero(evento.target.value))}
      />
      {comSinal && (
        <button
          type="button"
          className="fin-sinal"
          aria-label={t('match.manual.toggleSign', { field: rotulo })}
          onClick={() => aoMudar(valor.startsWith('-') ? valor.slice(1) : `-${valor}`)}
        >
          ±
        </button>
      )}
    </div>
  )
}

/** Partida jogada fora do app: jogadores, pontos, uma e oka. */
export default function RegistrarFinalizada({
  aoVoltar,
  aoRegistrar,
}: {
  aoVoltar: () => void
  aoRegistrar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { adicionar } = usePartidas()
  const [base] = useState<ConfigMesa>(() => carregarUltimaConfig(armazenamentoLocal))
  const [assentos, setAssentos] = useState<(string | null)[]>([null, null, null, null])
  const [pontos, setPontos] = useState(['', '', '', ''])
  const [uma, setUma] = useState(() => base.uma.map(String))
  const [oka, setOka] = useState(() => String(calcularOka(base)))
  const [escolhendo, setEscolhendo] = useState<number | null>(null)

  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : null
  }
  const valido = (texto: string) => /^-?\d+$/.test(texto)
  const completo =
    assentos.every(Boolean) && pontos.every(valido) && uma.every(valido) && /^\d+$/.test(oka)

  const umaNumeros = uma.map(Number) as ConfigMesa['uma']
  const previa = useMemo(
    () =>
      completo
        ? criarPartidaManual(
            'previa',
            base,
            {
              jogadorIds: assentos as unknown as readonly [string, string, string, string],
              nomes: assentos.map((id) => nomeDe(id) ?? ''),
              pontos: pontos.map(Number) as unknown as readonly [number, number, number, number],
              uma: umaNumeros,
              oka: Number(oka),
            },
            new Date().toISOString(),
          )
        : null,
    // A prévia só depende do que foi digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completo, assentos, pontos, uma, oka],
  )

  const nomeDaPrevia = (cadeira: number) => nomeDe(assentos[cadeira]) ?? '—'

  return (
    <section className="ptd-inicio fin-tela">
      <TituloTela titulo={t('match.manual.title')} aoVoltar={aoVoltar} />

      <p className="ptd-rotulo">{t('match.manual.players')}</p>
      <div className="fin-linhas">
        {LUGARES.map((lugar) => {
          const nome = nomeDe(assentos[lugar])
          return (
            <div key={lugar} className="fin-linha">
              <button
                type="button"
                className={`ptd-assento fin-jogador${nome ? ' ptd-assento--ocupado' : ''}`}
                aria-label={nome ?? t('match.manual.choosePlayer', { number: lugar + 1 })}
                onClick={() => setEscolhendo(lugar)}
              >
                {nome ?? t('match.setup.assign')}
              </button>
              <CampoNumerico
                rotulo={t('match.manual.points', { name: nome ?? lugar + 1 })}
                valor={pontos[lugar]}
                aoMudar={(valor) => setPontos(pontos.map((atual, i) => (i === lugar ? valor : atual)))}
              />
            </div>
          )
        })}
      </div>

      <p className="ptd-rotulo">{t('tableConfig.umaLabel')}</p>
      <div className="fin-uma">
        {LUGARES.map((lugar) => (
          <label key={lugar} className="cfg-campo">
            <span>{t(CHAVE_LUGAR[lugar])}</span>
            <CampoNumerico
              rotulo={`${t('tableConfig.umaLabel')} ${t(CHAVE_LUGAR[lugar])}`}
              valor={uma[lugar]}
              aoMudar={(valor) => setUma(uma.map((atual, i) => (i === lugar ? valor : atual)))}
            />
          </label>
        ))}
      </div>
      {uma.every(valido) && somaUma(umaNumeros) !== 0 && (
        <p className="cfg-aviso" role="status">
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          {t('tableConfig.umaWarning', { sum: numero(somaUma(umaNumeros)) })}
        </p>
      )}

      <label className="cfg-campo">
        <span>{t('match.manual.oka')}</span>
        <CampoNumerico
          rotulo={t('match.manual.oka')}
          valor={oka}
          comSinal={false}
          aoMudar={(valor) => setOka(valor.replace('-', ''))}
        />
      </label>

      {previa?.resultado && (
        <>
          <p className="ptd-rotulo">{t('match.manual.preview')}</p>
          <ListaResultado linhas={previa.resultado} nomeDe={nomeDaPrevia} />
        </>
      )}

      <button
        type="button"
        className="mesa-btn-principal"
        disabled={!previa}
        onClick={() => {
          if (!previa) return
          adicionar({ ...previa, id: gerarId() })
          aoRegistrar()
        }}
      >
        {t('match.manual.save')}
      </button>

      {escolhendo !== null && (
        <SeletorJogador
          idsEscolhidos={assentos.filter((id): id is string => !!id)}
          aoEscolher={(jogador) => {
            setAssentos(assentos.map((atual, i) => (i === escolhendo ? jogador.id : atual)))
            setEscolhendo(null)
          }}
          aoFechar={() => setEscolhendo(null)}
        />
      )}
    </section>
  )
}
