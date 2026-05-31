# Arquitetura

## Visao geral

O Riichi Manager e um app estatico React + TypeScript. Ele deve continuar funcionando em GitHub Pages, sem backend e sem servicos obrigatorios.

## Fronteiras principais

- `src/app`: navegacao manual e composicao dos modulos.
- `src/compartilhado/i18n`: carregamento de `public/locales/*.json`, fallback para `pt-BR` e helper `t`.
- `src/compartilhado/interface`: layout, componentes genericos, tokens e CSS.
- `src/compartilhado/mahjong/pontuacao`: tipos e funcoes puras de pontuacao por han/fu, ron/tsumo, dealer/leste e honba.
- `src/dominios/calculadora-mao/logica`: montagem e calculo completo de mao, incluindo tiles, esperas, furiten, dora, melds, yaku/fu e conversao para a lib `riichi`.
- `src/dominios/calculadora-mao/interface`: estado de tela, acoes de usuario e componentes da Calculadora de Mao.
  - `montagem-mao`: construcao e edicao estrutural da mao, incluindo teclado, Chi/Pon/Kan/Kan fechado, descartes/furiten, doras e escolha inicial da pedra da batida.
  - `finalizacao-mao`: revisao da mao completa, troca nao destrutiva da pedra da batida, configuracao de vitoria, honba, doras, ventos, riichi/condicoes especiais e calculo/modal de resultado.
  - `compartilhado`: componentes visuais e orquestradores sem regra destrutiva propria, como renderizacao de tiles e melds.
- `src/dominios/calculadora-han-fu/logica`: porta de entrada do dominio Han/Fu para a pontuacao direta compartilhada.
- `src/dominios/calculadora-han-fu/interface`: estado e componentes da Calculadora de Han e Fu, sem depender da interface ou do estado da Calculadora de Mao.
- `src/dominios/torneio-fast`: dominio do Torneio Fast, separado das calculadoras.

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
