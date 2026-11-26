import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { baixarArquivo, salvarArquivo } from '@/compartilhado/adaptadores/arquivo'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { URL_DO_APP } from '@/compartilhado/marca/url-app'
import { MASCOTE_QR_SRC } from './mascote'
import MascoteQr from './MascoteQr'
import {
  comporHistoria,
  nomeDoArquivo,
  type DadosHistoria,
  type LayoutHistoria,
  type TemaHistoria,
} from './comporHistoria'

const LAYOUTS: LayoutHistoria[] = ['foto', 'cabine']
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
    primario: cor('--primario', '#7a3fb0'),
    cartao: cor('--cor-primario-suave', '#2a2438'),
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
  const { t } = useI18n()
  const [layout, setLayout] = useState<LayoutHistoria>('foto')
  // Deitada escolhe a foto em 4:3 ou 3:4 na imagem; começa pelo formato da foto tirada.
  const [deitada, setDeitada] = useState(foto.width > foto.height)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [endereco, setEndereco] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const [enderecoFoto, setEnderecoFoto] = useState<string | null>(null)
  const inicioDeslize = useRef<number | null>(null)

  // A imagem fica pronta antes do toque: o iOS só abre a folha se o share vier direto do toque.
  useEffect(() => {
    let ativo = true
    setArquivo(null)
    setAviso('')
    const agora = new Date()
    comporHistoria(foto, dados, {
      layout,
      fotoDeitada: deitada,
      tema: temaAtual(),
      url: URL_DO_APP,
      mascoteSrc: MASCOTE_QR_SRC,
      textos: {
        nomeApp: t('global.appName'),
        convite: t('historiaMao.convite'),
      },
    })
      .then((blob) => {
        if (ativo) setArquivo(new File([blob], nomeDoArquivo(agora), { type: 'image/jpeg' }))
      })
      .catch(() => ativo && setAviso(t('historiaMao.falhou')))
    return () => {
      ativo = false
    }
  }, [foto, dados, layout, deitada, t])

  // A foto tirada, para a tela com o celular deitado (foto à esquerda, resultado à direita).
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

  const gestosDeslize = {
    onPointerDown: (evento: PointerEvent<HTMLDivElement>) => {
      inicioDeslize.current = evento.clientX
    },
    onPointerUp: (evento: PointerEvent<HTMLDivElement>) => aoSoltar(evento.clientX),
    onPointerCancel: () => {
      inicioDeslize.current = null
    },
  }
  const resumoVisivel = dados.resumo.toLowerCase() !== (dados.patamar ?? '').toLowerCase()

  return (
    <div
      className="historia-mao-tela historia-mao-previa"
      role="dialog"
      aria-modal="true"
      aria-label={t('historiaMao.titulo')}
    >
      {/* Barra do topo, como no HIG: fechar à esquerda, ações em ícones e o Compartilhar, a única ação principal, na ponta direita. */}
      <div className="historia-mao-barra">
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
            aria-label={t('historiaMao.deitar')}
            title={t('historiaMao.deitar')}
            aria-pressed={deitada}
            onClick={() => setDeitada(!deitada)}
          >
            <i className="fas fa-rotate-right" aria-hidden="true" />
            <span className="historia-mao-rotulo" aria-hidden="true">
              {t('historiaMao.rotuloDeitada')}
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
          <button
            type="button"
            className="historia-mao-icone historia-mao-compartilhar"
            aria-label={t('historiaMao.compartilhar')}
            title={t('historiaMao.compartilhar')}
            onClick={compartilhar}
            disabled={!arquivo}
          >
            <i className="fas fa-arrow-up-from-bracket" aria-hidden="true" />
            <span className="historia-mao-rotulo" aria-hidden="true">
              {t('historiaMao.compartilhar')}
            </span>
          </button>
        </div>
      </div>

      <div className="historia-mao-imagem" {...gestosDeslize}>
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

      {/* Celular deitado: a foto à esquerda e o resultado à direita, montados na tela. */}
      <div className="historia-mao-deitado-foto" {...gestosDeslize}>
        {enderecoFoto && <img src={enderecoFoto} alt="" draggable={false} />}
      </div>
      <div className="historia-mao-deitado-divisor" aria-hidden="true" />
      <div className="historia-mao-deitado-painel">
        {dados.patamar && <p className="historia-mao-deitado-patamar">{dados.patamar}</p>}
        <span className="historia-mao-deitado-forma">{dados.forma.toUpperCase()}</span>
        {resumoVisivel && <p className="historia-mao-deitado-resumo">{dados.resumo}</p>}
        {dados.vencedor && <p className="historia-mao-deitado-vencedor">{dados.vencedor}</p>}
        <p className="historia-mao-deitado-pontos">{dados.pontos}</p>
        {dados.yaku.length > 0 && (
          <ul className="historia-mao-deitado-yaku">
            {dados.yaku.map((yaku) => (
              <li key={yaku.nome}>
                {yaku.nome} <span>{yaku.valor}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="historia-mao-deitado-assinatura">
          <MascoteQr url={URL_DO_APP} rotulo={t('historiaMao.convite')} />
          <div>
            <p>{t('global.appName')}</p>
            <p>{t('historiaMao.convite')}</p>
          </div>
        </div>
      </div>

      <div className="historia-mao-rodape">
        {/* Bolinhas discretas, como páginas (HIG): deslizar a imagem é o jeito principal de trocar. */}
        <div
          className="historia-mao-paginas"
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
              aria-label={t(`historiaMao.layout_${opcao}`)}
              title={t(`historiaMao.layout_${opcao}`)}
              onClick={() => setLayout(opcao)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="historia-mao-dica">{t('historiaMao.dica')}</p>
        <p className="historia-mao-status" aria-live="polite">
          {aviso}
        </p>
      </div>
    </div>
  )
}
