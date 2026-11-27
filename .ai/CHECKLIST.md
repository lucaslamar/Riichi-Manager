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
- Distância para o pódio e relatórios da disputa: `npm run test:distancia-podio`. No navegador, leia o QR da imagem gerada (jsqr) e confira os dois temas.
- Premiação: `npm run test:premiacao`. WO, remontagem e atraso: `npm run test:wo`, e confira que o WO não entra no histórico nem no Ranking geral.
- Folha de pontos: `npm run test:expressao-pontos`, e no navegador Enter depois de tocar numa tecla, Enter para abrir a folha e toque no visor.
- Viradas, estatísticas, W.O. no meio e salvar para continuar: `npm run test:viradas`, `test:forma`, `test:estatisticas`, `test:saida` e `test:partida-pausada`. No navegador, confira a folha de pontos com W.O. em 360×640 e 375×548.
- Toda tarefa: registre no `.ai` regras, mudanças de UX, ideias adiadas e inspirações, sem dados de pessoas reais.
- Variantes e yakus locais: `npm run test:sanma` e `npm run test:yakus-locais`.
- Modo Chinês (motor de fan e pagamento MCR): `npm run test:fan-mcr` (inclui os 81 fan do guia do CMC), `npm run test:placar-mcr` e `npm run test:tutorial-mcr`. Ao mexer em componente compartilhado, confira o Riichi no navegador e procure termos do Riichi nas telas do MCR. Regra nova no Tutorial sem base no guia do CMC entra em [REFERENCIAS-MCR.md](REFERENCIAS-MCR.md).
- Persistência e backup: `npm run test:armazenamento` e `npm run test:backup`.
- Traduções e tema: `npm run test:i18n` e `npm run test:tema`.
- iPad e PC: confira 678×1024, 820×1180, 1024×768, 1024×1366, 1032×1376, 1376×1032, 1180×820, 1280×650, 1440×900 e 1920×1080. No Torneio, no Clube e no Ranking, use lista cheia e role até o fim.
- Interface: quando aplicável, siga [DESIGN.md](DESIGN.md) e confira layouts mobile e desktop, navegação por teclado e acessibilidade; para offline, valide o build, pois o service worker não roda no desenvolvimento.
- Testar no celular pela rede: `npm run dev:celular` (HTTPS com certificado local, necessário para câmera e Web Share) e abra no celular o endereço `Network` 192.168.x.x da rede Wi-Fi (não o de adaptador virtual, como 192.168.56.x). Aceite o aviso do certificado uma vez. Se não abrir, libere o Node no Firewall do Windows para rede privada.
- Compartilhar a mão: no iPhone (Safari) e no Android (Chrome), câmera, captura e Compartilhar para os Stories e o WhatsApp. Leia o QR do Story com outro celular, no tema claro e no escuro. Salve a imagem e poste da galeria nos Stories (9:16, sem corte). No PC sem câmera, galeria e download. Negue a permissão (aviso e galeria). Foto da galeria com rotação EXIF. Yakuman, mão aberta com chamadas e resultado MCR. Muitos yaku (+N) e nome comprido. Troque o layout várias vezes e compartilhe. Feche no meio da câmera: volta ao Resultado com a câmera desligada. No navegador do PC, leia o QR com jsqr na imagem inteira e reduzida à metade.
