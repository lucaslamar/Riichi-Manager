# Arquitetura

## Visao geral

O Mojoca e um app estatico React + TypeScript. Ele deve continuar funcionando em GitHub Pages, sem backend e sem servicos obrigatorios.

## Fronteiras principais

- `src/app`: navegacao manual e composicao dos modulos.
- `src/compartilhado/i18n`: carregamento de `public/locales/*.json`, fallback para `pt-BR` e helper `t`.
- `src/compartilhado/interface`: layout, componentes genericos, tokens e CSS.
- `src/compartilhado/mahjong/pontuacao`: tipos e funcoes puras de pontuacao por han/fu, ron/tsumo, dealer/leste e honba.
- `src/dominios/calculadora-mao/logica`: montagem e calculo completo de mao, incluindo tiles, esperas, furiten, dora, melds, yaku/fu e conversao para a lib `riichi`.
- `src/dominios/calculadora-mao/interface`: estado de tela, acoes de usuario e componentes da Calculadora de Mao.
  - `montagem-mao`: construcao e edicao estrutural da mao, incluindo teclado, Chi/Pon/Kan/Kan fechado, atalho para a Calculadora de Han e Fu, doras e escolha inicial da pedra da batida.
  - `finalizacao-mao`: revisao da mao completa, troca nao destrutiva da pedra da batida, configuracao de vitoria, honba, doras, descartes/furiten, ventos, riichi/condicoes especiais e calculo/modal de resultado.
  - `modais`: uma pasta por modal (`resultado`, `regras`, `ajuda-secoes`), cada uma com componente e CSS proprios, todas construidas sobre a Modal base `src/compartilhado/interface/componentes/modal` (cabecalho, corpo rolavel, rodape opcional, tamanhos `pequena`/`media`/`grande`, tom `alerta`, arrastar para fechar no limite da rolagem via `useDeslizeParaFechar`, telas internas que entram deslizando de lado com voltar via `ContextoNavegacaoModal`). Funcionalidades de uma modal ficam so na pasta dela.
  - `modais/glossario`: `TextoGlossario` (descricao com os termos do glossario virando link), `BlocoGlossario` (um assunto do glossario num bloco com titulo e subtitulos, usado na aba e na tela de termo) e `ConteudoTermo` (definicao aberta ao tocar no termo, como tela interna da modal em que o texto esta; `ModalTermo` so para textos fora de modal). Os textos e os aliases ficam em `logica/glossario.ts`, fonte unica da aba Glossario do Guia de bolso e da modal de termo.
  - `modais/ajuda-secoes`: botao "?" (`BotaoAjuda`) das secoes da finalizacao e a modal que ele abre. O conteudo de cada secao fica em `topicosAjuda.ts` (so chaves i18n, em blocos com subtitulo opcional para secoes que agrupam assuntos); os textos ficam em `public/locales` (bloco `sectionHelp`).
  - `compartilhado`: componentes visuais e orquestradores sem regra destrutiva propria, como renderizacao de tiles e melds e o `TecladoContextual` (teclado de selecao de pedras para paineis, no padrao do teclado da montagem em cada aparelho; usado nos paineis de Dora e Descartes).
- `src/dominios/calculadora-han-fu/logica`: porta de entrada do dominio Han/Fu para a pontuacao direta compartilhada.
- `src/dominios/calculadora-han-fu/interface`: estado e componentes da Calculadora de Han e Fu, sem depender da interface ou do estado da Calculadora de Mao.
  - `modais/tutorial-han-fu`: tutorial "Como contar Han e Fu" (chapeu de formatura da Tabela rapida), na Modal base com `paginacao` (Anterior/Proximo, pontos e deslize). A pagina "Guia de consulta" junta fu, limites, honba e exemplos em secoes, com sumario e a mesma busca do Guia de bolso (`CampoBuscaGuia`). A estrutura das paginas fica em `conteudoTutorialHanFu.ts` (so chaves i18n) e os textos em `public/locales` (bloco `hanFuTutorial`). Excecao a fronteira acima: reaproveita so componentes de exibicao das modais da Calculadora de Mao (texto do glossario, pedras de exemplo e os estilos das ajudas "?"), nunca hooks ou estado dela. No sentido inverso, o verbete Fu do glossario (`tutorialHanFu` em `logica/glossario.ts`) usa so o `BotaoTutorialHanFu` para abrir o tutorial por cima do Guia de bolso.
- `src/compartilhado/interface/componentes/formula`: `CaixaFormula` (caixa de formula de livro didatico), `TextoFormula` (`*variavel*` e `^{expoente}`) e `ContaPassos` (conta uma etapa por linha), para qualquer tutorial.
- `src/dominios/sorteador-ventos`: sorteio dos ventos/assentos da mesa.

## Regras para evolucao

- Regra de Mahjong nao deve depender de JSX, CSS, DOM ou browser.
- Componentes React chamam acoes nomeadas; nao devem embutir regra sensivel em JSX.
- Persistencia fica em `persistencia`, hoje apenas `localStorage`.
- Textos visiveis novos devem ir para `public/locales/pt-BR.json`.
- AdSlot existe como ponto isolado para publicidade futura e deve permanecer fora de areas criticas da calculadora.
- A Calculadora de Mao e a Calculadora de Han e Fu podem compartilhar pontuacao pura, mas nao devem compartilhar hooks ou componentes especificos de montagem de mao.
- A finalizacao da Calculadora de Mao nao edita a estrutura da mao diretamente. Para remover tiles, remover melds ou mudar a estrutura, o usuario usa o botao de lapis e volta para `montagem-mao`.

## GitHub Pages

O Vite usa `base: "/Riichi-Manager/"`. Caminhos para assets publicos devem usar `import.meta.env.BASE_URL` quando montados em TypeScript.

## Futuro app mobile

O projeto ainda nao usa Ionic, Capacitor ou React Native. Para nao dificultar esse futuro:

- mantenha logica pura em `logica`;
- evite acoplar regra de negocio a eventos de DOM;
- mantenha tipos explicitos;
- mantenha tokens e estilos centralizados;
- prefira componentes pequenos e nomes diretos.
