import { useEffect, useState } from 'react'
import { ehIos, estaInstalado } from '@/compartilhado/adaptadores/instalacao'
import {
  aoMudarTelaCheia,
  entrarTelaCheia,
  estaEmTelaCheia,
  sairTelaCheia,
  suportaTelaCheia,
} from '@/compartilhado/adaptadores/telaCheia'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'

const CHAVE_DICA_VISTA = 'riichi-manager-dica-tela-cheia'
const DURACAO_DICA_MS = 6000

/**
 * Nome do app no cabeçalho. No navegador, liga e desliga a tela cheia; no
 * Safari do iPhone, que não tem tela cheia para páginas, mostra como instalar.
 * Instalado (já sem a barra do navegador), volta a ser só o nome.
 */
export default function MarcaAplicacao() {
  const { t } = useI18n()
  const [ativa, setAtiva] = useState(estaEmTelaCheia)
  const [instrucaoAberta, setInstrucaoAberta] = useState(false)
  const [dicaVisivel, setDicaVisivel] = useState(false)

  const temTelaCheia = suportaTelaCheia()
  // Na tela cheia do navegador o display-mode também vira fullscreen: não é instalado.
  const instalado = estaInstalado() && !ativa
  const soInstrucao = !instalado && !temTelaCheia && ehIos()
  const interativa = !instalado && (temTelaCheia || soInstrucao)

  useEffect(() => aoMudarTelaCheia(() => setAtiva(estaEmTelaCheia())), [])

  // Dica só na primeira abertura pelo navegador; some sozinha e não volta.
  useEffect(() => {
    if (!interativa || estaEmTelaCheia() || armazenamentoLocal.ler(CHAVE_DICA_VISTA)) return
    armazenamentoLocal.gravar(CHAVE_DICA_VISTA, '1')
    setDicaVisivel(true)
  }, [interativa])

  useEffect(() => {
    if (!dicaVisivel) return
    const timer = window.setTimeout(() => setDicaVisivel(false), DURACAO_DICA_MS)
    return () => window.clearTimeout(timer)
  }, [dicaVisivel])

  const nome = t('global.appName')
  if (!interativa) return <h1 className="titulo-principal">{nome}</h1>

  const rotulo = t(ativa ? 'pages.fullscreenExit' : 'pages.fullscreenEnter')
  const tocar = () => {
    setDicaVisivel(false)
    if (soInstrucao) setInstrucaoAberta(true)
    else if (ativa) sairTelaCheia()
    else entrarTelaCheia()
  }

  return (
    <>
      <h1 className="titulo-principal">
        <button
          type="button"
          className="botao-marca-tela-cheia"
          aria-label={soInstrucao ? t('pages.installTitle') : rotulo}
          aria-pressed={soInstrucao ? undefined : ativa}
          title={soInstrucao ? t('pages.installTitle') : rotulo}
          onClick={tocar}
        >
          <span aria-hidden="true">{nome}</span>
          <i
            className={`fas ${ativa ? 'fa-down-left-and-up-right-to-center' : 'fa-up-right-and-down-left-from-center'}`}
            aria-hidden="true"
          />
        </button>
      </h1>
      {dicaVisivel && (
        <span className="dica-tela-cheia" role="status">
          {t('pages.fullscreenHeaderHint')}
        </span>
      )}

      {instrucaoAberta && (
        <Modal
          titulo={t('pages.installTitle')}
          aoFechar={() => setInstrucaoAberta(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <p>{t('pages.installIosSteps')}</p>
        </Modal>
      )}
    </>
  )
}
