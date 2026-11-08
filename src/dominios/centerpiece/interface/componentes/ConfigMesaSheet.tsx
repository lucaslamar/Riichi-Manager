import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ListaRegrasCalculo } from '@/dominios/calculadora-mao/interface/modais/regras/ModalRegras'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import AbasModal from '@/compartilhado/interface/componentes/modal/AbasModal'
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

/** Blocos da folha, um por aba, na ordem em que aparecem. */
const SECOES = [
  { id: 'pontuacao', chave: 'tableConfig.scoring' },
  { id: 'regras', chave: 'tableConfig.rules' },
  { id: 'empates', chave: 'tableConfig.indexDraws' },
  { id: 'calculo', chave: 'tableConfig.calcRules' },
  { id: 'mesa', chave: 'tableConfig.indexTable' },
] as const
type IdSecao = (typeof SECOES)[number]['id'] | string

/** Aba a mais, antes das de mesa (o Torneio usa para nome, formato e tempo). */
export interface AbaExtra {
  id: string
  rotulo: string
  conteudo: ReactNode
}

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
  titulo?: string
  abasExtras?: readonly AbaExtra[]
  /** Rodapé Cancelar e Salvar, no lugar de Reiniciar e Concluir. */
  rodapeSalvar?: boolean
  /** Validação das abas a mais. */
  podeConcluir?: boolean
}

/**
 * Folha "Configurações de mesa": um bloco por aba (Pontuação, Regras, Empates,
 * Regras de cálculo, Mesa), trocado pela aba ou deslizando para o lado, como no
 * Guia de bolso. O conjunto fica em botões no topo; mudou algo, vira Personalizado.
 * Com busca, aparecem todos os blocos que batem.
 */
export default function ConfigMesaSheet({
  inicial,
  aoConcluir,
  aoFechar,
  titulo,
  abasExtras = [],
  rodapeSalvar = false,
  podeConcluir = true,
}: PropsConfigMesaSheet) {
  const { t } = useI18n()
  const { config, alterar, escolherPreset, reiniciar } = useConfigMesa(inicial)
  const semOka = calcularOka(config) <= 0
  const [texto, setTexto] = useState('')
  const busca = normalizarTexto(texto)
  const [aba, setAba] = useState<IdSecao>(abasExtras[0]?.id ?? 'pontuacao')
  const mostrar = (id: IdSecao) => !!busca || aba === id

  return (
    <Modal
      titulo={titulo ?? t('tableConfig.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="config-mesa"
      rodape={
        <div className="cfg-acoes">
          <button type="button" className="btn-contorno" onClick={rodapeSalvar ? aoFechar : reiniciar}>
            {t(rodapeSalvar ? 'actions.cancel' : 'tableConfig.reset')}
          </button>
          <button
            type="button"
            className="btn-primario"
            disabled={!umaValida(config.uma) || !podeConcluir}
            onClick={() => aoConcluir(config)}
          >
            {t(rodapeSalvar ? 'tournament.settings.save' : 'tableConfig.done')}
          </button>
        </div>
      }
    >
      <ContextoBusca.Provider value={busca}>
      <AbasModal
        abas={[
          ...abasExtras.map(({ id, rotulo }) => ({ chave: id, rotulo })),
          ...SECOES.map(({ id, chave }) => ({ chave: id as IdSecao, rotulo: t(chave) })),
        ]}
        ativa={aba}
        aoEscolher={setAba}
        rotulo={t('tableConfig.indexLabel')}
        className="cfg-abas"
        fixoAcima
        fixo={
          <CampoBusca
            valor={texto}
            aoMudar={setTexto}
            rotulo={t('tableConfig.searchPlaceholder')}
            placeholder={t('tableConfig.searchPlaceholder')}
            rotuloLimpar={t('actions.clear')}
          />
        }
      >
      <div className={`cfg-corpo${busca ? " cfg-corpo--busca" : ""}`}>
      {abasExtras.map((extra) =>
        !busca && aba === extra.id ? (
          <section key={extra.id} className="cfg-secao" data-secao={extra.id}>
            {extra.conteudo}
          </section>
        ) : null,
      )}

      {!busca && !abasExtras.some((extra) => extra.id === aba) && (
        <div className="cfg-conjunto-regras">
          <span className="cfg-campo-rotulo">{t('tableConfig.preset')}</span>
          {/* Personalizado não é botão: nenhum fica marcado quando os valores são outros. */}
          <BotoesOpcao<ConfigMesa['preset']>
            rotulo={t('tableConfig.preset')}
            valor={config.preset}
            aoEscolher={escolherPreset}
            className="cfg-presets"
            opcoes={IDS_PRESET.map((preset) => ({ valor: preset, rotulo: t(`tableConfig.presets.${preset}`) }))}
          />
          <p className="cfg-ajuda">
            {t(config.preset === 'personalizado' ? 'tableConfig.customNote' : 'tableConfig.presetDefaultHelp')}
          </p>
        </div>
      )}

      {mostrar('pontuacao') && (
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
      )}

      {mostrar('regras') && (
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
      {config.prorrogacao && (
        <Campo
          rotulo={t('tableConfig.extensionTarget')}
          ajuda={
            <AjudaCampo rotulo={t('tableConfig.extensionTarget')}>
              <p>{t('tableConfig.extensionTargetHelp')}</p>
            </AjudaCampo>
          }
        >
          <CampoNumero
            valor={config.metaProrrogacao}
            passo={1000}
            minimo={0}
            aoMudar={(metaProrrogacao) => alterar({ metaProrrogacao })}
          />
        </Campo>
      )}
      <Opcao
        rotulo={t('tableConfig.nagashiMangan')}
        ajuda={t('tableConfig.nagashiManganHelp')}
        marcado={config.nagashiMangan}
        aoMudar={(nagashiMangan) => alterar({ nagashiMangan })}
      />

      </section>
      )}

      {mostrar('empates') && (
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
      )}

      {mostrar('calculo') && (
      <section className="cfg-secao" data-secao="calculo">
      <h3 className="cfg-grupo">{t('tableConfig.calcRules')}</h3>
      <ListaRegrasCalculo
        semChombo
        configuracao={config.regrasCalculo}
        aoMudar={(regrasCalculo) => alterar({ regrasCalculo })}
        mostrar={(textoRegra) => bate(busca, textoRegra)}
      />
      </section>
      )}

      {mostrar('mesa') && (
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
        rotulo={t('tableConfig.checkFuriten')}
        ajuda={t('tableConfig.checkFuritenHelp')}
        marcado={config.checarFuriten}
        aoMudar={(checarFuriten) => alterar({ checarFuriten })}
      />
      </section>
      )}

      <p className="cfg-sem-resultado" role="status">
        {t('tableConfig.searchEmpty')}
      </p>
      </div>
      </AbasModal>
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
