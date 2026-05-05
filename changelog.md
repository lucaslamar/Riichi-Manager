# Changelog - Riichi Tournament Pro

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

## [1.2.0] - 2026-05-03
### Adicionado
 - Melhoria no design e com diferenciação cromática por rodada para evitar confusão visual.

## [2.0.0] - 2026-05-03
- Motor de Ventos "Carrossel": Implementação de rotação física de mesa por shift de array, garantindo matematicamente zero repetições de ventos em 4 rodadas.
- Algoritmo Social Golfer (16p): Integração de matriz fixa para 16 jogadores, eliminando 100% das colisões de oponentes (12 adversários únicos por jogador).  
- Algoritmo de Saltos Primos (20p+): Distribuição dinâmica para grandes grupos, priorizando a rotação de ventos sobre a repetição mínima de oponentes.  

### Corrigido
- Bug da "Cadeira Fixa": Resolvido o problema onde IDs específicos ficavam presos no Norte ou Leste devido a colisões de permutação.
- Estabilidade de Dados: Refatoração da função de chaveamento para evitar objetos nulos em mesas incompletas.