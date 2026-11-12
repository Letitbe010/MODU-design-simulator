# MODU Eraikitzailea

MODU piezekin (Dreamer Set + 4 Balance Beam) egiturak 3Dn diseinatzeko web aplikazioa, errealitatean muntatu aurretik. Euskaraz, gaztelaniaz eta ingelesez erabil daiteke.

## Nola ireki

Aplikazioa hainbat fitxategitan banatuta dagoenez, **zerbitzari baten bidez ireki behar da**; `index.html` fitxategian klik bikoitza egitea ez da nahikoa.

1. **Ordenagailuan (lokalean):** egin klik bikoitza `abiarazi.bat` fitxategian. Zerbitzari lokal bat abiarazten du eta nabigatzailea irekitzen du `http://localhost:8765` helbidean. Python instalatuta egon behar da. Eskuz egiteko:

   ```bash
   python -m http.server 8765
   ```

2. **Interneten (web app gisa):** igo karpeta osoa HTTPS duen hosting estatiko batera (GitHub Pages, Netlify, ikastetxeko zerbitzaria...). Ez da konpilaziorik edo instalaziorik behar: fitxategiak bere horretan zerbitzatzen dira. `MODU_Dreamer_Booklet_2024.pdf` ez da igo behar.

### Instalatzea eta konexiorik gabe erabiltzea

HTTPS bidez (edo `localhost`-en) irekita, nabigatzaileak aplikazio gisa instalatzeko aukera ematen du (*Instalatu* edo *Gehitu hasierako pantailara*). Lehen bisitaren ondoren, konexiorik gabe ere badabil: three.js liburutegia `vendor/` karpetan dago, ez da CDNtik kargatzen.

## Erabilera

| Ekintza | Sagua / ukipena | Teklatua |
|---|---|---|
| Pieza bat jarri | Aukeratu pieza *Piezak* fitxan eta egin klik eszenan | |
| Pieza hautatu | Egin klik pieza batean | |
| Biratu 90°-ka | Beheko barrako `R` `T` `Y` botoiak | `R`, `T`, `Y` |
| Mugitu 5 cm | Beheko barrako geziak; *Dena* botoiak egitura osoa mugitzen du | Geziak, `RePág` / `AvPág` (`Shift`: dena) |
| Egitura lurrera jaitsi | *Lurrera* botoia | `G` |
| Mugitu (berriro jarri) / Bikoiztu / Ezabatu | Beheko barrako botoiak | `M` / `D` / `Supr` |
| Peg-aren sakonera | `−` / `+` botoiak (cm 1) | `Q` / `E` |
| Short-long peg-ari buelta eman | Buelta botoia | `F` |
| Desegin / Berregin | Goiko barrako geziak | `Ctrl+Z` / `Ctrl+Y` |
| Kamera | Arrastatu: biratu · eskuineko botoia edo bi hatz: desplazatu · gurpila edo atximurra: zoom | |

Beheko barra pieza bat hautatzean edo jartzean bakarrik agertzen da. Pantaila estuetan (tableta, mugikorra), piezen eta adibideen panela goiko ezkerreko botoiarekin irekitzen da.

### Konexio-arauak

- **Peg-ak eta swirly gurpilak** bloke edo beam baten zuloetan sartzen dira. Peg luzea 10 cm sartzen da eta peg laburra 3,5 cm; sakonera alda daiteke.
- **Foam gurpilak** irteten ari den peg baten muturrean jartzen dira. Gutxienez 5 cm behar dira kanpoan.
- **Blokeak eta beam-ak** gainazal batean jar daitezke, 5 cm-ko sarean. Peg bat aurrean badago, peg-ean txertatzen dira, zulo bat peg-ari begira dagoen bitartean.
- **Gurpildun eraikuntzak:** igo egitura (hautatu pieza bat, aktibatu *Dena* eta sakatu igotzeko gezia), jarri gurpilak eta sakatu *Lurrera*.
- Pieza gorriz agertzen bada, ezin da jarri: talka egiten du, lurraren azpitik geratzen da edo inbentarioa agortuta dago.

### Gainerako funtzioak

- **Hizkuntza:** goiko eskuineko hautagailua (Euskara / Español / English). Lehen aldian nabigatzailearen hizkuntza hartzen du; aukera gorde egiten da.
- **Pieza-zerrenda:** diseinuak zenbat pieza erabiltzen dituen eta zenbat falta diren.
- **Inbentarioa:** zure pieza kopuruak zuzentzeko.
- **Diseinuak:** nabigatzailean gorde eta ireki; JSON gisa esportatu eta inportatu; eszena garbitu.
- **Adibideak:** 38 eraikuntza, miniaturarekin eta bilatzailearekin, bost taldetan. Denak automatikoki egiaztatuta daude: ez dute talkarik, peg guztiak zuloetan daude eta inbentarioaren barruan geratzen dira (*+2 Square* taldekoak izan ezik).
  - **Jolasak eta altzariak:** Txotxongilo-antzokia, Futbol-atea, Oztopo-ibilbidea, Uztai-jokoa, Balantza, Banku luzea, Eskailera txikia, Tenis-sarea, Oreka-bide luzea, Plataforma arrapalarekin, Apal txikia.
  - **Harrigarriak:** Dinosauroa, Zubia eta txalupa, Kohetea, Robota, Garabia, Kulunka-txalupa.
  - **Gurpildunak:** Lasterketa-autoa, Eskuorga, Jostailu-orga, Kamioia, Hegazkina, Helikopteroa, Dortoka.
  - **Liburuxkatik** (argazkietatik berreraikiak, hurbilketak): Mahaia eta aulkia, Scooter Board, Swirly Ride, Rocker, Walker, Zabua, Balance Board, Kulunka-aulkia.
  - **+2 Square** (4 Square guztira): Kohete handia, Tenis-sare handia, Robot handia, Trena, Apal handia, Eszenatoki handia.
- **Muntaia:** adibide bakoitzaren ondoko botoiak (edo goiko *Muntaia* botoiak, uneko diseinuarentzat) eraikuntza urratsez urrats erakusten du, animazioarekin. *Lehertua* graduatzaileak piezak bereizita erakusten ditu. Teklak: `→` / `←`, `zuriunea`, `Esc`.

## Piezen datuak eta suposizioak

Iturri ofiziala: [modutoy.com](https://modutoy.com/products/dreamer-set) (2026-11-02an kontsultatua) eta *Dreamer Set Inspiration Booklet* (2024).

| Pieza | Neurria | Iturria |
|---|---|---|
| Block Square | 20 × 20 × 10 cm | Ofiziala |
| Block Round | 30 × 20 × 10 cm | Ofiziala |
| Block Angle | 20 × 20 × 10 cm | Ofiziala |
| Peg luzea / laburra | Ø3 × 20 cm / Ø3 × 7 cm | Ofiziala ("Ø3 × 7–20 cm") |
| Peg short-long | Ø3 × 13 cm | Ofiziala |
| Swirly Wheel | Ø5 cm | Ofiziala |
| Foam Wheel | Ø18 cm | Ofiziala |
| Balance Beam | 70 × 10 × 1,4 cm | Ofiziala |
| Block Base | 50 × 30 × 10 cm | Ofiziala |

**Dreamer Set-aren edukia** (ofiziala, 2026-11-02): 1 Block Base, 2 Square, 2 Round, 2 Angle; 8 peg luze, 6 labur eta 4 short-long; 4 swirly eta 4 foam gurpil. Hori da lehenetsitako inbentarioa, 4 beam-ez gain.

### Block Base (2026-11-12an zuzendua)

Zulo-patroia produktuaren argazki ofizialetik atera da, perspektiba zuzenduta eta 5 cm-ko sarera doituta. Estimazioa da, ez neurketa; erabiltzaileak pieza errealarekin alderatu eta ontzat eman du (2026-11-12).

- **Goian 19 zulo:** 1 erdian; haren inguruan lau hirukote (±5,±5 · ±10,±5 · ±5,±10 cm); eta mutur bakoitzean 3 (±20 cm-ra, 0 eta ±10 cm).
- **Alde luze bakoitzean 4 zulo:** ±5 eta ±20 cm-ra. Erdiko bien posizioa (±5) da zalantzazkoena.
- **Mutur laburretan zulorik ez.** Argazkian mutur bakarra ikusten da; bestea simetrikoa dela suposatu da.
- **Azpian:** kulunka-kurba (32 cm luze, 25 cm zabal, 3 cm sakon). Guztira 13 cm-ko altuera.
- **Suposizioa:** kurbaren gaineko 13 zuloak itsuak dira (goitik bakarrik erabil daitezke); muturretako 6ak alderik alde doaz, eta azpitik ere erabil daitezke (hankak, swirly gurpilak).

### Egiaztatu gabeko gainerako suposizioak

- Short-long peg-aren eraztuna mutur batetik 3,5 cm-ra dago: irudietatik hurbildua.
- **Square:** goiko aurpegian 5 zulo dadoaren patroian; alboetan 2 zulo.
- **Angle:** profil trapezoidala (behean 20 cm, goian 10 cm lau, 45°-ko malda). Lau zulo bertikal, 1 mutur bakoitzean eta 2 atzeko aurpegian.
- **Round:** zilindro-erdia. Alde lauan 8 zulo, gainazal kurboraino; mutur bakoitzean zulo 1.
- Zuloen distantzia zehatzak, Foam Wheel-aren lodiera (5 cm) eta Swirly gurpilaren altuera (6,3 cm) irudietatik hurbilduak dira.
- Beam-en zuloak: muturretatik 5 cm-ra.

## Mugak

- Ez dago fisika-simulaziorik: tresnak ez du egonkortasuna, pisua edo oreka egiaztatzen. Fabrikatzaileak dioenez, Dreamer Set-ak 50 kg jasaten ditu gehienez, eta beam-ek 80 kg. Adibide berriak (bankua, eskailera, zubia...) ez dira errealitatean probatu: haurrek erabili aurretik, heldu batek egiaztatu behar du egonkorrak direla.
- Liburuxkako eraikuntzak argazkietatik berreraiki dira; antzekoak dira, baina ez berdin-berdinak. Block Base-ren zuloak zuzentzean, *Rocker*, *Walker*, *Zabua* eta *Kulunka-aulkia* moldatu egin behar izan dira.
- Talkak kutxa angeluzuzenekin kalkulatzen dira. Angle eta Round blokeen alde kurbatuetan edo moztuetan, beraz, hurbilketa da.
- Pieza bat ezabatzean, hari lotutako peg-ak lekuan geratzen dira.
- Foam Balls ez daude tresnan.

## Fitxategiak

| Fitxategia | Edukia |
|---|---|
| `index.html` | Orriaren egitura |
| `css/app.css` | Itxura |
| `js/app.js` | Eszena, piezak jartzeko logika eta interfazea |
| `js/pieces.js` | Piezen katalogoa, formak eta zuloen posizioak |
| `js/templates.js` | Adibideak eta haien muntaia-urratsak (hiru hizkuntzatan) |
| `js/i18n.js` | Interfazeko testuak (euskara, gaztelania, ingelesa) |
| `vendor/` | three.js 0.160.0 (cdn.jsdelivr.net-etik kopiatua, 2026-11-12) |
| `manifest.webmanifest`, `sw.js`, `icons/` | Instalatzeko eta konexiorik gabe erabiltzeko |
| `abiarazi.bat` | Zerbitzari lokala abiarazteko (Windows) |

Testu bat aldatzeko edo hizkuntza bat gehitzeko, editatu `js/i18n.js` eta `js/templates.js`: sarrera bakoitza `[euskara, gaztelania, ingelesa]` hirukotea da. Fitxategiak aldatu ondoren, igo `sw.js`-ko `CACHE` izenaren bertsioa (`modu-v1` → `modu-v2`), instalatutako aplikazioek cache zaharra garbi dezaten.
