// Interface texts. Every entry is [Basque, Spanish, English].
export const LANGS = [['eu','Euskara'],['es','Español'],['en','English']];

const S = {
  'app.title': ['Eraikuntza-simulatzailea','Simulador de construcciones','Build simulator'],
  'app.for': ['Dreamer Set-erako','para el Dreamer Set','for the Dreamer Set'],

  // legal and safety notices
  'legal.badge': ['Ez-ofiziala','No oficial','Unofficial'],
  'legal.short': ['Proiektu ez-ofiziala, MODUrekin loturarik gabea.','Proyecto no oficial, sin relación con MODU.','Unofficial project, not affiliated with MODU.'],
  'legal.title': ['Lege-oharra','Aviso legal','Legal notice'],
  'legal.full': ['Proiektu independente eta ez-ofiziala da, eta ez du MODUrekin inolako loturarik; MODUk ez du onartu edo babesten. MODU, Dreamer Set eta piezen izenak haien jabearenak dira, eta piezak identifikatzeko bakarrik erabiltzen dira. Piezen neurriak eta formak hurbilketak dira. Kodea MIT lizentziapean dago.',
                 'Es un proyecto independiente y no oficial, sin ninguna relación con MODU, que no lo ha aprobado ni lo respalda. MODU, Dreamer Set y los nombres de las piezas pertenecen a su titular y se usan solo para identificar las piezas. Las medidas y formas de las piezas son aproximaciones. El código tiene licencia MIT.',
                 'This is an independent, unofficial project. It is not affiliated with, endorsed or sponsored by MODU. MODU, Dreamer Set and the piece names belong to their owner and are used only to identify the pieces. Piece sizes and shapes are approximations. The code is released under the MIT licence.'],
  'legal.safety': ['Tresnak ez du egonkortasuna egiaztatzen, eta adibideak ez dira pieza errealekin probatu. Heldu batek egiaztatu behar ditu haurrek erabili aurretik.',
                   'La herramienta no comprueba la estabilidad y los ejemplos no se han probado con piezas reales. Una persona adulta debe revisarlos antes de que los usen niñas y niños.',
                   'The tool does not check stability, and the examples have not been tested with real pieces. An adult should check every build before children use it.'],

  // pieces
  'p.square': ['Block Square','Block Square','Block Square'],
  'p.round': ['Block Round','Block Round','Block Round'],
  'p.angle': ['Block Angle','Block Angle','Block Angle'],
  'p.base': ['Block Base','Block Base','Block Base'],
  'p.beam': ['Balance Beam','Balance Beam','Balance Beam'],
  'p.pegLong': ['Peg luzea','Peg largo','Long peg'],
  'p.pegShort': ['Peg laburra','Peg corto','Short peg'],
  'p.pegSL': ['Peg short-long','Peg short-long','Short-long peg'],
  'p.swirly': ['Swirly Wheel','Swirly Wheel','Swirly Wheel'],
  'p.foam': ['Foam Wheel','Foam Wheel','Foam Wheel'],
  'g.struct': ['Blokeak','Bloques','Blocks'],
  'g.peg': ['Peg-ak','Pegs','Pegs'],
  'g.wheel': ['Gurpilak','Ruedas','Wheels'],

  // toolbar
  'tb.menu': ['Piezak eta adibideak','Piezas y ejemplos','Pieces and examples'],
  'tb.undo': ['Desegin','Deshacer','Undo'],
  'tb.redo': ['Berregin','Rehacer','Redo'],
  'tb.drop': ['Lurrera','Al suelo','To floor'],
  'tb.dropT': ['Egitura osoa lurreraino jaitsi (G)','Bajar toda la estructura hasta el suelo (G)','Drop the whole build to the floor (G)'],
  'tb.view3d': ['3D','3D','3D'],
  'tb.viewTop': ['Goitik','Planta','Top'],
  'tb.viewFront': ['Aurretik','Alzado','Front'],
  'tb.asm': ['Muntaia','Montaje','Assembly'],
  'tb.asmT': ['Uneko diseinuaren muntaia urratsez urrats','Montaje paso a paso del diseño actual','Step-by-step assembly of the current design'],
  'tb.bom': ['Pieza-zerrenda','Lista de piezas','Parts list'],
  'tb.inv': ['Inbentarioa','Inventario','Inventory'],
  'tb.files': ['Diseinuak','Diseños','Designs'],
  'tb.help': ['Laguntza','Ayuda','Help'],
  'tb.lang': ['Hizkuntza','Idioma','Language'],

  // sidebar
  'tab.pieces': ['Piezak','Piezas','Pieces'],
  'tab.examples': ['Adibideak','Ejemplos','Examples'],
  'side.note': ['Kopurua: erabili gabe / guztira. Aldatu kopuruak Inbentarioan.','Cantidad: sin usar / total. Cambia las cantidades en Inventario.','Count: unused / total. Change the amounts under Inventory.'],
  'side.search': ['Bilatu adibidea…','Buscar ejemplo…','Search examples…'],
  'side.none': ['Ez dago emaitzarik.','Sin resultados.','No results.'],
  'side.left': ['{n} geratzen dira ({t}etik)','Quedan {n} (de {t})','{n} left (of {t})'],
  'side.used': ['{n} erabilita','{n} usadas','{n} used'],
  'ex.asm': ['Muntaia','Montaje','Assembly'],
  'ex.asmT': ['Kargatu eta ikusi muntaia urratsez urrats','Cargar y ver el montaje paso a paso','Load it and watch the assembly step by step'],
  'ex.load': ['Kargatu','Cargar','Load'],
  'ex.steps': ['{n} urrats','{n} pasos','{n} steps'],

  // context bar
  'cx.rotY': ['Biratu (R)','Girar (R)','Rotate (R)'],
  'cx.rotX': ['Etzan / zutitu (T)','Tumbar / levantar (T)','Lay down / stand up (T)'],
  'cx.rotZ': ['Albora irauli (Y)','Volcar de lado (Y)','Tip sideways (Y)'],
  'cx.move': ['Mugitu (M)','Mover (M)','Move (M)'],
  'cx.dup': ['Bikoiztu (D)','Duplicar (D)','Duplicate (D)'],
  'cx.del': ['Ezabatu (Supr)','Borrar (Supr)','Delete (Del)'],
  'cx.less': ['Peg-a atera 1 cm (Q)','Sacar el peg 1 cm (Q)','Pull the peg out 1 cm (Q)'],
  'cx.more': ['Peg-a sartu 1 cm (E)','Meter el peg 1 cm (E)','Push the peg in 1 cm (E)'],
  'cx.flip': ['Buelta eman peg-ari (F)','Dar la vuelta al peg (F)','Flip the peg (F)'],
  'cx.cancel': ['Utzi (Esc)','Cancelar (Esc)','Cancel (Esc)'],
  'cx.nudge': ['Mugitu 5 cm','Mover 5 cm','Nudge 5 cm'],
  'cx.up': ['Igo 5 cm (RePág)','Subir 5 cm (RePág)','Raise 5 cm (PgUp)'],
  'cx.down': ['Jaitsi 5 cm (AvPág)','Bajar 5 cm (AvPág)','Lower 5 cm (PgDn)'],
  'cx.all': ['Dena','Todo','All'],
  'cx.allT': ['Geziekin egitura osoa mugitu (Shift)','Mover toda la estructura con las flechas (Shift)','Move the whole build with the arrows (Shift)'],
  'cx.depth': ['{d} cm','{d} cm','{d} cm'],

  // status
  'st.pieces': ['pieza','piezas','pieces'],
  'st.dims': ['Neurriak','Medidas','Size'],
  'st.dimsHint': ['luz. × zab. × alt.','largo × ancho × alto','L × W × H'],
  'st.over': ['Inbentarioa gainditua','Inventario superado','Over inventory'],

  // hints
  'h.idle': ['Hautatu pieza bat, edo aukeratu pieza berri bat zerrendan.','Selecciona una pieza o elige una nueva en la lista.','Select a piece, or pick a new one from the list.'],
  'h.bring': ['{p}: eraman eszenara eta egin klik.','{p}: llévala a la escena y haz clic.','{p}: move it over the scene and click.'],
  'h.place': ['Klik egin jartzeko','Haz clic para colocar','Click to place'],
  'h.rot': ['R/T/Y biratu','R/T/Y girar','R/T/Y rotate'],
  'h.depth': ['sakonera {d} cm (Q/E)','profundidad {d} cm (Q/E)','depth {d} cm (Q/E)'],
  'h.endLong': ['mutur luzea barruan (F: buelta eman)','extremo largo dentro (F: dar la vuelta)','long end in (F: flip)'],
  'h.endShort': ['mutur laburra barruan (F: buelta eman)','extremo corto dentro (F: dar la vuelta)','short end in (F: flip)'],
  'h.placed': ['Jarrita. Mugitu hurrengoa jartzeko (Esc: amaitu).','Colocada. Muévete para colocar la siguiente (Esc: terminar).','Placed. Move to place the next one (Esc: finish).'],
  'h.selected': ['{p} hautatuta','{p} seleccionada','{p} selected'],
  'h.snapped': ['Peg-ean txertatuta.','Encajada en el peg.','Snapped onto the peg.'],
  'h.pegDepth': ['Peg sakonera: {d} cm','Profundidad del peg: {d} cm','Peg depth: {d} cm'],
  'h.flipLong': ['Peg short-long: mutur luzea zuloan ({d} cm).','Peg short-long: extremo largo en el agujero ({d} cm).','Short-long peg: long end in the hole ({d} cm).'],
  'h.flipShort': ['Peg short-long: mutur laburra zuloan ({d} cm).','Peg short-long: extremo corto en el agujero ({d} cm).','Short-long peg: short end in the hole ({d} cm).'],
  'h.onFloor': ['Egitura lurrean dago jada.','La estructura ya está en el suelo.','The build is already on the floor.'],
  'h.dropped': ['Egitura osoa {d} cm jaitsi da, lurrera arte.','Toda la estructura ha bajado {d} cm, hasta el suelo.','The whole build moved down {d} cm, onto the floor.'],
  'h.raised': ['Egitura osoa {d} cm igo da, lurraren gainera.','Toda la estructura ha subido {d} cm, sobre el suelo.','The whole build moved up {d} cm, onto the floor.'],
  'h.loaded': ['"{n}" kargatuta.','"{n}" cargado.','"{n}" loaded.'],
  'h.noAsm': ['Ez dago piezarik muntaia erakusteko.','No hay piezas para mostrar el montaje.','There are no pieces to assemble.'],
  'h.badFile': ['Ezin izan da fitxategia irakurri (JSON baliogabea).','No se ha podido leer el archivo (JSON no válido).','Could not read the file (invalid JSON).'],

  // placement errors
  'e.none': ['Ez zaizu pieza hau geratzen (ikus Inbentarioa).','No te quedan piezas de este tipo (mira Inventario).','You have none of this piece left (see Inventory).'],
  'e.noneOf': ['Ez zaizu {p} gehiagorik geratzen. Aldatu Inbentarioa edo ezabatu bat.','No te quedan más {p}. Cambia el Inventario o borra una.','No {p} left. Change the Inventory or delete one.'],
  'e.under': ['Lurraren azpitik geratuko litzateke.','Quedaría por debajo del suelo.','It would end up below the floor.'],
  'e.hit': ['Beste pieza batekin talka egiten du.','Choca con otra pieza.','It collides with another piece.'],
  'e.wheelUnder': ['Gurpila lurraren azpitik geratuko litzateke: igo egitura eta, bukatzean, sakatu Lurrera (G).','La rueda quedaría bajo el suelo: sube la estructura y, al terminar, pulsa Al suelo (G).','The wheel would end up below the floor: raise the build and press To floor (G) when done.'],
  'e.wheelHit': ['Gurpilak beste pieza bat ukitzen du.','La rueda toca otra pieza.','The wheel touches another piece.'],
  'e.pegFloor': ['Peg-a lurraren barruan geratuko litzateke.','El peg quedaría dentro del suelo.','The peg would end up inside the floor.'],
  'e.pegInside': ['Peg-aren kanpoko zatia beste pieza baten barruan geratzen da.','La parte exterior del peg queda dentro de otra pieza.','The outer part of the peg ends up inside another piece.'],
  'e.needHole': ['Peg-ak eta swirly gurpilak bloke edo beam baten zuloetan sartzen dira.','Los pegs y las ruedas swirly se insertan en los agujeros de un bloque o beam.','Pegs and swirly wheels go into the holes of a block or beam.'],
  'e.nearHole': ['Hurbildu zulo batera.','Acércate a un agujero.','Move closer to a hole.'],
  'e.holeFull': ['Zulo hori beteta dago.','Ese agujero está ocupado.','That hole is taken.'],
  'e.foamNeedsPeg': ['Foam gurpila peg baten muturrean jartzen da: jarri lehenik peg bat.','La rueda foam se coloca en la punta de un peg: pon primero un peg.','A foam wheel goes on the tip of a peg: place a peg first.'],
  'e.pegShortOut': ['Peg horrek ez du nahikoa irteten (gutxienez 5 cm behar dira).','Ese peg no sobresale lo suficiente (hacen falta al menos 5 cm).','That peg does not stick out enough (at least 5 cm needed).'],
  'e.pegHasWheel': ['Peg horrek badu gurpila.','Ese peg ya tiene rueda.','That peg already has a wheel.'],
  'e.turn': ['Biratu pieza (R / T / Y): zulo batek peg-ari begira egon behar du.','Gira la pieza (R / T / Y): un agujero debe mirar hacia el peg.','Rotate the piece (R / T / Y): a hole must face the peg.'],

  // assembly
  'a.title': ['Muntaia','Montaje','Assembly'],
  'a.step': ['{i}. urratsa / {n}','Paso {i} de {n}','Step {i} of {n}'],
  'a.done': ['Amaituta ({n} urrats)','Terminado ({n} pasos)','Finished ({n} steps)'],
  'a.whole': ['Egitura osoa. Erabili "Lehertua" graduatzailea piezak bereizita ikusteko.','Estructura completa. Usa el control "Explosionado" para ver las piezas separadas.','The complete build. Use the "Exploded" slider to see the pieces apart.'],
  'a.prev': ['Aurrekoa','Anterior','Back'],
  'a.next': ['Hurrengoa','Siguiente','Next'],
  'a.play': ['Erreproduzitu','Reproducir','Play'],
  'a.stop': ['Gelditu','Parar','Pause'],
  'a.explode': ['Lehertua','Explosionado','Exploded'],
  'a.close': ['Itxi','Cerrar','Close'],
  'a.v.struct': ['Jarri','Coloca','Place'],
  'a.v.peg': ['Sartu','Inserta','Insert'],
  'a.v.swirly': ['Sartu zuloetan','Inserta en los agujeros','Push into the holes'],
  'a.v.foam': ['Jarri peg-en muturrean','Coloca en la punta de los pegs','Fit on the peg tips'],

  // dialogs
  'd.close': ['Itxi','Cerrar','Close'],
  'd.save': ['Gorde','Guardar','Save'],
  'bom.piece': ['Pieza','Pieza','Piece'],
  'bom.used': ['Erabilita','Usadas','Used'],
  'bom.have': ['Daukazu','Tienes','You have'],
  'bom.state': ['Egoera','Estado','Status'],
  'bom.missing': ['{n} falta','faltan {n}','{n} short'],
  'bom.spare': ['{n} soberan','sobran {n}','{n} spare'],
  'bom.copy': ['Kopiatu testu gisa','Copiar como texto','Copy as text'],
  'bom.copied': ['Kopiatuta','Copiado','Copied'],
  'inv.count': ['Kopurua','Cantidad','Amount'],
  'inv.unlimited': ['Mugarik gabe (inbentarioa ez kontuan hartu)','Sin límite (no tener en cuenta el inventario)','Unlimited (ignore the inventory)'],
  'inv.note': ['Lehenetsiak: Dreamer Set (1 Base, 2 Square, 2 Round, 2 Angle; 8 peg luze, 6 labur, 4 short-long; 4 swirly, 4 foam) + 4 Balance Beam. Zuzendu hemen zure kaxaren arabera.',
               'Por defecto: Dreamer Set (1 Base, 2 Square, 2 Round, 2 Angle; 8 pegs largos, 6 cortos, 4 short-long; 4 swirly, 4 foam) + 4 Balance Beams. Corrígelo aquí según tu caja.',
               'Default: Dreamer Set (1 Base, 2 Squares, 2 Rounds, 2 Angles; 8 long, 6 short and 4 short-long pegs; 4 swirly, 4 foam wheels) + 4 Balance Beams. Adjust it here to match your box.'],
  'inv.default': ['Lehenetsiak','Por defecto','Defaults'],
  'f.name': ['Izena (adib. Patinete handia)','Nombre (p. ej. Patinete grande)','Name (e.g. Big scooter)'],
  'f.saveCur': ['Gorde unekoa','Guardar el actual','Save current'],
  'f.open': ['Ireki','Abrir','Open'],
  'f.del': ['Ezabatu','Borrar','Delete'],
  'f.empty': ['Oraindik ez dago gordetako diseinurik.','Todavía no hay diseños guardados.','No saved designs yet.'],
  'f.note': ['Diseinuak nabigatzaile honetan gordetzen dira. Beste gailu batera eramateko, erabili Esportatu / Inportatu.',
             'Los diseños se guardan en este navegador. Para llevarlos a otro dispositivo, usa Exportar / Importar.',
             'Designs are stored in this browser. Use Export / Import to take them to another device.'],
  'f.export': ['Esportatu (JSON)','Exportar (JSON)','Export (JSON)'],
  'f.import': ['Inportatu','Importar','Import'],
  'f.clear': ['Eszena garbitu','Vaciar la escena','Clear the scene'],
  'f.pieces': ['{n} pieza','{n} piezas','{n} pieces'],
  'c.replace': ['Uneko eszena ordeztu?','¿Sustituir la escena actual?','Replace the current scene?'],
  'c.clear': ['Eszena osoa garbitu?','¿Vaciar toda la escena?','Clear the whole scene?'],
  'c.del': ['"{n}" ezabatu?','¿Borrar "{n}"?','Delete "{n}"?'],
  'c.over': ['"{n}" badago. Gainidatzi?','"{n}" ya existe. ¿Sobrescribir?','"{n}" already exists. Overwrite?'],
  'c.copy': ['Kopiatu:','Copiar:','Copy:'],

  // help
  'help.title': ['Nola erabili','Cómo se usa','How to use it'],
  'help.mouse': ['Sagua eta ukipena','Ratón y pantalla táctil','Mouse and touch'],
  'help.m1': ['Klik / ukitu: pieza jarri edo hautatu','Clic / toque: colocar o seleccionar una pieza','Click / tap: place or select a piece'],
  'help.m2': ['Arrastatu: kamera biratu','Arrastrar: girar la cámara','Drag: orbit the camera'],
  'help.m3': ['Eskuineko botoia edo bi hatz: desplazatu','Botón derecho o dos dedos: desplazar','Right button or two fingers: pan'],
  'help.m4': ['Gurpila edo atximurra: zoom','Rueda o pellizco: zoom','Wheel or pinch: zoom'],
  'help.keys': ['Teklatua','Teclado','Keyboard'],
  'help.k1': ['biratu 90°-ka','girar de 90° en 90°','rotate in 90° steps'],
  'help.k2': ['mugitu 5 cm (Shift: egitura osoa)','mover 5 cm (Shift: toda la estructura)','move 5 cm (Shift: whole build)'],
  'help.k3': ['peg-aren sakonera · short-long peg-ari buelta','profundidad del peg · dar la vuelta al short-long','peg depth · flip the short-long peg'],
  'help.k4': ['mugitu · bikoiztu · ezabatu','mover · duplicar · borrar','move · duplicate · delete'],
  'help.k5': ['egitura lurrera jaitsi','bajar la estructura al suelo','drop the build to the floor'],
  'help.k6': ['desegin / berregin','deshacer / rehacer','undo / redo'],
  'help.rules': ['Konexio-arauak','Reglas de conexión','Connection rules'],
  'help.r1': ['Peg-ak eta swirly gurpilak bloke edo beam baten zuloetan sartzen dira.','Los pegs y las ruedas swirly se insertan en los agujeros de un bloque o beam.','Pegs and swirly wheels go into the holes of a block or beam.'],
  'help.r2': ['Foam gurpilak irteten ari den peg baten muturrean jartzen dira (gutxienez 5 cm kanpoan).','Las ruedas foam se colocan en la punta de un peg que sobresalga al menos 5 cm.','Foam wheels go on the tip of a peg that sticks out at least 5 cm.'],
  'help.r3': ['Blokeak gainazaletan jartzen dira, 5 cm-ko sarean; peg bat aurrean badago, peg-ean txertatzen dira.','Los bloques se colocan sobre superficies, en una rejilla de 5 cm; si hay un peg delante, se encajan en él.','Blocks sit on surfaces on a 5 cm grid; if there is a peg in the way they snap onto it.'],
  'help.r4': ['Gurpildun eraikuntzetan: igo egitura, jarri gurpilak eta sakatu Lurrera (G).','En construcciones con ruedas: sube la estructura, coloca las ruedas y pulsa Al suelo (G).','For builds on wheels: raise the build, fit the wheels and press To floor (G).'],
  'help.r5': ['Pieza gorriz agertzen bada, ezin da jarri: talka, lurra edo inbentarioa.','Si la pieza aparece en rojo no se puede colocar: choque, suelo o inventario.','A red piece cannot be placed: collision, floor or inventory.'],
  'help.limit': ['Tresnak ez du egonkortasuna edo pisua egiaztatzen. Fabrikatzailearen mugak: Dreamer Set 50 kg, Balance Beam 80 kg.','La herramienta no comprueba la estabilidad ni el peso. Límites del fabricante: Dreamer Set 50 kg, Balance Beam 80 kg.','The tool does not check stability or weight. Manufacturer limits: Dreamer Set 50 kg, Balance Beam 80 kg.'],
  'help.install': ['Aplikazio gisa instala daiteke nabigatzailearen menutik ("Instalatu" edo "Gehitu hasierako pantailara"), eta konexiorik gabe dabil.','Se puede instalar como aplicación desde el menú del navegador ("Instalar" o "Añadir a pantalla de inicio") y funciona sin conexión.','You can install it as an app from the browser menu ("Install" or "Add to Home Screen"); it works offline.'],
};

let idx = 0;
export function getLang(){ return LANGS[idx][0]; }
export function setLang(code){
  const i = LANGS.findIndex(l => l[0] === code);
  idx = i < 0 ? 0 : i;
  try { localStorage.setItem('modu.lang', LANGS[idx][0]); } catch {}
  document.documentElement.lang = LANGS[idx][0];
}
export function initLang(){
  let code = null;
  try { code = localStorage.getItem('modu.lang'); } catch {}
  if (!code){
    const nav = (navigator.language || 'en').slice(0,2).toLowerCase();
    code = LANGS.some(l => l[0] === nav) ? nav : 'en';
  }
  setLang(code);
}
// Pick the current language out of a [eu, es, en] array
export const L = arr => Array.isArray(arr) ? (arr[idx] ?? arr[0]) : arr;
export function t(key, vars){
  let s = S[key] ? L(S[key]) : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
// Decimal comma for Basque and Spanish, point for English
export const num = s => idx === 2 ? String(s).replace(/(\d),(\d)/g, '$1.$2') : String(s);

// Translate the static markup: data-i18n (text), data-i18n-title (tooltip + aria-label), data-i18n-ph (placeholder)
export function applyStatic(root = document){
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { const v = t(el.dataset.i18nTitle); el.title = v; el.setAttribute('aria-label', v); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}
