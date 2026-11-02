import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ListaRegrasCalculo } from '@/dominios/calculadora-mao/interface/modais/regras/ModalRegras'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import {
  calcularOka,
  IDS_PRESET,
  OPCOES_TIMER_VEZ,
  VALOR_CHOMBO_FIXO_PADRAO,
  type ConfigMesa,
} from '../../logica/configMesa'
import { exemploPontuacao } from '../../logica/exemploPontuacao'
import { umaValida, valoresDaUma } from '../../logica/uma'
import { useConfigMesa } from '../hooks/useConfigMesa'
import BotoesOpcao from './BotoesOpcao'
import CampoUma from './CampoUma'
import EscolhaOka from './EscolhaOka'
import '../config-mesa.css'

const ABORTIVOS: { campo: keyof ConfigMesa['abortivos']; chave: string }[] = [
  { campo: 'kyuushuKyuuhai', chave: 'tableConfig.abortiveNineTerminals' },
  { campo: 'quatroVentos', chave: 'tableConfig.abortiveFourWinds' },
  { campo: 'quatroKans', chave: 'tableConfig.abortiveFourKans' },
  { campo: 'quatroRiichis', chave: 'tableConfig.abortiveFourRiichi' },
]
const ajudaDe = (chave: string) => `${chave}Help`

/** Seções do índice, na ordem da folha. */
const SECOES = [
  { id: 'pontuacao', chave: 'tableConfig.scoring' },
  { id: 'regras', chave: 'tableConfig.rules' },
  { id: 'empates', chave: 'tableConfig.indexDraws' },
  { id: 'calculo', chave: 'tableConfig.calcRules' },
  { id: 'mesa', chave: 'tableConfig.indexTable' },
] as const

/** O que foi digitado na busca, já normalizado; vazio mostra tudo. */
const ContextoBusca = createContext('')

function bate(busca: string, ...textos: (string | undefined)[]) {
  return !busca || normalizarTexto(textos.filter(Boolean).join(' ')).includes(busca)
}

/** Some quando não bate com a busca. As seções vazias somem pelo CSS (config-mesa.css). */
function Buscavel({ termos, className, children }: { termos: string; className?: string; children: ReactNode }) {
  const busca = useContext(ContextoBusca)
  return bate(busca, termos) ? <div className={['cfg-item', className].filter(Boolean).join(' ')}>{children}</div> : null
}

interface PropsConfigMesaSheet {
  inicial: ConfigMesa
  aoConcluir: (config: ConfigMesa) => void
  aoFechar: () => void
}

/** Folha "Configurações de mesa": preset no topo, Pontuação, Regras, Reiniciar e Feito. */
export default function ConfigMesaSheet({ inicial, aoConcluir, aoFechar }: PropsConfigMesaSheet) {
  const { t } = useI18n()
  const { config, alterar, escolherPreset, reiniciar } = useConfigMesa(inicial)
  const semOka = calcularOka(config) <= 0
  const [texto, setTexto] = useState('')
  const busca = normalizarTexto(texto)
  const raiz = useRef<HTMLDivElement | null>(null)
  const irPara = (id: string) =>
    raiz.current?.querySelector(`[data-secao="${id}"]`)?.scrollIntoView({ block: 'start' })

  return (
    <Modal
      titulo={t('tableConfig.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="config-mesa"
      rodape={
        <div className="cfg-acoes">
          <button type="button" className="btn-contorno" onClick={reiniciar}>
            {t('tableConfig.reset')}
          </button>
          <button
            type="button"
            className="btn-primario"
            disabled={!umaValida(config.uma)}
            onClick={() => aoConcluir(config)}
          >
            {t('tableConfig.done')}
          </button>
        </div>
      }
    >
      <ContextoBusca.Provider value={busca}>
      <div ref={raiz} className="cfg-corpo">
      <div className="cfg-topo">
        <CampoBusca
          valor={texto}
          aoMudar={setTexto}
          rotulo={t('tableConfig.searchPlaceholder')}
          placeholder={t('tableConfig.searchPlaceholder')}
          rotuloLimpar={t('actions.clear')}
        />
        {!busca && (
          <nav className="cfg-indice" aria-label={t('tableConfig.indexLabel')}>
            {SECOES.map(({ id, chave }) => (
              <button key={id} type="button" onClick={() => irPara(id)}>
                {t(chave)}
              </button>
            ))}
          </nav>
        )}
      </div>

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
      {config.preset === 'padrao' && !busca && <p className="cfg-ajuda">{t('tableConfig.presetDefaultHelp')}</p>}

      <section className="cfg-secao" data-secao="pontuacao">
      <h3 className="cfg-grupo">{t('tableConfig.scoring')}</h3>

      <div className="cfg-duas-colunas">
        <Campo rotulo={t('tableConfig.startPoints')}>
          <CampoNumero
            valor={config.pontosPartida}
            passo={1000}
            minimo={0}
            // Sem oka, o retorno acompanha a partida.
            aoMudar={(pontosPartida) =>
              alterar(semOka ? { pontosPartida, pontosRetorno: pontosPartida } : { pontosPartida })
            }
          />
        </Campo>
        {!semOka && (
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
        )}
      </div>
      <Buscavel termos={`${t('tableConfig.okaLabel')} ${t('tableConfig.okaHelp')} ${t('tableConfig.okaOffHelp')}`}>
        <EscolhaOka
          pontosPartida={config.pontosPartida}
          pontosRetorno={config.pontosRetorno}
          aoMudarRetorno={(pontosRetorno) => alterar({ pontosRetorno })}
        />
      </Buscavel>

      <Buscavel termos={`${t('tableConfig.uma')} ${t('tableConfig.umaHelp')} ${t('tableConfig.umaFloatHelp')}`}>
        <CampoUma
          valor={config.uma}
          aoMudar={(uma) => alterar({ uma })}
          pontosRetorno={config.pontosRetorno}
        />
      </Buscavel>

      <Grupo
        termos={t('tableConfig.leftoverHelp')}
        rotulo={t('tableConfig.leftoverSticks')}
        ajuda={
          <AjudaCampo rotulo={t('tableConfig.leftoverSticks')}>
            <p>{t('tableConfig.leftoverHelp')}</p>
          </AjudaCampo>
        }
      >
        <BotoesOpcao
          rotulo={t('tableConfig.leftoverSticks')}
          valor={config.palitosRestantes}
          aoEscolher={(palitosRestantes) => alterar({ palitosRestantes })}
          opcoes={[
            { valor: 'primeiro', rotulo: t('tableConfig.leftoverFirst') },
            { valor: 'perdidos', rotulo: t('tableConfig.leftoverLost') },
          ]}
        />
      </Grupo>

      <Grupo
        termos={`${t('tableConfig.chomboReverseMangan')} ${t('tableConfig.chomboReverseYakuman')} ${t('tableConfig.chomboFixed')}`}
        rotulo={t('tableConfig.chombo')}
      >
        <BotoesOpcao
          rotulo={t('tableConfig.chombo')}
          valor={config.chombo.tipo}
          aoEscolher={(tipo) =>
            alterar({
              chombo: tipo === 'fixo' ? { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO } : { tipo },
            })
          }
          opcoes={[
            { valor: 'manganReverso', rotulo: t('tableConfig.chomboReverseMangan') },
            { valor: 'yakumanReverso', rotulo: t('tableConfig.chomboReverseYakuman') },
            { valor: 'fixo', rotulo: t('tableConfig.chomboFixed') },
          ]}
        />
      </Grupo>
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

      </section>

      <section className="cfg-secao" data-secao="regras">
      <h3 className="cfg-grupo">{t('tableConfig.rules')}</h3>

      <Grupo
        termos={`${t('tableConfig.gameEast')} ${t('tableConfig.gameHanchan')}`}
        rotulo={t('tableConfig.gameType')}
      >
        <BotoesOpcao
          rotulo={t('tableConfig.gameType')}
          valor={config.tipoPartida}
          aoEscolher={(tipoPartida) => alterar({ tipoPartida })}
          opcoes={[
            { valor: 'leste', rotulo: t('tableConfig.gameEast') },
            { valor: 'hanchan', rotulo: t('tableConfig.gameHanchan') },
          ]}
        />
      </Grupo>

      <Grupo
        termos={`${t('tableConfig.ronAtamaHane')} ${t('tableConfig.ronTripleAborts')} ${t('tableConfig.ronAllowed')}`}
        rotulo={t('tableConfig.multipleRon')}
      >
        <BotoesOpcao
          empilhado
          rotulo={t('tableConfig.multipleRon')}
          valor={config.ronMultiplo}
          aoEscolher={(ronMultiplo) => alterar({ ronMultiplo })}
          opcoes={[
            { valor: 'atamaHane', rotulo: t('tableConfig.ronAtamaHane') },
            { valor: 'duploTriploAborta', rotulo: t('tableConfig.ronTripleAborts') },
            { valor: 'duploTriploPermitidos', rotulo: t('tableConfig.ronAllowed') },
          ]}
        />
      </Grupo>

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
        ajuda={t('tableConfig.nagashiManganHelp')}
        marcado={config.nagashiMangan}
        aoMudar={(nagashiMangan) => alterar({ nagashiMangan })}
      />

      </section>

      <section className="cfg-secao" data-secao="empates">
      <h3 className="cfg-grupo">{t('tableConfig.abortiveDraws')}</h3>
      <p className="cfg-ajuda cfg-ajuda--grupo">{t('tableConfig.abortiveDrawsHelp')}</p>
        {ABORTIVOS.map(({ campo, chave }) => (
          <Opcao
            key={campo}
            termos={`${t('tableConfig.abortiveDraws')} ${t('tableConfig.abortiveDrawsHelp')}`}
            rotulo={t(chave)}
            ajuda={t(ajudaDe(chave))}
            marcado={config.abortivos[campo]}
            aoMudar={(marcado) => alterar({ abortivos: { ...config.abortivos, [campo]: marcado } })}
          />
        ))}
      </section>

      <section className="cfg-secao" data-secao="calculo">
      <h3 className="cfg-grupo">{t('tableConfig.calcRules')}</h3>
      <ListaRegrasCalculo
        semChombo
        configuracao={config.regrasCalculo}
        aoMudar={(regrasCalculo) => alterar({ regrasCalculo })}
        mostrar={(textoRegra) => bate(busca, textoRegra)}
      />
      </section>

      <section className="cfg-secao" data-secao="mesa">
      <h3 className="cfg-grupo">{t('tableConfig.indexTable')}</h3>
      <Grupo rotulo={t('tableConfig.turnTimer')}>
        <BotoesOpcao
          rotulo={t('tableConfig.turnTimer')}
          valor={config.timerVez}
          aoEscolher={(timerVez) => alterar({ timerVez })}
          opcoes={OPCOES_TIMER_VEZ.map((segundos) => ({
            valor: segundos,
            rotulo: t(`tableConfig.timer${segundos}`),
          }))}
        />
      </Grupo>

      <Opcao
        rotulo={t('tableConfig.recordDiscards')}
        ajuda={t('tableConfig.recordDiscardsHelp')}
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
      </section>

      <p className="cfg-sem-resultado" role="status">
        {t('tableConfig.searchEmpty')}
      </p>
      </div>
      </ContextoBusca.Provider>
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
  const busca = useContext(ContextoBusca)
  if (!bate(busca, rotulo)) return null
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

/** Como `Campo`, para um grupo de botões: `label` em volta deles confundiria o toque. */
function Grupo({
  rotulo,
  termos,
  ajuda,
  children,
}: {
  rotulo: string
  /** Textos a mais que a busca encontra. */
  termos?: string
  ajuda?: ReactNode
  children: ReactNode
}) {
  const busca = useContext(ContextoBusca)
  if (!bate(busca, rotulo, termos)) return null
  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {rotulo}
        {ajuda}
      </span>
      {children}
    </div>
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
          uma: valoresDaUma(
            config.uma,
            exemploPontuacao(config).map((linha) => linha.pontos),
            config.pontosRetorno,
          ).join(' / '),
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

/** Mesmo controle das regras de cálculo: tudo na folha se liga e desliga igual. */
function Opcao({
  rotulo,
  termos,
  ajuda,
  marcado,
  aoMudar,
}: {
  rotulo: string
  /** Textos a mais que a busca encontra. */
  termos?: string
  ajuda?: string
  marcado: boolean
  aoMudar: (marcado: boolean) => void
}) {
  const { t } = useI18n()
  const busca = useContext(ContextoBusca)
  if (!bate(busca, rotulo, ajuda, termos)) return null
  return (
    <div className="linha-regra">
      <div className="texto-regra">
        <strong>{rotulo}</strong>
        {ajuda && <span>{ajuda}</span>}
      </div>
      <div className="controle-regra" role="group" aria-label={rotulo}>
        <button
          type="button"
          className={marcado ? 'ativo' : ''}
          aria-pressed={marcado}
          onClick={() => aoMudar(true)}
        >
          {t('tableConfig.yes')}
        </button>
        <button
          type="button"
          className={!marcado ? 'ativo' : ''}
          aria-pressed={!marcado}
          onClick={() => aoMudar(false)}
        >
          {t('tableConfig.no')}
        </button>
      </div>
    </div>
  )
}
