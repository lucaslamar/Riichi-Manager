# Arquitetura

## Visao geral

O Riichi Manager e um app estatico React + TypeScript. Ele deve continuar funcionando em GitHub Pages, sem backend e sem servicos obrigatorios.

## Fronteiras principais

- `src/app`: navegacao manual e composicao dos modulos.
- `src/compartilhado/i18n`: carregamento de `public/locales/*.json`, fallback para `pt-BR` e helper `t`.
- `src/compartilhado/interface`: layout, componentes genericos, tokens e CSS.
- `src/dominios/calculadora/logica`: regras de Mahjong, tipos puros, conversao para a lib `riichi`, esperas, furiten, pontuacao e Calculadora de Han e Fu.
- `src/dominios/calculadora/interface`: estado de tela, acoes de usuario e componentes da calculadora.
- `src/dominios/torneio-fast`: dominio do Torneio Fast, separado da calculadora.

## Regras para evolucao

- Regra de Mahjong nao deve depender de JSX, CSS, DOM ou browser.
- Componentes React chamam acoes nomeadas; nao devem embutir regra sensivel em JSX.
- Persistencia fica em `persistencia`, hoje apenas `localStorage`.
- Textos visiveis novos devem ir para `public/locales/pt-BR.json`.
- AdSlot existe como ponto isolado para publicidade futura e deve permanecer fora de areas criticas da calculadora.

## GitHub Pages

O Vite usa `base: "/Riichi-Manager/"`. Caminhos para assets publicos devem usar `import.meta.env.BASE_URL` quando montados em TypeScript.

## Futuro app mobile

O projeto ainda nao usa Ionic, Capacitor ou React Native. Para nao dificultar esse futuro:

- mantenha logica pura em `logica`;
- evite acoplar regra de negocio a eventos de DOM;
- mantenha tipos explicitos;
- mantenha tokens e estilos centralizados;
- prefira componentes pequenos e nomes diretos.
