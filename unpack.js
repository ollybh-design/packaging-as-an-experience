/* Unpack Your Desk (concept 5) – live 3D walkthrough. Needs THREE (r128) (+ OrbitControls optional).
   World mm: X across the tray (0 = inside of the left wall), Y front-to-back (0 = inside of the front wall), Z up (0 = inside floor).
   Provisional dimensions. The pen cup is a pre-glued four-wall tube: the back wall is hinged to the deck along a scored line,
   the tube lies flattened in the back zone for shipping, lifts up on its hinge and opens on its four creased corners. */
(function(){
const T = 1.5;                                  // board
const IW = 250, IL = 160, IH = 24;              // tray inside
const DECK_Y0 = 72, DECK_H = 8;                 // back-zone deck (part of the insert)
const CH_Y = [3, 18.5, 34, 49.5, 65], CH_X0 = 3, CH_X1 = 192, DIV_H = 14;   // channel dividers
const REC_X0 = 196, REC_X1 = 248;               // recess column
const CUP = {x0: 6, yB: 154, W: 55, D: 55, H: 78, hz: DECK_H + 1.6};      // hinge on the back wall's bottom edge
const TAB = {w: 22, h: 8};
const TONGUE = {w: 18, h: 9};
const KRAFT = 0xc29a6b, KRAFT_L = 0xd3ae80, KRAFT_D = 0xa98257, BLUE = '#0058a3', YEL = 0xffcc00;
const LID = {ix: 127.5, y0: -2.5, y1: 162.5, H: 26};
const d2r = THREE.MathUtils.degToRad;
const lerp = (a, b, u) => a + (b - a)*u, ez = u => u < 0.5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;

function tex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
const C = c => new THREE.Color(c).convertSRGBToLinear();
function mat(c, r=0.88, map){ return new THREE.MeshStandardMaterial({color: map ? 0xffffff : C(c), roughness: r, map: map||null}); }
function bx(w, d, h, m){ const o = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), m); o.castShadow = o.receiveShadow = true; return o; }
function at(o, x, y, z){ o.position.set(x, y, z); return o; }
function bx6(w, d, h, ms){ const o = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), ms); o.castShadow = o.receiveShadow = true; return o; }
function kraftTex(base){ return tex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++){ g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,215' : '90,60,30'},${Math.random()*0.05})`; g.fillRect(Math.random()*w, Math.random()*h, 2 + Math.random()*5, 1 + Math.random()*2); } }); }

function build(scene, logo){
  const kt = kraftTex('#c29a6b'); kt.wrapS = kt.wrapT = THREE.RepeatWrapping; kt.repeat.set(2, 2);
  const kraft = mat(0, 0.9, kt), kraftL = mat(KRAFT_L, 0.9), kraftD = mat(KRAFT_D, 0.9), dark = mat(0x2a1f14, 1);
  const R = {};
  const base = new THREE.Group(); scene.add(base); R.base = base;
  // ---- tray (die-cut, creased, corner flaps tucked) ----
  base.add(at(bx(IW + 2*T, IL + 2*T, T, kraft), IW/2, IL/2, -T/2));
  const wallH = IH + T;
  const frontPrint = mat(0, 0.9, tex(1024, 110, (g, w, h) => { g.fillStyle = '#c29a6b'; g.fillRect(0, 0, w, h);
    if (logo){ const lh = 52, lw = lh*logo.width/logo.height; g.drawImage(logo, 40, (h - lh)/2, lw, lh); }
    g.fillStyle = BLUE; g.font = '800 40px "Inter", Arial'; g.textAlign = 'right'; g.fillText('UNPACK YOUR DESK', w - 40, h/2 + 14); }));
  base.add(at(bx6(IW + 2*T, T, wallH, [kraft, kraft, kraft, frontPrint, kraftD, kraft]), IW/2, -T/2, wallH/2 - T));
  base.add(at(bx6(IW + 2*T, T, wallH, [kraft, kraft, kraft, kraft, kraftD, kraft]), IW/2, IL + T/2, wallH/2 - T));
  base.add(at(bx6(T, IL, wallH, [kraft, kraft, kraft, kraft, kraftD, kraft]), -T/2, IL/2, wallH/2 - T));
  base.add(at(bx6(T, IL, wallH, [kraft, kraft, kraft, kraft, kraftD, kraft]), IW + T/2, IL/2, wallH/2 - T));
  // ---- preassembled insert: channel dividers, recess walls, back deck with lock slot ----
  for (const y of CH_Y) base.add(at(bx(CH_X1 - CH_X0, T, DIV_H, kraftL), (CH_X0 + CH_X1)/2, y + T/2, DIV_H/2));
  base.add(at(bx(T, CH_Y[4] + T - CH_Y[0], DIV_H, kraftL), CH_X1 + T/2 + 1, (CH_Y[0] + CH_Y[4] + T)/2, DIV_H/2));
  base.add(at(bx(T, CH_Y[4] + T - CH_Y[0], DIV_H, kraftL), REC_X0 - T/2, (CH_Y[0] + CH_Y[4] + T)/2, DIV_H/2));
  for (const y of [CH_Y[0], 34.5, CH_Y[4]]) base.add(at(bx(REC_X1 - REC_X0, T, DIV_H, kraftL), (REC_X0 + REC_X1)/2, y + T/2, DIV_H/2));
  base.add(at(bx(T, CH_Y[4] + T - CH_Y[0], DIV_H, kraftL), REC_X1 + T/2, (CH_Y[0] + CH_Y[4] + T)/2, DIV_H/2));
  base.add(at(bx(IW, IL - DECK_Y0, DECK_H, kraftL), IW/2, (DECK_Y0 + IL)/2, DECK_H/2));
  const slot = new THREE.Mesh(new THREE.PlaneGeometry(TONGUE.w + 2, 2.4), dark); slot.position.set(CUP.x0 + CUP.W/2, CUP.yB - CUP.D - 1.2, DECK_H + 0.05); base.add(slot);
  // ---- pen cup: four walls on creases, hinge on the back wall, locking tongue on the front wall ----
  const hold = new THREE.Group(); hold.position.set(CUP.x0, CUP.yB, CUP.hz); base.add(hold); R.hold = hold;
  const cupTex = tex(256, 360, (g, w, h) => { g.fillStyle = '#c29a6b'; g.fillRect(0, 0, w, h);
    if (logo){ const lw = 120, lh = lw*logo.height/logo.width; g.drawImage(logo, (w - lw)/2, h*0.62, lw, lh); } });
  cupTex.center.set(0.5, 0.5); cupTex.rotation = Math.PI; const cupPrint = mat(0, 0.9, cupTex);
  const wall = (m) => { const g = new THREE.Group(); const b = bx6(1, T, CUP.H, m); b.position.set(0.5, 0, CUP.H/2); g.add(b); g.userData.box = b; hold.add(g); return g; };
  R.walls = {B: wall([kraft, kraft, kraft, kraft, kraftD, kraft]), Rt: wall([kraft, kraft, kraft, kraft, kraftD, kraft]),
             F: wall([kraft, kraft, cupPrint, kraft, kraftD, kraft]), L: wall([kraft, kraft, kraft, kraft, kraftD, kraft])};
  // corner crease lines
  R.creases = []; for (let i = 0; i < 4; i++){ const l = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, CUP.H), kraftD); hold.add(l); R.creases.push(l); }
  const tab = new THREE.Mesh(new THREE.BoxGeometry(TAB.w, 0.9, TAB.h + 6), mat(YEL, 0.6)); tab.castShadow = true;
  tab.position.set(CUP.W/2, 1.0, CUP.H + TAB.h/2 - 3); hold.add(tab); R.tab = tab;
  const tongue = new THREE.Group(); R.walls.F.add(tongue); R.tongue = tongue;
  const tm = bx(TONGUE.w, 1.2, TONGUE.h, kraftD); tm.position.set(0, -1.3, -TONGUE.h/2); tongue.add(tm);
  // ---- lid: printed outside, QR placeholder inside ----
  const lid = new THREE.Group(); scene.add(lid); R.lid = lid;
  const lw = 2*LID.ix + 2*T, ll = LID.y1 - LID.y0 + 2*T;
  const lidTop = mat(0, 0.9, tex(1400, 900, (g, w, h) => { g.fillStyle = '#c29a6b'; g.fillRect(0, 0, w, h);
    if (logo){ const lh = 96, lw2 = lh*logo.width/logo.height; g.drawImage(logo, 70, 70, lw2, lh); }
    g.fillStyle = BLUE; g.font = '900 118px "Inter", Arial'; g.textAlign = 'left'; g.fillText('UNPACK', 70, 330); g.fillText('YOUR DESK', 70, 450);
    g.font = '600 40px "Inter", Arial'; g.fillText('Your starter kit. Your desk organiser.', 72, 520);
    g.font = '500 32px "Inter", Arial'; g.fillText('2 pens  ·  2 pencils  ·  sharpener  ·  rubber', 72, 800);
    // line drawing of the organiser
    g.strokeStyle = BLUE; g.lineWidth = 6; g.lineJoin = 'round';
    const ox = 900, oy = 560; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + 300, oy - 90); g.lineTo(ox + 420, oy - 30); g.lineTo(ox + 120, oy + 60); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox, oy + 40); g.lineTo(ox + 120, oy + 100); g.lineTo(ox + 420, oy + 10); g.lineTo(ox + 420, oy - 30); g.stroke();
    g.beginPath(); g.moveTo(ox + 120, oy + 60); g.lineTo(ox + 120, oy + 100); g.stroke();
    const cx = ox + 70, cy = oy - 40; g.strokeRect(cx, cy - 170, 110, 170); g.beginPath(); g.moveTo(cx + 25, cy - 170); g.lineTo(cx + 10, cy - 260); g.moveTo(cx + 60, cy - 170); g.lineTo(cx + 70, cy - 270); g.moveTo(cx + 90, cy - 170); g.lineTo(cx + 115, cy - 250); g.stroke(); }));
  const lidIn = mat(0, 0.9, tex(1400, 900, (g, w, h) => { g.fillStyle = '#d3ae80'; g.fillRect(0, 0, w, h); g.save();
    g.fillStyle = BLUE; g.font = '800 70px "Inter", Arial'; g.fillText('Set up your study space.', 90, 210);
    g.font = '500 38px "Inter", Arial'; g.fillText('Scan for desks, lamps and storage for small rooms.', 92, 280);
    g.setLineDash([18, 12]); g.lineWidth = 6; g.strokeStyle = BLUE; g.strokeRect(w - 420, 380, 320, 320); g.setLineDash([]);
    g.font = '700 40px "Inter", Arial'; g.textAlign = 'center'; g.fillText('QR', w - 260, 525); g.font = '500 28px "Inter", Arial'; g.fillText('placeholder: student', w - 260, 570); g.fillText('workspace products', w - 260, 606);
    g.fillStyle = '#ffcc00'; g.fillRect(92, 330, 120, 14); g.restore(); }));
  lid.add(at(bx6(lw, ll, T, [kraft, kraft, kraft, kraft, lidTop, lidIn]), 0, (LID.y0 + LID.y1)/2, LID.H - T/2));
  lid.add(at(bx6(lw, T, LID.H - T, [kraft, kraft, kraft, kraft, kraftD, kraft]), 0, LID.y0 - T/2, (LID.H - T)/2));
  lid.add(at(bx6(lw, T, LID.H - T, [kraft, kraft, kraft, kraft, kraftD, kraft]), 0, LID.y1 + T/2, (LID.H - T)/2));
  lid.add(at(bx6(T, ll, LID.H - T, [kraft, kraft, kraft, kraft, kraftD, kraft]), LID.ix + T/2, (LID.y0 + LID.y1)/2, (LID.H - T)/2));
  lid.add(at(bx6(T, ll, LID.H - T, [kraft, kraft, kraft, kraft, kraftD, kraft]), -LID.ix - T/2, (LID.y0 + LID.y1)/2, (LID.H - T)/2));
  // ---- stationery ----
  R.items = [pen(scene), pen(scene), pencil(scene), pencil(scene), rubber(scene), sharpener(scene)];
  return R;
}
/* stationery: local axis along +x, lying on z=0 */
function pen(scene){ const g = new THREE.Group(); scene.add(g); const blue = mat(0x1d3d8f, 0.45), steel = new THREE.MeshStandardMaterial({color: 0xc9cdd2, metalness: 0.8, roughness: 0.3});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 120, 24), blue); body.rotation.z = Math.PI/2; body.position.set(70, 0, 5.2); g.add(body);
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 4.6, 16, 20), blue); nose.rotation.z = Math.PI/2; nose.position.set(2 + 8, 0, 5.2); g.add(nose);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 4, 10), steel); tip.rotation.z = Math.PI/2; tip.position.set(0, 0, 5.2); g.add(tip);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 10, 20), steel); cap.rotation.z = Math.PI/2; cap.position.set(135, 0, 5.2); g.add(cap);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(34, 2.2, 1.4), steel); clip.position.set(112, 0, 11); g.add(clip);
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.userData.len = 140; g.userData.r = 5.2; return g; }
function pencil(scene){ const g = new THREE.Group(); scene.add(g); const wood = mat(0xe3b77a, 0.7), lead = mat(0x333333, 0.5);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 160, 6), wood); body.rotation.z = Math.PI/2; body.position.set(95, 0, 3.7); g.add(body);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 0.9, 15, 18), mat(0xf0d2a4, 0.8)); cone.rotation.z = -Math.PI/2; cone.position.set(7.5, 0, 3.7); g.add(cone);
  const pt = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3, 10), lead); pt.rotation.z = Math.PI/2; pt.position.set(-1.5, 0, 3.7); g.add(pt);
  const end = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 1, 6), mat(0x1d3d8f, 0.5)); end.rotation.z = Math.PI/2; end.position.set(175, 0, 3.7); g.add(end);
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.userData.len = 175; g.userData.r = 3.7; return g; }
function rubber(scene){ const g = new THREE.Group(); scene.add(g); const m = new THREE.Mesh(new THREE.BoxGeometry(40, 20, 10), mat(0xf5f4f0, 0.8)); m.position.set(0, 0, 5); m.castShadow = m.receiveShadow = true; g.add(m); return g; }
function sharpener(scene){ const g = new THREE.Group(); scene.add(g); const steel = new THREE.MeshStandardMaterial({color: 0xb9bdc2, metalness: 0.7, roughness: 0.35});
  const m = new THREE.Mesh(new THREE.BoxGeometry(26, 16, 12), steel); m.position.set(0, 0, 6); m.castShadow = true; g.add(m);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(4, 16), mat(0x222222, 1)); hole.rotation.y = -Math.PI/2; hole.position.set(-13.05, 0, 6); g.add(hole); return g; }

/* ---------------- cup kinematics ---------------- */
function placeWall(g, p0, p1){ const dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const len = Math.hypot(dx, dy);
  g.position.set(p0[0], p0[1], 0); g.rotation.set(0, 0, Math.atan2(dy, dx)); g.userData.box.scale.x = len; g.userData.box.position.x = len/2; }
function setCup(R, lift, open, lock){
  R.hold.rotation.x = d2r(90*(1 - lift));                       // 90 = lying forward on the deck, 0 = upright
  const W = CUP.W, D = CUP.D, rho = d2r(90*open);             // rho: right wall from in line (+x) to square (-y)
  const flat = 1 - Math.sin(rho), off = -1.6*flat;            // flattened layer sits just in front of the fixed one
  const BL = [0, 0], BR = [W, 0], FR = [W + D*Math.cos(rho), -D*Math.sin(rho) + off], FL = [FR[0] - W, FR[1]];
  placeWall(R.walls.B, BL, BR); placeWall(R.walls.Rt, BR, FR); placeWall(R.walls.F, FR, FL); placeWall(R.walls.L, FL, BL);
  [BL, BR, FR, FL].forEach((p, i) => R.creases[i].position.set(p[0], p[1], CUP.H/2));
  // tab on the back wall top edge; tongue hinged on the front wall's bottom edge (folded up inside until locked)
  R.tongue.position.set(W/2, 0, 0); R.tongue.rotation.x = d2r(lerp(180, 0, lock));
}

/* ---------------- poses for lid and stationery ---------------- */
const CH_C = i => (CH_Y[i] + T + CH_Y[i + 1])/2;          // channel centre lines (front = 0)
function itemPoses(k){ // [packed, table, cup] world matrices (base frame) for item k
  const Q = (ax, ay, az) => new THREE.Quaternion().setFromEuler(new THREE.Euler(ax, ay, az, 'ZYX'));
  const M = (p, q) => new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(1, 1, 1));
  const cupCx = CUP.x0 + CUP.W/2, cupCy = CUP.yB - CUP.D/2;
  const inCup = [[cupCx - 13, cupCy - 13], [cupCx + 13, cupCy + 12], [cupCx + 13, cupCy - 13], [cupCx - 12, cupCy + 13]];
  const lean = [[-0.07, 0.06], [0.06, -0.05], [0.07, 0.07], [-0.06, -0.07]];
  if (k < 4){ const pencilK = k >= 2; const ch = [3, 2, 1, 0][k];
    const packed = M([CH_X0 + 8, CH_C(ch), 0], Q(0, 0, 0));
    const table = M([-10 + k*6, -70 - k*16, -T], Q(0, 0, d2r(-6 + k*3)));
    const [cx, cy] = inCup[k], [lx, ly] = lean[k];
    // stand upright: local +x (tip) pointing down, bottom resting on the deck
    const cup = M([cx, cy, DECK_H + 0.5], new THREE.Quaternion().setFromEuler(new THREE.Euler(lx, ly, 0)).multiply(Q(0, -Math.PI/2, 0)));
    const r = pencilK ? 3.7 : 5.2; cup.multiply(new THREE.Matrix4().makeTranslation(0, 0, -r));
    return [packed, table, cup]; }
  if (k === 4){ const p = M([(REC_X0 + REC_X1)/2, (34.5 + T + CH_Y[4])/2, 0], Q(0, 0, 0)); return [p, p, p]; }
  const p = M([(REC_X0 + REC_X1)/2, (CH_Y[0] + T + 34.5)/2, 0], Q(0, 0, 0)); return [p, p, p];
}
function blendM(a, b, u, arc){ const pa = new THREE.Vector3(), qa = new THREE.Quaternion(), sa = new THREE.Vector3(), pb = new THREE.Vector3(), qb = new THREE.Quaternion(), sb = new THREE.Vector3();
  a.decompose(pa, qa, sa); b.decompose(pb, qb, sb); const e = ez(u); const p = pa.clone().lerp(pb, e); p.z += arc*Math.sin(Math.PI*u);
  return new THREE.Matrix4().compose(p, qa.clone().slerp(qb, e), new THREE.Vector3(1, 1, 1)); }
function lidPose(R, p){ // 0 on, 1 aside: flipped inside-up, behind-left of the tray
  const on = new THREE.Matrix4().compose(new THREE.Vector3(IW/2, 0, IH - LID.H + T + 1.5), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
  const aside = new THREE.Matrix4().compose(new THREE.Vector3(IW/2 - 40, 270, LID.H - T), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, d2r(-8))), new THREE.Vector3(1, 1, 1));
  return blendM(on, aside, p, 160); }

function apply(R, S){
  R.lid.matrixAutoUpdate = false; R.lid.matrix.copy(lidPose(R, S.lid)); R.lid.visible = !S.noLid;
  setCup(R, S.lift, S.open, S.lock);
  for (let k = 0; k < 6; k++){ const it = R.items[k]; const [pk, tb, cp] = itemPoses(k);
    // stagger: each item moves in its own slice of the parameter
    const sl = (v, i) => Math.min(1, Math.max(0, v*1.6 - i*0.15));
    let m; if (k >= 4) m = pk; else if (S.items <= 1) m = blendM(pk, tb, sl(S.items, k), 90); else m = blendM(tb, cp, sl(S.items - 1, k), 160);
    it.matrixAutoUpdate = false; it.matrix.copy(m); it.visible = S.showItems !== false || k >= 4; }
}

const S0 = {lid: 0, items: 0, lift: 0, open: 0, lock: 0};
const STEPS = [
  [[0, {}], [1, {lid: 1}]],
  [[0, {}], [1, {items: 1}]],
  [[0, {}], [0.55, {lift: 1}], [1, {open: 1}]],
  [[0, {}], [1, {lock: 1}]],
  [[0, {}], [1, {items: 2}]]];
function endState(i){ let s = {...S0}; for (let k = 0; k <= i; k++) for (const [, p] of STEPS[k]) Object.assign(s, p); return s; }
function sample(i, u){ const base = i ? endState(i - 1) : {...S0}; const keys = STEPS[i]; const out = {...base};
  for (const name of Object.keys(S0)){ let t0 = 0, v0 = base[name];
    for (const [t, p] of keys){ if (!(name in p)) continue; const v1 = p[name];
      if (u >= t){ t0 = t; v0 = v1; continue; } out[name] = lerp(v0, v1, ez((u - t0)/(t - t0))); v0 = null; break; }
    if (v0 !== null) out[name] = v0; }
  return out; }

window.mountUnpack = function(el, steps, opts){
  opts = opts || {};
  el.innerHTML = `<div class="player"><div class="stage up-stage"><canvas aria-label="Interactive 3D model of the Unpack Your Desk kit: drag to rotate"></canvas><span class="count"></span><span class="load">Loading…</span></div>
    <div class="talk"><div class="ctrl states" role="group" aria-label="Jump to a state"><button data-s="packed">Packed</button><button data-s="deploying">Deploying</button><button data-s="ready">Ready</button></div><div class="steps">${steps.map((s,i)=>`<button class="step" data-i="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><h3>${s.t}</h3><p>${s.b}</p></span></button>`).join('')}</div>
    <label class="rot"><span>Rotate view</span><input type="range" min="-70" max="70" value="0" step="1" aria-label="Rotate view"></label>
    <div class="ctrl"><button data-a="prev">← Back</button><button class="primary" data-a="next">Next step →</button><button data-a="replay">Replay</button></div></div></div>`;
  const cv = el.querySelector('canvas'), count = el.querySelector('.count'), load = el.querySelector('.load');
  const renderer = new THREE.WebGLRenderer({canvas: cv, antialias: true, preserveDrawingBuffer: !!opts.capture});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(opts.bg || 0xeae5df, 1);
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(28, 1, 5, 8000); cam.up.set(0, 0, 1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f70, 0.8));
  const key = new THREE.DirectionalLight(0xfff6ea, 0.95); key.position.set(-500, -700, 1100); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {left: -500, right: 500, top: 500, bottom: -500, near: 100, far: 3500}); key.shadow.bias = -0.0005; key.shadow.radius = 4; key.target.position.set(125, 80, 0); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(800, -300, 500); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.ShadowMaterial({opacity: 0.17})); ground.position.z = -T - 0.2; ground.receiveShadow = true; scene.add(ground);
  const ctrl = (THREE.OrbitControls && opts.orbit !== false) ? new THREE.OrbitControls(cam, cv) : null;
  if (ctrl){ ctrl.enableDamping = true; ctrl.enablePan = false; ctrl.minDistance = 250; ctrl.maxDistance = 2200; }
  const CV = {lid: {r: 1050, el: 34, az: -66, x: 120, y: 120, z: 20}, open: {r: 900, el: 42, az: -72, x: 125, y: 80, z: 10},
    items: {r: 980, el: 36, az: -70, x: 110, y: 40, z: 10}, cup: {r: 560, el: 30, az: -58, x: 60, y: 120, z: 40},
    ready: {r: 820, el: 26, az: -60, x: 110, y: 100, z: 60}, lock: {r: 560, el: 30, az: -52, x: 45, y: 110, z: 36}};
  const CAMS = [[[0, CV.lid], [1, CV.open]], [[0, CV.open], [1, CV.items]], [[0, CV.items], [0.35, CV.cup], [1, CV.cup]], [[0, CV.cup], [0.5, CV.lock], [1, CV.lock]], [[0, CV.lock], [1, CV.ready]]];
  const mixV = (a, b, e) => { const o = {}; for (const k of ['r', 'el', 'x', 'y', 'z']) o[k] = lerp(a[k], b[k], e); o.az = a.az + ((b.az - a.az + 540) % 360 - 180)*e; return o; };
  function camAt(i, u){ const K = CAMS[i]; if (u <= K[0][0]) return K[0][1];
    for (let k = 1; k < K.length; k++) if (u <= K[k][0]){ const [t0, a] = K[k-1], [t1, b] = K[k]; return mixV(a, b, ez((u - t0)/(t1 - t0))); } return K[K.length-1][1]; }
  let camOverride = null, camV = CV.lid, camAnim = null, azOffset = 0;
  function placeCam(azOff){ if (azOff !== undefined) azOffset = azOff; const v = camOverride || camV; const tg = new THREE.Vector3(v.x, v.y, v.z);
    const az = d2r(v.az + azOffset), e = d2r(v.el); cam.position.set(tg.x + v.r*Math.cos(e)*Math.cos(az), tg.y + v.r*Math.cos(e)*Math.sin(az), tg.z + v.r*Math.sin(e)); cam.lookAt(tg);
    if (ctrl){ ctrl.target.copy(tg); ctrl.update(); } }
  placeCam(0);
  el.querySelector('.rot input').addEventListener('input', e => placeCam(+e.target.value));
  function resize(){ const w = cv.clientWidth, h = cv.clientHeight; if (!w) return; renderer.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); }
  let R = null, cur = 0, anim = null, state = {...S0}, showItems = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = new Image();
  Promise.all([new Promise(r => { logo.onload = () => r(logo); logo.onerror = () => r(null); logo.src = opts.logo || 'f/ikea_logo.png'; }), document.fonts ? document.fonts.ready : null])
    .then(([lg]) => { R = build(scene, lg); load.textContent = ''; go(0, true, true); });
  const DUR = [1800, 1900, 3400, 1500, 2600];
  const lastCam = i => CAMS[i][CAMS[i].length - 1][1];
  function setUI(){ el.querySelectorAll('.step').forEach((b, j) => b.setAttribute('aria-current', j === cur)); count.textContent = `Step ${cur + 1} of ${steps.length}`; el.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', ({packed: 0, deploying: 2, ready: 4})[b.dataset.s] === cur));
    el.querySelector('[data-a="next"]').textContent = cur === steps.length - 1 ? 'Back to start' : 'Next step →'; }
  function go(i, instant, packed){ cur = Math.max(0, Math.min(steps.length - 1, i)); setUI();
    if (packed){ state = {...S0}; camV = CV.lid; placeCam(); anim = {kind: 'step', i: 0, t0: performance.now() + 700, ms: DUR[0]}; camAnim = {follow: 0}; return; }
    if (instant || reduce){ state = endState(cur); anim = null; camV = lastCam(cur); camAnim = null; placeCam(); return; }
    anim = {kind: 'step', i: cur, t0: performance.now(), ms: DUR[cur]}; camAnim = {follow: cur, from: camV}; }
  function camTo(view, ms){ camAnim = {from: camV, to: view, t0: performance.now(), ms}; }
  function blendTo(i, ms){ cur = i; setUI(); anim = {kind: 'blend', from: {...state}, to: endState(i), t0: performance.now(), ms}; camTo(lastCam(i), ms); }
  el.querySelectorAll('.step').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i === cur + 1 || i === cur) go(i); else blendTo(i, 1300); });
  const STATES = {packed: [{...S0}, CV.lid, 0], deploying: [{...S0, lid: 1, items: 1, lift: 1, open: 0.5}, {r: 720, el: 34, az: -62, x: 95, y: 105, z: 30}, 2], ready: [endState(4), CV.ready, 4]};
  el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const [st, v, i] = STATES[b.dataset.s]; cur = i; setUI();
    anim = {kind: 'blend', from: {...state}, to: st, t0: performance.now(), ms: 1300}; camTo(v, 1300); });
  el.querySelector('[data-a="prev"]').onclick = () => blendTo(Math.max(0, cur - 1), 1100);
  el.querySelector('[data-a="next"]').onclick = () => cur === steps.length - 1 ? blendTo(0, 1400) : go(cur + 1);
  el.querySelector('[data-a="replay"]').onclick = () => { state = cur ? endState(cur - 1) : {...S0}; go(cur); };
  function tick(t){ if (!el.isConnected){ renderer.dispose(); return; }
    resize();
    if (anim){ const u = Math.max(0, Math.min(1, (t - anim.t0)/anim.ms));
      if (anim.kind === 'step') state = sample(anim.i, u); else { const e = ez(u); state = {}; for (const k in anim.to) state[k] = lerp(anim.from[k], anim.to[k], e); }
      if (camAnim && camAnim.follow === anim.i && anim.kind === 'step'){ const v = camAt(anim.i, u); camV = camAnim.from && u < 0.15 ? mixV(camAnim.from, v, ez(u/0.15)) : v; placeCam(); }
      if (u >= 1){ anim = null; if (camAnim && camAnim.follow !== undefined) camAnim = null; } }
    if (camAnim && camAnim.follow === undefined){ const u = Math.min(1, (t - camAnim.t0)/camAnim.ms); camV = mixV(camAnim.from, camAnim.to, ez(u)); placeCam(); if (u >= 1) camAnim = null; }
    if (R) apply(R, {...state, showItems});
    if (ctrl) ctrl.update(); renderer.render(scene, cam); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  el.__up = {setState: (s, show) => { anim = null; camAnim = null; state = {...S0, ...s}; if (show !== undefined) showItems = show; }, endState,
             setView: v => { camOverride = v; placeCam(); },
             project: pts => { scene.updateMatrixWorld(true); cam.updateMatrixWorld(); return pts.map(p => { const v = new THREE.Vector3(...p).project(cam); return [(v.x + 1)/2*cv.width, (1 - v.y)/2*cv.height]; }); }, renderer, scene, cam, R: () => R};
  return {next: () => el.querySelector('[data-a="next"]').click(), prev: () => el.querySelector('[data-a="prev"]').click(), go};
};
window.__upDims = {T, IW, IL, IH, DECK_Y0, DECK_H, CH_Y, CUP, TAB, TONGUE, LID};
})();
