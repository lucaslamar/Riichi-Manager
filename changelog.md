# Changelog - Riichi Manager

## [2.4.0] - 2026-05-20

### Adicionado

- Configuração de ESLint, Prettier e EditorConfig.
- Recomendações de extensões do VS Code para ESLint, Prettier, EditorConfig e TypeScript.
- Declaração `vite-env.d.ts` para imports de CSS e assets no TypeScript.

### Alterado

- Reorganizada a base para um monolito estático por domínio dentro de `src`.
- Separados os domínios `calculadora` e `torneio-fast`, cada um com `interface` como front do domínio e `logica` como back do domínio rodando no navegador.
- Fragmentado o CSS global em arquivos menores: base, layout, componentes compartilhados e estilos por domínio.
- Quebrados os arquivos grandes de interface da calculadora e do torneio fast em componentes menores por responsabilidade.
- Dividida a lógica da calculadora de mão em arquivos focados: tipos, configuração, cálculo, conversão para `riichi`, tradução, calculadora rápida e ordenação.
- Atualizado o README com o estado atual do projeto e a nova arquitetura.

---

## [2.3.2] - 2026-05-19

### Corrigido

- Corrigida a validação dos yakus para aceitar yakumans e condições especiais.

---

## [2.3.1] - 2026-05-19

### Corrigido

- Corrigido o tamanho do modal no navegador mobile.
- Incluído o desfalque de botão na contagem (`dora`/`ura dora`).
- Botão `Houtei` estava faltando.
- Mão inválida (sem yaku) mostrava `0` em vez de `"Sem yaku — mão inválida"`.

---

## [2.3.0] - 2026-05-19

### Adicionado

- Modal **Regras** na calculadora de mão com opções da biblioteca `riichi` em PT-BR.
- Controles para `aka dora`, `tanyao aberto`, `par de vento duplo`, `fu em rinshan`, `kiriage mangan`, `kazoe yakuman`, `yakuman duplo` e `yakuman acumulado`.
- Pedras de **aka dora** no teclado da calculadora usando `0m`, `0p` e `0s`, renderizadas com as imagens vermelhas do pacote de tiles.

### Alterado

- Atualizada a dependência `riichi` no `package-lock.json` para o commit atual da branch `master`.
- O padrão de cálculo do par de vento duplo agora usa `2 fu`, alinhado com regras competitivas modernas, mantendo a opção de alternar para `4 fu`.
- A calculadora rápida e a calculadora completa agora usam as regras escolhidas no modal em vez de uma configuração fixa.
- O `Haku` (dragão branco) ganhou contorno e fundo de destaque para ficar mais visível.
- Menu inicial reorganizado para exibir: calculadora, torneio fast, sistema suíço e referência de yaku.
- A calculadora de mão agora é o botão principal destacado no menu inicial.
- Reiniciar torneio agora leva direto para o cadastro de jogadores do torneio fast.
- No celular, a área de configurações da calculadora mostra um resumo fixo da mão, doras e uradoras durante a rolagem.

### Corrigido

- Ordenação e limite de quantidade das pedras agora tratam aka dora como cinco vermelho sem permitir mais de quatro pedras do mesmo valor.
- `Kan fechado` não pode mais ser adicionado quando a mão já está completa ou sem slots livres suficientes.
- O resultado da calculadora agora mostra a origem dos `fu` quando a biblioteca fornece o detalhamento.

---

## [2.2.0] - 2026-05-18

### Adicionado

- Adicionadas imagens de pedras de Riichi Mahjong a partir do projeto `fluffystuff/riichi-mahjong-tiles`.
- Renderização visual das pedras na calculadora, incluindo mão, teclado, dora, uradora e melds.
- Representação visual de chamadas abertas com uma pedra de lado para `Chi`, `Pon` e `Kan aberto`.
- Representação de `Kan fechado` com pedras externas viradas para baixo.

### Alterado

- Yaku retornados em japonês pela biblioteca de cálculo agora são exibidos em romaji, como `Pinfu`, `Tanyao`, `Toitoi`, `Ittsu`, `Chinitsu`, entre outros.
- Melhorada a validação de `Chi`, permitindo apenas sequências válidas do mesmo naipe.
- Honras, ventos e dragões agora ficam bloqueados durante a seleção de `Chi`.

---

## [2.1.0] - 2026-05-18

### Corrigido

- `Kan` — a conversão para string da biblioteca não tratava kans corretamente.
- `Vento da rodada` — agora limitado a Leste e Sul (regra correta para riichi padrão).
- Cores dos melds — `Chi`, `Pon`, `Kan aberto` e `Kan fechado` agora possuem cores distintas e label pequeno.
- `Uradora` — movida para ao lado do `Riichi`.

---

## [2.0.0] - 2026-05-10

### Adicionado

- Migração do front para `React` e do back para `TypeScript`.
- Melhoria no design com diferenciação cromática por rodada para evitar confusão visual.
- Implementação do validador de yaku e calculadora de mão.

---

## [1.0.1] - 2026-05-03

### Adicionado

- Sistema de interface com suporte a pontuação negativa e entrada apenas de números.
- Persistência de dados.
- Travamento de mesa pós-validação.

---

## [1.0.0] - 2026-05-02

### Adicionado

- **Motor de Chaveamento V5.1**: implementação de algoritmos de permutação para equilíbrio de confrontos.
- **Rotação de Ventos**: lógica de Quadrado Latino para garantir que cada jogador passe por Leste, Sul, Oeste e Norte.
- **Cálculo de Pontuação Profissional**: sistema de conversão de pontos baseado em UMA e penalidades de saldo negativo.
- **Interface Base**: layout responsivo em cartões com suporte a exportação de resultados em PDF.
