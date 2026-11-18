# Arquitetura

## Visão geral

O Riichi Manager é uma aplicação estática em React e TypeScript, publicada no GitHub Pages, sem backend ou serviços obrigatórios. `src/main.tsx` inicia o armazenamento e monta os providers de preferências e idioma; `src/app/App.tsx` compõe os módulos e controla a navegação. Para desenvolver, use `npm install` e `npm run dev`.

## Organização

- `src/dominios`: funcionalidades organizadas por domínio, incluindo calculadoras, mesa e clubes (`centerpiece`), jogadores, torneios, sorteador de ventos, configurações e guia de aprendizado. Partidas vinculam mesas de torneio aos resultados e rankings.
- `src/compartilhado`: recursos usados entre domínios, incluindo interface, internacionalização, persistência, adaptadores e lógica de Mahjong compartilhada.
- `src/services`: serviços de armazenamento e backup.
- `public/locales`: traduções da interface; a cadeia de fallback passa por `en` e depois `pt-BR`.

Dentro dos domínios, mantenha regras em `logica` e estado e componentes em `interface`. A lógica de Mahjong deve permanecer independente de JSX, CSS, DOM e APIs do navegador. As calculadoras podem compartilhar pontuação pura, mas não estado nem hooks de montagem de mão.

## Dados e integração

- A aplicação usa IndexedDB via Dexie para dados como jogadores, partidas e torneios. Preferências permanecem no `localStorage`, que também é a alternativa quando o banco não está disponível. O roteamento das chaves está em `src/compartilhado/persistencia/armazenamento.ts` e a inicialização em `src/services/storage/iniciarArmazenamento.ts`.
- `src/services/storage/armazenamentoDados.ts` migra dados do `localStorage` com conferência antes de removê-los; leituras usam memória e gravações vão ao banco em fila. Preserve compatibilidade e aguarde gravações pendentes quando necessário.
- `src/services/backup/backup.ts` define o formato versionado, validação e mesclagem; `lojaBackup.ts` integra os repositórios. Mudanças incompatíveis no formato exigem atenção à versão do esquema e aos dados existentes.
- Componentes chamam ações nomeadas; regras sensíveis pertencem à lógica, não ao JSX. Adaptadores em `src/compartilhado/adaptadores` isolam recursos da plataforma.
- O Vite usa a base `/Riichi-Manager/`; caminhos de assets públicos montados em TypeScript devem respeitar `import.meta.env.BASE_URL`. O build gera um service worker a partir de `scripts/sw-modelo.js` para acesso offline e atualiza o cache por versão; ele não é registrado em desenvolvimento.

Para detalhes de módulos e fluxos, consulte [arquitetura](../docs/arquitetura.md) e [fluxo da calculadora](../docs/calculadora-fluxo.md). Em caso de divergência, confira o código: a documentação de arquitetura ainda menciona apenas `localStorage`.
