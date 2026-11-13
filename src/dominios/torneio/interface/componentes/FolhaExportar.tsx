import { useEffect, useMemo, useState } from 'react'
import { copiarTexto, salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { gerarQr } from '@/compartilhado/adaptadores/qr'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import BotoesOpcao from '@/dominios/centerpiece/interface/componentes/BotoesOpcao'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  exportarTorneio,
  nomeDoArquivo,
  pacoteParaCodigo,
  pedacosDoCodigo,
  type ModoExportacao,
} from '../../logica/exportacao'
import type { Torneio } from '../../logica/tipos'
import { useTorneios } from '../hooks/useTorneios'

/** Tempo de cada QR na sequência: dá para a outra câmera ler sem pressa. */
const TEMPO_QR_MS = 1600

/**
 * Exportar o torneio: arquivo, sequência de QRs ou código. Em Transferir, o
 * aparelho fica só para consulta depois de enviar (dá para desfazer).
 */
export default function FolhaExportar({
  torneio,
  aoFechar,
}: {
  torneio: Torneio
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { partidas } = usePartidas()
  const { jogadores } = useJogadores()
  const { temporadas, marcarTransferido } = useTorneios()
  const [modo, setModo] = useState<ModoExportacao>('copia')
  const [vendoQr, setVendoQr] = useState(false)
  const [aviso, setAviso] = useState('')

  // O pacote nasce ao abrir: o que estiver na tela é o que vai.
  const [agora] = useState(() => new Date().toISOString())
  const pacote = useMemo(
    () => exportarTorneio(torneio, { partidas, jogadores, temporadas }, { modo, agora }),
    [torneio, partidas, jogadores, temporadas, modo, agora],
  )
  const codigo = useMemo(() => pacoteParaCodigo(pacote), [pacote])

  const enviado = () => {
    if (modo === 'transferencia') marcarTransferido(torneio.id, new Date().toISOString())
  }

  const arquivo = async () => {
    const resultado = await salvarArquivo(nomeDoArquivo(torneio), JSON.stringify(pacote))
    if (resultado === 'falhou') return setAviso(t('tournament.export.failed'))
    if (resultado === 'cancelado') return
    enviado()
    setAviso(t('tournament.export.fileDone'))
  }

  const copiar = async () => {
    if (!(await copiarTexto(codigo))) return setAviso(t('tournament.export.failed'))
    enviado()
    setAviso(t('tournament.export.copied'))
  }

  if (vendoQr) {
    return (
      <SequenciaQr
        codigo={codigo}
        aoFechar={() => setVendoQr(false)}
        aoConcluir={() => {
          enviado()
          setVendoQr(false)
          aoFechar()
        }}
      />
    )
  }

  return (
    <Modal
      titulo={t('tournament.export.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
    >
      <BotoesOpcao<ModoExportacao>
        rotulo={t('tournament.export.mode')}
        opcoes={[
          { valor: 'copia', rotulo: t('tournament.export.copy') },
          { valor: 'transferencia', rotulo: t('tournament.export.transfer') },
        ]}
        valor={modo}
        aoEscolher={setModo}
      />
      <p className="cfg-ajuda trn-exportar-ajuda">
        {t(modo === 'copia' ? 'tournament.export.copyHelp' : 'tournament.export.transferHelp')}
      </p>
      <ul className="trn-menu">
        <li>
          <button type="button" onClick={arquivo}>
            <i className="fas fa-file-arrow-down" aria-hidden="true" />
            <span>
              <strong>{t('tournament.export.file')}</strong>
              <small>{t('tournament.export.fileHelp')}</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" onClick={() => setVendoQr(true)}>
            <i className="fas fa-qrcode" aria-hidden="true" />
            <span>
              <strong>{t('tournament.export.qr')}</strong>
              <small>{t('tournament.export.qrHelp')}</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" onClick={copiar}>
            <i className="fas fa-copy" aria-hidden="true" />
            <span>
              <strong>{t('tournament.export.code')}</strong>
              <small>{t('tournament.export.codeHelp')}</small>
            </span>
          </button>
        </li>
      </ul>
      {aviso && (
        <p className="cfg-ajuda" role="status">
          {aviso}
        </p>
      )}
    </Modal>
  )
}

/** QRs numerados passando sozinhos, com pausa e troca manual. */
function SequenciaQr({
  codigo,
  aoFechar,
  aoConcluir,
}: {
  codigo: string
  aoFechar: () => void
  aoConcluir: () => void
}) {
  const { t } = useI18n()
  const pedacos = useMemo(() => pedacosDoCodigo(codigo), [codigo])
  const [indice, setIndice] = useState(0)
  const [imagens, setImagens] = useState<string[]>([])
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    let vivo = true
    void Promise.all(pedacos.map(gerarQr)).then((geradas) => vivo && setImagens(geradas))
    return () => {
      vivo = false
    }
  }, [pedacos])

  useEffect(() => {
    if (pausado || pedacos.length < 2) return
    const intervalo = window.setInterval(
      () => setIndice((atual) => (atual + 1) % pedacos.length),
      TEMPO_QR_MS,
    )
    return () => window.clearInterval(intervalo)
  }, [pausado, pedacos.length])

  const total = pedacos.length
  return (
    <Modal
      titulo={t('tournament.export.qr')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
    >
      <div className="trn-qr">
        {imagens[indice] ? (
          <img
            src={imagens[indice]}
            alt={t('tournament.export.qrAlt', { current: indice + 1, total })}
          />
        ) : (
          <span className="trn-qr-vazio" />
        )}
        <p className="trn-qr-contador" aria-live="polite">
          {t('tournament.export.qrCount', { current: indice + 1, total })}
        </p>
        {total > 1 && (
          <div className="trn-qr-controles">
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.export.qrPrevious')}
              onClick={() => setIndice((indice - 1 + total) % total)}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t(pausado ? 'tournament.export.qrPlay' : 'tournament.export.qrPause')}
              onClick={() => setPausado(!pausado)}
            >
              <i className={`fas ${pausado ? 'fa-play' : 'fa-pause'}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.export.qrNext')}
              onClick={() => setIndice((indice + 1) % total)}
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        )}
        <p className="cfg-ajuda">{t('tournament.export.qrScanHelp')}</p>
        <button type="button" className="btn-primario ptd-btn-largo" onClick={aoConcluir}>
          {t('tournament.export.qrDone')}
        </button>
      </div>
    </Modal>
  )
}
