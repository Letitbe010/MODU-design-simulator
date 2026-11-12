// Ready-made example builds. Every text is [Basque, Spanish, English].
import * as THREE from 'three';
import { CATALOG, HOLES, SWIRLY_DROP, V, Y, NEG_Y, defaultDepth } from './pieces.js';

const r2 = v => Math.round(v*100)/100, r5 = v => Math.round(v*1e5)/1e5;
const QI = [0,0,0,1];
const qa = (axis, deg) => new THREE.Quaternion().setFromAxisAngle(axis, deg*Math.PI/180).toArray().map(r5);
const Q_X90 = qa(V(1,0,0), 90);    // Square standing up (20 high, 10 deep)
const Q_XM90 = qa(V(1,0,0), -90);  // Round standing on its end / Base standing up
const Q_Y90 = qa(V(0,1,0), 90);    // beam running along Z
const Q_YM90 = qa(V(0,1,0), -90);
const Q_Y180 = qa(V(0,1,0), 180);
const Q_Z90 = qa(V(0,0,1), 90);    // Square standing with a 20x20 face towards ±X
const Q_Z180 = qa(V(0,0,1), 180);  // upside down

// Builds template records from host pieces and their local hole points, grouped in assembly steps
class TplBuilder {
  constructor(){ this.recs = []; this.steps = []; }
  step(text){ this.steps.push({ text, idx:[] }); }
  add(rec){ this.recs.push(rec); this.steps[this.steps.length-1].idx.push(this.recs.length-1); return rec; }
  block(type, p, q=QI){ return this.add({ type, p, q }); }
  hole(host, lp){
    const q = new THREE.Quaternion().fromArray(host.q), pos = V(...host.p), L = V(...lp);
    let best = null, bd = Infinity;
    for (const h of HOLES[host.type]){ const d = h.p.distanceTo(L); if (d < bd){ bd = d; best = h; } }
    if (bd > 0.5) console.warn('template hole not found', host.type, lp);
    return { p:best.p.clone().applyQuaternion(q).add(pos), n:best.n.clone().applyQuaternion(q) };
  }
  peg(host, lp, type='pegLong', { depth, flip=false } = {}){
    const h = this.hole(host, lp), L = CATALOG[type].len, d = depth ?? defaultDepth(type, flip);
    const rec = { type, p:h.p.clone().addScaledVector(h.n, L/2-d).toArray().map(r2),
                  q:new THREE.Quaternion().setFromUnitVectors(Y, h.n).toArray().map(r5), depth:d };
    if (flip) rec.flip = true;
    return this.add(rec);
  }
  swirly(host, lp){
    const h = this.hole(host, lp);
    return this.add({ type:'swirly', p:h.p.toArray().map(r2), q:new THREE.Quaternion().setFromUnitVectors(NEG_Y, h.n).toArray().map(r5) });
  }
  foam(peg){
    const a = Y.clone().applyQuaternion(new THREE.Quaternion().fromArray(peg.q)), L = CATALOG[peg.type].len;
    return this.add({ type:'foam', p:V(...peg.p).addScaledVector(a, L/2-2.5).toArray().map(r2), q:peg.q });
  }
}
function tpl(id, group, name, build){
  const b = new TplBuilder(); build(b);
  return { id, group, name, recs:b.recs, steps:b.steps };
}

/* Local hole points used below
   Square (flat):  top (±5,5,±5) (0,5,0) · bottom y=-5 · sides x (±10,0,±5) · sides z (±5,0,±10)
   Square standing (Q_X90): top = local (±5,0,-10), bottom = local (±5,0,10)
   Square standing (Q_Z90): top = local (10,0,±5), bottom = local (-10,0,±5)
   Round: ends (0,-1,±15) · flat face (±5,-5,-10|0|10) (0,-5,±5) · same holes on the curve: x=0 -> y 5, x=±5 -> y 3.66
   Angle: top (5,5,±5) · slope (-5,0,±5) · bottom (±5,-5,±5) · back (10,0,±5)
   Base: top (x,6.5,z) with (0,0) (±5,±5) (±10,±5) (±5,±10) (±20,0) (±20,±10) · bottom y=-3.5 only at x=±20
         long sides (±5|±20, 1.5, ±15) · no holes on the short ends
   Beam: holes (±30,±0.7,0) */

// Two Squares joined side by side with two long pegs: the chassis of most vehicles
function chassis(b, y){
  const A = b.block('square', [-10,y,0]);
  b.peg(A, [10,0,-5]); b.peg(A, [10,0,5]);
  const B = b.block('square', [10,y,0]);
  return [A, B];
}
function swirlies(b, A, B){
  b.swirly(A, [-5,-5,-5]); b.swirly(A, [-5,-5,5]); b.swirly(B, [5,-5,-5]); b.swirly(B, [5,-5,5]);
}
const T_SWIRL = ['Buelta eman eta sartu lau swirly gurpilak azpiko izkinetan.',
  'Dale la vuelta e inserta las cuatro ruedas swirly en las esquinas de abajo.',
  'Turn it over and push the four swirly wheels into the bottom corner holes.'];

// Parametric builds: n = squares used (2 = Dreamer Set, 4 = with two extra Squares)
function rocket(n){
  const big = n > 2;
  return tpl(big ? 'rocketBig' : 'rocket', big ? 'big' : 'wow',
    big ? ['Kohete handia','Cohete grande','Big rocket'] : ['Kohetea','Cohete','Rocket'], b => {
    b.step(['Jaurtiketa-plataforma: Block Base lurrean eta peg luze bat erdiko zuloan.',
            'Plataforma de lanzamiento: Block Base en el suelo y un peg largo en el agujero central.',
            'Launch pad: Block Base on the floor and a long peg in the centre hole.']);
    const base = b.block('base', [0,6.5,0]);
    b.peg(base, [0,6.5,0]);
    b.step(['Gorputza: txertatu lehen Square-a peg-ean.', 'Cuerpo: encaja el primer Square en el peg.', 'Body: slide the first Square onto the peg.']);
    const first = b.block('square', [0,18,0]);
    b.step(['Hegatsak: peg labur bana Square-aren alboetan eta Angle bana, malda kanpora.',
            'Aletas: un peg corto a cada lado del Square y un Angle en cada uno, con la rampa hacia fuera.',
            'Fins: a short peg on each side of the Square and an Angle on each, slope facing out.']);
    b.peg(first, [-10,0,5], 'pegShort'); b.peg(first, [10,0,-5], 'pegShort');
    b.block('angle', [-20,18,0]); b.block('angle', [20,18,0], Q_Y180);
    const corners = [[5,5,5],[-5,5,-5],[5,5,-5]];
    let S = first;
    for (let i = 1; i < n; i++){
      b.step([`Peg luze bat izkinan eta ${i+1}. Square-a gainean.`, `Un peg largo en la esquina y el Square n.º ${i+1} encima.`, `A long peg in the corner and Square no. ${i+1} on top.`]);
      b.peg(S, corners[(i-1) % 3]);
      S = b.block('square', [0,18+10*i,0]);
    }
    const top = 13 + 10*n;
    b.step(['Muturra: peg labur bat erdian eta Round blokea zutik, kurba aurrera.',
            'Punta: un peg corto en el centro y el bloque Round de pie, con la curva hacia delante.',
            'Nose: a short peg in the centre and the Round block standing up, curve to the front.']);
    b.peg(S, [0,5,0], 'pegShort');
    const nose = b.block('round', [0,top+15,-1], Q_XM90);
    b.step(['Antena: short-long peg bat goiko muturrean.', 'Antena: un peg short-long en el extremo superior.', 'Antenna: a short-long peg in the top end.']);
    b.peg(nose, [0,-1,15], 'pegSL');
  });
}
function tennisNet(n){
  const big = n > 2, levels = n / 2;
  return tpl(big ? 'netBig' : 'net', big ? 'big' : 'play',
    big ? ['Tenis-sare handia (40 cm)','Red de tenis grande (40 cm)','Big tennis net (40 cm)'] : ['Tenis-sarea','Red de tenis','Tennis net'], b => {
    b.step(['Zutoinak: Square bana zutik, 70 cm-ko tartearekin, aurpegi zuloduna aurrera.',
            'Postes: un Square de pie a cada lado, a 70 cm, con la cara de agujeros hacia delante.',
            'Posts: one Square standing on each side, 70 cm apart, holed face to the front.']);
    const posts = [-35,35].map(x => [b.block('square', [x,10,0], Q_X90)]);
    if (levels > 1){
      b.step(['Sartu peg luze bana goian eta txertatu bigarren Square-a zutoin bakoitzean.',
              'Inserta un peg largo arriba y encaja el segundo Square en cada poste.',
              'Insert a long peg on top and slide the second Square onto each post.']);
      b.peg(posts[0][0], [-5,0,-10]); b.peg(posts[1][0], [5,0,-10]);
      posts.forEach((p, k) => p.push(b.block('square', [k ? 35 : -35,30,0], Q_X90)));
    }
    b.step(['Oinak: peg labur bana atzean eta Angle bana, zutoinak eusteko.',
            'Pies: un peg corto detrás y un Angle en cada poste, para sujetarlos.',
            'Feet: a short peg at the back and an Angle on each post to hold them up.']);
    b.peg(posts[0][0], [5,-5,5], 'pegShort'); b.peg(posts[1][0], [-5,-5,5], 'pegShort');
    b.block('angle', [-35,5,-15], Q_YM90); b.block('angle', [35,5,-15], Q_YM90);
    for (let lv = 0; lv < levels; lv++){
      const upper = lv > 0;
      b.step(upper ? ['Goiko sarea: short-long peg-ak (mutur luzea barruan) eta beste bi beam ertzean.',
                      'Red superior: pegs short-long (extremo largo dentro) y otros dos beams de canto.',
                      'Upper net: short-long pegs (long end in) and two more beams on edge.']
                   : ['Sarea: lau peg labur aurrealdean eta bi beam ertzean jarrita, bata bestearen gainean.',
                      'Red: cuatro pegs cortos en el frente y dos beams de canto, uno sobre otro.',
                      'Net: four short pegs on the front and two beams on edge, one above the other.']);
      for (const [k, a] of [[0,5],[1,-5]]) for (const bb of [5,-5]){
        if (upper) b.peg(posts[k][lv], [a,5,bb], 'pegSL', { flip:true });
        else b.peg(posts[k][lv], [a,5,bb], 'pegShort');
      }
      b.block('beam', [0,20*lv+5,5.7], Q_X90); b.block('beam', [0,20*lv+15,5.7], Q_X90);
    }
  });
}
function robot(n){
  const big = n > 2, per = n / 2, L = 20*per;
  return tpl(big ? 'robotBig' : 'robot', big ? 'big' : 'wow',
    big ? ['Robot handia','Robot grande','Big robot'] : ['Robota','Robot','Robot'], b => {
    b.step(['Hankak: bi Square zutik, 10 cm-ko tartearekin.', 'Piernas: dos Squares de pie, separados 10 cm.', 'Legs: two Squares standing up, 10 cm apart.']);
    const legs = [-15,15].map(x => [b.block('square', [x,10,0], Q_X90)]);
    if (per > 1){
      b.step(['Peg luze bana goian eta beste Square bana hanka bakoitzean.',
              'Un peg largo arriba y otro Square en cada pierna.',
              'A long peg on top and another Square on each leg.']);
      b.peg(legs[0][0], [5,0,-10]); b.peg(legs[1][0], [-5,0,-10]);
      legs.forEach((l, k) => l.push(b.block('square', [k ? 15 : -15,30,0], Q_X90)));
    }
    b.step(['Oinak: peg labur bana aurrean eta Angle bana, malda aurrera.',
            'Pies: un peg corto delante y un Angle en cada pierna, con la rampa hacia delante.',
            'Feet: a short peg at the front and an Angle on each leg, slope forward.']);
    b.peg(legs[0][0], [5,5,5], 'pegShort'); b.peg(legs[1][0], [-5,5,5], 'pegShort');
    b.block('angle', [-15,5,15], Q_Y90); b.block('angle', [15,5,15], Q_Y90);
    b.step(['Gorputza: peg luze bana hanken kanpoko zuloan eta Block Base zutik, kurba aurrera (sabela).',
            'Cuerpo: un peg largo en el agujero exterior de cada pierna y el Block Base de pie, con la curva hacia delante (la barriga).',
            'Body: a long peg in the outer hole of each leg and the Block Base standing up, curve to the front (the belly).']);
    b.peg(legs[0][per-1], [-5,0,-10]); b.peg(legs[1][per-1], [5,0,-10]);
    const body = b.block('base', [0,L+15,1.5], Q_XM90);
    b.step(['Besoak: peg luze bana aurrealdeko zuloetan, aurrera begira, eta foam gurpil bana muturrean.',
            'Brazos: un peg largo en cada agujero frontal, apuntando hacia delante, y una rueda foam en la punta.',
            'Arms: a long peg in each front hole, pointing forward, and a foam wheel on each tip.']);
    b.foam(b.peg(body, [20,-3.5,0])); b.foam(b.peg(body, [-20,-3.5,0]));
    b.step(['Burua: peg labur bat goian eta Round blokea.', 'Cabeza: un peg corto arriba y el bloque Round.', 'Head: a short peg on top and the Round block.']);
    b.peg(body, [5,1.5,15], 'pegShort');
    const head = b.block('round', [0,L+35,0]);
    b.step(['Antenak: bi short-long peg buruan.', 'Antenas: dos pegs short-long en la cabeza.', 'Antennae: two short-long pegs on the head.']);
    b.peg(head, [0,5,-5], 'pegSL'); b.peg(head, [0,5,5], 'pegSL');
  });
}

export const GROUPS = [
  ['play', ['Jolasak eta altzariak','Juegos y muebles','Games and furniture']],
  ['wow',  ['Harrigarriak','Sorprendentes','Showpieces']],
  ['ride', ['Gurpildunak','Con ruedas','On wheels']],
  ['book', ['Liburuxkatik (hurbilketa)','Del folleto (aproximación)','From the booklet (approximation)']],
  ['big',  ['+2 Square (4 Square guztira)','+2 Square (4 Square en total)','+2 Squares (4 Squares in total)']],
];

export const TEMPLATES = [
  /* ---------- Games and furniture ---------- */
  tpl('theatre', 'play', ['Txotxongilo-antzokia','Teatro de marionetas','Puppet theatre'], b => {
    b.step(['Zutoinak: Square bana zutik, 70 cm-ko tartearekin, aurpegi zuloduna aurrera.',
            'Postes: un Square de pie a cada lado, a 70 cm, con la cara de agujeros hacia delante.',
            'Posts: one Square standing on each side, 70 cm apart, holed face to the front.']);
    const PL = b.block('square', [-35,10,0], Q_X90), PR = b.block('square', [35,10,0], Q_X90);
    b.step(['Oinak: peg labur bana atzean eta Angle bana, antzokia ez erortzeko.',
            'Pies: un peg corto detrás y un Angle en cada poste, para que el teatro no se caiga.',
            'Feet: a short peg at the back and an Angle on each post so the theatre stays up.']);
    b.peg(PL, [5,-5,5], 'pegShort'); b.peg(PR, [-5,-5,5], 'pegShort');
    b.block('angle', [-35,5,-15], Q_YM90); b.block('angle', [35,5,-15], Q_YM90);
    b.step(['Aurreko panela: lau peg labur eta bi beam ertzean. Txotxongilolaria atzean ezkutatzen da.',
            'Panel frontal: cuatro pegs cortos y dos beams de canto. Quien mueve las marionetas se esconde detrás.',
            'Front panel: four short pegs and two beams on edge. The puppeteer hides behind it.']);
    for (const [P, a] of [[PL,5],[PR,-5]]) for (const bb of [5,-5]) b.peg(P, [a,5,bb], 'pegShort');
    b.block('beam', [0,5,5.7], Q_X90); b.block('beam', [0,15,5.7], Q_X90);
    b.step(['Zutabeak: peg luze bana goian eta Round bana zutik, alde laua aurrera.',
            'Columnas: un peg largo arriba y un Round de pie en cada poste, con la cara plana hacia delante.',
            'Columns: a long peg on top and a Round standing on each post, flat face to the front.']);
    b.peg(PL, [5,0,-10]); b.peg(PR, [-5,0,-10]);
    const CL = b.block('round', [-30,35,-1], Q_XM90), CR = b.block('round', [30,35,-1], Q_XM90);
    b.step(['Goiko langa: short-long peg bana (mutur luzea barruan) eta beam-a gainean. Zintzilikatu oihal bat errezel gisa!',
            'Travesaño: un peg short-long en cada columna (extremo largo dentro) y el beam encima. ¡Cuelga una tela como telón!',
            'Top bar: a short-long peg in each column (long end in) and the beam on top. Hang a cloth as a curtain!']);
    b.peg(CL, [0,-1,15], 'pegSL', { flip:true }); b.peg(CR, [0,-1,15], 'pegSL', { flip:true });
    b.block('beam', [0,50.7,0]);
  }),
  tpl('goal', 'play', ['Futbol-atea','Portería de fútbol','Football goal'], b => {
    b.step(['Oinarriak: bi Square etzanda, 60 cm-ko tartearekin, eta peg luze bana erdiko zuloan.',
            'Bases: dos Squares tumbados, a 60 cm, y un peg largo en el agujero central de cada uno.',
            'Bases: two Squares lying flat, 60 cm apart, and a long peg in the centre hole of each.']);
    const SL = b.block('square', [-30,5,0]), SR = b.block('square', [30,5,0]);
    b.peg(SL, [0,5,0]); b.peg(SR, [0,5,0]);
    b.step(['Zutoinak: txertatu Round bana zutik peg-etan.', 'Postes: encaja un Round de pie en cada peg.', 'Posts: slide a Round, standing up, onto each peg.']);
    const CL = b.block('round', [-30,25,-1], Q_XM90), CR = b.block('round', [30,25,-1], Q_XM90);
    b.step(['Atzeko euskarriak: peg labur bana atzean eta Angle bana, malda atzera.',
            'Apoyos traseros: un peg corto detrás y un Angle en cada base, con la rampa hacia atrás.',
            'Back supports: a short peg at the back and an Angle on each base, slope to the rear.']);
    b.peg(SL, [5,0,-10], 'pegShort'); b.peg(SR, [-5,0,-10], 'pegShort');
    b.block('angle', [-30,5,-20], Q_YM90); b.block('angle', [30,5,-20], Q_YM90);
    b.step(['Langa: short-long peg bana goian (mutur luzea barruan) eta beam-a gainean. Atea: 60 × 40 cm.',
            'Larguero: un peg short-long arriba (extremo largo dentro) y el beam encima. Portería de 60 × 40 cm.',
            'Crossbar: a short-long peg on top of each post (long end in) and the beam across. Goal: 60 × 40 cm.']);
    b.peg(CL, [0,-1,15], 'pegSL', { flip:true }); b.peg(CR, [0,-1,15], 'pegSL', { flip:true });
    b.block('beam', [0,40.7,0]);
  }),
  tpl('course', 'play', ['Oztopo-ibilbidea','Circuito de obstáculos','Obstacle course'], b => {
    b.step(['1. Oreka-zubia: bi Angle (malda kanpora), 70 cm-ko tartearekin, peg labur bana eta beam-a gainean.',
            '1. Puente de equilibrio: dos Angles (rampa hacia fuera) a 70 cm, un peg corto en cada uno y el beam encima.',
            '1. Balance bridge: two Angles (slope out) 70 cm apart, a short peg in each and the beam on top.']);
    const A1 = b.block('angle', [0,5,0]), A2 = b.block('angle', [70,5,0], Q_Y180);
    b.peg(A1, [5,5,-5], 'pegShort'); b.peg(A2, [5,5,5], 'pegShort');
    b.block('beam', [35,10.7,-5]);
    b.step(['2. Harri-pausoak: bi Round lurrean, kurba gora. Batetik bestera salto!',
            '2. Piedras de paso: dos Rounds en el suelo, con la curva hacia arriba. ¡A saltar de una a otra!',
            '2. Stepping stones: two Rounds on the floor, curve up. Hop from one to the next!']);
    b.block('round', [105,5,0]); b.block('round', [135,5,0]);
    b.step(['3. Langa: bi Square zutik, peg labur bana goian eta beam-a zeharka. Gainetik salto edo azpitik pasa.',
            '3. Valla: dos Squares de pie, un peg corto arriba y el beam atravesado. Salta por encima o pasa por debajo.',
            '3. Hurdle: two Squares standing, a short peg on top of each and the beam across. Jump over or crawl under.']);
    const HL = b.block('square', [185,10,-35], Q_Z90), HR = b.block('square', [185,10,35], Q_Z90);
    b.peg(HL, [10,0,5], 'pegShort'); b.peg(HR, [10,0,-5], 'pegShort');
    b.block('beam', [185,20.7,0], Q_Y90);
    b.step(['4. Kulunka: Block Base lurrean. Gurutzatu erori gabe!',
            '4. Balancín: el Block Base en el suelo. ¡Crúzalo sin caerte!',
            '4. Wobble board: the Block Base on the floor. Cross it without falling!']);
    b.block('base', [235,6.5,0]);
  }),
  tpl('rings', 'play', ['Uztai-jokoa','Juego de aros','Ring toss'], b => {
    b.step(['Jarri Block Base lurrean.', 'Coloca el Block Base en el suelo.', 'Put the Block Base on the floor.']);
    const base = b.block('base', [0,6.5,0]);
    b.step(['Hiru peg luze erdiko lerroan: erdian eta bi muturretan.',
            'Tres pegs largos en la línea central: en el centro y en los dos extremos.',
            'Three long pegs along the centre line: in the middle and at both ends.']);
    const mid = b.peg(base, [0,6.5,0]); b.peg(base, [-20,6.5,0]); b.peg(base, [20,6.5,0]);
    b.step(['Lau short-long peg erdiaren inguruan (mutur laburra barruan).',
            'Cuatro pegs short-long alrededor del centro (extremo corto dentro).',
            'Four short-long pegs around the centre (short end in).']);
    for (const [x,z] of [[-10,-5],[-10,5],[10,-5],[10,5]]) b.peg(base, [x,6.5,z], 'pegSL');
    b.step(['Uztaiak: foam gurpilak. Jaurti urrutitik eta sartu peg-etan! Peg bakoitzari eman puntuazio bat.',
            'Aros: las ruedas foam. ¡Lánzalas desde lejos y ensártalas en los pegs! Dale una puntuación a cada peg.',
            'Rings: the foam wheels. Throw them from a distance onto the pegs! Give each peg a score.']);
    b.foam(mid);
    for (const [x,z] of [[48,-12],[56,12],[-50,6]]) b.add({ type:'foam', p:[x,2.5,z], q:QI });
  }),
  tpl('scale', 'play', ['Balantza','Balanza','Balance scale'], b => {
    b.step(['Euskarria: Round bat lurrean, kurba gora.', 'Apoyo: un Round en el suelo, con la curva hacia arriba.', 'Pivot: a Round on the floor, curve up.']);
    b.block('round', [0,5,0]);
    b.step(['Besoa: jarri beam-a gainean, erdian, orekan.', 'Brazo: coloca el beam encima, centrado y en equilibrio.', 'Arm: lay the beam on top, centred and balanced.']);
    const arm = b.block('beam', [0,10.7,0]);
    b.step(['Sartu short-long peg bana muturretako zuloetan, goitik (mutur laburra behera).',
            'Mete un peg short-long en el agujero de cada extremo, desde arriba (extremo corto hacia abajo).',
            'Drop a short-long peg into the hole at each end, from above (short end down).']);
    const P = [b.peg(arm, [30,0.7,0], 'pegSL'), b.peg(arm, [-30,0.7,0], 'pegSL')];
    b.step(['Pisuak: foam gurpil bana peg-etan. Zein da astunagoa? Probatu beste objektu batzuekin.',
            'Pesos: una rueda foam en cada peg. ¿Cuál pesa más? Prueba con otros objetos.',
            'Weights: a foam wheel on each peg. Which side is heavier? Try other objects too.']);
    P.forEach(p => b.foam(p));
  }),
  tpl('bench', 'play', ['Banku luzea','Banco largo','Long bench'], b => {
    b.step(['Hankak: bi Square zutik, 60 cm-ko tartearekin, aurpegi zuloduna kanpora.',
            'Patas: dos Squares de pie, a 60 cm, con la cara de agujeros hacia fuera.',
            'Legs: two Squares standing, 60 cm apart, holed face outwards.']);
    const L = b.block('square', [-30,10,0], Q_Z90), R = b.block('square', [30,10,0], Q_Z90);
    b.step(['Sartu bi peg labur hanka bakoitzaren goiko zuloetan.', 'Inserta dos pegs cortos en los agujeros de arriba de cada pata.', 'Insert two short pegs in the top holes of each leg.']);
    for (const S of [L, R]){ b.peg(S, [10,0,5], 'pegShort'); b.peg(S, [10,0,-5], 'pegShort'); }
    b.step(['Eserlekua: bi beam elkarren ondoan, peg-en gainean. 70 × 20 cm, 21 cm-ko altueran.',
            'Asiento: dos beams uno junto a otro sobre los pegs. 70 × 20 cm, a 21 cm de altura.',
            'Seat: two beams side by side on the pegs. 70 × 20 cm, 21 cm high.']);
    b.block('beam', [0,20.7,5]); b.block('beam', [0,20.7,-5]);
  }),
  tpl('stairs', 'play', ['Eskailera txikia','Escalera pequeña','Little staircase'], b => {
    b.step(['Lehen maila: Square bat etzanda.', 'Primer escalón: un Square tumbado.', 'First step: a Square lying flat.']);
    const S1 = b.block('square', [0,5,0]);
    b.step(['Arrapala: bi peg labur aurrean eta Angle blokea, malda aurrera.',
            'Rampa: dos pegs cortos delante y el bloque Angle, con la rampa hacia delante.',
            'Ramp: two short pegs at the front and the Angle block, slope forward.']);
    b.peg(S1, [5,0,10], 'pegShort'); b.peg(S1, [-5,0,10], 'pegShort');
    b.block('angle', [0,5,20], Q_Y90);
    b.step(['Bigarren maila: bi peg labur atzean eta beste Square-a zutik.',
            'Segundo escalón: dos pegs cortos detrás y el otro Square de pie.',
            'Second step: two short pegs at the back and the other Square standing up.']);
    b.peg(S1, [5,0,-10], 'pegShort'); b.peg(S1, [-5,0,-10], 'pegShort');
    const S2 = b.block('square', [0,10,-15], Q_X90);
    b.step(['Heldulekuak: bi peg luze goian.', 'Agarres: dos pegs largos arriba.', 'Handholds: two long pegs on top.']);
    b.peg(S2, [5,0,-10]); b.peg(S2, [-5,0,-10]);
  }),
  tennisNet(2),
  tpl('table', 'book', ['Mahaia eta aulkia','Mesa y silla','Table and chair'], b => {
    b.step(['Mahaia: buelta eman Block Base-ari eta sartu lau peg luze izkinetako zuloetan (hankak).',
            'Mesa: dale la vuelta al Block Base e inserta cuatro pegs largos en los agujeros de las esquinas (las patas).',
            'Table: turn the Block Base over and insert four long pegs in the corner holes (the legs).']);
    const base = b.block('base', [0,13.5,0]);
    for (const [x,z] of [[-20,-10],[20,-10],[-20,10],[20,10]]) b.peg(base, [x,-3.5,z]);
    b.step(['Aulkia: jarri Square bat etzanda (eserlekua) eta sartu bi peg luze atzeko aldean.',
            'Silla: coloca un Square tumbado (el asiento) e inserta dos pegs largos en la parte de atrás.',
            'Chair: lay a Square flat (the seat) and insert two long pegs at the back.']);
    const seat = b.block('square', [50,5,0]);
    b.peg(seat, [-5,0,-10]); b.peg(seat, [5,0,-10]);
    b.step(['Txertatu bigarren Square-a zutik, bizkarralde gisa.', 'Encaja el segundo Square de pie, como respaldo.', 'Slide on the second Square standing up, as the backrest.']);
    b.block('square', [50,10,-15], Q_X90);
  }),
  tpl('beamPath', 'play', ['Oreka-bide luzea arrapalekin','Camino de equilibrio con rampas','Long balance path with ramps'], b => {
    b.step(['Jarri Angle bat (malda kanpora), bi Square etzanda eta beste Angle bat, 70 cm-ko tartearekin.',
            'Coloca un Angle (rampa hacia fuera), dos Squares tumbados y otro Angle, cada 70 cm.',
            'Place an Angle (slope out), two Squares lying flat and another Angle, 70 cm apart.']);
    const A1 = b.block('angle', [0,5,0]);
    const S1 = b.block('square', [70,5,0]), S2 = b.block('square', [140,5,0]);
    const A2 = b.block('angle', [210,5,0], Q_Y180);
    b.step(['Sartu sei peg labur goiko zuloetan, txandaka atzean eta aurrean (zigzaga).',
            'Inserta seis pegs cortos en los agujeros de arriba, alternando detrás y delante (zigzag).',
            'Insert six short pegs in the top holes, alternating back and front (zigzag).']);
    b.peg(A1, [5,5,-5], 'pegShort');
    b.peg(S1, [-5,5,-5], 'pegShort'); b.peg(S1, [5,5,5], 'pegShort');
    b.peg(S2, [-5,5,5], 'pegShort'); b.peg(S2, [5,5,-5], 'pegShort');
    b.peg(A2, [5,5,5], 'pegShort');
    b.step(['Jarri hiru beam-ak peg-en gainean.', 'Coloca los tres beams sobre los pegs.', 'Lay the three beams on the pegs.']);
    b.block('beam', [35,10.7,-5]); b.block('beam', [105,10.7,5]); b.block('beam', [175,10.7,-5]);
  }),
  tpl('platform', 'play', ['Plataforma arrapalarekin (70 × 40 cm)','Plataforma con rampa (70 × 40 cm)','Platform with ramp (70 × 40 cm)'], b => {
    b.step(['Ezkerrean bi Square etzanda; eskuinean bi Angle, malda kanpora. 70 cm-ko tartea.',
            'A la izquierda dos Squares tumbados; a la derecha dos Angles, rampa hacia fuera. A 70 cm.',
            'Two Squares lying flat on the left; two Angles on the right, slope out. 70 cm apart.']);
    const S1 = b.block('square', [-35,5,-10]), S2 = b.block('square', [-35,5,10]);
    const A1 = b.block('angle', [35,5,-10], Q_Y180), A2 = b.block('angle', [35,5,10], Q_Y180);
    b.step(['Sartu sei peg labur: kanpoko beam-entzat bi muturretan, erdikoentzat batean.',
            'Inserta seis pegs cortos: en los dos extremos para los beams exteriores y en uno para los centrales.',
            'Insert six short pegs: at both ends for the outer beams, at one end for the middle ones.']);
    b.peg(S1, [5,5,-5], 'pegShort'); b.peg(S1, [5,5,5], 'pegShort'); b.peg(S2, [5,5,5], 'pegShort');
    b.peg(A1, [5,5,5], 'pegShort'); b.peg(A2, [5,5,-5], 'pegShort'); b.peg(A2, [5,5,5], 'pegShort');
    b.step(['Jarri lau beam-ak elkarren ondoan.', 'Coloca los cuatro beams uno junto a otro.', 'Lay the four beams side by side.']);
    for (const z of [-15,-5,5,15]) b.block('beam', [0,10.7,z]);
  }),
  tpl('shelf', 'play', ['Apal txikia (bi solairu)','Estantería pequeña (dos niveles)','Small shelf (two levels)'], b => {
    b.step(['Jarri bi Square bloke zutik, 70 cm-ko tartearekin.', 'Coloca dos Squares de pie, a 70 cm.', 'Stand two Squares up, 70 cm apart.']);
    const L = b.block('square', [-35,10,0], Q_X90), R = b.block('square', [35,10,0], Q_X90);
    b.step(['Sartu peg luze bana barruko goiko zuloan: erdia kanpoan geratzen da.',
            'Inserta un peg largo en el agujero superior interior de cada uno: la mitad queda fuera.',
            'Insert a long peg in the inner top hole of each: half of it sticks out.']);
    b.peg(L, [5,0,-10]); b.peg(R, [-5,0,-10]);
    b.step(['Jarri lehen beam-a, peg-ak zuloetatik pasatuta.', 'Coloca el primer beam, pasando los pegs por sus agujeros.', 'Lay the first beam, with the pegs through its holes.']);
    b.block('beam', [0,20.7,0]);
    b.step(['Txertatu Round bana peg-en gainean, luzetara.', 'Encaja un Round sobre cada peg, a lo largo.', 'Slide a Round onto each peg, lengthways.']);
    const RL = b.block('round', [-35,26.4,0], Q_Y90), RR = b.block('round', [25,26.4,0], Q_Y90);
    b.step(['Sartu peg labur bana Round-en beste goiko zuloan eta jarri bigarren beam-a.',
            'Inserta un peg corto en el otro agujero superior de cada Round y coloca el segundo beam.',
            'Insert a short peg in the other top hole of each Round and lay the second beam.']);
    b.peg(RL, [0,5,-5], 'pegShort'); b.peg(RR, [0,5,-5], 'pegShort');
    b.block('beam', [-10,32.1,0]);
  }),

  /* ---------- Showpieces ---------- */
  tpl('dino', 'wow', ['Dinosauroa','Dinosaurio','Dinosaur'], b => {
    b.step(['Hankak: bi Square zutik, 10 cm-ko tartearekin.', 'Patas: dos Squares de pie, separados 10 cm.', 'Legs: two Squares standing up, 10 cm apart.']);
    const LF = b.block('square', [-15,10,0], Q_X90), LB = b.block('square', [15,10,0], Q_X90);
    b.step(['Gorputza: peg luze bana hanken kanpoko zuloan (12 cm barruan) eta Block Base gainean.',
            'Cuerpo: un peg largo en el agujero exterior de cada pata (12 cm dentro) y el Block Base encima.',
            'Body: a long peg in the outer hole of each leg (12 cm in) and the Block Base on top.']);
    b.peg(LF, [-5,0,-10], 'pegLong', { depth:12 }); b.peg(LB, [5,0,-10], 'pegLong', { depth:12 });
    const base = b.block('base', [0,26.5,0]);
    b.step(['Lepoa: peg labur bat aurreko muturrean eta Round bat zutik.',
            'Cuello: un peg corto en el extremo delantero y un Round de pie.',
            'Neck: a short peg at the front end and a Round standing up.']);
    b.peg(base, [-20,6.5,0], 'pegShort');
    const neck = b.block('round', [-20,48,-1], Q_XM90);
    b.step(['Burua: peg labur bat lepoaren goian eta bigarren Round-a etzanda, muturra aurrera.',
            'Cabeza: un peg corto arriba del cuello y el segundo Round tumbado, con el morro hacia delante.',
            'Head: a short peg on top of the neck and the second Round lying down, snout forward.']);
    b.peg(neck, [0,-1,15], 'pegShort');
    b.block('round', [-25,68,0], Q_Y90);
    b.step(['Buztana: peg labur bat atzean eta Angle blokea, malda atzera.',
            'Cola: un peg corto detrás y el bloque Angle, con la rampa hacia atrás.',
            'Tail: a short peg at the back and the Angle block, slope to the rear.']);
    b.peg(base, [10,6.5,5], 'pegShort');
    const tail = b.block('angle', [15,38,0], Q_Y180);
    b.step(['Arantzak: hiru short-long peg bizkarrean.', 'Púas: tres pegs short-long en el lomo.', 'Spikes: three short-long pegs along the back.']);
    b.peg(base, [0,6.5,0], 'pegSL'); b.peg(tail, [5,5,5], 'pegSL'); b.peg(tail, [5,5,-5], 'pegSL');
  }),
  tpl('bridge', 'wow', ['Zubia eta txalupa','Puente y barca','Bridge and boat'], b => {
    b.step(['Zutabeak: bi Square zutik, 60 cm-ko tartearekin, aurpegi zuloduna kanpora.',
            'Pilares: dos Squares de pie, a 60 cm, con la cara de agujeros hacia fuera.',
            'Piers: two Squares standing, 60 cm apart, holed face outwards.']);
    const L = b.block('square', [-30,10,0], Q_Z90), R = b.block('square', [30,10,0], Q_Z90);
    b.step(['Arrapalak: peg labur bana kanpoko aurpegian eta Angle bana, malda kanpora.',
            'Rampas: un peg corto en la cara exterior de cada pilar y un Angle, con la rampa hacia fuera.',
            'Ramps: a short peg on the outer face of each pier and an Angle, slope outwards.']);
    b.peg(L, [-5,5,5], 'pegShort'); b.peg(R, [-5,-5,5], 'pegShort');
    b.block('angle', [-45,5,0]); b.block('angle', [45,5,0], Q_Y180);
    b.step(['Sartu bi peg labur zutabe bakoitzaren goian.', 'Inserta dos pegs cortos arriba de cada pilar.', 'Insert two short pegs on top of each pier.']);
    for (const S of [L, R]){ b.peg(S, [10,0,5], 'pegShort'); b.peg(S, [10,0,-5], 'pegShort'); }
    b.step(['Zubi-ohola: bi beam elkarren ondoan.', 'Tablero: dos beams uno junto a otro.', 'Deck: two beams side by side.']);
    b.block('beam', [0,20.7,5]); b.block('beam', [0,20.7,-5]);
    b.step(['Txalupa: Round bat buruz behera zubiaren azpian, eta short-long peg bat masta gisa.',
            'Barca: un Round boca abajo bajo el puente y un peg short-long como mástil.',
            'Boat: a Round upside down under the bridge, with a short-long peg as the mast.']);
    const boat = b.block('round', [0,5,0], Q_Z180);
    b.peg(boat, [0,-5,5], 'pegSL');
  }),
  rocket(2),
  robot(2),
  tpl('crane', 'wow', ['Garabia','Grúa','Crane'], b => {
    b.step(['Oinarria: Block Base lurrean eta peg luze bat erdiaren ondoko zuloan.',
            'Base: el Block Base en el suelo y un peg largo en un agujero junto al centro.',
            'Base: Block Base on the floor and a long peg in a hole next to the centre.']);
    const base = b.block('base', [0,6.5,0]);
    b.peg(base, [5,6.5,-5]);
    b.step(['Txertatu lehen Square-a eta sartu peg luze bat haren izkinan.',
            'Encaja el primer Square e inserta un peg largo en su esquina.',
            'Slide on the first Square and insert a long peg in its corner.']);
    const S1 = b.block('square', [10,18,0]);
    b.peg(S1, [5,5,5]);
    b.step(['Txertatu bigarren Square-a eta sartu peg labur bat erdiko zuloan.',
            'Encaja el segundo Square e inserta un peg corto en el agujero central.',
            'Slide on the second Square and insert a short peg in its centre hole.']);
    const S2 = b.block('square', [10,28,0]);
    b.peg(S2, [0,5,0], 'pegShort');
    b.step(['Besoa: jarri beam-a peg laburraren gainean, kanpora begira.',
            'Brazo: coloca el beam sobre el peg corto, apuntando hacia fuera.',
            'Jib: lay the beam on the short peg, pointing outwards.']);
    const arm = b.block('beam', [40,33.7,0]);
    b.step(['Kakoa: sartu peg luze bat beam-aren muturreko zulotik behera eta jarri foam gurpila karga gisa.',
            'Gancho: mete un peg largo hacia abajo por el agujero del extremo del beam y pon la rueda foam como carga.',
            'Hook: push a long peg down through the hole at the end of the beam and add the foam wheel as the load.']);
    b.foam(b.peg(arm, [30,-0.7,0], 'pegLong', { depth:1.4 }));
    b.step(['Kontrapisua: short-long peg bat eta Angle blokea oinarriaren beste aldean.',
            'Contrapeso: un peg short-long y el bloque Angle al otro lado de la base.',
            'Counterweight: a short-long peg and the Angle block on the other side of the base.']);
    b.peg(base, [-5,6.5,5], 'pegSL');
    b.block('angle', [-10,18,0]);
  }),
  tpl('boat', 'wow', ['Kulunka-txalupa','Barca balancín','Rocking boat'], b => {
    b.step(['Kroskoa: jarri Round bat buruz behera eta sartu peg luze bat muturreko zuloan.',
            'Casco: coloca un Round boca abajo e inserta un peg largo en el agujero del extremo.',
            'Hull: put a Round upside down and insert a long peg in its end hole.']);
    const R1 = b.block('round', [0,5,-15], Q_Z180);
    b.peg(R1, [0,-1,15]);
    b.step(['Txertatu bigarren Round-a, hau ere buruz behera.', 'Encaja el segundo Round, también boca abajo.', 'Slide on the second Round, upside down too.']);
    const R2 = b.block('round', [0,5,15], Q_Z180);
    b.step(['Kabina: sartu peg labur bana Round-en alde lauko zuloetan eta txertatu Square bat erdian.',
            'Cabina: inserta un peg corto en la cara plana de cada Round y encaja un Square en el centro.',
            'Cabin: insert a short peg in the flat face of each Round and slide a Square on in the middle.']);
    b.peg(R1, [-5,-5,10], 'pegShort'); b.peg(R2, [5,-5,-10], 'pegShort');
    const C = b.block('square', [0,15,0]);
    b.step(['Masta: peg luze bat Square-aren erdiko zuloan.', 'Mástil: un peg largo en el agujero central del Square.', 'Mast: a long peg in the centre hole of the Square.']);
    b.peg(C, [0,5,0]);
  }),

  /* ---------- On wheels ---------- */
  tpl('racer', 'ride', ['Lasterketa-autoa','Coche de carreras','Racing car'], b => {
    b.step(['Txasisa: lotu bi Square blokeak bi peg luzerekin.', 'Chasis: une los dos Squares con dos pegs largos.', 'Chassis: join the two Squares with two long pegs.']);
    const [A, B] = chassis(b, 9);
    b.step(['Ardatzak: lau peg luze alboetako kanpoko zuloetan eta foam gurpil bana.',
            'Ejes: cuatro pegs largos en los agujeros exteriores de los lados y una rueda foam en cada uno.',
            'Axles: four long pegs in the outer side holes and a foam wheel on each.']);
    [b.peg(A, [-5,0,-10]), b.peg(A, [-5,0,10]), b.peg(B, [5,0,-10]), b.peg(B, [5,0,10])].forEach(p => b.foam(p));
    b.step(['Sudurra: bi peg labur aurrean eta Angle blokea, malda aurrera.',
            'Morro: dos pegs cortos delante y el bloque Angle, con la rampa hacia delante.',
            'Nose: two short pegs at the front and the Angle block, slope forward.']);
    b.peg(A, [-10,0,5], 'pegShort'); b.peg(A, [-10,0,-5], 'pegShort');
    b.block('angle', [-30,9,0]);
    b.step(['Kabina: peg labur bat eta Round blokea gainean, luzetara.',
            'Cabina: un peg corto y el bloque Round encima, a lo largo.',
            'Cockpit: a short peg and the Round block on top, lengthways.']);
    b.peg(B, [-5,5,5], 'pegShort');
    const cab = b.block('round', [5,19,0], Q_Y90);
    b.step(['Ihes-hodiak eta antena: bi short-long peg atzean eta bat kabinaren gainean.',
            'Tubos de escape y antena: dos pegs short-long detrás y uno sobre la cabina.',
            'Exhausts and antenna: two short-long pegs at the back and one on the cockpit.']);
    b.peg(B, [10,0,5], 'pegSL'); b.peg(B, [10,0,-5], 'pegSL');
    b.peg(cab, [0,5,5], 'pegSL');
  }),
  tpl('barrow', 'ride', ['Eskuorga','Carretilla','Wheelbarrow'], b => {
    b.step(['Kaxa: Square bat. Sartu bi peg luze aurreko alboetako zuloetan (ardatzak).',
            'Caja: un Square. Inserta dos pegs largos en los agujeros laterales delanteros (los ejes).',
            'Tub: one Square. Insert two long pegs in the front side holes (the axles).']);
    const S = b.block('square', [0,9,0]);
    const P = [b.peg(S, [-5,0,-10]), b.peg(S, [-5,0,10])];
    b.step(['Gurpilak: foam gurpil bana ardatzetan.', 'Ruedas: una rueda foam en cada eje.', 'Wheels: a foam wheel on each axle.']);
    P.forEach(p => b.foam(p));
    b.step(['Hankak: bi peg labur azpian, atzeko zuloetan.', 'Patas: dos pegs cortos por debajo, en los agujeros traseros.', 'Legs: two short pegs underneath, in the rear holes.']);
    b.peg(S, [5,-5,5], 'pegShort'); b.peg(S, [5,-5,-5], 'pegShort');
    b.step(['Heldulekuak: bi peg luze atzeko aurpegian.', 'Mangos: dos pegs largos en la cara trasera.', 'Handles: two long pegs in the rear face.']);
    b.peg(S, [10,0,5]); b.peg(S, [10,0,-5]);
    b.step(['Karga-ontzia: peg labur bat gainean eta Angle blokea, malda aurrera.',
            'Cubeta: un peg corto encima y el bloque Angle, con la rampa hacia delante.',
            'Tray: a short peg on top and the Angle block, slope forward.']);
    b.peg(S, [5,5,5], 'pegShort');
    b.block('angle', [0,19,0]);
  }),
  tpl('wagon', 'ride', ['Jostailu-orga','Carro de juguetes','Toy wagon'], b => {
    b.step(['Jarri Block Base eta sartu lau peg luze alboetako muturreko zuloetan.',
            'Coloca el Block Base e inserta cuatro pegs largos en los agujeros laterales de los extremos.',
            'Take the Block Base and insert four long pegs in the outer side holes.']);
    const base = b.block('base', [0,7.5,0]);
    const P = [[-20,15],[20,15],[-20,-15],[20,-15]].map(([x,z]) => b.peg(base, [x,1.5,z]));
    b.step(['Jarri lau foam gurpilak peg-en muturretan.', 'Coloca las cuatro ruedas foam en los pegs.', 'Fit the four foam wheels on the pegs.']);
    P.forEach(p => b.foam(p));
    b.step(['Hesolak: lau short-long peg goiko izkinetan, karga ez erortzeko.',
            'Estacas: cuatro pegs short-long en las esquinas de arriba, para que la carga no se caiga.',
            'Stakes: four short-long pegs in the top corners so the load stays on.']);
    for (const [x,z] of [[-20,-10],[20,-10],[-20,10],[20,10]]) b.peg(base, [x,6.5,z], 'pegSL');
    b.step(['Karga: peg labur bat eta Square bat gainean. Bete jostailuz!',
            'Carga: un peg corto y un Square encima. ¡Llénalo de juguetes!',
            'Load: a short peg and a Square on top. Fill it with toys!']);
    b.peg(base, [10,6.5,5], 'pegShort');
    b.block('square', [5,19,0]);
  }),
  tpl('truck', 'ride', ['Kamioia','Camión','Truck'], b => {
    b.step(['Txasisa: lotu bi Square blokeak bi peg luzerekin.', 'Chasis: une los dos Squares con dos pegs largos.', 'Chassis: join the two Squares with two long pegs.']);
    const [A, B] = chassis(b, 9);
    b.step(['Ardatzak: sartu lau peg luze alboetako kanpoko zuloetan.', 'Ejes: inserta cuatro pegs largos en los agujeros exteriores de los lados.', 'Axles: insert four long pegs in the outer side holes.']);
    const P = [b.peg(A, [-5,0,-10]), b.peg(A, [-5,0,10]), b.peg(B, [5,0,-10]), b.peg(B, [5,0,10])];
    b.step(['Jarri lau foam gurpilak peg-en muturretan.', 'Coloca las cuatro ruedas foam en los pegs.', 'Fit the four foam wheels on the pegs.']);
    P.forEach(p => b.foam(p));
    b.step(['Kabina: sartu short-long peg bat aurreko blokean eta txertatu Angle blokea, malda aurrera.',
            'Cabina: inserta un peg short-long en el bloque delantero y encaja el Angle, con la rampa hacia delante.',
            'Cab: insert a short-long peg in the front block and slide on the Angle, slope forward.']);
    b.peg(A, [5,5,5], 'pegSL');
    b.block('angle', [-10,19,0]);
    b.step(['Karga: jarri Round blokea atzeko blokearen gainean (peg-ik gabe).',
            'Carga: coloca el bloque Round sobre el bloque trasero (sin pegs).',
            'Load: put the Round block on the rear block (no pegs).']);
    b.block('round', [10,19,0]);
  }),
  tpl('plane', 'ride', ['Hegazkina','Avión','Aeroplane'], b => {
    const H = 5 + SWIRLY_DROP;
    b.step(['Gorputza: lotu bi Square blokeak bi peg luzerekin.', 'Fuselaje: une los dos Squares con dos pegs largos.', 'Fuselage: join the two Squares with two long pegs.']);
    const [A, B] = chassis(b, H);
    b.step(T_SWIRL);
    swirlies(b, A, B);
    b.step(['Hegoak: sartu bi peg labur aurreko blokean eta jarri bi beam-ak zeharka.',
            'Alas: inserta dos pegs cortos en el bloque delantero y coloca los dos beams atravesados.',
            'Wings: insert two short pegs in the front block and lay the two beams crossways.']);
    b.peg(A, [5,5,-5], 'pegShort'); b.peg(A, [5,5,5], 'pegShort');
    b.block('beam', [-5,H+5.7,35], Q_Y90); b.block('beam', [-5,H+5.7,-35], Q_Y90);
    b.step(['Isatsa: sartu short-long peg bat (mutur laburra behean) eta txertatu Angle blokea.',
            'Cola: inserta un peg short-long (extremo corto abajo) y encaja el bloque Angle.',
            'Tail: insert a short-long peg (short end down) and slide on the Angle block.']);
    b.peg(B, [5,5,5], 'pegSL');
    b.block('angle', [10,H+10,0]);
    b.step(['Helizea: peg luze bat aurrealdean eta foam gurpila haren muturrean.',
            'Hélice: un peg largo en el frente y la rueda foam en su punta.',
            'Propeller: a long peg at the front and the foam wheel on its tip.']);
    b.foam(b.peg(A, [-10,0,5]));
  }),
  tpl('heli', 'ride', ['Helikopteroa (errotorea biratu egiten da)','Helicóptero (el rotor gira)','Helicopter (the rotor spins)'], b => {
    const H = 5 + SWIRLY_DROP;
    b.step(['Kabina: lotu bi Square blokeak bi peg luzerekin.', 'Cabina: une los dos Squares con dos pegs largos.', 'Cabin: join the two Squares with two long pegs.']);
    const [A, B] = chassis(b, H);
    b.step(T_SWIRL);
    swirlies(b, A, B);
    b.step(['Isatsa: peg labur bat atzeko blokearen erdian eta beam bat atzera begira.',
            'Cola: un peg corto en el centro del bloque trasero y un beam apuntando hacia atrás.',
            'Tail: a short peg in the centre of the rear block and a beam pointing backwards.']);
    b.peg(B, [0,5,0], 'pegShort');
    b.block('beam', [40,H+5.7,0]);
    b.step(['Masta: peg luze bat aurreko blokearen erdiko zuloan.', 'Mástil: un peg largo en el agujero central del bloque delantero.', 'Mast: a long peg in the centre hole of the front block.']);
    b.peg(A, [0,5,0]);
    b.step(['Errotorea: bi beam masta inguruan, bata bestearen gainean eta gurutzatuta. Biratu egiten dira!',
            'Rotor: dos beams en el mástil, uno sobre otro y cruzados. ¡Giran!',
            'Rotor: two beams on the mast, one on top of the other and crossed. They spin!']);
    b.block('beam', [-40,H+5.7,0]); b.block('beam', [-10,H+7.1,30], Q_Y90);
  }),
  tpl('turtle', 'ride', ['Dortoka','Tortuga','Turtle'], b => {
    const H = 3.5 + SWIRLY_DROP;
    b.step(['Jarri Block Base eta sartu lau swirly gurpilak azpiko izkinetan.',
            'Coloca el Block Base e inserta las cuatro ruedas swirly en las esquinas de abajo.',
            'Take the Block Base and push the four swirly wheels into the bottom corners.']);
    const base = b.block('base', [0,H,0]);
    for (const [x,z] of [[-20,-10],[20,-10],[-20,10],[20,10]]) b.swirly(base, [x,-3.5,z]);
    b.step(['Oskola: peg labur bat eta Round blokea gainean, luzetara.',
            'Caparazón: un peg corto y el bloque Round encima, a lo largo.',
            'Shell: a short peg and the Round block on top, lengthways.']);
    b.peg(base, [10,6.5,5], 'pegShort');
    const shell = b.block('round', [10,H+11.5,0], Q_Y90);
    b.step(['Burua: peg labur bat eta Angle blokea aurrean, malda aurrera.',
            'Cabeza: un peg corto y el bloque Angle delante, con la rampa hacia delante.',
            'Head: a short peg and the Angle block at the front, slope forward.']);
    b.peg(base, [-10,6.5,-5], 'pegShort');
    b.block('angle', [-15,H+11.5,0]);
    b.step(['Buztana: short-long peg bat oskolaren atzeko muturrean.',
            'Cola: un peg short-long en el extremo trasero del caparazón.',
            'Tail: a short-long peg in the rear end of the shell.']);
    b.peg(shell, [0,-1,15], 'pegSL');
  }),

  /* ---------- From the booklet ---------- */
  tpl('scooter', 'book', ['Scooter Board','Scooter Board','Scooter Board'], b => {
    const H = 5 + SWIRLY_DROP;
    b.step(['Jarri lehen Square blokea.', 'Coloca el primer Square.', 'Place the first Square.']);
    const A = b.block('square', [-10,H,0]);
    b.step(['Sartu bi peg luze alboko zuloetan, erdiraino.', 'Inserta dos pegs largos en los agujeros laterales, hasta la mitad.', 'Insert two long pegs in the side holes, halfway in.']);
    b.peg(A, [10,0,-5]); b.peg(A, [10,0,5]);
    b.step(['Txertatu bigarren Square blokea peg-etan.', 'Encaja el segundo Square en los pegs.', 'Slide the second Square onto the pegs.']);
    const B = b.block('square', [10,H,0]);
    b.step(T_SWIRL);
    swirlies(b, A, B);
  }),
  tpl('swirlyRide', 'book', ['Swirly Ride','Swirly Ride','Swirly Ride'], b => {
    const H = 5 + SWIRLY_DROP;
    b.step(['Lotu bi Square blokeak alboz bi peg luzerekin.', 'Une los dos Squares de lado con dos pegs largos.', 'Join the two Squares side by side with two long pegs.']);
    const [A, B] = chassis(b, H);
    b.step(T_SWIRL);
    swirlies(b, A, B);
    b.step(['Aurrealdea: peg labur bat eta Angle blokea, malda aurrera.',
            'Frente: un peg corto y el bloque Angle, con la rampa hacia delante.',
            'Front: a short peg and the Angle block, slope forward.']);
    b.peg(A, [-5,5,5], 'pegShort');
    const F = b.block('angle', [-10,H+10,0]);
    b.step(['Eserlekua: peg labur bat eta Round blokea atzeko blokearen gainean.',
            'Asiento: un peg corto y el bloque Round sobre el bloque trasero.',
            'Seat: a short peg and the Round block on the rear block.']);
    b.peg(B, [5,5,5], 'pegShort');
    b.block('round', [10,H+10,5]);
    b.step(['Heldulekuak: bi peg luze Angle blokearen goiko zuloetan.', 'Manillar: dos pegs largos en los agujeros de arriba del Angle.', 'Handlebars: two long pegs in the top holes of the Angle.']);
    b.peg(F, [5,5,-5]); b.peg(F, [5,5,5]);
  }),
  tpl('rocker', 'book', ['Rocker','Rocker','Rocker'], b => {
    b.step(['Jarri Block Base lurrean (kurba behean: kulunkatu egiten da).',
            'Coloca el Block Base en el suelo (curva abajo: se balancea).',
            'Put the Block Base on the floor (curve down: it rocks).']);
    const base = b.block('base', [0,6.5,0]);
    b.step(['Sartu peg luze bat ezkerreko muturreko zuloan eta peg labur bat eskuinean.',
            'Inserta un peg largo en el agujero del extremo izquierdo y un peg corto a la derecha.',
            'Insert a long peg in the left end hole and a short peg on the right.']);
    b.peg(base, [-20,6.5,0]); b.peg(base, [5,6.5,5], 'pegShort');
    b.step(['Txertatu Square blokea zutik ezkerrean eta Round blokea eskuinean (eserlekua).',
            'Encaja el Square de pie a la izquierda y el Round a la derecha (el asiento).',
            'Slide on the Square standing on the left and the Round on the right (the seat).']);
    const S = b.block('square', [-15,23,0], Q_X90);
    b.block('round', [15,18,0], Q_Y90);
    b.step(['Heldulekuak: bi peg luze Square blokearen goiko zuloetan.', 'Agarres: dos pegs largos en los agujeros de arriba del Square.', 'Handles: two long pegs in the top holes of the Square.']);
    b.peg(S, [-5,0,-10]); b.peg(S, [5,0,-10]);
  }),
  tpl('walker', 'book', ['Walker','Walker','Walker'], b => {
    b.step(['Jarri Block Base eta sartu lau peg luze alboetako muturreko zuloetan.',
            'Coloca el Block Base e inserta cuatro pegs largos en los agujeros laterales de los extremos.',
            'Take the Block Base and insert four long pegs in the outer side holes.']);
    const base = b.block('base', [0,7.5,0]);
    const P = [[-20,15],[20,15],[-20,-15],[20,-15]].map(([x,z]) => b.peg(base, [x,1.5,z]));
    b.step(['Jarri lau foam gurpilak peg-en muturretan.', 'Coloca las cuatro ruedas foam en los pegs.', 'Fit the four foam wheels on the pegs.']);
    P.forEach(p => b.foam(p));
    b.step(['Zutabea: peg luze bat atzealdean eta lehen Square blokea etzanda.',
            'Columna: un peg largo en la parte trasera y el primer Square tumbado.',
            'Column: a long peg near the back and the first Square lying flat.']);
    b.peg(base, [-10,6.5,5]);
    const S1 = b.block('square', [-15,19,0]);
    b.step(['Peg luze bat izkinan eta bigarren Square blokea.', 'Un peg largo en la esquina y el segundo Square.', 'A long peg in the corner and the second Square.']);
    b.peg(S1, [-5,5,-5]);
    const S2 = b.block('square', [-15,29,0]);
    b.step(['Short-long peg bat eta Angle blokea gainean, malda aurrera.',
            'Un peg short-long y el bloque Angle encima, con la rampa hacia delante.',
            'A short-long peg and the Angle block on top, slope forward.']);
    b.peg(S2, [-5,5,5], 'pegSL');
    const A = b.block('angle', [-15,39,0], Q_Y180);
    b.step(['Heldulekua: bi peg luze Angle blokearen goiko zuloan eta maldako zuloan.',
            'Agarre: dos pegs largos, en el agujero de arriba del Angle y en el de la rampa.',
            'Handle: two long pegs, in the top hole of the Angle and in the slope hole.']);
    b.peg(A, [5,5,5]); b.peg(A, [-5,0,5], 'pegLong', { depth:5 });
  }),
  tpl('seesaw', 'book', ['Zabua','Balancín','Seesaw'], b => {
    b.step(['Jarri Block Base lurrean: kurbak kulunkatzen du.', 'Coloca el Block Base en el suelo: la curva hace que se balancee.', 'Put the Block Base on the floor: the curve makes it rock.']);
    const base = b.block('base', [0,6.5,0]);
    b.step(['Eserlekuak: peg labur bana alde bakoitzean eta Square bana gainean.',
            'Asientos: un peg corto a cada lado y un Square encima de cada uno.',
            'Seats: a short peg on each side and a Square on each.']);
    b.peg(base, [10,6.5,5], 'pegShort'); b.peg(base, [-10,6.5,-5], 'pegShort');
    const R = b.block('square', [15,18,0]), L = b.block('square', [-15,18,0]);
    b.step(['Heldulekuak: peg luze bana eserlekuen barruko zuloan.',
            'Agarres: un peg largo en el agujero interior de cada asiento.',
            'Handles: a long peg in the inner hole of each seat.']);
    b.peg(R, [-5,5,-5]); b.peg(L, [5,5,5]);
  }),
  tpl('balance', 'book', ['Balance Board','Balance Board','Balance Board'], b => {
    b.step(['Jarri Round bat buruz behera (kurba behean).', 'Coloca un Round boca abajo (curva abajo).', 'Put a Round upside down (curve down).']);
    b.block('round', [0,5,0], Q_Z180);
    b.step(['Jarri Block Base gainean, erdian. Kulunkatu eta oreka landu!',
            'Coloca el Block Base encima, centrado. ¡Balancéate y practica el equilibrio!',
            'Put the Block Base on top, centred. Rock and practise your balance!']);
    b.block('base', [0,16.5,0]);
  }),
  tpl('rockChair', 'book', ['Kulunka-aulkia','Mecedora','Rocking chair'], b => {
    b.step(['Jarri Block Base lurrean (kurbak kulunkatzen du).', 'Coloca el Block Base en el suelo (la curva hace que se balancee).', 'Put the Block Base on the floor (the curve makes it rock).']);
    const base = b.block('base', [0,6.5,0]);
    b.step(['Eserlekua: peg labur bat eta Square bat etzanda.', 'Asiento: un peg corto y un Square tumbado.', 'Seat: a short peg and a Square lying flat.']);
    b.peg(base, [5,6.5,5], 'pegShort');
    const seat = b.block('square', [10,18,0]);
    b.step(['Bizkarra: bi peg labur atzean eta Square bat zutik, aurpegi zuloduna atzera.',
            'Respaldo: dos pegs cortos detrás y un Square de pie, con la cara de agujeros hacia atrás.',
            'Backrest: two short pegs behind and a Square standing up, holed face to the rear.']);
    b.peg(base, [-5,6.5,5], 'pegShort'); b.peg(base, [-5,6.5,-5], 'pegShort');
    b.block('square', [-5,23,0], Q_Z90);
    b.step(['Heldulekuak: bi short-long peg eserlekuaren aurreko zuloetan.',
            'Agarres: dos pegs short-long en los agujeros delanteros del asiento.',
            'Handles: two short-long pegs in the front holes of the seat.']);
    b.peg(seat, [5,5,5], 'pegSL'); b.peg(seat, [5,5,-5], 'pegSL');
  }),

  /* ---------- With two extra Squares ---------- */
  rocket(4),
  tennisNet(4),
  robot(4),
  tpl('train', 'big', ['Trena (lokomotora + bagoia)','Tren (locomotora + vagón)','Train (engine + wagon)'], b => {
    const H = 5 + SWIRLY_DROP;
    b.step(['Lokomotora: lotu bi Square peg luzeekin eta sartu lau swirly gurpilak azpian.',
            'Locomotora: une dos Squares con pegs largos e inserta las cuatro ruedas swirly por debajo.',
            'Engine: join two Squares with long pegs and push the four swirly wheels in underneath.']);
    const [A, B] = chassis(b, H);
    swirlies(b, A, B);
    b.step(['Tximinia eta kabina: short-long peg bat aurrean; peg labur bat eta Angle blokea atzean.',
            'Chimenea y cabina: un peg short-long delante; un peg corto y el bloque Angle detrás.',
            'Funnel and cab: a short-long peg at the front; a short peg and the Angle block at the back.']);
    b.peg(A, [0,5,0], 'pegSL');
    b.peg(B, [5,5,5], 'pegShort');
    b.block('angle', [10,H+10,0]);
    b.step(['Bagoia: lotu beste bi Square peg luzeekin.', 'Vagón: une los otros dos Squares con pegs largos.', 'Wagon: join the other two Squares with long pegs.']);
    const C = b.block('square', [50,9,0]);
    b.peg(C, [10,0,-5]); b.peg(C, [10,0,5]);
    const D = b.block('square', [70,9,0]);
    b.step(['Ardatzak eta gurpilak: lau peg luze alboetan eta lau foam gurpil.',
            'Ejes y ruedas: cuatro pegs largos en los lados y cuatro ruedas foam.',
            'Axles and wheels: four long pegs in the sides and four foam wheels.']);
    [b.peg(C, [-5,0,-10]), b.peg(C, [-5,0,10]), b.peg(D, [5,0,-10]), b.peg(D, [5,0,10])].forEach(p => b.foam(p));
    b.step(['Karga: peg labur bat eta Round blokea bi blokeen gainean.',
            'Carga: un peg corto y el bloque Round sobre los dos bloques.',
            'Load: a short peg and the Round block across the two blocks.']);
    b.peg(C, [5,5,5], 'pegShort');
    b.block('round', [55,19,0]);
  }),
  tpl('shelfBig', 'big', ['Apal handia','Estantería grande','Big shelf'], b => {
    b.step(['Jarri bi Square bloke zutik, 70 cm-ko tartearekin.', 'Coloca dos Squares de pie, a 70 cm.', 'Stand two Squares up, 70 cm apart.']);
    const L = b.block('square', [-35,10,0], Q_X90), R = b.block('square', [35,10,0], Q_X90);
    b.step(['Sartu peg luze bana barruko goiko zuloan: erdia kanpoan geratzen da.',
            'Inserta un peg largo en el agujero superior interior de cada uno: la mitad queda fuera.',
            'Insert a long peg in the inner top hole of each: half of it sticks out.']);
    b.peg(L, [5,0,-10]); b.peg(R, [-5,0,-10]);
    b.step(['Jarri lehen beam-a, peg-ak zuloetatik pasatuta.', 'Coloca el primer beam, pasando los pegs por sus agujeros.', 'Lay the first beam, with the pegs through its holes.']);
    b.block('beam', [0,20.7,0]);
    b.step(['Txertatu beste bi Square blokeak, zutik, peg-en gainean.', 'Encaja los otros dos Squares, de pie, sobre los pegs.', 'Slide the other two Squares, standing, onto the pegs.']);
    const UL = b.block('square', [-35,31.4,0], Q_X90), UR = b.block('square', [35,31.4,0], Q_X90);
    b.step(['Sartu peg labur bana goian eta jarri bigarren beam-a.', 'Inserta un peg corto arriba de cada uno y coloca el segundo beam.', 'Insert a short peg on top of each and lay the second beam.']);
    b.peg(UL, [5,0,-10], 'pegShort'); b.peg(UR, [-5,0,-10], 'pegShort');
    b.block('beam', [0,42.1,0]);
  }),
  tpl('stage', 'big', ['Eszenatoki handia (70 × 40 cm)','Escenario grande (70 × 40 cm)','Big stage (70 × 40 cm)'], b => {
    b.step(['Jarri lau Square bloke etzanda, binaka eta elkarren kontra, 70 cm-ko tartearekin.',
            'Coloca cuatro Squares tumbados, de dos en dos y juntos, a 70 cm.',
            'Lay four Squares flat, in two touching pairs, 70 cm apart.']);
    const L1 = b.block('square', [-35,5,-10]), L2 = b.block('square', [-35,5,10]);
    const R1 = b.block('square', [35,5,-10]),  R2 = b.block('square', [35,5,10]);
    b.step(['Ezkerrean lau peg labur; eskuinean lau short-long, mutur luzea barruan.',
            'A la izquierda cuatro pegs cortos; a la derecha cuatro short-long, con el extremo largo dentro.',
            'Four short pegs on the left; four short-long pegs on the right, long end in.']);
    for (const z of [-5,5]){ b.peg(L1, [5,5,z], 'pegShort'); b.peg(L2, [5,5,z], 'pegShort'); }
    for (const z of [-5,5]){ b.peg(R1, [-5,5,z], 'pegSL', { flip:true }); b.peg(R2, [-5,5,z], 'pegSL', { flip:true }); }
    b.step(['Jarri lau beam-ak elkarren ondoan, peg-en gainean.', 'Coloca los cuatro beams uno junto a otro sobre los pegs.', 'Lay the four beams side by side on the pegs.']);
    for (const z of [-15,-5,5,15]) b.block('beam', [0,10.7,z]);
  }),
];
