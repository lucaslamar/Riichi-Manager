import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { lerArquivoTexto } from '@/compartilhado/adaptadores/arquivo'
import { lerQrDaCamera, PermissaoCameraNegada, type LeitorQr } from '@/compartilhado/adaptadores/qr'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import BotoesOpcao from '@/dominios/centerpiece/interface/componentes/BotoesOpcao'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  codigoParaPacote,
  EXTENSAO_PACOTE,
  importarTorneio,
  juntarPedaco,
  leituraCompleta,
  planejarImportacao,
  validarPacote,
  type ErroPacote,
  type LeituraQr,
  type PacoteTorneio,
  type Validacao,
} from '../../logica/exportacao'
import { useTorneios } from '../hooks/useTorneios'

type Passo = 'escolher' | 'camera' | 'colar' | 'resumo'

const CHAVE_ERRO: Record<ErroPacote, string> = {
  invalido: 'tournament.import.errorInvalid',
  corrompido: 'tournament.import.errorCorrupted',
  versaoNova: 'tournament.import.errorNewer',
}

/** Importar um torneio: arquivo, QR pela câmera ou código colado; resumo antes de gravar. */
export default function FolhaImportar({
  aoFechar,
  aoImportado,
}: {
  aoFechar: () => void
  aoImportado: (torneioId: string) => void
}) {
  const { t } = useI18n()
  const { torneios, importar } = useTorneios()
  const { jogadores } = useJogadores()
  const [passo, setPasso] = useState<Passo>('escolher')
  const [erro, setErro] = useState('')
  const [pacote, setPacote] = useState<PacoteTorneio | null>(null)
  const seletor = useRef<HTMLInputElement | null>(null)

  const receber = (validacao: Validacao) => {
    if (!validacao.ok) return setErro(t(CHAVE_ERRO[validacao.erro]))
    setErro('')
    setPacote(validacao.pacote)
    setPasso('resumo')
  }

  const escolherArquivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (arquivo) receber(validarPacote(await lerArquivoTexto(arquivo)))
  }

  const voltar = passo === 'escolher' ? aoFechar : () => setPasso('escolher')

  return (
    <Modal
      titulo={t('tournament.import.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
    >
      {passo === 'escolher' && (
        <ul className="trn-menu">
          <li>
            <button type="button" onClick={() => seletor.current?.click()}>
              <i className="fas fa-file-arrow-up" aria-hidden="true" />
              <span>
                <strong>{t('tournament.import.file')}</strong>
                <small>{t('tournament.import.fileHelp')}</small>
              </span>
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setPasso('camera')}>
              <i className="fas fa-camera" aria-hidden="true" />
              <span>
                <strong>{t('tournament.import.camera')}</strong>
                <small>{t('tournament.import.cameraHelp')}</small>
              </span>
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setPasso('colar')}>
              <i className="fas fa-paste" aria-hidden="true" />
              <span>
                <strong>{t('tournament.import.paste')}</strong>
                <small>{t('tournament.import.pasteHelp')}</small>
              </span>
            </button>
          </li>
        </ul>
      )}
      <input
        ref={seletor}
        type="file"
        accept={`${EXTENSAO_PACOTE},.json,application/json`}
        hidden
        onChange={escolherArquivo}
      />

      {passo === 'camera' && <LeitorCamera aoLer={receber} />}
      {passo === 'colar' && <ColarCodigo aoLer={receber} />}
      {passo === 'resumo' && pacote && (
        <Resumo
          pacote={pacote}
          plano={planejarImportacao(pacote, { torneios, jogadores })}
          nomeLocal={(id) => {
            const jogador = jogadores.find((item) => item.id === id)
            return jogador ? nomeExibido(jogador) : '?'
          }}
          aoImportar={(escolhas) => {
            const plano = planejarImportacao(pacote, { torneios, jogadores })
            const resultado = importarTorneio(
              pacote,
              plano,
              { ...escolhas, sufixoImportado: t('tournament.import.suffix') },
              { gerarId, agora: new Date().toISOString() },
            )
            importar(resultado)
            aoImportado(resultado.torneio.id)
          }}
        />
      )}

      {erro && (
        <p className="cfg-ajuda trn-negativo" role="alert">
          {erro}
        </p>
      )}
      {passo !== 'escolher' && (
        <button type="button" className="btn-contorno ptd-btn-largo trn-encerrar" onClick={voltar}>
          {t('actions.back')}
        </button>
      )}
    </Modal>
  )
}

type ErroCamera = 'permissao' | 'outro' | null

/**
 * Câmera traseira principal lendo a sequência de QRs. Liga uma vez só (a ref
 * segura o StrictMode, que monta duas vezes em dev) e desliga ao sair.
 */
function LeitorCamera({ aoLer }: { aoLer: (validacao: Validacao) => void }) {
  const { t } = useI18n()
  const video = useRef<HTMLVideoElement | null>(null)
  const [leitura, setLeitura] = useState<LeituraQr | null>(null)
  const [erro, setErro] = useState<ErroCamera>(null)
  /** Muda para ligar a câmera de novo (Tentar de novo). */
  const [tentativa, setTentativa] = useState(0)
  const leituraRef = useRef<LeituraQr | null>(null)
  const ligada = useRef(false)
  const aoLerRef = useRef(aoLer)
  useEffect(() => {
    aoLerRef.current = aoLer
  }, [aoLer])

  useEffect(() => {
    const elemento = video.current
    if (!elemento || ligada.current) return
    ligada.current = true
    let leitor: LeitorQr | null = null
    let terminado = false
    lerQrDaCamera(elemento, (texto) => {
      if (terminado) return
      const antes = leituraRef.current
      const proxima = juntarPedaco(antes, texto)
      if (!proxima) return
      // Pedaço que já tinha sido lido: ignora (sem vibrar de novo).
      const quantos = (item: LeituraQr | null) => Object.keys(item?.pedacos ?? {}).length
      if (antes && antes.total === proxima.total && quantos(antes) === quantos(proxima)) return
      leituraRef.current = proxima
      setLeitura(proxima)
      try {
        navigator.vibrate?.(50)
      } catch {
        // Sem vibração: segue.
      }
      const codigo = leituraCompleta(proxima)
      if (codigo) {
        // Todos lidos: para a câmera e processa uma vez só.
        terminado = true
        leitor?.parar()
        aoLerRef.current(codigoParaPacote(codigo))
      }
    })
      .then((aberto) => {
        if (terminado) aberto.parar()
        else leitor = aberto
      })
      .catch((falha) => {
        ligada.current = false
        if (!terminado) setErro(falha instanceof PermissaoCameraNegada ? 'permissao' : 'outro')
      })
    return () => {
      terminado = true
      ligada.current = false
      leitor?.parar()
    }
  }, [tentativa])

  const lidos = leitura ? Object.keys(leitura.pedacos).length : 0
  return (
    <div className="trn-qr">
      <video ref={video} className="trn-camera" muted playsInline aria-label={t('tournament.import.camera')} />
      {erro ? (
        <>
          <p className="cfg-ajuda trn-negativo" role="alert">
            {t(erro === 'permissao' ? 'tournament.import.cameraDenied' : 'tournament.import.cameraError')}
          </p>
          <button
            type="button"
            className="btn-primario ptd-btn-largo"
            onClick={() => {
              setErro(null)
              setTentativa((atual) => atual + 1)
            }}
          >
            <i className="fas fa-rotate-right" aria-hidden="true" /> {t('tournament.import.cameraRetry')}
          </button>
        </>
      ) : (
        <p className="trn-qr-contador" aria-live="polite">
          {leitura
            ? t('tournament.import.cameraProgress', { read: lidos, total: leitura.total })
            : t('tournament.import.cameraWaiting')}
        </p>
      )}
    </div>
  )
}

function ColarCodigo({ aoLer }: { aoLer: (validacao: Validacao) => void }) {
  const { t } = useI18n()
  const [codigo, setCodigo] = useState('')
  return (
    <div className="trn-qr">
      <textarea
        className="clb-campo trn-codigo"
        value={codigo}
        onChange={(evento) => setCodigo(evento.target.value)}
        aria-label={t('tournament.import.paste')}
        placeholder={t('tournament.import.pastePlaceholder')}
      />
      <button
        type="button"
        className="btn-primario ptd-btn-largo"
        disabled={!codigo.trim()}
        onClick={() => {
          const texto = codigo.trim()
          aoLer(texto.startsWith('{') ? validarPacote(texto) : codigoParaPacote(texto))
        }}
      >
        {t('tournament.import.read')}
      </button>
    </div>
  )
}

function Resumo({
  pacote,
  plano,
  nomeLocal,
  aoImportar,
}: {
  pacote: PacoteTorneio
  plano: ReturnType<typeof planejarImportacao>
  nomeLocal: (id: string) => string
  aoImportar: (escolhas: {
    mesmoNome: Record<string, boolean>
    conflito: 'substituir' | 'manterAmbos'
  }) => void
}) {
  const { t, idioma } = useI18n()
  const [mesmoNome, setMesmoNome] = useState<Record<string, boolean>>({})
  const [conflito, setConflito] = useState<'substituir' | 'manterAmbos'>('substituir')
  const porNome = pacote.jogadores.filter((jogador) => plano.jogadores[jogador.id]?.tipo === 'nome')
  const novos = pacote.jogadores.filter(
    (jogador) => plano.jogadores[jogador.id]?.tipo === 'novo',
  ).length
  const { resumo } = plano

  return (
    <>
      <dl className="trn-resumo">
        <dt>{t('tournament.import.name')}</dt>
        <dd>{resumo.nome}</dd>
        <dt>{t('tournament.import.format')}</dt>
        <dd>{t(`tournament.formats.${resumo.formato}`)}</dd>
        <dt>{t('tournament.import.rounds')}</dt>
        <dd>{resumo.rodadas}</dd>
        <dt>{t('tournament.import.players')}</dt>
        <dd>{resumo.jogadores}</dd>
        <dt>{t('tournament.import.games')}</dt>
        <dd>{resumo.partidas}</dd>
        <dt>{t('tournament.import.exportedAt')}</dt>
        <dd>
          {new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
            new Date(pacote.exportadoEm),
          )}
        </dd>
      </dl>

      {novos > 0 && (
        <p className="cfg-ajuda">{t('tournament.import.newPlayers', { count: novos })}</p>
      )}

      {porNome.length > 0 && (
        <fieldset className="trn-importar-campo">
          <legend className="cfg-ajuda">{t('tournament.import.samePersonHelp')}</legend>
          {porNome.map((jogador) => {
            const casamento = plano.jogadores[jogador.id]
            const localId = casamento?.tipo === 'nome' ? casamento.localId : ''
            return (
              <label key={jogador.id} className="trn-importar-jogador">
                <input
                  type="checkbox"
                  checked={mesmoNome[jogador.id] !== false}
                  onChange={(evento) =>
                    setMesmoNome({ ...mesmoNome, [jogador.id]: evento.target.checked })
                  }
                />
                <span>{t('tournament.import.samePerson', { name: nomeLocal(localId) })}</span>
              </label>
            )
          })}
        </fieldset>
      )}

      {plano.conflito && (
        <>
          <p className="cfg-ajuda">{t('tournament.import.conflictHelp')}</p>
          <BotoesOpcao<'substituir' | 'manterAmbos'>
            rotulo={t('tournament.import.conflict')}
            opcoes={[
              { valor: 'substituir', rotulo: t('tournament.import.replace') },
              { valor: 'manterAmbos', rotulo: t('tournament.import.keepBoth') },
            ]}
            valor={conflito}
            aoEscolher={setConflito}
          />
        </>
      )}

      <div className="trn-importar-acoes">
        <button
          type="button"
          className="btn-primario ptd-btn-largo"
          onClick={() => aoImportar({ mesmoNome, conflito })}
        >
          <i className="fas fa-file-import" aria-hidden="true" /> {t('tournament.import.confirm')}
        </button>
      </div>
    </>
  )
}
