# Riichi Manager

App web estático para Riichi Mahjong, feito com React + TypeScript e publicado no GitHub Pages.

URL de produção: https://lucaslamar.github.io/Riichi-Manager/

## Estado atual

Versão do pacote: 3.0.1.

Módulos públicos:

- Calculadora de Mão: entrada principal do app, com montagem por tiles, esperas, furiten, dora, riichi, ventos, honba e resultado em modal.
- Calculadora de Han e Fu: pontuação direta por han/fu, tipo de vitória, dealer/leste e honba.
- Torneio Fast: cadastro, grade, timer, qualidade das mesas, ranking e persistência em localStorage.
- Regras / Configurações e Sobre / versão: acessos globais compactos.

O app não tem backend, banco de dados, autenticação ou API externa obrigatória.

A pasta logica funciona como o domínio puro executado no navegador.
A pasta interface contém React, eventos, componentes e CSS.

## Como rodar

    npm install
    npm run dev

## Qualidade

    npm run lint
    npm run build

## Deploy GitHub Pages

O vite.config.ts usa:

    base: "/Riichi-Manager/"

Então assets públicos e arquivos de idioma devem respeitar:

    import.meta.env.BASE_URL

Deploy:

    npm run build
    npm run deploy

## Estrutura do projeto

    src/
      app/                         # Composição raiz e navegação manual

      compartilhado/
        i18n/                      # Provider e helper de traduções
        interface/
          componentes/             # Componentes compartilhados, como AdSlot
          layout/                  # Cabeçalho/menu global
          estilos/                 # Tokens, reset, layout e CSS dos domínios

      dominios/
        calculadora/
          logica/                  # Regras puras de Mahjong e conversão para riichi
          interface/
            hooks/                 # Estado, ações de usuário e resultados derivados
            componentes/           # UI da calculadora
            paginas/               # Orquestração do modo completo/han-fu

        torneio-fast/
          logica/                  # Sorteio, qualidade, chaves e tipos
          interface/               # Telas do torneio
          persistencia/            # localStorage

    public/
      locales/                     # pt-BR default e estrutura para outros idiomas
      tiles/                       # Assets públicos das pedras

    docs/
      arquitetura.md
      calculadora-fluxo.md
      regras-de-negocio.md

## Documentação

Leia também:

- Arquitetura: docs/arquitetura.md
- Fluxo da calculadora: docs/calculadora-fluxo.md
- Regras de negócio: docs/regras-de-negocio.md

# Contribuindo

## Princípios

- Preserve as regras de Mahjong em src/dominios/calculadora/logica.
- Prefira mudanças de UX em src/dominios/calculadora/interface.
- Não adicione backend, banco de dados, autenticação ou API externa obrigatória.
- Mantenha compatibilidade com GitHub Pages.
- Use import.meta.env.BASE_URL para arquivos em public.
- Textos novos devem ir para public/locales/pt-BR.json.
- Textos da interface devem usar fallback pelo useI18n.

## Antes de mexer na calculadora

Leia:

- docs/calculadora-fluxo.md
- docs/regras-de-negocio.md

O fluxo atual da Calculadora de Mão é:

1. Montar a mão.
2. Escolher a pedra vencedora.
3. Finalizar a mão e configurar vitória.
4. Clicar em Calcular.
5. Ver o resultado em modal.

Fechar a modal não remove a pedra vencedora.

Para trocar a espera, use a ação explícita de voltar para montagem.

## Checklist rápido antes de abrir PR ou finalizar alteração

    npm run lint
    npm run build

Ao alterar telas, valide pelo menos:

- mobile retrato;
- mobile paisagem;
- desktop/tablet;
- foco por teclado;
- aria-labels dos botões novos;
- resultado da calculadora em Ron e Tsumo;
- Calculadora de Han e Fu;
- Torneio Fast ainda acessível pelo menu global;
- compatibilidade com GitHub Pages.

## Cuidados importantes

### Regras de negócio

Evite alterar diretamente regras sensíveis sem entender o impacto.

Antes de mexer em cálculo, confira:

- tenpai;
- esperas;
- furiten;
- sem-yaku;
- dora;
- honba;
- ventos;
- riichi;
- ron/tsumo;
- condições especiais;
- resultado final.

### Interface

Mudanças visuais devem preservar o fluxo existente.

Evite:

- duplicar informações como MÃO 14/14;
- criar cards ou containers desnecessários;
- esconder ações importantes;
- quebrar a navegação mobile;
- remover acessibilidade;
- trocar botões funcionais por ícones decorativos sem onClick.

### Internacionalização

Todo texto novo visível ao usuário deve ir para:

    public/locales/pt-BR.json

Evite strings hardcoded em componentes React.

### GitHub Pages

Não usar caminhos absolutos fixos para assets públicos.

Preferir:

    ${import.meta.env.BASE_URL}tiles/...

ou a solução já usada no projeto.

## Objetivo do projeto

O Riichi Manager busca ser um ecossistema simples, acessível e funcional para jogadores e clubes de Riichi Mahjong.

Prioridades atuais:

- Calculadora de Mão mobile-first;
- cálculo confiável;
- boa experiência visual com tiles;
- acessibilidade;
- suporte futuro a múltiplos idiomas;
- Torneio Fast preservado;
- compatibilidade com GitHub Pages.
