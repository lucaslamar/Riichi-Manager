/**
 * Guia Aprender a jogar em lituano: mesmos ids, pedras e respostas do pt-BR
 * (`npm run test:guia` confere). Vocabulário igual ao do app em lt: akmuo, rūšis,
 * trejetas, seka, pora, šaukimas, mirusi siena. Tratamento formal (jūs). As
 * referências entre módulos vêm depois de "žr.", para não precisar declinar.
 */
import { BASE_PATAMAR } from '@/compartilhado/mahjong/pontuacao'
import { conteudoGuiaBolso } from '@/dominios/calculadora-mao/conteudo/guia-bolso'
import {
  ARTIGO_SUJI,
  criarAuxiliares,
  criarBuscaModulo,
  criarModuloRegras,
  hanYaku,
  trocarReferencias,
  type TopicoRegras,
} from './auxiliares'
import type { ConteudoTutorial, TermoGlossarioGuia, TutorialModule, TutorialPart } from './tipos'

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao } = criarAuxiliares('lt', {
  sim: 'Taip',
  nao: 'Ne',
  cabecalhoYakus: ['Yaku', 'Ko reikia', 'Uždara', 'Atvira'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: 'Akmenys',
    cover: 'Susipažinkite su 136 žaidimo akmenimis.',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: 'Trys rūšys',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: 'Yra **136 akmenys**: 34 tipai, po 4 kiekvieno. Trys rūšys turi skaičius nuo 1 iki 9.',
          },
          { type: 'text', md: '**Man** 萬 • Simboliai: skaičiai, parašyti kanji.' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**Pin** 筒 • Apskritimai: nuo vieno iki devynių apskritimų.' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**Sou** 索 • Bambukai: 1 dažniausiai yra paukštis.' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: 'Garbės akmenys',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: 'Akmenys be skaičių (字牌). Jie niekada nesudaro sekos.' },
          {
            type: 'text',
            md: '**Vėjai** 風牌: Rytai (Ton), Pietūs (Nan), Vakarai (Shaa), Šiaurė (Pei).',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**Drakonai** 三元牌: Baltas (Haku), Žalias (Hatsu), Raudonas (Chun).',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: 'Japoniškus pavadinimus išgirsite prie stalo, bet kol kas dėl jų nesirūpinkite: žaisti pakanka žodžių Rytai, Pietūs, Baltas ir Raudonas.',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: 'Pavadinimai, kuriuos išgirsite',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **Kraštiniai**: rūšių 1 ir 9.\n- **Paprasti**: akmenys nuo 2 iki 8.\n- **Raudonas 5** (Aka dora): ypatingas 5 kiekvienoje rūšyje, duodantis premiją.',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: 'Kraštiniai', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: 'Raudoni penketai' },
          {
            type: 'tip',
            md: 'Kol kas žaiskite raudoną 5 kaip įprastą savo rūšies 5. Apie jo premiją žr. {{onde:dora}}.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Ar Pin 9 yra kraštinis, ar paprastas?',
        hand: '9p',
        options: [{ label: 'Kraštinis', correct: true }, { label: 'Paprastas' }],
        answer: 'Kraštinis. Rūšių 1 ir 9 yra kraštiniai; nuo 2 iki 8 yra paprasti.',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: 'Stalas',
    cover: 'Paruoškite savo pirmąjį stalą.',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: 'Vėjų burtai',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: 'Pirmiausia kiekvienam žaidėjui reikia vėjo. Jis nustato vietą prie stalo ir kas pradeda.',
          },
          {
            type: 'text',
            md: '- Ištraukęs **Rytus** yra **oya** (dalintojas). Jis meta kauliukus ir pirmas išmeta akmenį.\n- Kiti sėdi nuo jo prieš laikrodžio rodyklę: Rytai → Pietūs → Vakarai → Šiaurė.',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: 'Stalas iš viršaus su keturiomis vietomis: Rytai (oya) apačioje, Pietūs dešinėje, Vakarai viršuje ir Šiaurė kairėje. Raudonos rodyklės viduryje rodo ėjimų tvarką: iš Rytų į Pietus, iš Pietų į Vakarus, iš Vakarų į Šiaurę ir iš Šiaurės atgal į Rytus.',
            caption:
              'Ėjimas pereina į dešinę nuo žaidusiojo: Rytai → Pietūs → Vakarai → Šiaurė. Pasikeitus oya, Rytai taip pat pereina į dešinę: buvęs Pietūs tampa naujais Rytais.',
          },
          {
            type: 'text',
            md: '**Kaip burti**\n- **Su akmenimis**: apverskite po vieną kiekvieno vėjo akmenį, sumaišykite, ir kiekvienas žaidėjas paima po vieną.\n- **Su programėle**: Vėjų burtai iškart paskirsto keturis vėjus, akmenų atrinkti nereikia.',
          },
          { type: 'appLink', tool: 'sorteador', label: 'Atidaryti Vėjų burtus' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: 'Maišymas ir sienos statymas',
        blocks: [
          {
            type: 'steps',
            items: [
              'Paskleiskite akmenis stalo centre ir visi kartu gerai išmaišykite, kaip jie begulėtų. Tada apverskite tuos, kurie liko veidu į viršų, ir švelniai pamaišykite, kad nė vienas vėl neapsiverstų.',
              {
                md: 'Kiekvienas žaidėjas prieš save pastato eilę, **17 akmenų ilgio ir 2 aukščio** (34 akmenys).',
                image: 'muroFileira',
                alt: '17 stulpelių apverstų akmenų eilė, kiekviename stulpelyje 2 akmenys vienas ant kito.',
              },
              {
                md: 'Kiekvienas pastumia savo sieną šiek tiek į stalo vidurį. Keturios sienos supa centrą, bet ==neprivalo liestis== ar sudaryti tobulo kvadrato.',
                image: 'muroQuadrado',
                alt: 'Vaizdas iš viršaus: keturios sienos aplink stalo centrą, kiekviena prieš žaidėją, su tarpu kiekviename kampe. Rytai apačioje, Pietūs dešinėje, Vakarai viršuje ir Šiaurė kairėje. Viduryje centrinė plokštė su Rytais (東), o kiekvienoje pusėje – kauliukų skaičiai, atveriantys to žaidėjo sieną: Rytai 1, 5 ir 9; Pietūs 2, 6 ir 10; Vakarai 3, 7 ir 11; Šiaurė 4, 8 ir 12.',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: 'Sienos atvėrimas',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: 'Oya ==visada meta du kauliukus== ir juos sudeda. Skaičius nurodo, **kuri siena atveriama** ir **ties kuriuo stulpeliu** ji perskiriama. Ties šia vieta atskiriama mirusi siena.',
          },
          { type: 'heading', text: '1. Kuri siena atveriama' },
          {
            type: 'text',
            md: 'Skaičiuokite žaidėjus nuo oya ==prieš laikrodžio rodyklę==: oya yra 1, žaidėjas jam iš dešinės yra 2, priešais sėdintis yra 3, o iš kairės yra 4. Ties 5 skaičiavimas grįžta prie oya.',
          },
          {
            type: 'text',
            md: '- **5 arba 9**: oya siena.\n- **2, 6 arba 10**: siena žaidėjo jam iš dešinės.\n- **3, 7 arba 11**: priešais esanti siena.\n- **4, 8 arba 12**: siena žaidėjo jam iš kairės.',
          },
          {
            type: 'tip',
            md: '**Su centrine plokšte** skaičiuoti nereikia: kiekviena jos pusė rodo skaičius, atveriančius ten sėdinčio žaidėjo sieną. Tiesiog raskite kauliukų sumą.',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: 'Stalas iš viršaus su keturiomis sienomis. Prie kiekvieno vėjo – skaičiavimo skaičiai: Rytai 1, 5 ir 9; Pietūs 2, 6 ir 10; Vakarai 3, 7 ir 11; Šiaurė 4, 8 ir 12. Kauliukų viduryje suma 5, o Rytai, pats oya, paryškinti.',
            caption: 'Pavyzdys: 2 + 3 = 5. Skaičiavimas apeina ratą ir sustoja ties pačiu oya.',
          },
          { type: 'heading', text: '2. Kur atveriama' },
          {
            type: 'text',
            md: 'Burtų nurodytą sieną pastatęs žaidėjas žiūri į ją iš savo vietos ir skaičiuoja stulpelius ==iš dešinės į kairę==: dešiniausias stulpelis yra 1. Jis suskaičiuoja kauliukų skaičių ir atskiria sieną iškart už to stulpelio: tai ==anga==.',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: '17 stulpelių siena, kurią iš priekio mato ją pastatęs žaidėjas. 5 dešiniausi stulpeliai sunumeruoti: 1 dešiniajame gale ir 5 toliau į kairę. Raudona rodyklė iš dešinės į kairę rodo iki angos, iškart už 5-ojo stulpelio.',
            caption: 'Kauliukai 5: 1 stulpelis yra jūsų dešinėje, o anga – už 5-ojo.',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: 'Stalas iš viršaus. Rytų sienos stulpeliai raudonai sunumeruoti nuo 1 iki 5, nuo Rytuose sėdinčio žaidėjo dešiniojo galo į kairę, o siena perskirta už 5-ojo.',
            caption: 'Tas pats skaičiavimas iš viršaus, Rytų sienoje.',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.4',
        title: 'Mirusi siena',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '==7 stulpeliai iškart į dešinę nuo angos== (14 akmenų) sudaro **mirusią sieną**. Iš jos įprastai netraukiama.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Atverta siena iš priekio: kairėje siena, iš kurios traukiama, toliau anga ir dešinėje 7 mirusios sienos stulpeliai, sunumeruoti nuo 1 iki 7 nuo angos. 3 stulpelyje viršutinis akmuo atverstas: tai dora indikatorius.',
            caption:
              'Žiūrint į sieną: traukiama į kairę nuo angos, mirusi siena dešinėje, numeruojama nuo angos.',
          },
          { type: 'heading', text: 'Jei kauliukai rodo mažiau nei 7' },
          {
            type: 'text',
            md: 'Į dešinę nuo angos lieka tik suskaičiuoti stulpeliai, mažiau nei 7. ==Papildykite mirusią sieną iš kaimyninės sienos== dešinėje. Kauliukų 5 pavyzdyje Rytų sienoje lieka 5 stulpeliai, o kiti 2 imami iš Pietų sienos.',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: 'Stalas iš viršaus, kauliukų suma 5. Rytų siena perskirta už 5-ojo stulpelio; mirusi siena, užbrūkšniuota ir raudonai apvesta, užima tuos 5 stulpelius ir tęsiasi per pirmus 2 Pietų sienos stulpelius, apeidama kampą. Indikatorius yra 3 stulpelyje, dar Rytuose.',
            caption: 'Kauliukai 5: 5 stulpeliai Rytuose + 2 Pietuose.',
          },
          {
            type: 'tip',
            md: 'Esant 7 ar daugiau, visa mirusi siena telpa nurodytoje sienoje. Nuo 2 iki 6 ji visada apeina kampą.',
          },
          { type: 'heading', text: 'Kam ji reikalinga' },
          {
            type: 'text',
            md: 'Yra 136 akmenys, po 4 kiekvieno. Jei visi patektų į žaidimą, būtų galima suskaičiuoti, kas išėjo, ir tiksliai žinoti, kas liko. 14 mirusios sienos akmenų netraukiami, todėl ==niekas tiksliai nežino==, kurie akmenys pasirodys.',
          },
          { type: 'heading', text: 'Dora indikatorius' },
          {
            type: 'text',
            md: 'Dabar skaičiuojama priešingai nei su kauliukais: suskaičiuokite ==3 stulpelius nuo angos į dešinę== ir apverskite viršutinį 3-iojo stulpelio akmenį. Tai **dora indikatorius**; apie jį žr. {{onde:dora}}.',
          },
          {
            type: 'tip',
            md: 'Kai kurie mirusios sienos akmenys turi ir kitų paskirčių; žr. {{onde:kan}}.',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: 'Akmenų traukimas',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: 'Traukti pradedama ==nuo stulpelio iškart į kairę nuo angos== (tą sieną pastačiusio žaidėjo požiūriu) ir einama ==į kairę==, siena po sienos, kaip rodo rodyklė. Mirusi siena lieka nuošalyje. Žiūrint iš viršaus, akmenys imami **pagal laikrodžio rodyklę**: priešingai nei ėjimų tvarka, kuri yra prieš laikrodžio rodyklę.',
                image: 'mesaCompra',
                alt: 'Stalas iš viršaus. Rytų siena atverta; kampo pusėje yra raudonai apvesta mirusi siena, pereinanti į Pietų sieną. Iš kitos angos pusės raudona rodyklė eina Rytų siena, paskui Šiaurės siena, pagal laikrodžio rodyklę.',
              },
              'Pirmas ima oya, paskui žaidėjas jam iš dešinės ir taip toliau. Kiekvienas ima **po 4 akmenis** (2 stulpelius), kol visi turi po 12.',
              'Kiekvienas žaidėjas paima dar **1 akmenį** ir turi 13.',
              'Oya paima **14-ąjį akmenį** ir pradeda žaidimą pirmuoju išmetimu.',
            ],
          },
          { type: 'heading', text: 'Santrauka: į kurią pusę skaičiuoti' },
          {
            type: 'text',
            md: 'Visada žiūrint į sieną kaip ją pastatęs žaidėjas:\n- **Kauliukai**: nuo dešiniojo galo į kairę.\n- **Mirusi siena ir indikatorius**: nuo angos į dešinę.\n- **Traukimas**: nuo angos į kairę.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Kas meta kauliukus ir pirmas išmeta akmenį?',
        options: [
          { label: 'Žaidėjas į dešinę nuo Rytų' },
          { label: 'Oya, ištraukęs Rytus', correct: true },
          { label: 'Ištraukęs Šiaurę' },
        ],
        answer: 'Oya, ištraukęs Rytus. Jis meta kauliukus ir pradeda žaidimą pirmuoju išmetimu.',
      },
      {
        type: 'quiz',
        question: 'Kam reikalinga mirusi siena?',
        options: [
          { label: 'Laikyti išmestus akmenis' },
          { label: 'Atskirti pralaimėjusio žaidėjo akmenis' },
          {
            label: 'Palikti akmenis už žaidimo, kad niekas tiksliai nežinotų, kurie pasirodys',
            correct: true,
          },
        ],
        answer:
          'Palikti akmenis už žaidimo. Kai jie netraukiami, niekas negali tiksliai suskaičiuoti, kas dar liko.',
      },
      {
        type: 'quiz',
        question: 'Su keliais akmenimis pradeda oya?',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14. Kiti turi po 13, o oya pradeda žaidimą išmesdamas 14-ąjį.',
      },
      {
        type: 'quiz',
        question: 'Kauliukai parodė 4 (1 + 3). Kurioje sienoje yra anga ir kur mirusi siena?',
        options: [
          { label: 'Šiaurėje, ir visa mirusi siena joje telpa' },
          { label: 'Šiaurėje: 4 stulpeliai joje + 3 Rytų sienoje', correct: true },
          { label: 'Vakaruose: 4 stulpeliai juose + 3 Pietuose' },
        ],
        answer:
          'Skaičiuojant nuo oya prieš laikrodžio rodyklę, 4 tenka žaidėjui jam iš kairės: Šiaurei. Šis suskaičiuoja 4 stulpelius nuo savo dešiniojo galo į kairę ir atveria sieną. Ten telpa tik 4 mirusios sienos stulpeliai; kiti 3 imami iš kaimyninės sienos į dešinę nuo Šiaurės, t. y. Rytų.',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: 'Pilna ranka',
    cover: 'Sužinokite, ką bandote surinkti.',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: 'Formulė: 4 grupės + 1 pora',
        blocks: [
          {
            type: 'text',
            md: 'Kad laimėtumėte, reikia **14 akmenų**, suskirstytų į keturias grupes po tris ir vieną porą.',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: 'Grupių tipai',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**Seka**: trys iš eilės einantys tos pačios rūšies skaičiai.' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**Trejetas**: trys vienodi akmenys.' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**Pora**: du vienodi akmenys.' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: 'Seka neapsisuka (8-9-1 negalioja), o garbės akmenys (vėjai ir drakonai) niekada nesudaro sekos.',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: 'Tenpai: trūksta vieno',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'Žaidžiate su 13 akmenų, o 14-ąjį gaunate laimėdami. Kai trūksta tik vieno, jūsų ranka yra **tenpai**. Tinkami akmenys yra jūsų **laukimai**.',
          },
          {
            type: 'text',
            md: 'Išskaidykite ranką į jau baigtas grupes. Tai, kas ==lieka nebaigta==, ir yra laukimo vieta.',
          },
          { type: 'heading', text: 'Dvipusis' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['Seka', 'Seka', 'Seka', 'Pora', 'Laukimas'],
            after: '36m',
            afterLabel: 'laukimas',
            caption: '4-5 užbaigia 3 arba 6: geriausias laukimas, iki 8 akmenų.',
          },
          { type: 'heading', text: 'Vidurinis' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['Seka', 'Seka', 'Trejetas', 'Pora', 'Laukimas'],
            after: '5m',
            afterLabel: 'laukimas',
            caption: '4-6 užbaigia tik vidurinis 5.',
          },
          { type: 'heading', text: 'Krašto' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['Seka', 'Seka', 'Trejetas', 'Pora', 'Laukimas'],
            after: '3m',
            afterLabel: 'laukimas',
            caption: '1-2 užbaigia tik 3: kitoje pusėje 0 nėra.',
          },
          { type: 'heading', text: 'Dvi poros' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['Seka', 'Seka', 'Seka', 'Laukimas', 'Laukimas'],
            after: '2p8s',
            afterLabel: 'laukimas',
            caption: 'Viena pora tampa trejetu, o kita lieka pora.',
          },
          { type: 'heading', text: 'Tik pora' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['Seka', 'Seka', 'Seka', 'Trejetas', 'Laukimas'],
            after: '5s',
            afterLabel: 'laukimas',
            caption: 'Visos 4 grupės baigtos: trūksta tik Sou 5 poros.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Ar ši ranka yra tenpai?',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: 'Taip. Ji laukia Pin 6 arba 9, kad užbaigtų 7-8.',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: 'Ėjimas',
    cover: 'Traukite, išmeskite ir šaukite akmenis.',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: 'Traukimas ir išmetimas',
        blocks: [
          {
            type: 'text',
            md: 'Savo ėjimo metu ištraukiate akmenį iš sienos ir išmetate kitą, veidu į viršų. Išmesti akmenys dedami eilėmis po šešis prieš jus, tarp jūsų sienos ir stalo centro, visiems matomi. Ėjimas pereina žaidėjui jums iš dešinės.',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: 'Stalas iš viršaus: prieš kiekvieną sieną 6 išmestų akmenų eilė ir antros pradžia. Viduryje stalo centras su raundo vėju (東). Vienas Pietų išmestas akmuo pasuktas šonu, kaip per Riichi. Į dešinę nuo Rytų, už sienos, atviras pon: trys akmenys, kairysis pasuktas šonu.',
            caption:
              'Kiekvienas išmeta prieš save, eilėmis po 6. Į dešinę nuo Rytų – pon: paimtas akmuo pasuktas šonu.',
          },
          {
            type: 'text',
            md: 'Su kito žaidėjo išmestu akmeniu grupę galite sudaryti ir iškart: tai **šaukimas**, pavyzdžiui, pon ir chi. Pašaukta grupė lieka atvira ant stalo, jums iš dešinės.',
          },
          {
            type: 'tip',
            md: 'Ant stalo iš kito žaidėjo paimtas akmuo pasukamas **šonu**, nukreiptas į jį išmetusį žaidėją. Taip visi žino, iš kur jis atėjo.',
          },
        ],
      },
      {
        id: 'pon',
        number: '4.2',
        title: 'Pon',
        termos: ['pon'],
        blocks: [
          {
            type: 'text',
            md: 'Kažkas išmetė akmenį, o jūs rankoje turite du tokius pat. Pasakykite „pon“, paimkite akmenį ir parodykite trejetą ant stalo.',
          },
          {
            type: 'text',
            md: 'Galima su **bet kurio žaidėjo** išmestu akmeniu. Žaidimas tęsiasi nuo jūsų: išmeskite akmenį.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: 'Iš kairės' },
              { mpsz: '777s', deLado: 1, caption: 'Iš priešais' },
              { mpsz: '777s', deLado: 2, caption: 'Iš dešinės' },
            ],
          },
          {
            type: 'text',
            md: 'Po pon jūsų ranka tampa **atvira**. Ranka be kitų žaidėjų išmestų akmenų yra **uždara**.',
          },
        ],
      },
      {
        id: 'chi',
        number: '4.3',
        title: 'Chi',
        termos: ['chi', 'chamada'],
        blocks: [
          {
            type: 'text',
            md: 'Seką galite užbaigti išmestu akmeniu, bet tik žaidėjo **jums iš kairės**. Pasakykite „chi“ ir parodykite seką ant stalo.',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: 'Paėmėte Pin 4: jis pasuktas šonu, kairėje',
              },
            ],
          },
          { type: 'text', md: 'Po chi jūsų ranka tampa **atvira**.' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: 'Kas turi pirmenybę',
        blocks: [
          {
            type: 'text',
            md: 'Jei tą patį išmestą akmenį nori keli žaidėjai: **ron > pon > chi**.',
          },
          {
            type: 'text',
            md: '**Ron** yra laimėjimas su kažkieno išmestu akmeniu. Apie tai – kitame puslapyje.',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: 'Tsumo ir ron',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **Tsumo**: ištraukėte akmenį, užbaigusį ranką. Moka visi kiti žaidėjai.\n- **Ron**: akmuo atėjo iš kito žaidėjo išmetimo. Moka tik jį išmetęs žaidėjas.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question:
          'Priešais sėdintis žaidėjas išmetė Pin 6, o jūs turite Pin 5 ir 7. Ar galite šaukti chi?',
        hand: '57p',
        options: simNao(false),
        answer: 'Ne. Chi galima tik su žaidėjo jums iš kairės išmestu akmeniu.',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: 'Galiojanti ranka',
    cover: 'Užbaigtos rankos nepakanka: kad laimėtumėte, reikia yaku.',
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: 'Be yaku nėra laimėjimo',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: '4 grupių ir 1 poros nepakanka. Rankai reikia bent vieno **yaku**, taškų sąlygos. Be yaku ranka vis tiek gali būti tenpai, ir lygiosiose tai skaičiuojama. Tik laimėti ji negali.',
          },
          {
            type: 'tip',
            md: 'Pagal tikras taisykles laimėjimas be yaku yra chombo, sunkus pažeidimas.',
          },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: 'Yaku pradžiai',
        termos: [
          'riichi',
          'yaku:menzen-tsumo',
          'yaku:tanyao',
          'yaku:yakuhai',
          'yaku:pinfu',
          'ryanmen',
          'yaku:iipeikou',
          'yaku:chanta',
          'yaku:toitoi',
          'yaku:chinitsu',
          'yaku:honitsu',
          'yaku:chiitoitsu',
        ],
        blocks: [
          {
            type: 'text',
            md: 'Pradėkite nuo šių penkių: su jais jau laimėsite daugumą rankų. Palieskite kiekvieną, kad pamatytumėte, kaip jis veikia.',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: 'Riichi',
                badge: 'tik uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Dažniausias yaku. Turėdami **uždarą** ranką tenpai būsenoje, pasakote „Riichi“ ir išmetate akmenį šonu.',
                  },
                  {
                    type: 'text',
                    md: 'Vien jis jau padaro ranką galiojančią. Paskelbus ranka nebegali būti keičiama.',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: 'Menzen Tsumo',
                badge: 'tik uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Laimėjimas tsumo būdu (su ištrauktu akmeniu) turint **uždarą** ranką.',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: "Tan'yao",
                badge: 'atvira arba uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Tik akmenys nuo 2 iki 8, be kraštinių ir be garbės akmenų.',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: "Prie kai kurių stalų Tan'yao galioja tik su uždara ranka. Susitarkite prieš žaisdami.",
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: 'Yakuhai',
                badge: 'atvira arba uždara',
                blocks: [
                  { type: 'text', md: '**Drakono**, **raundo vėjo** arba **jūsų vietos vėjo** trejetas.' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: 'Kurie vėjai tinka' },
                  {
                    type: 'text',
                    md: 'Kiekvienas žaidėjas turi **savo vietos vėją** (tą, kurį ištraukė burtuose). Visas stalas turi **raundo vėją**: tonpuusen žaidime tai Rytai.',
                  },
                  {
                    type: 'text',
                    md: '- Raundo vėjas: yaku visiems.\n- Jūsų vietos vėjas: yaku tik jums.\n- Jei raundo vėjas yra ir jūsų, jis vertas ==dvigubai==.\n- Niekieno vėjas yaku neduoda.',
                  },
                  {
                    type: 'text',
                    md: 'Pavyzdys: Rytų raunde Rytai tinka visiems. **Oya** tai ir vietos vėjas: vertas dvigubai.',
                  },
                  {
                    type: 'tip',
                    md: 'Galioja ir su **atvira** ranka: drakono ar vertingo vėjo pon jau duoda rankai yaku.',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: 'Pinfu',
                badge: 'tik uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Tik sekos, pora, kuri nėra nei drakonas, nei vertingas vėjas (jūsų ar raundo), ir dvipusis laukimas (ryanmen).',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: 'Ranka tenpai būsenoje',
                    after: '1s4s',
                    afterLabel: 'laukimas',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: 'Kitam žingsniui' },
          {
            type: 'text',
            md: 'Kai šie penki taps įprasti, prie stalo dažnai pasirodo ir šie:',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: 'Iipeikou',
                badge: 'tik uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Dvi ==vienodos== tos pačios rūšies sekos.',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: 'Chanta',
                badge: 'atvira arba uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Visose grupėse **ir poroje** yra kraštinis (1 ar 9) arba garbės akmuo. Reikia bent vienos sekos.',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: 'Toitoi',
                badge: 'atvira arba uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Tik trejetai (ar kan) ir pora. ==Jokių sekų==.',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: "Hon'itsu",
                badge: 'atvira arba uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Visa ranka iš **vienos rūšies** ir garbės akmenų.',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: "Chin'itsu",
                badge: 'atvira arba uždara',
                blocks: [
                  {
                    type: 'text',
                    md: 'Visa ranka iš **vienos rūšies**, ==be garbės akmenų==.',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: 'Chiitoitsu',
                badge: 'tik uždara',
                blocks: [
                  {
                    type: 'text',
                    md: '**Septynios skirtingos poros**. Tai vienintelė ranka, nesilaikanti 4 grupių + 1 poros formulės.',
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: 'Poros turi būti skirtingos: keturi vienodi akmenys nėra dvi poros.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Atvira ranka su chi, be garbės akmenų trejeto. Ar ji turi yaku?',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          "Ne. Ji turi kraštinių (nėra Tan'yao), yra atvira (nėra Riichi, Menzen Tsumo ir Pinfu) ir neturi vertingo trejeto (nėra Yakuhai).",
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: 'Taškai',
    cover: 'Kiek verta jūsų ranka ir kaip mokėti.',
    coverTip:
      'Ar jau sužaidėte raundą, kuriame yaku privalomas? Jei ne, **sužaiskite dabar**, dar neskaičiuodami taškų, ir grįžkite.',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: 'Lazdelės',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: 'Taškai skaičiuojami lazdelėmis. Kiekvienas žaidėjas pradeda su **25 000**:',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: '1 000 taškų lazdelė yra ir Riichi statymas. 100 taškų lazdelės skaičiuoja honba.',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: 'Han ir fu',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: 'Vertė priklauso nuo **han** (yaku ir dora) ir **fu** (rankos forma). Skaičiuoklė viską apskaičiuoja.',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['Yaku', 'Han'],
            rows: [
              ['Riichi', hanYaku('riichi')],
              ['Menzen Tsumo', hanYaku('menzen-tsumo')],
              ["Tan'yao", hanYaku('tanyao')],
              ['Yakuhai', `${hanYaku('yakuhai')} už trejetą`],
              ['Pinfu', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: "Yaku sumuojami. Riichi + Tan'yao + Pinfu + Menzen Tsumo = **4 han**.",
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: 'Taškų ribos',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: 'Nuo 5 han ranka pasiekia ribą su fiksuota verte. **Ko** yra kiekvienas, kuris nėra oya.',
          },
          {
            type: 'table',
            headers: ['Riba', 'Han', 'Ko', 'Oya'],
            rows: [
              linhaPatamar('Mangan', '5', BASE_PATAMAR.mangan),
              linhaPatamar('Haneman', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('Baiman', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('Sanbaiman', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('Yakuman', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: 'Oya laimėjęs gauna **1,5×** taškų.' },
          { type: 'tip', md: 'Su 3 ar 4 han fu gali pakelti ranką iki Mangan.' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: 'Kas moka',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **Ron**: viską moka išmetęs žaidėjas.\n- **Tsumo**: moka visi. Jei laimėtojas nėra oya, oya moka pusę, o kiti du dalijasi likutį.',
          },
          {
            type: 'text',
            md: 'Laimėtojas taip pat pasiima ant stalo esančius Riichi statymus (po 1 000).',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: 'Riichi statymas',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Skaičiuojant taškus, Riichi paskelbęs žaidėjas į stalo centrą padeda **1 000** taškų lazdelę.',
          },
          {
            type: 'text',
            md: '- Kad paskelbtumėte, reikia turėti bent 1 000 taškų.\n- Mahjong Soul ir Tenhou sienoje dar turi būti likę bent 4 akmenys. Prie gyvo stalo tai priklauso nuo taisyklių.\n- Jei Riichi akmuo kam nors duoda ron, statymas nedaromas.\n- Rankos laimėtojas pasiima statymus nuo stalo.\n- Jei niekas nelaimi, statymai lieka ant stalo kitai rankai.',
          },
          {
            type: 'tip',
            md: 'Riichi laimėtojui taip pat atskleidžia Ura-dora; žr. {{onde:dora}}.',
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: 'Honba ir lygiosios',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: 'Kiekviena honba ant stalo laimėtojui prideda 300 taškų. Tsumo atveju kiekvienas moka po 100 daugiau. Ron atveju išmetęs moka 300. Ši suma pridedama atskirai: jos nekeičia ribinės rankos ir oya 1,5×.',
          },
          {
            type: 'text',
            md: 'Jei siena baigiasi be laimėtojo, ne tenpai žaidėjai iš viso sumoka 3 000 tenpai žaidėjams.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Ko laimi Mangan tsumo būdu. Kiek moka oya?',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}, pusę. Kiti du moka po ${pontos(BASE_PATAMAR.mangan)}.`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: 'Dora',
    cover: 'Premijiniai akmenys, kurie padaro ranką vertingesnę.',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: 'Indikatorius ir dora',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Prisimenate apverstą akmenį mirusioje sienoje? Tai **indikatorius**. Indikatorius nėra dora: **dora** yra po jo einantis akmuo. Kiekviena dora rankoje verta 1 han.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Atverta siena iš priekio: traukimas kairėje, anga ir mirusi siena dešinėje, dora indikatorius apverstas 3 stulpelyje nuo angos.',
            caption: 'Indikatorius lieka apverstas mirusioje sienoje.',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: 'Indikatorius Man 3',
            after: '4m',
            afterLabel: 'dora',
          },
          { type: 'tip', md: 'Dora nėra yaku. Be yaku ji nepadeda laimėti.' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: 'Tvarka',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Kiekvienas akmuo nurodo kitą. Kiekvienos eilės pabaigoje skaičiavimas grįžta į pradžią. Jei du indikatoriai rodo tą patį akmenį, kiekviena jo kopija rankoje verta 2 han.',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: 'Raudonas 5',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Kiekvienas raudonas 5 (Aka dora) prideda 1 han, o rankoje veikia kaip įprastas 5. Jei 5 taip pat yra dora, raudonas 5 vertas 2 han. Apverstas kaip indikatorius, jis laikomas įprastu 5.',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: 'Ne prie kiekvieno stalo žaidžiama su raudonais penketais. Susitarkite prieš žaisdami.',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '9.4',
        title: 'Ura-dora',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Laimėjęs paskelbus **Riichi** atskleidžia akmenį po kiekvienu dora indikatoriumi. Tai **Ura-dora**: veikia kaip dar vienas indikatorius, bet tik laimėtojui.',
          },
          { type: 'tip', md: 'Be Riichi nėra Ura-dora. Dar viena priežastis jį paskelbti.' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Indikatorius yra Raudonas drakonas. Kuris akmuo yra dora?',
        hand: '7z',
        options: [
          { label: 'Baltas', mpsz: '5z', correct: true },
          { label: 'Žalias', mpsz: '6z' },
          { label: 'Raudonas', mpsz: '7z' },
        ],
        answer: 'Baltas drakonas: Raudonas → Baltas.',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: 'Kan',
    cover: 'Keturi vienodi akmenys, vienas papildomas akmuo ir dar viena dora.',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: 'Trys kan rūšys',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: 'Keturi vienodi akmenys. Kan galima padaryti trimis būdais:' },
          {
            type: 'text',
            md: '- **Atviras kan**: turite tris vienodus, o kažkas išmeta ketvirtą. Galima su bet kuriuo žaidėju, kaip ir pon.\n- **Uždaras kan**: visi keturi yra jūsų rankoje. Parodykite ant stalo, abu galus apvertę.\n- **Pridėtas kan**: jau turite pon ir ištraukiate ketvirtą. Jis dedamas ant šonu pasukto akmens.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: 'Atviras kan (iš priešais)' },
              { mpsz: '1111m', viradas: [0, 3], caption: 'Uždaras kan' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: 'Pridėtas kan' },
            ],
          },
          {
            type: 'text',
            md: 'Atviras ir pridėtas kan palieka ranką **atvirą**. Uždaras kan, padarytas tik iš jūsų rankos akmenų, palieka ranką **uždarą**.',
          },
          { type: 'tip', md: 'Kan pirmenybė tokia pati kaip pon.' },
          { type: 'heading', text: 'Kan per Riichi' },
          {
            type: 'text',
            md: 'Paskelbę Riichi dar galite padaryti **uždarą kan**: jei kitus tris jau turėjote rankoje ir ==ketvirtą patys ištraukėte== iš sienos. Negalima tik tada, kai kan pakeičia jūsų laukimą.',
          },
          {
            type: 'tip',
            md: 'Su kito žaidėjo išmestu akmeniu **negalima**: per Riichi negalima daryti nei atviro kan, nei pon, nes ranka nebegali keistis.',
          },
          { type: 'heading', text: 'Kan pavojus' },
          {
            type: 'text',
            md: 'Kiekvienas kan prideda ==dar vieną dora indikatorių== (kan dora), ir jis galioja **visiems** prie stalo, ne tik padariusiam kan. Laimėjęs per Riichi dar pažiūri ir Ura-dora po juo: dar viena dora galimybė.',
          },
          {
            type: 'tip',
            md: 'Todėl pagalvokite prieš darydami kan: nauja dora gali padaryti vertingesnę ranką to, kuris laimės prieš jus.',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: 'Pakaitinis akmuo ir kan dora',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Kai grupėje yra keturi akmenys, rankoje vieno trūksta. Po bet kurio kan ištraukiate **pakaitinį** akmenį iš mirusios sienos ir apverčiamas naujas dora indikatorius. Tada išmetate.',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: 'Mirusi siena iš priekio, 7 stulpeliai sunumeruoti nuo angos. Viršutinis 1 stulpelio akmuo padėtas ant stalo, atskirai šalia: tai kan pakaitinis akmuo. 3 stulpelyje apverstas dora indikatorius, o 4 stulpelyje – kan dora indikatorius.',
            caption:
              'Po kan: pakaitinis akmuo imamas iš 1 stulpelio, o kan dora apverčiama 4-ajame.',
          },
          {
            type: 'text',
            md: '1 ir 2 stulpeliai prie angos saugo **kan pakaitinius akmenis**: padaręs kan pirmiausia ištraukia viršutinį 1 stulpelio akmenį. Prie daugelio stalų šis akmuo iš anksto nuleidžiamas ant stalo, atskirai šalia, kad imant niekas nenugriautų sienos.',
          },
          {
            type: 'text',
            md: 'Kiekvienas kan apverčia dar vieną indikatorių, **kan dora**: viršutinį kito stulpelio akmenį (4-ojo, paskui 5-ojo…). Jis veikia kaip pirmasis indikatorius.',
          },
          {
            type: 'text',
            md: 'Kan negalima skelbti, kai siena baigėsi: nebėra pakaitinio akmens.',
          },
          {
            type: 'tip',
            md: 'Kada apverčiamas kan dora, priklauso nuo taisyklių. Mahjong Soul ir Tenhou uždaras kan jį apverčia iš karto. Atviras ir pridėtas kan jį apverčia tik po jūsų išmetimo.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Padariau uždarą kan. Ar mano ranka vis dar uždara?',
        options: simNao(true),
        answer:
          'Taip. Uždaras kan daromas tik iš jūsų rankos akmenų, be kitų žaidėjų išmestų akmenų.',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: 'Partijos pabaiga',
    cover: 'Lygiosios, kitas oya ir kada partija baigiasi.',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: 'Lygiosios',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'Ranka gali baigtis ir **be laimėtojo**. Kai ==lieka tik mirusi siena== ir niekas neužbaigė rankos, tai **lygiosios**.',
          },
          {
            type: 'text',
            md: 'Kiekvienas pasako, ar yra tenpai. Tie, kurie yra, parodo ranką. Kiti yra **noten** ir gali palikti ranką apverstą.',
          },
          {
            type: 'tip',
            md: 'Skaičiuojant taškus, ne tenpai žaidėjai moka tenpai žaidėjams. Žr. „Honba ir lygiosios“, {{onde:pontos}}.',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: 'Kita ranka',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- Jei oya laimėjo arba per lygiąsias buvo tenpai, jis **lieka oya**, o ranka kartojama (renchan).\n- Kitu atveju Rytai pereina kitam žaidėjui.',
          },
        ],
      },
      {
        id: 'fim',
        number: '5.3',
        title: 'Tonpuusen',
        blocks: [
          {
            type: 'text',
            md: 'Pradžiai sužaiskite **tonpuusen**: kiekvienas žaidėjas bent kartą būna oya. Kai paskutinis oya perduoda Rytus, partija baigiasi.',
          },
          {
            type: 'text',
            md: 'Pirmosiose partijose, neskaičiuojant taškų, laimi daugiausia rankų laimėjęs. Pradėjus skaičiuoti, laimi turintis daugiausia taškų, o partija baigiasi ir tada, kai kas nors lieka su neigiamais taškais.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Oya laimėjo ranką. Kas bus kitos rankos oya?',
        options: [
          { label: 'Tas pats žaidėjas', correct: true },
          { label: 'Žaidėjas jam iš dešinės' },
          { label: 'Laimėjęs dar ankstesnę ranką' },
        ],
        answer: 'Tas pats žaidėjas. Kai oya laimi, jis lieka oya, o ranka kartojama.',
      },
      {
        type: 'quiz',
        question: 'Siena baigėsi ir niekas nelaimėjo. Oya nebuvo tenpai. Kas bus kitos rankos oya?',
        options: [
          { label: 'Tas pats žaidėjas' },
          { label: 'Žaidėjas jam iš dešinės', correct: true },
          { label: 'Buvęs tenpai' },
        ],
        answer:
          'Žaidėjas jam iš dešinės. Per lygiąsias oya lieka tik būdamas tenpai; kitu atveju Rytai pereina toliau.',
      },
    ],
  },
]

const topicosRegras: TopicoRegras[] = [
  {
    id: 'furiten',
    section: 'regras',
    title: 'Furiten',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Esant furiten negalima laimėti ron būdu, tik tsumo. Tai galioja ==visiems== jūsų laukiamiems akmenims, ne tik tam, dėl kurio atsirado furiten. Paskelbti ron esant furiten paprastai yra chombo.',
      },
      {
        type: 'text',
        md: '- **Dėl išmestų akmenų**: akmuo, kuris užbaigtų jūsų ranką, yra tarp jūsų išmestų akmenų. Trunka, kol pakeisite laukimą.\n- **Laikinas**: praleidote akmenį, kuris užbaigtų ranką, nepaskelbę ron. Trunka iki kito jūsų išmetimo.\n- **Po Riichi**: paskelbę Riichi praleidote akmenį, kuris užbaigtų ranką. Trunka iki rankos pabaigos.',
      },
      {
        type: 'tip',
        md: 'Svarbu rankos forma, ne yaku. Jei akmuo užbaigtų ranką, furiten galioja net jei su juo neturėtumėte yaku laimėti.',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: 'Draudžiamas keitimas (kuikae)',
    blocks: [
      {
        type: 'text',
        md: 'Iškart po chi ar pon to paties ėjimo išmetimas turi apribojimų. Skelbti vien tam, kad pakeistumėte akmenį kitu, atliekančiu tą patį vaidmenį, vadinama **kuikae**, ir tai draudžiama.',
      },
      { type: 'heading', text: 'Tas pats akmuo' },
      {
        type: 'text',
        md: 'Negalite išmesti tokio paties akmens, kokį ką tik paėmėte. Tai galioja ir chi, ir pon.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '555p',
            deLado: 1,
            caption: 'Pon su Pin 5: jei rankoje dar turite kitą Pin 5, jo dabar išmesti negalima',
          },
        ],
      },
      { type: 'heading', text: 'Kitas sekos galas' },
      {
        type: 'text',
        md: 'Jei chi darote su dviem gretimais akmenimis, draudžiamas ir akmuo kitame sekos gale: su juo seka būtų ta pati, tik pasislinkusi.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '234m',
            deLado: 0,
            caption: 'Chi su Man 2, turint 3-4: negalima išmesti nei Man 2, nei Man 5',
          },
          {
            mpsz: '867s',
            deLado: 0,
            caption: 'Chi su Sou 8, turint 6-7: negalima išmesti nei Sou 8, nei Sou 5',
          },
        ],
      },
      {
        type: 'text',
        md: 'Chi su viduriniu akmeniu (3 su 2-4) arba uždarame krašte (3 su 1-2) draudžia tik tokį patį akmenį: kito galo nėra.',
      },
      { type: 'heading', text: 'Kodėl tai draudžiama' },
      {
        type: 'text',
        md: 'Skelbimai skirti rankai pastūmėti į priekį. Su kuikae ranka nepasistūmi, nes išmetamas akmuo užbaigtų tą pačią grupę. Be šios taisyklės būtų galima skelbti vien tam, kad trukdytumėte: nutraukti kieno nors Ippatsu arba pakeisti, kas paims paskutinį sienos akmenį.',
      },
      {
        type: 'tip',
        md: 'Jei po skelbimo liktų išmesti tik draudžiami akmenys, skelbti negalima. Mahjong Soul ir Tenhou pats žaidimas to neleidžia. Prie gyvo stalo tas, kas padaro kuikae, lieka su mirusia ranka: toliau traukia ir išmeta, bet nebegali laimėti šios rankos. Kai kurios senesnės taisyklės draudžia tik tokį patį akmenį, kokį paėmėte, todėl susitarkite prieš žaidimą.',
      },
      {
        type: 'quiz',
        question: 'Turite Pin 5-6 ir darote chi su Pin 4. Ko negalite išmesti tą patį ėjimą?',
        hand: '56p',
        options: [
          { label: 'Pin 4 ir 7', correct: true },
          { label: 'Tik Pin 4' },
          { label: 'Pin 4 ir 6' },
        ],
        answer:
          'Pin 4 ir 7. Pin 4 – akmuo, kurį paėmėte; išmetus 7, tie patys 5-6 sudarytų 5-6-7, kitą galą.',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: 'Yaku sąrašas',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'Visi yaku su kiekvieno han esant uždarai ir atvirai rankai. **—** reiškia, kad galioja tik su uždara ranka, o **Y** yra yakuman. Palieskite yaku, kad pamatytumėte pavyzdį. Jei ranką galima perskaityti keliais būdais, skaičiuojamas tas, kuris duoda daugiausia taškų. Yakuman nesumuojami su paprastais yaku.',
      },
      ...grupoYakus('Sekos', [
        ['pinfu', 'Tik sekos, poros be vertės ir dvipusis laukimas'],
        ['iipeikou', 'Dvi vienodos tos pačios rūšies sekos'],
        ['ryanpeikou', 'Dukart po dvi vienodas sekas'],
        ['sanshoku-doujun', 'Ta pati seka visose trijose rūšyse'],
        ['ittsuu', 'Tos pačios rūšies 1-2-3, 4-5-6 ir 7-8-9'],
      ]),
      ...grupoYakus('Trejetai', [
        ['toitoi', 'Keturi trejetai ir pora'],
        ['sanankou', 'Trys trejetai, sudaryti nešaukiant'],
        ['sanshoku-doukou', 'Tas pats trejetas visose trijose rūšyse'],
        ['sankantsu', 'Trys kan'],
        ['chiitoitsu', 'Septynios skirtingos poros'],
      ]),
      ...grupoYakus('Kraštiniai ir garbės akmenys', [
        ['tanyao', 'Tik akmenys nuo 2 iki 8'],
        ['yakuhai', 'Drakono ar vertingo vėjo trejetas'],
        ['shousangen', 'Du drakonų trejetai ir trečiojo pora'],
        ['chanta', 'Kraštinis ar garbės akmuo visose grupėse ir poroje'],
        ['junchan', 'Kraštinis visose grupėse ir poroje, be garbės akmenų'],
        ['honroutou', 'Tik kraštiniai ir garbės akmenys'],
      ]),
      ...grupoYakus('Rūšis', [
        ['honitsu', 'Tik viena rūšis, su garbės akmenimis'],
        ['chinitsu', 'Tik viena rūšis, be garbės akmenų'],
      ]),
      ...grupoYakus('Kiti', [
        ['riichi', 'Paskelbti tenpai su uždara ranka'],
        ['double-riichi', 'Riichi jau per pirmąjį išmetimą'],
        ['ippatsu', 'Laimėti iki kito savo išmetimo po Riichi, be skelbimų tarp jų'],
        ['menzen-tsumo', 'Tsumo su uždara ranka'],
        ['haitei', 'Tsumo su paskutiniu sienos akmeniu'],
        ['houtei', 'Ron su paskutiniu išmestu akmeniu'],
        ['rinshan', 'Laimėti su kan pakaitiniu akmeniu'],
        ['chankan', 'Ron ant akmens, kurį kitas prideda prie pon'],
        ['renhou', 'Ron prieš pirmąjį traukimą'],
      ]),
      ...grupoYakus('Yakuman', [
        ['kokushi', 'Po vieną kiekvieno kraštinio ir garbės akmens, vienas pasikartoja'],
        ['suuankou', 'Keturi trejetai, sudaryti nešaukiant'],
        ['daisangen', 'Visų trijų drakonų trejetai'],
        ['shousuushii', 'Trys vėjų trejetai ir ketvirtojo pora'],
        ['daisuushii', 'Visų keturių vėjų trejetai'],
        ['tsuuiisou', 'Tik garbės akmenys'],
        ['chinroutou', 'Tik kraštiniai'],
        ['ryuuiisou', 'Tik žali akmenys'],
        ['chuuren', 'Vienos rūšies 1-1-1-2-3-4-5-6-7-8-9-9-9 ir dar vienas'],
        ['suukantsu', 'Keturi kan'],
        ['tenhou', 'Oya laimi su gautais akmenimis'],
        ['chiihou', 'Laimėti tsumo per pirmąjį traukimą'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('lt').notaKazoe },
    ],
  },
  {
    id: 'yakus-locais',
    section: 'regras',
    title: 'Local yaku',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'Besides the yaku on the list, many tables play with **house rules**: yaku outside the standard rules that change from club to club. So ==agree before playing== which ones count at your table.',
      },
      { type: 'heading', text: 'A few examples' },
      {
        type: 'text',
        md: '- **Renhou**: a non-dealer wins by Ron before their first draw. Depending on the house, it is worth Mangan, Baiman or Yakuman.\n- **Daisharin**: 22334455667788 in Pin. Seven pairs in a ladder, paid as Yakuman.\n- **Paarenchan**: eight wins in a row. The eighth is a Yakuman, as long as the hand has a yaku.',
      },
      { type: 'hand', mpsz: '22334455667788p', caption: 'Daisharin' },
      {
        type: 'tip',
        md: 'To use any of them in the calculator, turn it on in **Calculation rules → Local yaku**. They all start off. The full list, with each value, is in the Local yaku tab of the Pocket guide.',
      },
    ],
  },
  {
    id: 'chombo',
    section: 'chombo-honba',
    title: 'Chombo',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: 'Sunkus pažeidimas, sugadinantis ranką taip, kad jos nebeįmanoma atitaisyti. Dažniausi atvejai:\n- Paskelbti laimėjimą su nebaigta ranka, be yaku arba esant furiten.\n- Paskelbti Riichi nesant tenpai. Tai paaiškėja, kai ranka baigiasi lygiosiomis ir ją reikia parodyti.\n- Po Riichi padaryti uždarą kan, kuris pakeičia laukimą.\n- Nugriauti sieną arba per klaidą atskleisti ranką.',
      },
      {
        type: 'text',
        md: 'Ranka panaikinama ir žaidžiama iš naujo su tuo pačiu honba skaičiumi, o kas joje paskelbė Riichi, atsiima statymą. Dažniausia bauda yra sumokėti Mangan kaip per tsumo. Jei suklydo ko, jis moka 4 000 oya ir po 2 000 kitiems. Jei suklydo oya, jis moka po 4 000 kiekvienam. Turnyruose bauda paprastai didesnė, o laisvai žaidžiant jos gali ir nebūti. Susitarkite prieš žaisdami.',
      },
    ],
  },
  {
    id: 'honba',
    section: 'chombo-honba',
    title: 'Honba',
    termos: ['honba'],
    blocks: [
      {
        type: 'text',
        md: '**Honba** skaičius padidėja vienu, kai laimi oya arba kai ranka baigiasi be laimėtojo, net jei Rytai pereina kitam. Oya padeda ant stalo 100 taškų lazdelę, kad būtų matyti, kiek jų yra. Kai laimi ko, skaičius grįžta į nulį.',
      },
      {
        type: 'tip',
        md: 'Kiekviena honba padaro kitą pergalę brangesnę. Kiek – pamatysite {{onde:pontos}}.',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: 'Hanchan: Rytai ir Pietūs',
    blocks: [
      {
        type: 'text',
        md: 'Standartinė klubų ir turnyrų partija. Kai visi pabuvo oya Rytų raunde, prasideda **Pietų** raundas, ir kiekvienas vėl būna oya.',
      },
      {
        type: 'text',
        md: 'Pietų raunde raundo vėjas tampa Pietūs. Tai trunka dvigubai ilgiau nei tonpuusen ir duoda daugiau laiko atgauti taškus.',
      },
      {
        type: 'tip',
        md: '**Niekas nepasiekė 30 000?** Prie daugelio stalų, pavyzdžiui, Mahjong Soul ir Tenhou, partija tęsiasi **Vakarų** raunde, kol kas nors viršija 30 000. Pagal EMA taisykles ji bet kuriuo atveju baigiasi po Pietų.',
      },
    ],
  },
  {
    id: 'sanma',
    section: 'regras',
    title: "Sanma: 3 žaidėjai",
    blocks: [
      { type: 'text', md: "**Sanma** yra Riichi trims žaidėjams, populiarus Japonijoje ir Mahjong Soul. Taisyklės tos pačios, su skirtumais žemiau." },
      { type: 'heading', text: "Plytelės" },
      { type: 'text', md: "Išimamos **Man nuo 2 iki 8** plytelės ir lieka 108. Iš Man lieka tik 1 ir 9. Raudonas 5 yra tik Pin ir Sou." },
      { type: 'hand', mpsz: '19m', caption: "Iš Man lieka tik šios" },
      { type: 'heading', text: "Stalas ir šaukimai" },
      { type: 'text', md: "- Yra tik Rytų, Pietų ir Vakarų vietos.\n- Pon ir Kan lieka, ==nėra tik Chi==.\n- Kai indikatorius 1m, dora yra 9m, o kai 9m, dora yra 1m.\n- Nėra lygiųjų dėl keturių vėjų, keturių Riichi ar trigubo ron. Kyuushu kyuuhai lieka." },
      { type: 'heading', text: "Kita (Šiaurė)" },
      { type: 'text', md: "Turėdami Šiaurę rankoje galite daryti **Kita**: padedate ją šalia rankos ir imate pakaitinę plytelę. Kiekvienas Kita vertas **1 dora** (nukidora). Tai ne šaukimas, todėl ranka lieka uždara ir Tan'yao negenda. Kai indikatorius Vakarai, kiekvienas Kita vertas 2." },
      { type: 'hand', mpsz: '4z', caption: "Kiekviena atidėta Šiaurė yra 1 dora" },
      { type: 'heading', text: "Yaku" },
      { type: 'text', md: "- **Sanshoku doujun** ir Man **Ittsu** neįmanomi.\n- Kokushi, Chinroutou ir Sanshoku doukou galimi, nes yra 1m ir 9m.\n- Po Kita nebėra Tenhou ir Chiihou. Laimėjimas su Kita pakaitine plytele yra Rinshan.\n- Paprastai Šiaurė rankoje nėra yakuhai." },
      { type: 'heading', text: "Mokėjimai" },
      { type: 'text', md: "Ron moka tiek pat kaip su 4. Per tsumo moka tik 2. Pagal dažniausią **tsumo-son** taisyklę Šiaurės dalis prarandama: ne dalytojo Mangan yra 6 000, o ne 8 000. Kai kur ta dalis padalijama dviem mokantiesiems. Noten iš viso 2 000, o ne 3 000." },
      { type: 'tip', md: "Pasirinkite 3 žaidėjus Rankos skaičiuoklės, Han ir Fu, Partijos ir Turnyro nustatymuose, kad programa viską skaičiuotų kaip Sanma." },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: '5 blokai',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: 'Pilna ranka turi **5 blokus**: 4 grupes ir 1 porą. Todėl ranka juda greičiau, kai laikote ją iš ==5 blokų==, kurių kiekvienas baigtas arba beveik baigtas.',
      },
      {
        type: 'text',
        md: 'Blokas yra pora, trejetas, seka arba beveik baigta grupė (du akmenys, laukiantys trečiojo).',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['Pora', 'Trejetas', 'Seka', 'Beveik baigta'],
        caption: 'Keturi blokų tipai',
      },
      { type: 'tip', md: 'Netaikoma Chiitoitsu (septynioms poroms) ir Kokushi musou.' },
      { type: 'heading', text: 'Pavyzdys' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['Seka', 'Vidurinis', 'Pora', 'Vidurinis', 'Beveik baigta', 'Krašto'],
      },
      {
        type: 'text',
        md: 'Tai **6 blokai** 5 vietoms: vienas turi išeiti. Kuris?',
      },
      {
        type: 'text',
        md: '- **345m ir 55p** jau baigti: lieka.\n- **778s** priima Sou 6, 7 ir 9: puiku, lieka.\n- **24m ir 46p** laukia viduryje (3m ir 5p), bet tampa dvipusiai, jei ateina 5m arba 3p ar 7p.\n- **12s** laukia krašte, ir jį užbaigia tik 3s: tai ==blogiausias blokas==.',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: 'Išardykite blogiausią bloką, pradėdami nuo Sou 1',
        after: '3s',
        afterLabel: 'tik laukia',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: 'Pirmieji išmetimai',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: 'Efektyvumas – tai greičiau pasiekti tenpai, paliekant formas, kurios priima **daugiau akmenų**.',
      },
      {
        type: 'text',
        md: 'Turėdami ==pavienius== akmenis (be poros ir be tos pačios rūšies kaimyno), išmeskite šia tvarka, nuo pirmo iki paskutinio:',
      },
      { type: 'hand', mpsz: '234z', caption: '1. Vėjai, kurie nėra nei jūsų, nei raundo' },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. Kraštiniai (1 ir 9)' },
      { type: 'hand', mpsz: '567z', caption: '3. Drakonai' },
      { type: 'hand', mpsz: '1z', caption: '4. Paskiausiai jūsų ir raundo vėjai' },
      {
        type: 'text',
        md: 'Kurie vėjai jums duoda yaku, rašoma prie Yakuhai; žr. {{onde:yakus}}. Rytų raunde **oya** laiko Rytus iki galo: jam jie verti dvigubai. Kitiems Rytai verti tiek pat, kiek drakonas.',
      },
      {
        type: 'tip',
        md: 'Nelaikykite vertingo garbės akmens amžinai: jei per kelis ratus jis nesudarė poros, išmeskite anksti. Vėliau jis gali būti būtent tas akmuo, kurio laukia kitas žaidėjas.',
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: 'Kada tvarka keičiasi',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: 'Pora nėra pavienis akmuo' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: 'Vėjo be vertės pora ir kraštinių pora: lieka',
      },
      {
        type: 'text',
        md: 'Vėjo be vertės pora gali būti rankos pora (net ir Pinfu), o kraštinių pora taip pat lieka.',
      },
      { type: 'heading', text: 'Kraštinis su kaimynu nėra pavienis' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1 su 2 arba 1 su 3: jau pusė grupės',
      },
      { type: 'heading', text: '1 šalia 4' },
      { type: 'hand', mpsz: '14p', caption: '1 šalia 4 (arba 9 šalia 6): išeina 1' },
      {
        type: 'text',
        md: '1 beveik nepadeda, kai turite tos pačios rūšies 4: jam tinkantys 2 ir 3 ==geriau dera su 4==.',
      },
      { type: 'heading', text: 'Kiti atvejai' },
      {
        type: 'text',
        md: "- **Jau išmestas garbės akmuo** vertas mažiau: lieka mažiau kopijų porai.\n- **Tokie yaku kaip Hon'itsu ir Chanta** viską pakeičia: tada garbės akmenys ir kraštiniai gali būti vertingesni.",
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: 'Kiek akmenų padeda',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'Kodėl tokia tvarka? Suskaičiuokite, kiek akmenų paverčia pavienį akmenį pora arba puse grupės. Kuo daugiau padeda, tuo labiau verta laikyti.',
      },
      {
        type: 'table',
        headers: ['Pavienis akmuo', 'Padedantys akmenys'],
        rows: [
          ['Garbės', '3 (tik pora)'],
          ['1 ir 9', '11'],
          ['2 ir 8', '15'],
          ['3–7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: 'Pavienis Pin 1: padeda pora, 2 ir 3',
        after: '1p2p3p',
        afterLabel: 'padeda',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: 'Pavienis Pin 5: padeda pora ir nuo 3 iki 7',
        after: '3p4p5p6p7p',
        afterLabel: 'padeda',
      },
      {
        type: 'tip',
        md: 'Vien pagal skaičių: 3–7 > 2 ir 8 > 1 ir 9 > garbės akmenys. Garbės akmenį iš eilės galo iškelia tik yaku, kurį jis gali duoti.',
      },
      { type: 'heading', text: 'Rinkitės dvipusius laukimus' },
      {
        type: 'text',
        md: 'Suskaičiuokite, kiek akmenų tinka: kiekvieno tipo yra 4 kopijos.',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: 'Dvipusis: iki 8 akmenų',
        after: '14m',
        afterLabel: 'laukimas',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: 'Vidurinis: iki 4 akmenų',
        after: '2m',
        afterLabel: 'laukimas',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: 'Krašto: iki 4 akmenų',
        after: '3m',
        afterLabel: 'laukimas',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: 'Pulti ar gintis?',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: 'Kai kas nors paskelbia Riichi, pažiūrėkite į savo ranką. **Shanten** rodo, kiek liko iki tenpai: esant 1-shanten trūksta vieno akmens, esant 2-shanten – dviejų.',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: 'Tenpai: laukia Pin 6 arba 9',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1-shanten: iki tenpai trūksta vieno akmens',
      },
      {
        type: 'text',
        md: '- **Tenpai**: pulti dažniausiai verta, ypač jei esate oya. Priklauso nuo rankos vertės.\n- **1-shanten**: pagalvokite, ar dar daug akmenų padeda ir ar ranka verta rizikos.\n- **2-shanten ar daugiau**: ==ginkitės==.',
      },
      { type: 'heading', text: 'Ką pasverti' },
      {
        type: 'text',
        md: '- Kiek dora matoma?\n- Ar tenpai žaidėjas yra oya? Jis gauna 1,5×.\n- Kiek verta jūsų ranka?\n- Koks rezultatas?\n- Kiek rankų liko iki partijos pabaigos?',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: 'Gynyba: genbutsu',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Gintis – tai išmesti akmenį su ==mažiausia tikimybe== būti Riichi paskelbusio žaidėjo laukimu.',
      },
      {
        type: 'text',
        md: 'Viso to pagrindas yra **furiten**: jei ==bet kuris== jo laukimo akmuo yra jo išmestuose, jis negali daryti ron su jokiu laukimu, net ir su kitais.',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: 'Jei jis laukia su Sou 4-5 ir jau išmetė 3…',
        after: '3s6s',
        afterLabel: 'furiten abiem',
      },
      { type: 'heading', text: 'Genbutsu: jo paties akmenys' },
      {
        type: 'text',
        md: 'Viskas, ką Riichi žaidėjas ==jau išmetė==, prieš jį 100 % saugu: jei tas akmuo būtų jo laukimas, jis būtų furiten ir negalėtų daryti ron.',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: 'Jo išmesti akmenys: visi prieš jį saugūs',
      },
      {
        type: 'tip',
        md: 'Tik genbutsu yra 100 %. Suji, kabe ir kiti nieko negarantuoja, bet yra daug saugesni už bet kokį akmenį.',
      },
      {
        type: 'text',
        md: '**Abejodami**: pirma genbutsu, tada garbės akmenys, pasirodę du ar tris kartus, tada suji. Atsisakyti silpnos rankos – tai žaisti gerai.',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: 'Gynyba: suji',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'Riichi paskelbusio žaidėjo išmesti akmenys parodo jums saugesnius akmenis. Jei jis išmetė 4, tos pačios rūšies ==1 ir 7== tampa saugesni.',
      },
      {
        type: 'text',
        md: 'Šie skaičiai kas 3 (1-4-7, 2-5-8 ir 3-6-9) vadinami **suji**. Jie apsaugo nuo dvipusio laukimo, dažniausio iš visų.',
      },
      { type: 'heading', text: 'Kodėl tai veikia' },
      {
        type: 'text',
        md: 'Jis išmetė **Pin 5**. Jei lauktų su Pin 3-4 arba 6-7, 5 būtų vienas iš laukimų ir jis būtų furiten. Taigi šiomis dviem formomis jis ==nelaukia==:',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4 lauktų 2 arba 5: neįmanoma',
        after: '2p5p',
        afterLabel: 'laukimas',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7 lauktų 5 arba 8: neįmanoma',
        after: '5p8p',
        afterLabel: 'laukimas',
      },
      {
        type: 'text',
        md: 'Todėl **Pin 2 ir 8** tampa saugesni: tai 5 suji.',
      },
      { type: 'heading', text: 'Trys atskaitos taškai' },
      {
        type: 'text',
        md: '4, 5 ir 6 yra atskaitos taškai, nes kiekvienas pašalina ==du== dvipusius laukimus. Jei jis išmetė vieną iš jų, ==išmesti jo suji== jums saugiau:',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: 'Jis išmetė 4: 1 ir 7 galite išmesti su mažesne rizika',
        after: '1p7p',
        afterLabel: 'saugesni',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: 'Jis išmetė 5: 2 ir 8 tampa saugesni',
        after: '2p8p',
        afterLabel: 'saugesni',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: 'Jis išmetė 6: 3 ir 9 tampa saugesni',
        after: '3p9p',
        afterLabel: 'saugesni',
      },
      { type: 'heading', text: 'Ko suji neapima' },
      {
        type: 'hand',
        mpsz: '46p',
        caption: 'Vidurinis: 4-6 laukia 5 net ir išmetus 2 ir 8',
        after: '5p',
        afterLabel: 'laukimas',
      },
      {
        type: 'text',
        md: 'Suji neapsaugo nuo vidurinio laukimo, krašto laukimo (1-2 laukia 3), poros ar trejeto laukimo.',
      },
      {
        type: 'tip',
        md: 'Būtent čia slypi **suji spąstai**: taisyklę žinantis žaidėjas gali tyčia laukti suji akmens. Kaip tai daroma, sužinosite iškart po pusinio suji.',
      },
      { type: 'heading', text: 'Ne visi suji vienodi' },
      {
        type: 'text',
        md: '- **1 ir 9**: saugiausi. Jų galima laukti tik poroje arba trejete.\n- **2 ir 8**: jų galima laukti ir viduryje (2 su 1-3).\n- **3 ir 7**: mažiausiai saugūs. Jų galima laukti ir viduryje, ir krašte (3 su 1-2).',
      },
      {
        type: 'text',
        md: 'Būkite atsargūs su ==Riichi akmens== suji. Kas turi 1-3-5 ir išmeta 5, kad paskelbtų Riichi, lieka laukti 2, kuris atrodo saugus kaip 5 suji. 1 ir 9 tai neliečia.',
      },
      {
        type: 'tip',
        md: 'Kuo daugiau suji jau yra jo išmestuose, tuo pavojingesni lieka kiti akmenys: jei jis laukia iš dviejų pusių, laukimas yra viename iš likusių suji.',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: 'Gynyba: pusinis suji ir nakasuji',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: 'Pusinis suji' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: 'Jis išmetė tik 8: 5 tik šiek tiek saugesnis',
        after: '5m',
        afterLabel: 'pusiau saugus',
      },
      {
        type: 'text',
        md: '8 pašalina 6-7 (kuris lauktų 5 arba 8), bet ne 3-4. Jis vis dar gali laukti 5 su 3-4:',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: 'Vis dar įmanoma: laukia 2 arba 5',
        after: '2m5m',
        afterLabel: 'laukimas',
      },
      {
        type: 'text',
        md: 'Todėl 5 yra tik **pusinis suji**: saugiau nei nieko, bet mažiau nei tikras suji.',
      },
      { type: 'heading', text: 'Nakasuji' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: 'Jis išmetė 2 ir 8: 5 toks pat saugus kaip suji',
        after: '5s',
        afterLabel: 'saugesnis',
      },
      {
        type: 'text',
        md: 'Išmetus 2 **ir** 8, 3-4 ir 6-7 tampa neįmanomi. 5 apsaugotas iš abiejų pusių ir prilygsta ==tikram suji==. Tas pats galioja 4 (1 ir 7) ir 6 (3 ir 9).',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: 'Puolimas: suji spąstai',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Dabar iš kitos stalo pusės: besiginantis su suji mano, kad jei išmetėte 4, tai 1 ir 7 yra saugūs. **Suji spąstai** – tai ==laukti būtent to suji== forma, kurios suji neapima.',
      },
      { type: 'heading', text: 'Kaip paruošti' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: 'Turite Man 4 ir 6-8',
      },
      {
        type: 'steps',
        items: [
          '**Išmeskite masalą**: Man 4. Kitiems Man 1 ir 7 ima atrodyti saugūs.',
          'Palikite **vidurinį** laukimą: 6-8 laukia 7, išmesto 4 suji.',
          'Besiginantis su suji išmeta 7, manydamas, kad tai saugu, ir jūs darote ron.',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: 'Laukia 7, kuris dėl išmesto 4 atrodo saugus',
        after: '7m',
        afterLabel: 'laukimas',
      },
      { type: 'heading', text: 'Kitos tinkamos formos' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: 'Krašto: 8-9 laukia 7',
        after: '7m',
        afterLabel: 'laukimas',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: 'Dvi poros: laukia 1 (4 suji) arba Pin 5',
        after: '1m5p',
        afterLabel: 'laukimas',
      },
      {
        type: 'text',
        md: '==Netinka== dvipusis laukimas: išmetus 4, 5-6, laukiantis 4 arba 7, palieka jus **furiten**, nes 4 yra tarp jūsų išmestų akmenų.',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: 'Furiten: 4 yra vienas iš laukimų ir jau tarp jūsų išmestų',
        after: '4m7m',
        afterLabel: 'netinka',
      },
      { type: 'heading', text: 'Stipriausias masalas' },
      {
        type: 'text',
        md: 'Paskelbti Riichi ==pačiu masalu==. Visi žiūri į Riichi akmenį ir pasitiki jo suji. Anksti išmestas masalas taip pat padeda, nes prisideda sotogawa: išorė atrodo dar saugesnė.',
      },
      { type: 'heading', text: 'Atsargumo priemonės' },
      {
        type: 'text',
        md: '- Vidurinis ar krašto laukimas priima **mažiau akmenų** (iki 4) nei dvipusis (iki 8). Keiskite tik tada, kai spąstai to verti.\n- Tai veikia prieš tuos, kurie **ginasi su suji**. Pradedantieji išmeta neskaitydami jūsų išmetimų, o patyrę žaidėjai nepasitiki suji šalia Riichi.\n- Nepersistenkite: jei visada spendžiate spąstus, kiti nustoja pasitikėti jūsų suji.',
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: 'Gynyba: kabe',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**Kabe** reiškia sieną. Tai žiūrėjimas, kur yra 4 akmens kopijos: išmestuose, šaukimuose, dora indikatoriuje ir jūsų rankoje. Kai ==matomos visos 4==, niekas kitas negali turėti grupės, kuriai jo reikia.',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: 'Matomos visos 4 Pin 3 kopijos',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: 'Nė viena neįmanoma: visoms reikia 3',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: 'Už sienos',
        after: '1p2p',
        afterLabel: 'saugesni',
      },
      {
        type: 'tip',
        md: 'Kabe nepadaro akmens 100 % saugaus: jo vis dar galima laukti pora ar trejetu. Bet jis daug saugesnis už bet kokį akmenį.',
      },
      { type: 'heading', text: 'Kurie akmenys tampa saugesni' },
      {
        type: 'table',
        headers: ['Matomos visos 4', 'Tampa saugesni'],
        rows: [
          ['2', '1'],
          ['3', '1 ir 2'],
          ['4', '2 ir 3'],
          ['5', '3 ir 7'],
          ['6', '7 ir 8'],
          ['7', '8 ir 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: 'Su 2, 3 ar 4 saugesni tampa du akmenys ==prieš== jį. Su 6, 7 ar 8 – du akmenys ==po== jo. Su 5 – 3 ir 7.',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: 'Kraštinis: visos 4 matomos kopijos nieko neapsaugo',
      },
      { type: 'heading', text: 'No chance ir one chance' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: 'No chance: matomos visos 4',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: 'One chance: matomos 3 iš 4',
      },
      {
        type: 'text',
        md: '- **No chance**: dvipusis laukimas su juo neįmanomas, galioja ir nuo vidurinio laukimo. Tai taip pat saugu kaip suji ar net saugiau.\n- **One chance**: mažiau tikėtina, kad kas nors turi paskutinį, bet gali turėti. Labiau vertinga rankos pradžioje ir viduryje; arti pabaigos paskutinė kopija jau gali būti kieno nors rankoje.',
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: 'Gynyba: sotogawa',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Sotogawa** yra išorė. Kas vidurinį akmenį išmeta ==pačioje pradžioje== (pirmoje eilėje), greičiausiai nelaikė akmenų tarp jo ir rūšies galo: jei laikytų, jis būtų naudingas.',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'Turėdamas vieną iš šių, jis anksti neišmestų Man 3',
      },
      {
        type: 'text',
        md: 'Jei išmetė, greičiausiai jau užbaigė grupę. Akmenys iki 2 skaičių atstumu, ==rūšies galo link==, tampa šiek tiek saugesni:',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Jis anksti išmetė 3: 1 ir 2 (išorė) tampa šiek tiek saugesni',
        after: '1m2m',
        afterLabel: 'saugesni',
      },
      {
        type: 'table',
        headers: ['Išmetė anksti', 'Išorė'],
        rows: [
          ['2', '1'],
          ['3', '1 ir 2'],
          ['4', '2 ir 3'],
          ['5', '3 ir 7'],
          ['6', '7 ir 8'],
          ['7', '8 ir 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '- Geriau veikia prieš gerai žaidžiančius: idėja daro prielaidą, kad žaidėjas išmeta efektyviai.\n- Akmuo, kuris kartu yra sotogawa **ir** suji, yra saugesnis.\n- Netaikoma akmeniui, kuriuo paskelbtas Riichi, net jei anksti.',
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: 'Jis išmetė 3 ir 5: 2 yra 3 sotogawa ir 5 suji',
        after: '2p',
        afterLabel: 'daug saugesnis',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: 'Gynyba: matagi suji',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Matagi suji** yra sotogawa priešingybė: rodo ==pavojingiausius== akmenis. Žiūrima į vėlyvus išmetimus, ypač į akmenį, kuriuo paskelbtas Riichi.',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Paskelbė Riichi išmesdamas Man 3',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'Galėjo būti iš vienos iš šių formų',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: 'Rankoje liko 2-3 arba 3-4',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Taigi tikėtiniausi laukimai yra 1-4 ir 2-5',
        after: '1m4m2m5m',
        afterLabel: 'pavojingiausi',
      },
      {
        type: 'text',
        md: 'Tinka bet kuriam akmeniui: pavojingi yra dvipusiai laukimai, kurie ==apima== jį iš abiejų pusių.',
      },
      {
        type: 'tip',
        md: 'Matagi suji mokytis mintinai nereikia. Gynyboje tvarka yra genbutsu, tada suji ir kabe, tada sotogawa. Matagi suji padeda apsispręsti, ar pulti, ar trauktis.',
      },
      {
        type: 'text',
        md: `Norintiems daugiau: [Suji in mahjong, NPMahjong](${ARTIGO_SUJI}), anglų kalba.`,
      },
    ],
  },
]

const moduloRegras = criarModuloRegras(topicosRegras)
const modulo = criarBuscaModulo(modulos)

const tutorialParts: TutorialPart[] = [
  {
    id: 'primeiras-partidas',
    number: 1,
    title: 'Pirmosios partijos',
    cover: 'Viskas, ko reikia raundui sužaisti, be yaku ir neskaičiuojant taškų.',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: 'Toliau',
    cover:
      'Yaku, chombo ir honba: tikro žaidimo taisyklės, dar neskaičiuojant taškų.',
    milestone: {
      title: 'Jau galite žaisti!',
      md: 'Prieš tęsdami ==sužaiskite raundą== (tonpuusen). Kol kas be yaku ir neskaičiuojant taškų: laimi užbaigęs ranką, o Rytai pereina taip, kaip ką tik matėte.\nTai, ką matėte iki šiol, yra **pagrindas**. Visas žaidimas yra platesnis, o kiti moduliai parodo likusią dalį.',
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, 'Chombo ir honba', 'Klaida, kuri panaikina ranką, ir ranka, kuri kartojasi.'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: 'Taškai',
    cover: 'Kiek verta kiekviena ranka, su dora ir kan.',
    milestone: {
      title: 'Žaiskite dar kartą!',
      md: 'Prieš taškus ==sužaiskite partiją==, kurioje yaku jau privalomas. Vis dar neskaičiuodami taškų užsirašykite, kas laimi kiekvieną ranką, o pabaigoje laimi tas, kas laimėjo daugiausia rankų.',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: 'Giliau',
    cover:
      'Daugiau taisyklių, galiojančių kiekvienoje partijoje.',
    modules: [
      moduloRegras(
        'regras',
        11,
        'Daugiau taisyklių',
        'Detalės, kurios taip pat yra žaidimo dalis.',
      ),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: 'Strategija',
    cover: 'Kad žaistumėte geriau: ką išmesti ir kada gintis.',
    modules: [
      moduloRegras('estrategia', 12, 'Strategija', 'Kad geriau žaistumėte po pirmųjų partijų.', [
        {
          type: 'quiz',
          question: 'Jūsų ranka turi 6 blokus. Kurį išardysite pirmiausia?',
          hand: '345m 24m 55p 46p 778s 12s',
          options: [
            { label: 'Sou 1-2', mpsz: '12s', correct: true },
            { label: 'Man 2-4', mpsz: '24m' },
            { label: 'Sou 7-7-8', mpsz: '778s' },
          ],
          answer:
            'Sou 1-2. Jis laukia krašte, ir jį užbaigia tik Sou 3. Man 2-4 dar gali tapti dvipusiu, o 7-7-8 priima tris skirtingus akmenis.',
        },
        {
          type: 'quiz',
          question: 'Ištraukėte ir turite išmesti. Kuris akmuo išeina pirmas?',
          hand: '234m 9m 55p 678p 45s 79s 4z',
          options: [
            { label: 'Šiaurė', mpsz: '4z', correct: true },
            { label: 'Man 9', mpsz: '9m' },
            { label: 'Sou 7', mpsz: '7s' },
          ],
          answer:
            'Šiaurė (jei tai nei jūsų, nei raundo vėjas). Vienas jis gali tapti tik pora ir yaku neduoda. Man 9 dar gali tapti 7-8-9, o Sou 7-9 laukia 8.',
        },
        {
          type: 'quiz',
          question: 'Pin 1 ir 4 rūšyje yra vieni. Kuris išeina?',
          hand: '14p',
          options: [
            { label: 'Pin 1', mpsz: '1p', correct: true },
            { label: 'Pin 4', mpsz: '4p' },
          ],
          answer: 'Pin 1. 2 ir 3, kurie padėtų 1, geriau dera su 4, kuris dar priima 5 ir 6.',
        },
        {
          type: 'quiz',
          question: 'Kažkas paskelbė Riichi. Jūsų ranka yra 2-shanten ir verta nedaug. Ką daryti?',
          options: [{ label: 'Gintis', correct: true }, { label: 'Pulti' }],
          answer:
            'Gintis. Iki tenpai trūksta dviejų akmenų: tikimybė suspėti, kol nesumokėjote už jo ranką, maža.',
        },
        {
          type: 'quiz',
          question: 'Jis išmetė tik Man 8. Ar Man 5 yra suji?',
          hand: '8m',
          options: [{ label: 'Taip, tai suji' }, { label: 'Ne, tik pusinis suji', correct: true }],
          answer:
            'Tik pusinis suji. Jis vis dar gali turėti Man 3-4, laukiantį 2 arba 5. Kad 5 būtų tikras suji, turi būti išėjęs ir 2.',
        },
        {
          type: 'quiz',
          question:
            'Norite paspęsti spąstus, laukdami Man 7 su 6-8. Kuris akmuo geriausias masalas?',
          hand: '68m',
          options: [
            { label: 'Man 4', mpsz: '4m', correct: true },
            { label: 'Man 5', mpsz: '5m' },
            { label: 'Man 9', mpsz: '9m' },
          ],
          answer:
            'Man 4. 7 yra 4 suji: besiginantis su suji mano, kad 7 saugus, ir išmeta jį jums.',
        },
        {
          type: 'quiz',
          question: 'Kažkas paskelbė Riichi, o visos 4 Pin 3 kopijos matomos. Kuris saugiausias?',
          hand: '3333p',
          options: [
            { label: 'Pin 1', mpsz: '1p', correct: true },
            { label: 'Pin 4', mpsz: '4p' },
            { label: 'Pin 6', mpsz: '6p' },
          ],
          answer:
            'Pin 1. Jo galėtų laukti tik 2-3, o matant visus keturis 3, niekas neturi 2-3. 4 ir 6 dar galima laukti įvairiais būdais.',
        },
        {
          type: 'quiz',
          question:
            'Esate oya Rytų raunde. Turite pavienius Rytus ir Žalią drakoną. Kurį laikysite ilgiau?',
          hand: '1z 6z',
          options: [
            { label: 'Rytai', mpsz: '1z', correct: true },
            { label: 'Žalias', mpsz: '6z' },
          ],
          answer:
            'Rytai. Oya Rytų raunde tai ir vietos, ir raundo vėjas: jų trejetas vertas 2 han.',
        },
      ]),
    ],
  },
]

trocarReferencias(
  tutorialParts,
  (parte, numeroModulo, titulo) => `${parte} dalis, ${numeroModulo} modulis („${titulo}“)`,
)

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
const glossary: TermoGlossarioGuia[] = [
  { term: 'Chombo', definition: doGlossario('chombo') },
  { term: 'Dora', definition: doGlossario('dora') },
  { term: 'Fu', definition: doGlossario('fu') },
  { term: 'Furiten', definition: doGlossario('furiten') },
  {
    term: 'Genbutsu',
    definition: 'Akmuo, kurį Riichi žaidėjas jau išmetė: prieš jį saugus.',
  },
  { term: 'Han', definition: doGlossario('han') },
  { term: 'Hanchan', definition: 'Standartinė partija su Rytų ir Pietų raundais.' },
  { term: 'Honba', definition: doGlossario('honba') },
  { term: 'Ko', definition: doGlossario('ko') },
  { term: 'Menzen', definition: 'Uždara ranka: be kitų žaidėjų išmestų akmenų.' },
  {
    term: 'Mirusi siena',
    definition:
      '14 akmenų, atskirtų už angos, kurie įprastai netraukiami. Joje yra dora indikatorius ir kan pakaitiniai akmenys.',
  },
  { term: 'Oya', definition: doGlossario('oya') },
  {
    term: 'Suji',
    definition:
      'Tos pačios rūšies skaičiai kas 3 (1-4-7, 2-5-8, 3-6-9). Saugesni prieš dvipusį laukimą.',
  },
  { term: 'Tenpai', definition: doGlossario('tenpai') },
  { term: 'Tonpuusen', definition: 'Trumpa partija, tik su Rytų raundu.' },
  { term: 'Yaku', definition: doGlossario('yaku') },
]

export const conteudoLt: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['Naujokas', 'Įgudęs', 'Veteranas', 'Ekspertas', '1-asis dan'],
  ilustracoes: {
    colunaDuasPedras: '1 stulpelis = 2 akmenys',
    umaSobreOutra: 'vienas gulintis ant kito',
    comprimentoMuro: '17 akmenų ilgio',
    conteDireitaEsquerda: 'skaičiuokite iš dešinės į kairę',
    abertura: 'anga',
    esquerda: '← kairė',
    suaDireita: 'jūsų dešinė →',
    voceSentado: 'jūs, sėdintys priešais savo sieną',
    indicadorDora: 'dora indikatorius',
    reposicaoKan: 'kan pakaitinis',
    kanDora: 'kan dora',
    compras: '← traukimas',
    muroMorto: 'mirusi siena (14 akmenų)',
    muroMortoCurto: 'mirusi siena',
    ponChamada: 'pon (šaukimas)',
    ordem: 'ėjimų',
    daVez: 'tvarka',
    ventos: { leste: 'Rytai', sul: 'Pietūs', oeste: 'Vakarai', norte: 'Šiaurė' },
    sufixoOya: ' (oya)',
    dadosExemplo: '2 + 3 = 5 → Rytai (oya)',
    dadosExemploCurto: '2 + 3 = 5 → Rytai',
    direitaLeste: '1 = dešinysis galas',
    contaEsquerda: '← skaičiuoti į kairę',
    abreDepois: 'anga už 5-ojo ↘',
    colunasLeste: '5 st. Rytuose',
    colunasSul: '+ 2 Pietuose ↘',
    seusDescartes: 'jūsų išmesti: eilės po 6',
  },
}
