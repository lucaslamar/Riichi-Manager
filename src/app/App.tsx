import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { anunciar } from '@/compartilhado/adaptadores/voz'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AtalhosNarracao from '@/compartilhado/interface/narracao/AtalhosNarracao'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { focarTituloTela, ID_TITULO_TELA } from '@/compartilhado/interface/layout/TituloTela'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useAlturaTeclado } from '@/compartilhado/interface/hooks/useAlturaTeclado'
import { ITENS_NAVEGACAO, ORDEM_TELAS, type DestinoComSubitens, type SubtelaPartida } from '@/compartilhado/interface/layout/navegacao'
import ModalIdioma from '@/compartilhado/interface/layout/ModalIdioma'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import PaginaRegras from '@/dominios/configuracoes/interface/PaginaRegras'
import GuiaAprender from '@/dominios/aprender-a-jogar/interface/GuiaAprender'

const PaginaCenterpiece = lazy(
  () => import('@/dominios/centerpiece/interface/paginas/PaginaCenterpiece'),
)

export type TelaPrincipal =
  | 'calculadora'
  | 'calculadoraRapida'
  | 'sorteadorVentos'
  | 'centerpiece'
  | 'partidas'
  | 'ranking'
  | 'regras'

/**
 * Componente raiz da aplicacao. A Calculadora de Mao e a porta de entrada.
 */
export default function App() {
  const [tela, setTela] = useState<TelaPrincipal>('calculadora')
  // Sorteador aberto pelo Centerpiece simples: deslizar para qualquer lado volta para lá.
  const [simplesAberto, setSimplesAberto] = useState(false)
  // Sorteador aberto pela mesa: só os ventos de quem joga nela (3 no Sanma).
  const [jogadoresSorteio, setJogadoresSorteio] = useState<3 | 4>(4)
  const [entradaDoSimples, setEntradaDoSimples] = useState<'pedras' | 'notacao' | null>(null)
  const [idiomaAberto, setIdiomaAberto] = useState(false)
  /** Subitem do menu lateral: a Mesa partida abre direto nesta tela. `chave` remonta a cada toque. */
  const [subtela, setSubtela] = useState<{ tela: SubtelaPartida; chave: number } | null>(null)
  // Contador próprio: `navegar` zera a subtela no mesmo ciclo, então a chave não pode vir dela.
  const toquesSubtela = useRef(0)

  // Guia Aprender a jogar: tela cheia por cima de tudo. `chave` remonta o guia
  // a cada abertura, sempre na capa.
  const [guia, setGuia] = useState<{ chave: number } | null>(null)
  const abrirGuia = useCallback(() => {
    setGuia((atual) => ({ chave: (atual?.chave ?? 0) + 1 }))
  }, [])

  // Ir para uma tela fecha o guia: na capa dele a barra inferior fica à vista.
  const navegar = useCallback((proxima: TelaPrincipal) => {
    setGuia(null)
    setSimplesAberto(false)
    setEntradaDoSimples(null)
    setSubtela(null)
    setTela(proxima)
  }, [])
  const navegarSubtela = useCallback(
    (aba: DestinoComSubitens, destino: SubtelaPartida) => {
      navegar(aba)
      toquesSubtela.current += 1
      setSubtela({ tela: destino, chave: toquesSubtela.current })
    },
    [navegar],
  )

  const abrirSorteadorDoSimples = (jogadores: 3 | 4) => {
    setJogadoresSorteio(jogadores)
    navegar('sorteadorVentos')
    setSimplesAberto(true)
  }
  // Atalhos de cálculo do Centerpiece simples: a Calculadora de Mão abre com a
  // entrada escolhida, sem a troca para MPSZ, e deslizar para qualquer lado volta
  // para o simples, como no sorteador e no Han e Fu.
  const abrirCalculoDoSimples = (calculo: 'mao' | 'hanFu' | 'mpsz') => {
    navegar(calculo === 'hanFu' ? 'calculadoraRapida' : 'calculadora')
    setSimplesAberto(true)
    if (calculo !== 'hanFu') setEntradaDoSimples(calculo === 'mpsz' ? 'notacao' : 'pedras')
  }
  const voltarAoSimples = () => {
    setEntradaDoSimples(null)
    setTela('centerpiece')
  }
  const sorteadorDoSimples =
    simplesAberto && (tela === 'sorteadorVentos' || tela === 'calculadoraRapida')

  // Deslizar segue a ordem da barra inferior; o Centerpiece trata o próprio gesto
  // (Pointer Events, com a tela acompanhando). Dedo para a esquerda vai para a
  // tela seguinte e para a direita volta para a anterior. Os gestos da
  // Calculadora de Mão ficam na própria página (a finalização tem um caso a mais).
  // Carrossel infinito: depois da última tela (Configurações) vem a folha de
  // Idioma e, dela, a Calculadora de novo.
  const indiceTela = ORDEM_TELAS.indexOf(tela)
  const telaAnterior = indiceTela > 0 ? ORDEM_TELAS[indiceTela - 1] : undefined
  const proximaTela =
    indiceTela >= 0 ? (ORDEM_TELAS[indiceTela + 1] ?? ORDEM_TELAS[0]) : undefined

  // Deslizar até o Aprender abre o guia por cima, e até o Idioma abre a folha
  // por cima. Ao fechar, a pessoa volta para a tela de onde deslizou.
  const irPara = (destino: TelaPrincipal | 'aprender' | 'idioma') => {
    if (destino === 'aprender') abrirGuia()
    else if (destino === 'idioma') setIdiomaAberto(true)
    else navegar(destino)
  }
  // Na capa do guia, deslizar vai para a tela vizinha do Aprender na barra.
  const indiceAprender = ORDEM_TELAS.indexOf('aprender')
  const sairDoGuia = (passo: 1 | -1) => {
    const destino = ORDEM_TELAS[indiceAprender + passo] ?? 'calculadora'
    if (destino !== 'aprender') navegar(destino)
  }
  // Leitor de tela: a cada troca, o foco vai para o título da tela nova (TituloTela).
  // O guia e as telas sem título no cabeçalho só têm o nome anunciado.
  const { t } = useI18n()
  const telaAnunciada = guia ? 'aprender' : tela
  const ultimaAnunciada = useRef(telaAnunciada)
  useEffect(() => {
    if (ultimaAnunciada.current === telaAnunciada) return
    ultimaAnunciada.current = telaAnunciada
    const espera = window.setTimeout(() => {
      if (telaAnunciada !== 'aprender' && document.querySelector(`#${ID_TITULO_TELA} .titulo-tela`)) {
        focarTituloTela()
        return
      }
      const item = ITENS_NAVEGACAO.find(({ destino }) => destino === telaAnunciada)
      if (item) anunciar(t(item.chave))
    }, 150)
    return () => window.clearTimeout(espera)
    // Só a troca de tela conta, não a troca de idioma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telaAnunciada])

  // Teclado do sistema: barras e folhas sobem com ele, a barra inferior some.
  useAlturaTeclado()
  useDeslizeHorizontal({
    ativo: indiceTela >= 0 && tela !== 'calculadora' && tela !== 'centerpiece' && tela !== 'partidas' && tela !== 'ranking',
    aoDeslizarDireita: sorteadorDoSimples
      ? voltarAoSimples
      : telaAnterior && (() => irPara(telaAnterior)),
    aoDeslizarEsquerda: sorteadorDoSimples
      ? voltarAoSimples
      : proximaTela && (() => irPara(proximaTela)),
  })

  return (
    <>
      <AtalhosNarracao />
      <Cabecalho
        telaAtual={guia ? 'aprender' : tela}
        aoNavegar={navegar}
        aoNavegarSubtela={navegarSubtela}
        aoAbrirAprender={() => abrirGuia()}
        aoAbrirIdioma={() => setIdiomaAberto(true)}
      />

      <main className="conteudo-principal">
        {/* Sempre montada: a mão em andamento continua lá ao voltar de outra tela. */}
        <PaginaCalculadoraMao
          aoIrParaProximaTela={() => navegar('calculadoraRapida')}
          visivel={tela === 'calculadora'}
          entradaFixa={entradaDoSimples ?? undefined}
          aoVoltar={entradaDoSimples ? voltarAoSimples : undefined}
        />
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && (
          <PaginaSorteadorVentos key={simplesAberto ? 'mesa' : 'menu'} jogadores={simplesAberto ? jogadoresSorteio : undefined} />
        )}
        <Suspense fallback={null}>
          {/* O botão Centerpiece abre direto o simples; Mesa partida é o menu das partidas com pontos e Ranking, o dos resultados. */}
          {(tela === 'centerpiece' || tela === 'partidas' || tela === 'ranking') && (
            <PaginaCenterpiece
              key={subtela ? `${tela}-${subtela.chave}` : tela}
              modo={tela === 'centerpiece' ? 'simples' : tela}
              telaInicial={tela === 'partidas' || tela === 'ranking' ? subtela?.tela : undefined}
              aoAbrirSorteador={abrirSorteadorDoSimples}
              aoAbrirCalculo={abrirCalculoDoSimples}
              aoTelaAnterior={telaAnterior && (() => irPara(telaAnterior))}
              aoProximaTela={proximaTela && (() => irPara(proximaTela))}
            />
          )}
        </Suspense>
        {tela === 'regras' && <PaginaRegras />}
      </main>

      {guia && (
        <GuiaAprender
          key={guia.chave}
          aoFechar={() => setGuia(null)}
          aoAbrirCalculadora={() => navegar('calculadora')}
          aoTrocarTela={sairDoGuia}
        />
      )}

      {idiomaAberto && (
        <ModalIdioma
          aoFechar={() => setIdiomaAberto(false)}
          aoProximaTela={() => {
            setIdiomaAberto(false)
            navegar('calculadora')
          }}
        />
      )}
    </>
  )
}
