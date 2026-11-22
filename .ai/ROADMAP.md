# Roadmap e ideias

Ideias discutidas e ainda não implementadas. Ao implementar, mova a regra para BUSINESS ou DESIGN e apague daqui.

## Brief do Torneio de 21/11/2026: próximas fases

- Fases 0 a 6 e 8 feitas, menos a 3C. Faltam a 7 e a 7B, que dependem das decisões abaixo.
- Ao fazer a 7, acrescentar o padrão de WO por modo em `RegrasDoModo`.
- Fora por enquanto: PDF com QR (o app não gera PDF), link do QR direto para o torneio (precisa de backend) e a dica de uma na folha da distância.

## Aguardando decisão

- **3C, grades ZAPS:** só com autorização do autor (licença NC).
- **5 no MCR:** "vitórias de mesa = diferença ÷ 4" foi implementado como proposto, mas o usuário ainda não confirmou. Muda só em `regrasDoModo.ts`.
- **7, WO:** proposta de −30,0 para o ausente e +10,0 por presente, aguardando o clube. Valores do MCR em aberto. Conferir atraso e WO na WRC 2025.
- **7B, inscrição e premiação:** falta a divisão com menos de 16 jogadores e como marcar pagamento antecipado.

## Clube

- Lembrar repetições entre dias diferentes (hoje só o mesmo dia).
- Sanma no clube, com mesas de 3. O sorteio compartilhado já aceita.

## Problemas conhecidos

- O fim do tempo não encerra a partida na mão atual, embora a ajuda diga que sim.
- A ajuda do timer de vez cita a aba Mesa, que não existe mais nas configurações do torneio.
- Os cortes do Eliminatório no Sanma são lidos como múltiplos de 4 no campo.
- `npm run lint` varre `.claude/skills` e falha num script de lá.

## Desktop

- Revisar a tela de desktop, inclusive o título que trunca com quatro ações no menu lateral.
- Na folha de pontos, apagar o valor anterior ao começar a digitar (só no desktop).
