import { useEffect, useState } from 'react'
import { baixarArquivo, salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { URL_DO_APP } from '@/compartilhado/marca/url-app'
import {
  comporHistoria,
  nomeDoArquivo,
  type DadosHistoria,
  type LayoutHistoria,
  type TemaHistoria,
} from './comporHistoria'

const LAYOUTS: LayoutHistoria[] = ['foto', 'resultado']

function temaAtual(): TemaHistoria {
  const estilo = getComputedStyle(document.body)
  const cor = (variavel: string, reserva: string) =>
    estilo.getPropertyValue(variavel).trim() || reserva
  return {
    superficie: cor('--cor-superficie', '#ffffff'),
    texto: cor('--cor-texto', '#1c1724'),
    textoSuave: cor('--cor-texto-suave', '#5d5470'),
    destaque: cor('--cor-destaque', cor('--primario', '#7a3fb0')),
    pedraFace: cor('--pedra-face', '#f2efe6'),
    pedraBorda: cor('--pedra-borda', '#dddddd'),
  }
}

export default function TelaPrevia({
  foto,
  dados,
  aoRefazer,
  aoFechar,
}: {
  foto: ImageBitmap
  dados: DadosHistoria
  aoRefazer: () => void
  aoFechar: () => void
}) {
  const { t, idioma } = useI18n()
  const [layout, setLayout] = useState<LayoutHistoria>('foto')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [endereco, setEndereco] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  // A imagem fica pronta antes do toque: o iOS só abre a folha se o share vier direto do toque.
  useEffect(() => {
    let ativo = true
    setArquivo(null)
    const agora = new Date()
    comporHistoria(foto, dados, {
      layout,
      tema: temaAtual(),
      url: URL_DO_APP,
      logo: `${import.meta.env.BASE_URL}icones/icone-192.png`,
      textos: {
        nomeApp: t('global.appName'),
        convite: t('historiaMao.convite'),
        data: new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(agora),
        mais: (quantos) => `+${quantos}`,
      },
    })
      .then((blob) => {
        if (ativo) setArquivo(new File([blob], nomeDoArquivo(agora), { type: 'image/jpeg' }))
      })
      .catch(() => ativo && setAviso(t('historiaMao.falhou')))
    return () => {
      ativo = false
    }
  }, [foto, dados, layout, idioma, t])

  useEffect(() => {
    if (!arquivo) return
    const url = URL.createObjectURL(arquivo)
    setEndereco(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivo])

  const compartilhar = () => {
    if (!arquivo) return
    void salvarArquivo(arquivo.name, arquivo, arquivo.type).then((resultado) => {
      if (resultado === 'baixado') setAviso(t('historiaMao.salva'))
    })
  }

  const salvar = () => {
    if (arquivo && baixarArquivo(arquivo) === 'baixado') setAviso(t('historiaMao.salva'))
  }

  return (
    <div
      className="historia-mao-tela historia-mao-previa"
      role="dialog"
      aria-modal="true"
      aria-label={t('historiaMao.titulo')}
    >
      <div className="historia-mao-topo">
        <button
          type="button"
          className="historia-mao-icone"
          aria-label={t('actions.close')}
          onClick={aoFechar}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div className="historia-mao-imagem">
        {endereco && arquivo ? (
          <img src={endereco} alt={t('historiaMao.imagem')} />
        ) : (
          <i className="fas fa-spinner fa-spin" aria-label={t('historiaMao.montando')} />
        )}
      </div>
      <p className="historia-mao-dica">{t('historiaMao.dica')}</p>
      <p className="historia-mao-status" aria-live="polite">
        {aviso}
      </p>

      <div className="historia-mao-acoes">
        <div
          className="historia-mao-segmentado"
          role="radiogroup"
          aria-label={t('historiaMao.layout')}
        >
          {LAYOUTS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={layout === opcao}
              className={layout === opcao ? 'ativo' : ''}
              onClick={() => setLayout(opcao)}
            >
              {t(`historiaMao.layout_${opcao}`)}
            </button>
          ))}
        </div>
        <div className="historia-mao-botoes">
          <button type="button" className="btn-contorno" onClick={aoRefazer}>
            <i className="fas fa-rotate-left" aria-hidden="true" /> {t('historiaMao.refazer')}
          </button>
          <button type="button" className="btn-contorno" onClick={salvar} disabled={!arquivo}>
            <i className="fas fa-download" aria-hidden="true" /> {t('historiaMao.salvar')}
          </button>
          <button type="button" className="btn-primario" onClick={compartilhar} disabled={!arquivo}>
            <i className="fas fa-share-from-square" aria-hidden="true" />{' '}
            {t('historiaMao.compartilhar')}
          </button>
        </div>
      </div>
    </div>
  )
}
