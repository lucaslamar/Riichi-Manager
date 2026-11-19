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
- Variantes e yakus locais: `npm run test:sanma` e `npm run test:yakus-locais`.
- Persistência e backup: `npm run test:armazenamento` e `npm run test:backup`.
- Traduções e tema: `npm run test:i18n` e `npm run test:tema`.
- Interface: quando aplicável, siga [DESIGN.md](DESIGN.md) e confira layouts mobile e desktop, navegação por teclado e acessibilidade; para offline, valide o build, pois o service worker não roda no desenvolvimento.
