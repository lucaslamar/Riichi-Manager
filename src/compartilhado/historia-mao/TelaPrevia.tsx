import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
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

const LAYOUTS: LayoutHistoria[] = ['foto', 'resultado', 'cabine']
/** Quanto o dedo precisa andar de lado para trocar o estilo. */
const DESLIZE_MINIMO = 50

function temaAtual(): TemaHistoria {
  const estilo = getComputedStyle(document.body)
  const cor = (variavel: string, reserva: string) =>
    estilo.getPropertyValue(variavel).trim() || reserva
  return {
    superficie: cor('--cor-superficie', '#ffffff'),
    texto: cor('--cor-texto', '#1c1724'),
    textoSuave: cor('--cor-texto-suave', '#5d5470'),
    destaque: cor('--cor-destaque', cor('--primario', '#7a3fb0')),
    primario: cor('--primario', '#7a3fb0'),
    cartao: cor('--cor-primario-suave', '#2a2438'),
  }
}

/** Desenho de cada estilo no seletor: os dois têm foto e resultado, muda o tamanho da foto. */
function MiniaturaLayout({ layout }: { layout: LayoutHistoria }) {
  return (
    <svg viewBox="0 0 18 32" className="historia-mao-miniatura" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="17"
        height="31"
        rx="2.5"
        className="historia-mao-miniatura-tela"
      />
      {layout === 'foto' ? (
        <>
          <rect
            x="0.5"
            y="0.5"
            width="17"
            height="31"
            rx="2.5"
            className="historia-mao-miniatura-foto"
          />
          <rect
            x="2.5"
            y="15"
            width="13"
            height="12"
            rx="1.5"
            className="historia-mao-miniatura-cartao"
          />
        </>
      ) : layout === 'cabine' ? (
        <>
          <rect x="2" y="4" width="8.5" height="12" className="historia-mao-miniatura-foto" />
          <rect x="12" y="4" width="4" height="1.5" className="historia-mao-miniatura-cartao" />
          <rect x="12" y="7" width="4" height="1.5" className="historia-mao-miniatura-cartao" />
          <rect x="12" y="10" width="3" height="1.5" className="historia-mao-miniatura-cartao" />
          <rect
            x="2"
            y="18"
            width="14"
            height="5"
            rx="1"
            className="historia-mao-miniatura-cartao"
          />
        </>
      ) : (
        <>
          <rect
            x="2.5"
            y="4"
            width="13"
            height="8"
            rx="1.5"
            className="historia-mao-miniatura-foto"
          />
          <rect
            x="2.5"
            y="14"
            width="13"
            height="13"
            rx="1.5"
            className="historia-mao-miniatura-cartao"
          />
        </>
      )}
    </svg>
  )
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
  const [deitada, setDeitada] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [endereco, setEndereco] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const inicioDeslize = useRef<number | null>(null)

  // A imagem fica pronta antes do toque: o iOS só abre a folha se o share vier direto do toque.
  useEffect(() => {
    let ativo = true
    setArquivo(null)
    setAviso('')
    const agora = new Date()
    comporHistoria(foto, dados, {
      layout,
      deitada,
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
  }, [foto, dados, layout, deitada, idioma, t])

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

  // Deslizar para o lado (ou as setas do teclado) troca o estilo, como páginas.
  const irPara = (passo: number) => {
    const indice = LAYOUTS.indexOf(layout) + passo
    if (indice >= 0 && indice < LAYOUTS.length) setLayout(LAYOUTS[indice])
  }
  const aoSoltar = (x: number) => {
    if (inicioDeslize.current === null) return
    const distancia = x - inicioDeslize.current
    inicioDeslize.current = null
    if (Math.abs(distancia) > DESLIZE_MINIMO) irPara(distancia < 0 ? 1 : -1)
  }
  const aoTeclarEstilo = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === 'ArrowRight') irPara(1)
    else if (evento.key === 'ArrowLeft') irPara(-1)
    else return
    evento.preventDefault()
  }

  return (
    <div
      className="historia-mao-tela historia-mao-previa"
      role="dialog"
      aria-modal="true"
      aria-label={t('historiaMao.titulo')}
    >
      {/* Barra do topo, como no HIG: fechar à esquerda, ações em ícones e o Compartilhar, a única ação principal, na ponta direita. */}
      <div className="historia-mao-barra">
        <button
          type="button"
          className="historia-mao-icone"
          aria-label={t('actions.close')}
          title={t('actions.close')}
          onClick={aoFechar}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
        <div className="historia-mao-barra-acoes">
          <button
            type="button"
            className="historia-mao-icone"
            aria-label={t('historiaMao.refazer')}
            title={t('historiaMao.refazer')}
            onClick={aoRefazer}
          >
            <i className="fas fa-camera" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="historia-mao-icone"
            aria-label={t('historiaMao.deitar')}
            title={t('historiaMao.deitar')}
            aria-pressed={deitada}
            onClick={() => setDeitada(!deitada)}
          >
            <i className="fas fa-rotate-right" aria-hidden="true" />
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
          </button>
          <button
            type="button"
            className="historia-mao-icone historia-mao-compartilhar"
            aria-label={t('historiaMao.compartilhar')}
            title={t('historiaMao.compartilhar')}
            onClick={compartilhar}
            disabled={!arquivo}
          >
            <i className="fas fa-arrow-up-from-bracket" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="historia-mao-imagem"
        onPointerDown={(evento) => {
          inicioDeslize.current = evento.clientX
        }}
        onPointerUp={(evento) => aoSoltar(evento.clientX)}
        onPointerCancel={() => {
          inicioDeslize.current = null
        }}
      >
        {endereco ? (
          <img
            src={endereco}
            alt={t('historiaMao.imagem')}
            className={arquivo ? undefined : 'historia-mao-montando'}
            draggable={false}
          />
        ) : (
          <i className="fas fa-spinner fa-spin" aria-label={t('historiaMao.montando')} />
        )}
      </div>

      <div className="historia-mao-rodape">
        <div
          className="historia-mao-segmentado"
          role="radiogroup"
          aria-label={t('historiaMao.layout')}
          onKeyDown={aoTeclarEstilo}
        >
          {LAYOUTS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={layout === opcao}
              tabIndex={layout === opcao ? 0 : -1}
              className={layout === opcao ? 'ativo' : ''}
              aria-label={t(`historiaMao.layout_${opcao}`)}
              title={t(`historiaMao.layout_${opcao}`)}
              onClick={() => setLayout(opcao)}
            >
              <MiniaturaLayout layout={opcao} />
            </button>
          ))}
        </div>
        {/* A dica é dos Stories, que são em pé. */}
        {!deitada && <p className="historia-mao-dica">{t('historiaMao.dica')}</p>}
        <p className="historia-mao-status" aria-live="polite">
          {aviso}
        </p>
      </div>
    </div>
  )
}
