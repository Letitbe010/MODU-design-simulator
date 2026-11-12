// Piece catalogue, geometry and hole positions for the MODU builder
import * as THREE from 'three';

export const SNAP = 5;
export const SWIRLY_DROP = 6.3; // distance from block surface to floor when standing on swirly wheels
export const CATALOG = {
  square:   { dims:'20 × 20 × 10 cm', group:'struct', css:'#E9E5DD' },
  round:    { dims:'30 × 20 × 10 cm', group:'struct', css:'#E9E5DD' },
  angle:    { dims:'20 × 20 × 10 cm', group:'struct', css:'#E9E5DD' },
  base:     { dims:'50 × 30 × 10 cm', group:'struct', css:'#E9E5DD' },
  beam:     { dims:'70 × 10 × 1,4 cm', group:'struct', css:'#E8D49C' },
  pegLong:  { dims:'Ø3 × 20 cm', group:'peg', len:20, css:'#E6C977' },
  pegShort: { dims:'Ø3 × 7 cm',  group:'peg', len:7,  css:'#E6C977' },
  // collar off-centre: short end (3.5 cm) and long end (9.5 cm); F flips which end goes in
  pegSL:    { dims:'Ø3 × 13 cm', group:'peg', len:13, collar:3.5, css:'#E6C977' },
  swirly:   { dims:'Ø5 cm',      group:'swirly', css:'#2B2A28' },
  foam:     { dims:'Ø18 cm',     group:'foam', css:'#F1EEE8' },
};
export const ORDER = ['square','round','angle','base','beam','pegLong','pegShort','pegSL','swirly','foam'];
// Dreamer Set contents (modutoy.com product images) + 4 Balance Beams
export const DEFAULT_INV = { square:2, round:2, angle:2, base:1, beam:4, pegLong:8, pegShort:6, pegSL:4, swirly:4, foam:4 };

export const V = (x,y,z) => new THREE.Vector3(x,y,z);
export const Y = V(0,1,0), NEG_Y = V(0,-1,0);
// Shapes are drawn in a 2D plane (sx, sy) and extruded along world Y: (sx, sy, h) -> (sx, h, -sy)
const W = (sx,sy,h) => V(sx,h,-sy);
const N2 = (nx,ny) => V(nx,0,-ny).normalize();

function polyShape(pts){
  const s = new THREE.Shape();
  pts.forEach(([x,y],i) => i ? s.lineTo(x,y) : s.moveTo(x,y));
  s.closePath();
  return s;
}
function roundShape(){ // half-cylinder profile: 20 wide, 10 high
  const s = new THREE.Shape();
  s.moveTo(-10,-5); s.lineTo(10,-5);
  s.absarc(0,-5,10,0,Math.PI,false);
  s.closePath();
  return s;
}
// curved rocker under Block Base: chord 32 cm along the plate, 3 cm deep, 25 cm wide
const ROCKER = { c:16, sag:3, depth:25 };
function baseRocker(){
  const s = new THREE.Shape(), top = -3.5, { c, sag, depth } = ROCKER, R = (c*c + sag*sag)/(2*sag), cy = top - sag + R;
  s.moveTo(-c, top);
  s.absarc(0, cy, R, Math.atan2(top-cy, -c), Math.atan2(top-cy, c), false);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled:true, bevelThickness:0.5, bevelSize:0.5, bevelOffset:-0.5, bevelSegments:3, curveSegments:32 });
  geo.translate(0,0,-depth/2);
  return mesh(geo, MAT.sand);
}
// Block Round: 8 vertical holes from the flat face up through the curved face
function roundHoles(){
  const out = [];
  for (const [x,z] of [[-5,-10],[-5,0],[-5,10],[5,-10],[5,0],[5,10],[0,-5],[0,5]]){
    const yt = -5 + Math.sqrt(100 - x*x);
    out.push([x, -5, 0, -1, z]);                       // flat face
    out.push([x, yt, 0, 1, z, x/10, (yt+5)/10]);       // exit on the curve (drawn along the surface normal)
  }
  return out;
}
const S2 = Math.SQRT1_2;
// Profile pieces are extruded along their length; POST turns profile height into world Y
const POST = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
function beamShape(){
  const s = new THREE.Shape();
  s.moveTo(-30,-5); s.lineTo(30,-5);
  s.absarc(30,0,5,-Math.PI/2,Math.PI/2,false);
  s.lineTo(-30,5);
  s.absarc(-30,0,5,Math.PI/2,Math.PI*1.5,false);
  return s;
}
const quad = (a, b) => [[a,b],[-a,b],[a,-b],[-a,-b]];

// through: holes open on both faces · blind: holes open on the top face only
// sides: [sx, sy, nx, ny, h=0, vx, vy] -> hole whose axis lies in the shape plane;
// (vx,vy) is the surface normal used to draw it when the hole meets a slanted or curved face
export const DEF = {
  square: { // footprint 20x20 extruded 10 high; top holes like the five on a die
    shape: () => polyShape([[-10,-10],[10,-10],[10,10],[-10,10]]), thick:10, size:V(20,10,20), mat:'sand',
    through: [[-5,-5],[5,-5],[-5,5],[5,5],[0,0]],
    sides: [[10,-5,1,0],[10,5,1,0],[-10,-5,-1,0],[-10,5,-1,0],[-5,10,0,1],[5,10,0,1],[-5,-10,0,-1],[5,-10,0,-1]],
  },
  round: { // half cylinder: 20 wide, 10 high, 30 long
    shape: roundShape, thick:30, post:POST, size:V(20,10,30), mat:'sand',
    through: [[0,-1]],
    sides: roundHoles(),
  },
  angle: { // trapezoid profile (bottom 20, top 10, 45° slope, 10 high) extruded 20
    shape: () => polyShape([[-10,-5],[10,-5],[10,5],[0,5]]), thick:20, post:POST, size:V(20,10,20), mat:'sand',
    through: [[4,0]],
    sides: [
      [5,5,0,1,-5],[5,5,0,1,5],           // flat top
      [5,-5,0,-1,-5],[5,-5,0,-1,5],       // bottom, under the flat top
      [-5,0,0,1,-5,-S2,S2],[-5,0,0,1,5,-S2,S2], // vertical holes coming out of the slope
      [-5,-5,0,-1,-5],[-5,-5,0,-1,5],     // bottom, under the slope
      [10,0,1,0,-5],[10,0,1,0,5],         // vertical back face
    ],
  },
  // 50x30 plate, 10 thick, with a 3 cm rocker bulge underneath. Hole pattern taken from the
  // official product photo (5 cm grid): 19 on top, 4 on each long side, none on the short ends.
  base: {
    shape: () => polyShape([[-25,-15],[25,-15],[25,15],[-25,15]]), thick:10, yOff:1.5, size:V(50,13,30), mat:'sand',
    through: [[20,0],[-20,0], ...quad(20,10)],                    // clear of the rocker: open underneath too
    blind:   [[0,0], ...quad(5,5), ...quad(10,5), ...quad(5,10)], // above the rocker
    sides: [-20,-5,5,20].flatMap(x => [[x,15,0,1],[x,-15,0,-1]]),
    extra: baseRocker,
  },
  beam: {
    shape: beamShape, thick:1.4, size:V(70,1.4,10), mat:'beam',
    through: [[-30,0],[30,0]],
    sides: [],
  },
};

// Local hole list per structural type: surface point p and outward normal n
export const HOLES = {};
for (const [t,d] of Object.entries(DEF)) {
  const h = d.thick/2, list = [];
  for (const [x,y] of d.through) { list.push({ p:W(x,y,h), n:Y.clone() }); list.push({ p:W(x,y,-h), n:NEG_Y.clone() }); }
  for (const [x,y] of d.blind || []) list.push({ p:W(x,y,h), n:Y.clone() });
  for (const [x,y,nx,ny,hh=0] of d.sides) list.push({ p:W(x,y,hh), n:N2(nx,ny) });
  if (d.yOff) for (const o of list) o.p.y += d.yOff;
  if (d.post) for (const o of list){ o.p.applyQuaternion(d.post); o.n.applyQuaternion(d.post); }
  HOLES[t] = list;
}

/* ---------------- Materials ---------------- */
function speckleTexture(){
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#E9E5DD'; g.fillRect(0,0,256,256);
  const cols = ['rgba(196,188,174,.35)','rgba(255,255,255,.7)','rgba(176,166,150,.25)','rgba(214,206,193,.6)'];
  for (let i=0;i<3000;i++){
    g.fillStyle = cols[i%cols.length];
    g.beginPath(); g.arc(Math.random()*256, Math.random()*256, 0.4+Math.random()*1.1, 0, Math.PI*2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1/25,1/25);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const MAT = {
  sand:  new THREE.MeshStandardMaterial({ color:0xffffff, map:speckleTexture(), roughness:.95 }),
  hole:  new THREE.MeshStandardMaterial({ color:0xA79F92, roughness:1, side:THREE.DoubleSide }),
  honey: new THREE.MeshStandardMaterial({ color:0xE6C977, roughness:.5 }),
  beam:  new THREE.MeshStandardMaterial({ color:0xE8D49C, roughness:.65 }),
  tire:  new THREE.MeshStandardMaterial({ color:0x2A2826, roughness:.7 }),
  foam:  new THREE.MeshStandardMaterial({ color:0xffffff, map:speckleTexture(), roughness:.95 }),
};

/* ---------------- Prototype meshes ---------------- */
function mesh(geo, mat){ const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }

function buildStruct(type){
  const d = DEF[type], root = new THREE.Group(), g = new THREE.Group();
  if (d.post) g.quaternion.copy(d.post);
  if (d.yOff) g.position.y = d.yOff;
  root.add(g);
  if (d.extra) root.add(d.extra());
  const shape = d.shape(), blind = d.blind || [], vertical = [...d.through, ...blind];
  for (const [x,y] of vertical){ const p = new THREE.Path(); p.absarc(x,y,1.5,0,Math.PI*2,true); shape.holes.push(p); }
  const bt = Math.min(0.6, d.thick*0.2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth:d.thick-2*bt, bevelEnabled:true, bevelThickness:bt, bevelSize:bt, bevelOffset:-bt, bevelSegments:3, curveSegments:40,
  });
  geo.translate(0,0,-(d.thick-2*bt)/2);
  geo.rotateX(-Math.PI/2);
  geo.computeVertexNormals();
  g.add(mesh(geo, MAT[d.mat]));
  // hole interiors
  const tube = new THREE.CylinderGeometry(1.5,1.5,d.thick-0.2,20,1,true);
  for (const [x,y] of vertical){ const m = mesh(tube, MAT.hole); m.position.copy(W(x,y,0)); m.name = 'holeTube'; g.add(m); }
  // invisible caps so that clicking straight into a hole still hits the piece face
  const capGeo = new THREE.CircleGeometry(1.6,16);
  const cap = (x, y, s) => {
    const c = new THREE.Mesh(capGeo, MAT.hole);
    c.visible = false;
    c.quaternion.setFromUnitVectors(V(0,0,1), V(0,s,0));
    c.position.copy(W(x,y,s*(d.thick/2-0.05)));
    g.add(c);
  };
  for (const [x,y] of d.through){ cap(x,y,1); cap(x,y,-1); }
  for (const [x,y] of blind) cap(x,y,1);
  // side holes (blind holes drawn as dark discs)
  const disc = new THREE.CircleGeometry(1.5,20);
  for (const [x,y,nx,ny,h=0,vx,vy] of d.sides){
    const n = vx == null ? N2(nx,ny) : N2(vx,vy), m = new THREE.Mesh(disc, MAT.hole);
    m.quaternion.setFromUnitVectors(V(0,0,1), n);
    m.position.copy(W(x,y,h)).addScaledVector(n, 0.04);
    g.add(m);
  }
  return root;
}
function buildPeg(len, collarFromEnd){
  const root = new THREE.Group(), g = new THREE.Group();
  g.name = 'flipper'; // rotated 180° when an off-centre peg is flipped
  root.add(g);
  g.add(mesh(new THREE.CylinderGeometry(1.5,1.5,len-0.6,24), MAT.honey));
  for (const s of [1,-1]){
    const cap = mesh(new THREE.CylinderGeometry(1.2,1.5,0.3,24), MAT.honey);
    cap.position.y = s*(len/2-0.15); if (s<0) cap.rotation.x = Math.PI; g.add(cap);
  }
  // stop collar (in the middle, or collarFromEnd from the bottom end), with a groove on each side
  const cy = collarFromEnd == null ? 0 : -len/2 + collarFromEnd;
  const collar = mesh(new THREE.CylinderGeometry(1.95,1.95,0.7,28), MAT.honey); collar.position.y = cy; g.add(collar);
  for (const s of [1,-1]){
    const r = mesh(new THREE.TorusGeometry(1.5,0.14,6,24), MAT.honey);
    r.rotation.x = Math.PI/2; r.position.y = cy + s*0.9; g.add(r);
  }
  return root;
}
export function applyFlip(o, flip){
  const f = o.getObjectByName('flipper');
  if (f) f.rotation.x = flip ? Math.PI : 0;
  if (o.userData) o.userData.flip = !!flip;
}
function buildSwirly(){
  // local +Y: stem going into the hole; wheel hangs below (-Y)
  const g = new THREE.Group();
  const stem = mesh(new THREE.CylinderGeometry(1.4,1.4,4,20), MAT.honey); stem.position.y = 2; g.add(stem);
  // saucer-shaped flange that rests against the block
  const flange = mesh(new THREE.CylinderGeometry(3.8,1.4,1.4,32), MAT.honey); flange.position.y = -0.7; g.add(flange);
  const wy = -SWIRLY_DROP + 2.5;
  const body = mesh(new THREE.BoxGeometry(1.2,-wy-1.2,1.8), MAT.honey); body.position.y = (wy-1.4)/2 + 0.2; g.add(body);
  // twin wheels: dark tyre with a coloured cap on the outside
  for (const s of [1,-1]){
    const tyre = mesh(new THREE.CylinderGeometry(2.5,2.5,1.5,28), MAT.tire);
    tyre.rotation.z = Math.PI/2; tyre.position.set(s*1.4, wy, 0); g.add(tyre);
    const cap = mesh(new THREE.CylinderGeometry(1.9,1.9,0.2,24), MAT.honey);
    cap.rotation.z = Math.PI/2; cap.position.set(s*2.2, wy, 0); g.add(cap);
  }
  return g;
}
function buildFoam(){
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(9,9,5,48), MAT.foam));
  for (const s of [1,-1]){
    const hub = mesh(new THREE.CylinderGeometry(4,4,0.3,32), MAT.honey); hub.position.y = s*2.55; g.add(hub);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(1.5,20), MAT.hole);
    hole.rotation.x = -s*Math.PI/2; hole.position.y = s*2.72; g.add(hole);
  }
  return g;
}
export const PROTO = {
  square:buildStruct('square'), round:buildStruct('round'), angle:buildStruct('angle'), base:buildStruct('base'), beam:buildStruct('beam'),
  pegLong:buildPeg(20), pegShort:buildPeg(7), pegSL:buildPeg(13, CATALOG.pegSL.collar), swirly:buildSwirly(), foam:buildFoam(),
};

export function defaultDepth(t, flip=false){
  const c = CATALOG[t];
  if (c.collar != null) return flip ? c.len - c.collar : c.collar;
  return Math.min(c.len/2, 10);
}
export function clampDepth(t, d){ const L = CATALOG[t].len; return Math.max(1, Math.min(L-1, d ?? defaultDepth(t))); }

export function makeObject(type){
  const o = PROTO[type].clone();
  o.userData = { type };
  o.traverse(c => { if (c !== o) c.userData = { root:o }; });
  return o;
}
// Scene object for a saved record { type, p, q, depth?, flip? }
export function objectFromRec(rec){
  const o = makeObject(rec.type);
  o.position.fromArray(rec.p); o.quaternion.fromArray(rec.q);
  if (CATALOG[rec.type].group === 'peg') o.userData.depth = rec.depth ?? defaultDepth(rec.type, rec.flip);
  if (rec.flip) applyFlip(o, true);
  return o;
}
