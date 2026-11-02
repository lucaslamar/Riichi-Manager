import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  calcularOka,
  IDS_PRESET,
  OPCOES_TIMER_VEZ,
  somaUma,
  VALOR_CHOMBO_FIXO_PADRAO,
  type ConfigMesa,
} from '../../logica/configMesa'
import { exemploPontuacao } from '../../logica/exemploPontuacao'
import { useConfigMesa } from '../hooks/useConfigMesa'
import '../config-mesa.css'

const CHAVE_LUGAR = ['tableConfig.uma1', 'tableConfig.uma2', 'tableConfig.uma3', 'tableConfig.uma4']

const ABORTIVOS: { campo: keyof ConfigMesa['abortivos']; chave: string }[] = [
  { campo: 'kyuushuKyuuhai', chave: 'tableConfig.abortiveNineTerminals' },
  { campo: 'quatroVentos', chave: 'tableConfig.abortiveFourWinds' },
  { campo: 'quatroKans', chave: 'tableConfig.abortiveFourKans' },
  { campo: 'quatroRiichis', chave: 'tableConfig.abortiveFourRiichi' },
]

interface PropsConfigMesaSheet {
  inicial: ConfigMesa
  aoConcluir: (config: ConfigMesa) => void
  aoFechar: () => void
}

/** Folha "Configurações de mesa": preset no topo, Pontuação, Regras, Reiniciar e Feito. */
export default function ConfigMesaSheet({ inicial, aoConcluir, aoFechar }: PropsConfigMesaSheet) {
  const { t, numero } = useI18n()
  const { config, alterar, escolherPreset, reiniciar } = useConfigMesa(inicial)
  const oka = calcularOka(config)
  const soma = somaUma(config.uma)

  return (
    <Modal
      titulo={t('tableConfig.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="modal-folha config-mesa"
      rodape={
        <div className="cfg-acoes">
          <button type="button" className="btn-contorno" onClick={reiniciar}>
            {t('tableConfig.reset')}
          </button>
          <button type="button" className="btn-primario" onClick={() => aoConcluir(config)}>
            {t('tableConfig.done')}
          </button>
        </div>
      }
    >
      <Campo rotulo={t('tableConfig.preset')}>
        <select
          className="cfg-entrada"
          value={config.preset}
          onChange={(evento) => escolherPreset(evento.target.value as ConfigMesa['preset'])}
        >
          {IDS_PRESET.map((preset) => (
            <option key={preset} value={preset}>
              {t(`tableConfig.presets.${preset}`)}
            </option>
          ))}
          <option value="personalizado">{t('tableConfig.presets.personalizado')}</option>
        </select>
      </Campo>
      {config.preset === 'padrao' && <p className="cfg-ajuda">{t('tableConfig.presetDefaultHelp')}</p>}

      <h3 className="cfg-grupo">{t('tableConfig.scoring')}</h3>

      <div className="cfg-duas-colunas">
        <Campo rotulo={t('tableConfig.startPoints')}>
          <CampoNumero
            valor={config.pontosPartida}
            passo={1000}
            minimo={0}
            aoMudar={(pontosPartida) => alterar({ pontosPartida })}
          />
        </Campo>
        <Campo
          rotulo={t('tableConfig.returnPoints')}
          ajuda={
            <AjudaCampo rotulo={t('tableConfig.returnPoints')}>
              <AjudaRetorno config={config} />
            </AjudaCampo>
          }
        >
          <CampoNumero
            valor={config.pontosRetorno}
            passo={1000}
            minimo={0}
            aoMudar={(pontosRetorno) => alterar({ pontosRetorno })}
          />
        </Campo>
      </div>
      <p className="cfg-ajuda cfg-ajuda--com-botao">
        {t('tableConfig.okaValue', { points: numero(oka) })}
        <AjudaCampo rotulo={t('tableConfig.okaLabel')}>
          <p>{t('tableConfig.okaHelp')}</p>
        </AjudaCampo>
      </p>

      <fieldset className="cfg-conjunto">
        <legend className="cfg-legenda-com-botao">
          {t('tableConfig.uma')}
          <AjudaCampo rotulo={t('tableConfig.umaLabel')}>
            <p>{t('tableConfig.umaHelp')}</p>
          </AjudaCampo>
        </legend>
        <div className="cfg-uma">
          {config.uma.map((valor, indice) => (
            <Campo key={CHAVE_LUGAR[indice]} rotulo={t(CHAVE_LUGAR[indice])}>
              <CampoNumero
                valor={valor}
                passo={1}
                aoMudar={(novo) => {
                  const uma = [...config.uma] as ConfigMesa['uma']
                  uma[indice] = novo
                  alterar({ uma })
                }}
              />
            </Campo>
          ))}
        </div>
        {soma !== 0 && (
          <p className="cfg-aviso" role="status">
            <i className="fas fa-triangle-exclamation" aria-hidden="true" />
            {t('tableConfig.umaWarning', { sum: numero(soma) })}
          </p>
        )}
      </fieldset>

      <Campo
        rotulo={t('tableConfig.leftoverSticks')}
        ajuda={
          <AjudaCampo rotulo={t('tableConfig.leftoverSticks')}>
            <p>{t('tableConfig.leftoverHelp')}</p>
          </AjudaCampo>
        }
      >
        <select
          className="cfg-entrada"
          value={config.palitosRestantes}
          onChange={(evento) =>
            alterar({ palitosRestantes: evento.target.value as ConfigMesa['palitosRestantes'] })
          }
        >
          <option value="primeiro">{t('tableConfig.leftoverFirst')}</option>
          <option value="perdidos">{t('tableConfig.leftoverLost')}</option>
        </select>
      </Campo>

      <Campo rotulo={t('tableConfig.chombo')}>
        <select
          className="cfg-entrada"
          value={config.chombo.tipo}
          onChange={(evento) =>
            alterar({
              chombo:
                evento.target.value === 'fixo'
                  ? { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO }
                  : { tipo: evento.target.value as 'manganReverso' | 'yakumanReverso' },
            })
          }
        >
          <option value="manganReverso">{t('tableConfig.chomboReverseMangan')}</option>
          <option value="yakumanReverso">{t('tableConfig.chomboReverseYakuman')}</option>
          <option value="fixo">{t('tableConfig.chomboFixed')}</option>
        </select>
      </Campo>
      {config.chombo.tipo === 'fixo' && (
        <Campo rotulo={t('tableConfig.chomboValue')}>
          <CampoNumero
            valor={config.chombo.valor}
            passo={1000}
            minimo={0}
            aoMudar={(valor) => alterar({ chombo: { tipo: 'fixo', valor } })}
          />
        </Campo>
      )}

      <h3 className="cfg-grupo">{t('tableConfig.rules')}</h3>

      <fieldset className="cfg-conjunto">
        <legend>{t('tableConfig.gameType')}</legend>
        <div className="cfg-segmentos">
          <Segmento
            ativo={config.tipoPartida === 'leste'}
            rotulo={t('tableConfig.gameEast')}
            aoEscolher={() => alterar({ tipoPartida: 'leste' })}
          />
          <Segmento
            ativo={config.tipoPartida === 'hanchan'}
            rotulo={t('tableConfig.gameHanchan')}
            aoEscolher={() => alterar({ tipoPartida: 'hanchan' })}
          />
        </div>
      </fieldset>

      <Campo rotulo={t('tableConfig.multipleRon')}>
        <select
          className="cfg-entrada"
          value={config.ronMultiplo}
          onChange={(evento) =>
            alterar({ ronMultiplo: evento.target.value as ConfigMesa['ronMultiplo'] })
          }
        >
          <option value="atamaHane">{t('tableConfig.ronAtamaHane')}</option>
          <option value="duploTriploAborta">{t('tableConfig.ronTripleAborts')}</option>
          <option value="duploTriploPermitidos">{t('tableConfig.ronAllowed')}</option>
        </select>
      </Campo>

      <Opcao
        rotulo={t('tableConfig.tobi')}
        ajuda={t('tableConfig.tobiHelp')}
        marcado={config.tobi}
        aoMudar={(tobi) => alterar({ tobi })}
      />
      <Opcao
        rotulo={t('tableConfig.agariYame')}
        ajuda={t('tableConfig.agariYameHelp')}
        marcado={config.agariYame}
        aoMudar={(agariYame) => alterar({ agariYame })}
      />
      <Opcao
        rotulo={t('tableConfig.extraRound')}
        ajuda={t('tableConfig.extraRoundHelp')}
        marcado={config.prorrogacao}
        aoMudar={(prorrogacao) => alterar({ prorrogacao })}
      />
      <Opcao
        rotulo={t('tableConfig.nagashiMangan')}
        marcado={config.nagashiMangan}
        aoMudar={(nagashiMangan) => alterar({ nagashiMangan })}
      />

      <fieldset className="cfg-conjunto">
        <legend>{t('tableConfig.abortiveDraws')}</legend>
        {ABORTIVOS.map(({ campo, chave }) => (
          <Opcao
            key={campo}
            rotulo={t(chave)}
            marcado={config.abortivos[campo]}
            aoMudar={(marcado) => alterar({ abortivos: { ...config.abortivos, [campo]: marcado } })}
          />
        ))}
      </fieldset>

      <fieldset className="cfg-conjunto">
        <legend>{t('tableConfig.turnTimer')}</legend>
        <div className="cfg-segmentos">
          {OPCOES_TIMER_VEZ.map((segundos) => (
            <Segmento
              key={segundos}
              ativo={config.timerVez === segundos}
              rotulo={t(`tableConfig.timer${segundos}`)}
              aoEscolher={() => alterar({ timerVez: segundos })}
            />
          ))}
        </div>
      </fieldset>

      <Opcao
        rotulo={t('tableConfig.recordDiscards')}
        marcado={config.registrarDescartes}
        aoMudar={(registrarDescartes) =>
          alterar({ registrarDescartes, checarFuriten: registrarDescartes && config.checarFuriten })
        }
      />
      {config.registrarDescartes && (
        <Opcao
          rotulo={t('tableConfig.checkFuriten')}
          ajuda={t('tableConfig.checkFuritenHelp')}
          marcado={config.checarFuriten}
          aoMudar={(checarFuriten) => alterar({ checarFuriten })}
        />
      )}
    </Modal>
  )
}

function Campo({
  rotulo,
  ajuda,
  children,
}: {
  rotulo: string
  ajuda?: ReactNode
  children: ReactNode
}) {
  return (
    <label className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {rotulo}
        {ajuda}
      </span>
      {children}
    </label>
  )
}

/** Texto com **destaque** vindo dos locales. */
function TextoComDestaque({ texto }: { texto: string }) {
  return (
    <p>
      {texto.split('**').map((parte, indice) =>
        indice % 2 === 1 ? <strong key={indice}>{parte}</strong> : parte,
      )}
    </p>
  )
}

/** Ajuda de Pontos de retorno; o exemplo usa os valores que estão na tela. */
function AjudaRetorno({ config }: { config: ConfigMesa }) {
  const { t, numero } = useI18n()
  const oka = calcularOka(config)
  const comSinal = (valor: number) => (valor > 0 ? `+${numero(valor)}` : numero(valor))
  return (
    <div className="cfg-ajuda-texto">
      <p>{t('tableConfig.returnHelp1')}</p>
      <TextoComDestaque texto={t('tableConfig.returnHelp2')} />
      {oka > 0 ? (
        <p>
          {t('tableConfig.returnHelpOka', {
            start: numero(config.pontosPartida),
            target: numero(config.pontosRetorno),
            each: numero(oka / 4),
            oka: numero(oka),
          })}
        </p>
      ) : (
        <p>{t('tableConfig.returnHelpNoOka')}</p>
      )}
      <p>
        <strong>{t('tableConfig.returnExample')}</strong>{' '}
        {t('tableConfig.returnExampleValues', {
          start: numero(config.pontosPartida),
          target: numero(config.pontosRetorno),
          uma: config.uma.join(' / '),
        })}
      </p>
      <table className="cfg-tabela-exemplo">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">{t('tableConfig.exPlace')}</span>
            </th>
            <th scope="col">{t('tableConfig.exPoints')}</th>
            <th scope="col">{t('tableConfig.exReturn')}</th>
            <th scope="col">{t('tableConfig.exUma')}</th>
            {oka > 0 && <th scope="col">{t('tableConfig.exOka')}</th>}
            <th scope="col">{t('tableConfig.exFinal')}</th>
          </tr>
        </thead>
        <tbody>
          {exemploPontuacao(config).map((linha) => (
            <tr key={linha.colocacao}>
              <th scope="row">{t('match.result.place', { place: linha.colocacao })}</th>
              <td>{numero(linha.pontos)}</td>
              <td>{comSinal(linha.menosRetorno)}</td>
              <td>{comSinal(linha.uma)}</td>
              {oka > 0 && <td>{linha.oka > 0 ? comSinal(linha.oka) : ''}</td>}
              <td>
                <strong>{comSinal(linha.final)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Número com texto próprio: dá para apagar tudo e digitar de novo, ou começar
 * pelo sinal de menos, sem o campo voltar sozinho. Só vai para a config quando vale.
 */
function CampoNumero({
  valor,
  passo,
  minimo,
  aoMudar,
}: {
  valor: number
  passo: number
  minimo?: number
  aoMudar: (valor: number) => void
}) {
  const [texto, setTexto] = useState(String(valor))

  // Preset ou Reiniciar mudaram o valor por fora.
  useEffect(() => {
    if (Number(texto) !== valor || texto.trim() === '') setTexto(String(valor))
    // Só reage ao valor; o texto em edição é da pessoa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  return (
    <input
      className="cfg-entrada"
      type="number"
      step={passo}
      min={minimo}
      value={texto}
      onChange={(evento) => {
        const digitado = evento.target.value
        setTexto(digitado)
        const novo = Number(digitado)
        if (digitado.trim() === '' || !Number.isFinite(novo)) return
        if (minimo !== undefined && novo < minimo) return
        if (novo !== valor) aoMudar(novo)
      }}
      // Saiu do campo com algo inválido: volta para o último valor que valeu.
      onBlur={() => setTexto(String(valor))}
    />
  )
}

function Segmento({
  ativo,
  rotulo,
  aoEscolher,
}: {
  ativo: boolean
  rotulo: string
  aoEscolher: () => void
}) {
  return (
    <button
      type="button"
      className={`cfg-segmento${ativo ? ' cfg-segmento--ativo' : ''}`}
      aria-pressed={ativo}
      onClick={aoEscolher}
    >
      {rotulo}
    </button>
  )
}

function Opcao({
  rotulo,
  ajuda,
  marcado,
  aoMudar,
}: {
  rotulo: string
  ajuda?: string
  marcado: boolean
  aoMudar: (marcado: boolean) => void
}) {
  return (
    <label className="cfg-opcao">
      <span>
        <strong>{rotulo}</strong>
        {ajuda && <small>{ajuda}</small>}
      </span>
      <input
        type="checkbox"
        checked={marcado}
        onChange={(evento) => aoMudar(evento.target.checked)}
      />
    </label>
  )
}
