import { useState, type FormEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { configuracaoPadrao } from '@/compartilhado/mahjong/pontuacao/configuracao'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import ModalTermo from '@/dominios/calculadora-mao/interface/modais/glossario/ModalTermo'
import { TecladoPedras } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/TecladoPedras'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import {
  lerPedrasDescartadas,
  REGISTRO_VAZIO,
  type LanceDescarte,
  type TipoChamada,
} from '../../logica/descartes'
import { CHAVE_DESCRICAO_FURITEN, descreverEsperas, descreverFuriten, descreverPedra } from '../../logica/descreverPedras'
import { CADEIRAS, type Cadeira, type Partida } from '../../logica/partida'
import {
  furitenDe,
  lerMaoInformada,
  maoPodeTerMudado,
} from '../../logica/registroPartida'
import type { AcoesDescartes } from '../hooks/useDescartes'
import RioPedras from './RioPedras'

const TIPOS_CHAMADA: TipoChamada[] = ['chi', 'pon', 'kan']
const CHAVE_AJUDA = { riichi: 'riichi', descartes: 'discards', temporario: 'temporary' } as const

const SEM_ESPERA = new Map()

/** Só as pedras da Calculadora de Mão: sem esperas, batida ou finalização. */
function Teclado({ aoEscolher }: { aoEscolher: (pedra: CodigoPedra) => void }) {
  return (
    <div className="dsc-teclado">
      <TecladoPedras
        acaoPendente={{ tipo: 'descarte' }}
        configuracao={configuracaoPadrao}
        dorasReais={new Set()}
        esperasPorPedra={SEM_ESPERA}
        filtrarTecladoPorEspera={false}
        furitenBloqueiaRon={false}
        maoCompleta={false}
        podeSelecionarPedra={() => true}
        rotuloEsperaTeclado={() => ''}
        classeEsperaTeclado={() => ''}
        contexto="finalizacao"
        aoAdicionarPedra={aoEscolher}
      />
    </div>
  )
}

/** Rio do jogador: registrar, marcar Riichi e chamadas, informar a mão e ver o furiten. */
export default function ModalDescartes({
  partida,
  cadeira,
  nomeDe,
  acoes,
  rapido = false,
  aoPular,
  aoRegistrou,
  aoChamou,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  acoes: AcoesDescartes
  /** "Descarte de Fulano", ao passar a vez pelo timer: registrar já passa. */
  rapido?: boolean
  aoPular?: () => void
  aoRegistrou?: () => void
  aoChamou?: (cadeira: Cadeira) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const registro = partida.registro ?? REGISTRO_VAZIO
  const { lances } = registro
  const mao = registro.maos[cadeira]
  const furiten = furitenDe(partida, cadeira)

  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [riichi, setRiichi] = useState(false)
  const [kakan, setKakan] = useState(false)
  const [tecladoEm, setTecladoEm] = useState<'descarte' | 'mao' | null>(rapido ? 'descarte' : null)
  const [selecionado, setSelecionado] = useState<LanceDescarte | null>(null)
  const [textoMao, setTextoMao] = useState(mao?.notacao ?? '')
  const [erroMao, setErroMao] = useState<string | null>(null)
  const [detalheAberto, setDetalheAberto] = useState(false)
  const [glossarioAberto, setGlossarioAberto] = useState(false)

  const registrar = (entrada: string) => {
    const leitura = lerPedrasDescartadas(entrada, lances)
    if (leitura.erro) {
      setErro(t(leitura.erro.chave, leitura.erro.parametros))
      return
    }
    setErro(null)
    setTexto('')
    if (kakan) leitura.pedras.forEach((pedra) => acoes.kakan(cadeira, pedra))
    else acoes.descartar(cadeira, leitura.pedras, riichi)
    setRiichi(false)
    setKakan(false)
    if (rapido) aoRegistrou?.()
  }

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault()
    registrar(texto)
  }

  const salvarMao = (evento: FormEvent) => {
    evento.preventDefault()
    const leitura = lerMaoInformada(textoMao)
    if (leitura.erro) {
      const { chave, ...resto } = leitura.erro
      setErroMao(t(chave, 'parametros' in resto ? resto.parametros : undefined))
      return
    }
    setErroMao(null)
    acoes.informarMao(cadeira, leitura.mao)
  }

  const chamar = (ordem: number, outra: Cadeira, tipo: TipoChamada) => {
    acoes.chamar(ordem, { cadeira: outra, tipo })
    setSelecionado(null)
    aoChamou?.(outra)
  }

  const seguinte = ((cadeira + 1) % 4) as Cadeira
  const emRiichi = partida.placar.riichi.includes(cadeira)

  return (
    <Modal
      titulo={t(rapido ? 'match.discards.quickTitle' : 'match.discards.title', { name: nomeDe(cadeira) })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="modal-folha dsc-modal"
      rodape={
        rapido ? (
          <div className="ptd-acoes-folha">
            <button type="button" className="btn-contorno" onClick={aoPular}>
              {t('match.discards.skip')}
            </button>
          </div>
        ) : undefined
      }
    >
      {furiten?.principal && mao && (
        <div className="dsc-furiten">
          <button
            type="button"
            className="dsc-furiten-aviso"
            aria-expanded={detalheAberto}
            onClick={() => setDetalheAberto((aberto) => !aberto)}
          >
            <i className="fas fa-triangle-exclamation" aria-hidden="true" />
            {descreverFuriten(furiten, mao.esperas, t)}
          </button>
          <p className="ptd-apoio">{t('match.furiten.canTsumo')}</p>
          {detalheAberto && (
            <>
              <p>{t(`sectionHelp.furiten.${CHAVE_AJUDA[furiten.principal]}`)}</p>
              <ul className="ptd-linhas">
                {furiten.causas.map((causa) => (
                  <li key={`${causa.tipo}-${causa.ordem}`}>
                    <span>{t(`${CHAVE_DESCRICAO_FURITEN[causa.tipo]}.title`)}</span>
                    <strong>
                      {t('match.furiten.cause', {
                        tile: descreverPedra(causa.pedra, t),
                        order: causa.ordem,
                        name: nomeDe(causa.cadeira),
                      })}
                    </strong>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-contorno" onClick={() => setGlossarioAberto(true)}>
                {t('match.furiten.glossary')}
              </button>
            </>
          )}
        </div>
      )}

      <RioPedras
        lances={lances}
        cadeira={cadeira}
        nomeDe={nomeDe}
        selecionada={selecionado?.ordem ?? null}
        aoTocar={rapido ? undefined : (descarte) => setSelecionado((atual) => (atual?.ordem === descarte.ordem ? null : descarte))}
      />

      {lances.some((lance) => lance.tipo === 'kakan' && lance.cadeira === cadeira) && (
        <p className="ptd-apoio">
          {t('match.discards.kakan')}:{' '}
          {lances
            .filter((lance) => lance.tipo === 'kakan' && lance.cadeira === cadeira)
            .map((lance) => descreverPedra(lance.pedra, t))
            .join(', ')}
        </p>
      )}

      {selecionado && (
        <div className="dsc-chamada">
          <p className="ptd-rotulo">{t('match.discards.calledBy')}</p>
          {CADEIRAS.filter((outra) => outra !== cadeira).map((outra) => (
            <div key={outra} className="dsc-chamada-linha">
              <span>{nomeDe(outra)}</span>
              {TIPOS_CHAMADA.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  className="mesa-btn-secundario"
                  // Chi só vem do jogador à esquerda de quem descartou.
                  disabled={tipo === 'chi' && outra !== seguinte}
                  aria-label={t('spokenTiles.calledMark', { name: nomeDe(outra), call: t(`match.discards.call.${tipo}`) })}
                  onClick={() => chamar(selecionado.ordem, outra, tipo)}
                >
                  {t(`match.discards.call.${tipo}`)}
                </button>
              ))}
            </div>
          ))}
          {selecionado.chamadaPor && (
            <button
              type="button"
              className="btn-contorno"
              onClick={() => {
                acoes.chamar(selecionado.ordem)
                setSelecionado(null)
              }}
            >
              {t('match.discards.removeCall')}
            </button>
          )}
        </div>
      )}

      <form className="dsc-entrada" onSubmit={aoEnviar}>
        <label className="ptd-rotulo" htmlFor="dsc-notacao">
          {t(kakan ? 'match.discards.kakanInput' : 'match.discards.input')}
        </label>
        <div className="dsc-entrada-linha">
          <input
            id="dsc-notacao"
            className="cfg-entrada"
            value={texto}
            placeholder="3m5p1z"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!erro}
            onChange={(evento) => {
              setTexto(evento.target.value)
              setErro(null)
            }}
          />
          <button type="submit" className="btn-primario" disabled={!texto.trim()}>
            {t('match.discards.add')}
          </button>
        </div>
        {erro && (
          <p className="dsc-erro" role="alert">
            {erro}
          </p>
        )}
        <div className="dsc-marcas">
          {!emRiichi && (
            <button
              type="button"
              className={`ptd-opcao${riichi ? ' ptd-opcao--ativa' : ''}`}
              aria-pressed={riichi}
              disabled={kakan}
              onClick={() => setRiichi((atual) => !atual)}
            >
              {t('match.discards.riichi')}
            </button>
          )}
          <button
            type="button"
            className={`ptd-opcao${kakan ? ' ptd-opcao--ativa' : ''}`}
            aria-pressed={kakan}
            disabled={riichi}
            onClick={() => setKakan((atual) => !atual)}
          >
            {t('match.discards.kakan')}
          </button>
          <button
            type="button"
            className={`ptd-opcao${tecladoEm === 'descarte' ? ' ptd-opcao--ativa' : ''}`}
            aria-pressed={tecladoEm === 'descarte'}
            onClick={() => setTecladoEm((atual) => (atual === 'descarte' ? null : 'descarte'))}
          >
            {t('match.discards.keyboard')}
          </button>
        </div>
        {tecladoEm === 'descarte' && <Teclado aoEscolher={registrar} />}
      </form>

      {!rapido && (
        <>
          <button
            type="button"
            className="btn-contorno dsc-desfazer"
            disabled={lances.every((lance) => lance.cadeira !== cadeira)}
            onClick={() => acoes.desfazer(cadeira)}
          >
            <i className="fas fa-rotate-left" aria-hidden="true" /> {t('match.discards.undo')}
          </button>

          <form className="dsc-entrada" onSubmit={salvarMao}>
            <label className="ptd-rotulo" htmlFor="dsc-mao">
              {t('match.discards.handTitle')}
            </label>
            <p className="ptd-apoio">{t('match.discards.handHelp')}</p>
            <div className="dsc-entrada-linha">
              <input
                id="dsc-mao"
                className="cfg-entrada"
                value={textoMao}
                placeholder="123456789m123p4s"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={!!erroMao}
                onChange={(evento) => {
                  setTextoMao(evento.target.value)
                  setErroMao(null)
                }}
              />
              <button type="submit" className="btn-primario" disabled={!textoMao.trim()}>
                {t('match.discards.handSave')}
              </button>
            </div>
            {erroMao && (
              <p className="dsc-erro" role="alert">
                {erroMao}
              </p>
            )}
            {mao && (
              <>
                <p>{t('match.discards.handWaits', { tiles: descreverEsperas(mao.esperas, t) })}</p>
                {maoPodeTerMudado(partida, cadeira) && (
                  <p className="ptd-apoio">{t('match.discards.handChanged')}</p>
                )}
              </>
            )}
            <div className="dsc-marcas">
              <button
                type="button"
                className={`ptd-opcao${tecladoEm === 'mao' ? ' ptd-opcao--ativa' : ''}`}
                aria-pressed={tecladoEm === 'mao'}
                onClick={() => setTecladoEm((atual) => (atual === 'mao' ? null : 'mao'))}
              >
                {t('match.discards.keyboard')}
              </button>
              {mao && (
                <button
                  type="button"
                  className="ptd-opcao"
                  onClick={() => {
                    acoes.apagarMao(cadeira)
                    setTextoMao('')
                  }}
                >
                  {t('match.discards.handClear')}
                </button>
              )}
            </div>
            {tecladoEm === 'mao' && (
              <Teclado aoEscolher={(pedra) => setTextoMao((atual) => atual + pedra)} />
            )}
          </form>
        </>
      )}

      {glossarioAberto && <ModalTermo termo="furiten" aoFechar={() => setGlossarioAberto(false)} />}
    </Modal>
  )
}
