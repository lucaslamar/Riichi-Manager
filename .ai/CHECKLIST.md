# Checklist de alterações

- [ ] A mudança atende ao pedido e preserva regras e comportamentos existentes? Dúvidas de negócio foram esclarecidas com o usuário?
- [ ] A lógica, a interface, os adaptadores e a persistência respeitam suas responsabilidades e fronteiras?
- [ ] Os nomes são claros e consistentes? Há aninhamento, comentários ou abstrações desnecessários?
- [ ] Quando aplicável, foram considerados acessibilidade, privacidade, traduções, variantes e GitHub Pages?
- [ ] Foram executados os testes específicos da área e verificações adequadas ao impacto? Consulte os scripts de `package.json`, incluindo `npm run typecheck`, `npm run lint`, `npm test` e `npm run build` quando aplicáveis.
- [ ] Os arquivos vivos afetados foram atualizados para refletir mudanças relevantes? As referências e informações conferem com o código?
- [ ] Foi informado ao usuário qualquer teste ou verificação que não pôde ser executado?

## Verificações por área

Escolha os testes conforme o impacto; os comandos completos estão em `package.json`.

- Partidas, ranking e clubes: `npm run test:partida`, `npm run test:ranking` e `npm run test:clube`.
- Torneios e formatos: `npm run test:torneio` e `npm run test:formatos`.
- Sorteio e grade: `npm run test:formatos` (8, 12, 16 e Sanma de 9) e `npm run test:clube`. Ao mexer na busca, meça o tempo de 8 a 172 jogadores: no PC ficou abaixo de 100 ms por rodada.
- Ranking do torneio: `npm run test:torneio` (setas, confirmação e placares MCR convertidos). Confira as cores das setas no navegador.
- Folha de pontos: `npm run test:expressao-pontos`, e no navegador Enter depois de tocar numa tecla, Enter para abrir a folha e toque no visor.
- Toda tarefa: registre no `.ai` regras, mudanças de UX, ideias adiadas e inspirações, sem dados de pessoas reais.
- Variantes e yakus locais: `npm run test:sanma` e `npm run test:yakus-locais`.
- Modo Chinês (motor de fan e pagamento MCR): `npm run test:fan-mcr` (inclui os 81 fan do guia do CMC) e `npm run test:placar-mcr`. Confira também que `git diff main -- src/dominios/calculadora-mao` continua vazio.
- Persistência e backup: `npm run test:armazenamento` e `npm run test:backup`.
- Traduções e tema: `npm run test:i18n` e `npm run test:tema`.
- Interface: quando aplicável, siga [DESIGN.md](DESIGN.md) e confira layouts mobile e desktop, navegação por teclado e acessibilidade; para offline, valide o build, pois o service worker não roda no desenvolvimento.
