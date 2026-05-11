# Riichi Manager v5

Gerenciador de torneios de Riichi Mahjong com calculadora de pontos integrada.

## Estrutura do projeto (monolito)

```
src/
├── App.tsx                          # Raiz: roteamento e estado global
├── main.tsx                         # Ponto de entrada React
├── estilos/
│   └── global.css                   # Todos os estilos (visual do Manager original)
├── logica/                          # Lógica pura (sem React, testável)
│   ├── calculo/
│   │   └── mao.ts                   # Cálculo de pontos de mão (ponte para lib riichi)
│   ├── pareamento/
│   │   ├── qualidade.ts             # Avaliação da qualidade da grade
│   │   └── sorteio.ts               # Algoritmo de geração de grade balanceada
│   └── torneio/
│       ├── acoes.ts                 # Funções puras: timer, pontuação
│       ├── aleatorio.ts             # Fisher-Yates shuffle
│       ├── armazenamento.ts         # localStorage: salvar/carregar torneio
│       ├── chaves.ts                # Chaves de mesa, formatação de texto
│       ├── constantes.ts            # Valores configuráveis do torneio
│       ├── jogadores.ts             # Parse e validação da lista de jogadores
│       └── tipos.ts                 # Todos os tipos TypeScript do domínio
├── componentes/
│   ├── layout/
│   │   ├── Cabecalho.tsx            # Header fixo
│   │   └── MenuInicial.tsx          # Menu principal
│   └── torneio/
│       └── ComponentesTorneio.tsx   # Config, Ranking, Timer, Qualidade, Grade
└── paginas/
    └── PaginaCalculadora.tsx        # Calculadora completa (modo pedras + han/fu)
```

## Como rodar

```bash
npm install
npm run dev
```

## Como fazer build para produção

```bash
npm run build
# Arquivos gerados em dist/
```

## Deploy GitHub Pages

No `vite.config.ts`, descomente a linha `base: '/Riichi-Manager/'` e rode:
```bash
npm run build
npx gh-pages -d dist
```
