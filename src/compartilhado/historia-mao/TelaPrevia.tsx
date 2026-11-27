import { useEffect, useState, type CSSProperties } from 'react'
import { baixarArquivo, salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { URL_DO_APP } from '@/compartilhado/marca/url-app'
import { MASCOTE_QR_SRC } from './mascote'
import MascoteQr from './MascoteQr'
import HanCarimbo from './HanCarimbo'
import {
  comporHistoria,
  nomeDoArquivo,
  type DadosHistoria,
  type TemaHistoria,
} from './comporHistoria'

function temaAtual(): TemaHistoria {
  const estilo = getComputedStyle(document.body)
  const cor = (variavel: string, reserva: string) =>
    estilo.getPropertyValue(variavel).trim() || reserva
  return {
    superficie: cor('--cor-superficie', '#ffffff'),
    texto: cor('--cor-texto', '#1c1724'),
    textoSuave: cor('--cor-texto-suave', '#5d5470'),
    primario: cor('--primario', '#7a3fb0'),
    cartao: cor('--cor-primario-suave', '#2a2438'),
  }
}

/**
 * Prévia montada na tela, em pé e deitado: a foto é a estrela e aparece inteira,
 * com ela mesma desfocada atrás, sem nada por cima. O resultado vem embaixo (em pé)
 * ou ao lado (deitado), com o mascote no canto. A imagem que sai (1080×1920) é
 * montada à parte, num canvas fora da tela.
 */
export default function TelaPrevia({
  foto,
  dados,
  mostrarDica,
  aoRefazer,
  aoFechar,
}: {
  foto: ImageBitmap
  dados: DadosHistoria
  /** A dica do Link aparece só nas primeiras vezes (`FluxoHistoriaMao`). */
  mostrarDica: boolean
  aoRefazer: () => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [aviso, setAviso] = useState('')
  const [enderecoFoto, setEnderecoFoto] = useState<string | null>(null)

  // A imagem fica pronta antes do toque: o iOS só abre a folha se o share vier direto do toque.
  useEffect(() => {
    let ativo = true
    setArquivo(null)
    setAviso('')
    const agora = new Date()
    comporHistoria(foto, dados, {
      tema: temaAtual(),
      url: URL_DO_APP,
      mascoteSrc: MASCOTE_QR_SRC,
    })
      .then((blob) => {
        if (ativo) setArquivo(new File([blob], nomeDoArquivo(agora), { type: 'image/jpeg' }))
      })
      .catch(() => ativo && setAviso(t('historiaMao.falhou')))
    return () => {
      ativo = false
    }
  }, [foto, dados, t])

  // A foto tirada vira um endereço para a tela.
  useEffect(() => {
    let url: string | null = null
    const tela = document.createElement('canvas')
    tela.width = foto.width
    tela.height = foto.height
    tela.getContext('2d')?.drawImage(foto, 0, 0)
    tela.toBlob(
      (blob) => {
        if (!blob) return
        url = URL.createObjectURL(blob)
        setEnderecoFoto(url)
      },
      'image/jpeg',
      0.9,
    )
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [foto])

  const compartilhar = () => {
    if (!arquivo) return
    void salvarArquivo(arquivo.name, arquivo, arquivo.type).then((resultado) => {
      if (resultado === 'baixado') setAviso(t('historiaMao.salva'))
    })
  }

  const salvar = () => {
    if (arquivo && baixarArquivo(arquivo) === 'baixado') setAviso(t('historiaMao.salva'))
  }

  const resumoVisivel = dados.resumo.toLowerCase() !== (dados.patamar ?? '').toLowerCase()
  // A proporção real da foto guia a altura dela (em pé) ou a largura (deitado).
  const proporcao = {
    '--proporcao-foto': `${foto.width} / ${foto.height}`,
    '--razao-foto': foto.width / foto.height,
  } as CSSProperties

  return (
    <div
      className="historia-mao-tela historia-mao-previa"
      role="dialog"
      aria-modal="true"
      aria-label={t('historiaMao.titulo')}
      style={proporcao}
    >
      <div className="historia-mao-foto">
        {enderecoFoto ? (
          <>
            <img className="historia-mao-foto-fundo" src={enderecoFoto} alt="" draggable={false} />
            <img
              className="historia-mao-foto-principal"
              src={enderecoFoto}
              alt={t('historiaMao.imagem')}
              draggable={false}
            />
          </>
        ) : (
          <i className="fas fa-spinner fa-spin" aria-label={t('historiaMao.montando')} />
        )}
      </div>

      <div className={`historia-mao-painel${dados.nivel ? ' historia-mao-painel--carimbado' : ''}`}>
        <div className="historia-mao-painel-texto">
          {dados.patamar && <p className="historia-mao-patamar">{dados.patamar}</p>}
          <span className="historia-mao-forma">{dados.forma.toUpperCase()}</span>
          {resumoVisivel && <p className="historia-mao-resumo">{dados.resumo}</p>}
          {dados.vencedor && <p className="historia-mao-vencedor">{dados.vencedor}</p>}
          <p className="historia-mao-pontos">{dados.pontos}</p>
        </div>
        {dados.yaku.length > 0 && (
          <ul className="historia-mao-yaku">
            {dados.yaku.map((yaku) => (
              <li key={yaku.nome}>
                {yaku.nome} <span>{yaku.valor}</span>
              </li>
            ))}
          </ul>
        )}
        {/* O carimbo usa só o espaço que sobra à esquerda do mascote; sem espaço, some. */}
        <div className="historia-mao-carimbo-area">
          <HanCarimbo nivel={dados.nivel} />
        </div>
        <MascoteQr url={URL_DO_APP} rotulo={t('historiaMao.convite')} />
      </div>

      <div className="historia-mao-barra-acoes">
        <button
          type="button"
          className="historia-mao-icone"
          aria-label={t('historiaMao.refazer')}
          title={t('historiaMao.refazer')}
          onClick={aoRefazer}
        >
          <i className="fas fa-camera" aria-hidden="true" />
          <span className="historia-mao-rotulo" aria-hidden="true">
            {t('historiaMao.refazer')}
          </span>
        </button>
        <button
          type="button"
          className="historia-mao-icone"
          aria-label={t('historiaMao.salvar')}
          title={t('historiaMao.salvar')}
          onClick={salvar}
          disabled={!arquivo}
        >
          <i className="fas fa-download" aria-hidden="true" />
          <span className="historia-mao-rotulo" aria-hidden="true">
            {t('historiaMao.rotuloSalvar')}
          </span>
        </button>
        <button
          type="button"
          className="historia-mao-icone historia-mao-descartar"
          aria-label={t('historiaMao.descartar')}
          title={t('historiaMao.descartar')}
          onClick={aoFechar}
        >
          <i className="fas fa-trash" aria-hidden="true" />
          <span className="historia-mao-rotulo" aria-hidden="true">
            {t('historiaMao.rotuloDescartar')}
          </span>
        </button>
        <div className="historia-mao-compartilhar-envoltorio">
          <button
            type="button"
            className="historia-mao-icone historia-mao-compartilhar"
            aria-label={t('historiaMao.compartilhar')}
            title={t('historiaMao.compartilhar')}
            onClick={compartilhar}
            disabled={!arquivo}
          >
            <i className="fas fa-share-nodes" aria-hidden="true" />
            <span className="historia-mao-rotulo" aria-hidden="true">
              {t('historiaMao.compartilhar')}
            </span>
          </button>
          {mostrarDica && <p className="historia-mao-dica-balao">{t('historiaMao.dica')}</p>}
        </div>
      </div>

      {/* Fora do card: a dica (em pé) e o aviso de imagem salva. */}
      <div className="historia-mao-rodape">
        {mostrarDica && <p className="historia-mao-dica">{t('historiaMao.dica')}</p>}
        <p className="historia-mao-status" aria-live="polite">
          {aviso}
        </p>
      </div>
    </div>
  )
}
