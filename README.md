# [Riichi Tournament Pro](https://lucaslamar.github.io/Riichi-Manager/) 🀄

Gerenciador de torneios de Mahjong Riichi focado em equilíbrio matemático e rotação justa de jogadores.

## 🧠 O Motor Matemático (A Matriz Perfeita)

Para garantir um torneio justo, o sistema não utiliza sorteios puramente aleatórios. O back-end foi construído sobre dois pilares da combinatória:

1. **Equilíbrio de Adjacência (Decomposição de Baranyai):** 
   Em grupos de 8 jogadores, o sistema minimiza a "taxa de colisão". Isso garante que você enfrente o máximo de oponentes diferentes antes de repetir qualquer mesa.
   
2. **Rotação de Assentos (Quadrado Latino de Ordem 4):** 
   Garantia matemática de que cada jogador ocupará as quatro posições de vento (**Leste, Sul, Oeste e Norte**) exatamente uma vez ao longo de 4 rodadas

## 📋 Regras de Negócio Implementadas

- **Cálculo de UMA:** Pontuação final convertida automaticamente para o padrão de torneios.
- **Dobon Penalty:** Jogadores que terminam com pontuação bruta negativa recebem uma penalidade fixa de **-3.0 pontos** na tabela geral.
- **Escalabilidade:** Otimizado para 8 jogadores, com variância zero de oponentes recomendada para grupos de 16 ou mais[cite: 4].

## 🚀 Como Usar

1. Insira os nomes dos jogadores (mínimo 8, múltiplo de 4).
2. Clique em **Gerar Chaveamento**.
3. Insira as pontuações ao final de cada mesa e clique em **Guardar Mesa**.
4. Exporte o ranking final em **PDF**.

## 🛠️ Tecnologias
- HTML5 / CSS3 (Material Design)
- JavaScript Vanilla (Engine de Chaveamento)
- jsPDF (Exportação de relatórios)