# Roadmap e ideias

Ideias discutidas e ainda não implementadas. Ao implementar, mova a regra para BUSINESS ou DESIGN e apague daqui.

## Brief do Torneio de 21/11/2026: próximas fases

- **3, sorteio mitigado:** comparar as regras em ordem, sem somar pesos (a soma quebra a prioridade). Mínimos provados por busca exaustiva: 8 jogadores 4, 12 e 24 duplas repetidas em 2, 3 e 4 rodadas, e 12 jogadores 3, 9 e 18. Com 12 e 3 rodadas é possível ninguém repetir mais de 2 adversários.
- **3, grade fixa para 16:** necessária. O Brasileirão repetiu em 28 de 30 simulações de 4 rodadas.
- **3B, sorteio do clube com memória do dia.**
- **4, estatística da grade:** sem nota nem peso de ventos quando eles saem na mesa.
- **0, `RegrasDoModo`:** criar quando a Fase 5 precisar.
- **5, distância para o pódio:** arredondar a diferença antes do `Math.ceil` (16,0 dava 3 mangans em vez de 2).
- **6, QR na imagem compartilhada:** o app não gera PDF.

## Aguardando decisão

- **3C, grades ZAPS:** só com autorização do autor (licença NC).
- **5 no MCR:** "vitórias de mesa = diferença ÷ 4" a confirmar.
- **7, WO:** proposta de −30,0 para o ausente e +10,0 por presente, aguardando o clube. Valores do MCR em aberto. Conferir atraso e WO na WRC 2025.
- **7B, inscrição e premiação:** falta a divisão com menos de 16 jogadores e como marcar pagamento antecipado.

## Problemas conhecidos

- O fim do tempo não encerra a partida na mão atual, embora a ajuda diga que sim.
- A ajuda do timer de vez cita a aba Mesa, que não existe mais nas configurações do torneio.
- Os cortes do Eliminatório no Sanma são lidos como múltiplos de 4 no campo.
- `npm run lint` varre `.claude/skills` e falha num script de lá.

## Desktop

- Revisar a tela de desktop, inclusive o título que trunca com quatro ações no menu lateral.
- Na folha de pontos, apagar o valor anterior ao começar a digitar (só no desktop).
