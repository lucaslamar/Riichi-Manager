# Riichi Manager

Gerenciador de torneios de Riichi Mahjong com calculadora de pontos integrada.

App publicado: [Riichi Manager no GitHub Pages](https://lucaslamar.github.io/Riichi-Manager/)

## Estado atual

O projeto está na versão `2.3.2` e roda como app estático no navegador, pronto para GitHub Pages.

Módulos funcionais:

- **Calculadora de mão**: monta a mão com tiles visuais, calcula yaku/han/fu/pontos com `github:1Computer1/riichi` e usa imagens de `fluffystuff/riichi-mahjong-tiles`.
- **Torneio fast**: cadastra jogadores, gera grade balanceada, controla timer, salva resultados no `localStorage` e exporta ranking em PDF.

Não existe backend servidor por enquanto. Neste projeto, a pasta `logica` faz o papel de **back do domínio**: regras de negócio em TypeScript executadas no navegador. A pasta `interface` faz o papel de **front do domínio**: telas, componentes React e eventos do usuário.

## Estrutura por domínio

```txt
src/
  vite-env.d.ts                 # Tipos do Vite para CSS e assets importados
  app/                          # Composição da aplicação React
  compartilhado/
    interface/
      layout/                   # Cabeçalho, menu e layouts reutilizáveis
      estilos/
        base/                   # Tokens e reset
        componentes/            # Botões, cards, formulários e placeholders
        dominios/               # CSS específico de cada módulo
        layout/                 # CSS de layout compartilhado
        index.css               # Importa todos os fragmentos
  dominios/
    calculadora/
      interface/                # Página e componentes React da calculadora
      logica/                   # Regras puras e ponte para lib riichi
    torneio-fast/
      interface/                # Componentes React do torneio
      logica/                   # Sorteio, pareamento, timer, pontuação e tipos
      persistencia/             # localStorage e integrações do navegador
public/
  tiles/                        # SVG/PNG das peças e outros assets públicos
```

## Como pensar as pastas

- `interface`: front do domínio; tudo que conversa com tela, usuário, eventos e JSX (`.tsx`).
- `logica`: back do domínio; regra de negócio testável, sem React (`.ts`), mesmo rodando no navegador.
- `persistencia`: leitura/escrita fora da memória, como `localStorage`.
- `compartilhado`: peças reaproveitáveis entre módulos, como layout, botões, cards e estilos base.

## Princípios usados

- Domínios separados por assunto: `calculadora` e `torneio-fast`.
- Regras de negócio ficam fora do React sempre que possível: primeiro na `logica`, depois consumidas pela `interface`.
- Variáveis, tipos e comentários seguem português.
- Variáveis monossilábicas devem ser evitadas. Use nomes que ensinem a intenção do código; nomes como `i`, `j`, `a`, `b`, `x` e `y` ficam reservados para índices, comparadores e coordenadas muito locais.
- Funções principais recebem JSDoc para explicar intenção e contrato.
- Assets públicos ficam em `public`, preservando compatibilidade com Vite/GitHub Pages.

## Como rodar

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run lint
npm run format:check
npm run build
```

Para formatar:

```bash
npm run format
```

## VS Code

Extensões recomendadas em `.vscode/extensions.json`:

- ESLint
- Prettier
- EditorConfig
- TypeScript Nightly

## Deploy GitHub Pages

O `vite.config.ts` já usa `base: "/Riichi-Manager/"` e gera a build em `dist/`.

URL de produção: [https://lucaslamar.github.io/Riichi-Manager/](https://lucaslamar.github.io/Riichi-Manager/)

```bash
npm run build
npm run deploy
```
