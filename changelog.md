# Changelog - Riichi Manager

## [1.0.0] - 2026-05-02

### Adicionado
- **Motor de Chaveamento V5.1**: Implementação de algoritmos de permutação para equilíbrio de confrontos.
- **Rotação de Ventos**: Lógica de Quadrado Latino para garantir que cada jogador passe por Leste, Sul, Oeste e Norte.
- **Cálculo de Pontuação Profissional**: Sistema de conversão de pontos baseado em UMA e penalidades de saldo negativo.
- **Interface Base**: Layout responsivo em cartões com suporte a exportação de resultados em PDF.

## [1.0.1] - 2026-05-03
### Adicionado
-  Sistema de interface com suporte a pontuação negativa e somente numeros.
- Persistência de dados.
- Travamento de mesa pós validação.

## [2.0.0] - 2026-05-10
### Adicionado
-  Migra front para `React` e Back para `TypeScript`.
 - Melhoria no design e com diferenciação cromática por rodada para evitar confusão visual.
- Lança validador de Yaku e calculadora de mão;

## [2.1.0] - 2026-05-18
### Corrigido
- Kans — a conversão para string da lib não está tratando kans corretamente.
- Vento da rodada — só Leste e Sul (regra correta para riichi padrão).
- Cores dos melds — chii/pon/kan aberto/kan fechado com cores distintas + label pequeno.
- Uradora — mover para ao lado do Riichi.

## 2.2.0 - 2026-05-18

### Adicionado
- Adicionadas imagens de pedras de Riichi Mahjong a partir do projeto `fluffystuff/riichi-mahjong-tiles`.
- Renderização visual das pedras na calculadora, incluindo mão, teclado, dora, uradora e melds.
- Representação visual de chamadas abertas com uma pedra de lado para `Chi`, `Pon` e `Kan aberto`.
- Representação de `Kan fechado` com pedras externas viradas para baixo.

### Alterado
- Yaku retornados em japonês pela biblioteca de cálculo agora são exibidos em romaji, como `Pinfu`, `Tanyao`, `Toitoi`, `Ittsu`, `Chinitsu`, entre outros.
- Melhorada a validação de `Chi`, permitindo apenas sequências válidas do mesmo naipe.
- Honras, ventos e dragões agora ficam bloqueados durante a seleção de `Chi`.



