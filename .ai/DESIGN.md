# Design de interface (mobile)

Estas diretrizes orientam telas novas e ajustes visuais, com foco no celular. Elas resumem o [Human Interface Guidelines da Apple](https://developer.apple.com/design/human-interface-guidelines) adaptado a um app web em React. A cópia completa das páginas fica na skill `.claude/skills/apple-design` (`references/hig/`). Para uma revisão de tela, use `/apple-design` e cite a página consultada.

O Riichi Manager é web e roda em qualquer celular. Por isso valem os princípios e os fundamentos (acessibilidade, cor, tipografia, layout e escrita). Convenções exclusivas de iOS nativo, como Liquid Glass e barras do sistema, não se aplicam.

## Princípios

- Cada tela tem um propósito claro. Todo elemento precisa merecer seu lugar.
- Permita explorar, pular e desfazer. Ações destrutivas pedem confirmação ou oferecem desfazer.
- Use padrões familiares e consistentes entre os módulos.
- Funcione em telas pequenas e grandes, com texto ampliado, toque, teclado e leitor de tela.
- Cuide dos detalhes: espaçamento, alinhamento, textos e animações acabados.

## Acessibilidade (bloqueante)

- Texto: padrão de 17px no celular e mínimo de 11px. Evite pesos finos em textos pequenos. Use unidades que acompanhem o zoom e o tamanho de fonte do sistema (`rem`).
- Contraste: 4,5:1 para texto comum e 3:1 para texto a partir de 18px ou em negrito, nos temas claro e escuro.
- Alvos de toque: padrão de 44×44px e mínimo de 28×28px, com espaço entre controles vizinhos.
- Nunca transmita informação só por cor. Botões só com ícone têm `aria-label`.
- Animações são opcionais e respeitam `prefers-reduced-motion`.

## Layout no celular

- Respeite as áreas seguras com `env(safe-area-inset-*)`, principalmente em barras fixas no topo e no rodapé.
- Ações principais ficam ao alcance do polegar, na parte de baixo da tela quando fizer sentido.
- Nada de rolagem horizontal da página. Conteúdo largo rola dentro do próprio bloco.
- Navegação leva a lugares, botões executam ações. Não misture os dois papéis.
- Modais: um por vez, com forma clara de sair além do botão de confirmar.

## Seleção de pedras

- Não escolhida não é desabilitada: a pedra fica com a aparência cheia (opacidade, face e cor das Pedras). Escolhida ganha só um contorno por sombra na cor `--cor-destaque` (a do botão Gang, rosa no tema escuro), com `aria-pressed` e sem mudar de tamanho. No Alto contraste o contorno engrossa. O foco fica por fora dele. Exemplo: Flores e Estações do MCR.

## Escrita

- Rótulos dizem o que vai acontecer ("Salvar partida", não "OK").
- Erros explicam o problema e como resolver. Estados vazios orientam o próximo passo.
- Variantes de mahjong pelo nome que os jogadores usam (Riichi, MCR), não pelo país.
