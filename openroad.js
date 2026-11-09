/* Open Road (concept 3) – live 3D walkthrough. Needs THREE (r128) + THREE.OrbitControls loaded first.
   World: X across the box (0..330 inside), Y depth (0 front .. 330 back), Z up (floor top 0). mm. */
(function(){
const IN = 330, WALL = 1.5, SIDE = 3.0, H = 45, LT = 1.5;            // chamber, board, rolled side wall, lid board
const HINGE = {y: IN + WALL, z: H + LT/2};
const INS_T = 0.6, CW = 320, WW = 157, IH = 310, IY0 = 10;             // insert: centre, wings, height, gap from hinge
const CX0 = (IN - CW)/2;                                                // 5 mm each side
const LID_MAX = 100, WING_MAX = 165;
const STAGES = [ {lid:0, wing:0}, {lid:LID_MAX, wing:0}, {lid:LID_MAX, wing:80}, {lid:LID_MAX, wing:WING_MAX} ];
const CHAR = 0x1d1f22, KRAFT = 0xc49a6c;

function canvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t; }
function std(color, rough=0.85){ return new THREE.MeshStandardMaterial({color:new THREE.Color(color).convertSRGBToLinear(), roughness:rough}); }
function box(w,d,h,mat){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,d,h), mat); m.castShadow=true; m.receiveShadow=true; return m; }
function at(m,x,y,z){ m.position.set(x,y,z); return m; }
/* quad with explicit corners (counter-clockwise seen from the front) and uvs */
function quad(p, uv, map, side){ const g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...p[0],...p[1],...p[2],...p[0],...p[2],...p[3]],3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([...uv[0],...uv[1],...uv[2],...uv[0],...uv[2],...uv[3]],2));
  g.computeVertexNormals();
  const m=new THREE.Mesh(g, new THREE.MeshStandardMaterial({map, roughness:0.7, side: side||THREE.FrontSide})); m.receiveShadow=true; return m; }

function build(scene, img, ex){ ex = ex || {};
  const charcoal = std(CHAR, 0.8), kraft = std(KRAFT, 0.92), white = std(0xf3f0ea, 0.9);
  const root = new THREE.Group(); scene.add(root);
  // ---- base: floor, front/back walls, rolled (double) side walls, corner ears ----
  root.add(at(box(IN+2*SIDE, IN+2*WALL, WALL, charcoal), IN/2, IN/2, -WALL/2));
  root.add(at(box(IN, IN, 0.2, kraft), IN/2, IN/2, 0.1));
  root.add(at(box(IN+2*SIDE, WALL, H, charcoal), IN/2, -WALL/2, H/2));                // front wall
  root.add(at(box(IN+2*SIDE, WALL, H, charcoal), IN/2, IN+WALL/2, H/2));              // back wall
  root.add(at(box(SIDE, IN, H, charcoal), -SIDE/2, IN/2, H/2));                        // rolled sides
  root.add(at(box(SIDE, IN, H, charcoal), IN+SIDE/2, IN/2, H/2));
  for (const x of [0.4, IN-0.4]) root.add(at(box(0.6, IN, H-1, kraft), x, IN/2, H/2));   // kraft inner faces
  root.add(at(box(IN, 0.6, H-1, kraft), IN/2, 0.4, H/2)); root.add(at(box(IN, 0.6, H-1, kraft), IN/2, IN-0.4, H/2));
  // front wall print: text label (no logo artwork reproduced)
  const ft = canvasTex(1024,140,(g,w,h)=>{ g.fillStyle='#1d1f22'; g.fillRect(0,0,w,h);
    if (ex.rings){ const rh=104, rw=rh*ex.rings.width/ex.rings.height; g.drawImage(ex.rings, w/2-rw/2, 20, rw, rh); }
    else { g.fillStyle='#fff'; g.font='600 60px "Instrument Sans", Arial'; g.textAlign='center'; g.fillText('AUDI', w/2, 92); g.fillStyle='#e30613'; g.fillRect(w/2-40, 116, 80, 6); } });
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(IN, IN*140/1024), new THREE.MeshStandardMaterial({map:ft, roughness:0.8})); fp.rotation.x=Math.PI/2; at(fp, IN/2, -WALL-0.05, H/2); root.add(fp);
  // ---- pizza (margherita) ----
  const pz = new THREE.Group(); root.add(pz);
  pz.add(at(new THREE.Mesh(new THREE.CylinderGeometry(150,150,6,64), std(0xd9a15a,0.8)).rotateX(Math.PI/2), IN/2, IN/2, 4));
  const crust = new THREE.Mesh(new THREE.TorusGeometry(141,11,16,96), std(0xc9823d,0.75)); at(crust, IN/2, IN/2, 9); pz.add(crust);
  pz.add(at(new THREE.Mesh(new THREE.CylinderGeometry(132,132,2,64), std(0xd7472f,0.6)).rotateX(Math.PI/2), IN/2, IN/2, 7.6));
  const rnd = (s=>()=> (s=(s*16807)%2147483647)/2147483647)(7);
  for (let i=0;i<10;i++){ const a=rnd()*6.28, r=Math.sqrt(rnd())*105; const m=new THREE.Mesh(new THREE.CylinderGeometry(20+rnd()*8,20+rnd()*8,1.6,24), std(0xf4ead2,0.6)); m.rotation.x=Math.PI/2; m.scale.set(1,1,0.7+rnd()*0.5); at(m, IN/2+r*Math.cos(a), IN/2+r*Math.sin(a), 9); pz.add(m); }
  for (let i=0;i<7;i++){ const a=rnd()*6.28, r=Math.sqrt(rnd())*110; const m=new THREE.Mesh(new THREE.CylinderGeometry(10,10,1,3), std(0x2f6b2a,0.5)); m.rotation.x=Math.PI/2; m.scale.set(1.8,1,1); m.rotation.z=rnd()*3; at(m, IN/2+r*Math.cos(a), IN/2+r*Math.sin(a), 10.3); pz.add(m); }
  pz.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; }});

  // ---- lid assembly: pivot at the rear hinge crease. Lid-local: -y runs from hinge to the front edge, -z is the inner face ----
  const lid = new THREE.Group(); lid.position.set(0, HINGE.y, HINGE.z); root.add(lid);
  const LD = IN + WALL;                                      // lid depth hinge->front edge
  lid.add(at(box(IN+2*SIDE, LD, LT, charcoal), IN/2, -LD/2, 0));
  lid.add(at(box(IN+2*SIDE-1, LD-1, 0.3, kraft), IN/2, -LD/2, -LT/2-0.15));           // kraft inner face
  const flap = at(box(IN-2, LT, 38, charcoal), IN/2, -LD+LT/2+1.0, -19 - LT/2);            // front tuck flap, folds down inside front wall
  lid.add(flap);
  // outer lid print
  const lt = canvasTex(1536,1536,(g,w,h)=>{ g.fillStyle='#1d1f22'; g.fillRect(0,0,w,h);
    if (ex.cover) g.drawImage(ex.cover, 0, 0, w, h);
    // labelled QR placeholder, bottom right
    const qs=210, qx=w-qs-90, qy=h-qs-150; g.fillStyle='rgba(255,255,255,.92)'; g.fillRect(qx,qy,qs,qs);
    g.setLineDash([14,10]); g.lineWidth=4; g.strokeStyle='#1d1f22'; g.strokeRect(qx+14,qy+14,qs-28,qs-28); g.setLineDash([]);
    g.fillStyle='#1d1f22'; g.textAlign='center'; g.font='700 28px "Instrument Sans", Arial'; g.fillText('QR', qx+qs/2, qy+qs/2-8);
    g.font='600 20px "Instrument Sans", Arial'; g.fillText('placeholder', qx+qs/2, qy+qs/2+22);
    g.fillStyle='#fff'; g.font='600 24px "Instrument Sans", Arial'; g.fillText('Explore the A6 Sportback e-tron', qx+qs/2, qy+qs+40); });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(IN+2*SIDE, LD), new THREE.MeshStandardMaterial({map:lt, roughness:0.7})); at(top, IN/2, -LD/2, LT/2+0.05); lid.add(top);
  // insert centre panel (glued): art faces -z
  const yA = -IY0, yB = -(IY0+IH);                           // near hinge / front end of insert (lid-local y)
  const zC = -LT/2 - 0.3 - INS_T/2;                          // centre panel mid-plane
  lid.add(at(box(CW, IH, INS_T, white), CX0 + CW/2, (yA+yB)/2, zC));
  const pano = new THREE.Texture(img); pano.encoding=THREE.sRGBEncoding; pano.anisotropy=8; pano.needsUpdate=true;
  const total = WW*2 + CW, uL = WW/total, uR = (WW+CW)/total, zArt = zC - INS_T/2 - 0.05;
  // centre art: seen from -z; front-left corner (x=CX0, y=yB) is top-left of the image
  lid.add(quad([[CX0,yB,zArt],[CX0,yA,zArt],[CX0+CW,yA,zArt],[CX0+CW,yB,zArt]], [[uL,1],[uL,0],[uR,0],[uR,1]], pano, THREE.DoubleSide));
  // wings: pivot on the crease, lying folded over the centre art (further -z). rotation.y opens them.
  const teaser = canvasTex(1280,1240,(g,w,h)=>{ const sw=img.width*314/1268; g.drawImage(img, 0, 0, sw, img.height, 0, 0, w/2, h); g.drawImage(img, img.width-sw, 0, sw, img.height, w/2, 0, w/2, h); g.fillStyle='rgba(18,20,23,.62)'; g.fillRect(0,0,w,h);
    g.fillStyle='#fff'; g.font='600 64px "Instrument Sans", Arial'; g.textAlign='center';
    g.fillText('OPEN', w*0.25, h*0.46); g.fillText('ROAD', w*0.75, h*0.46);
    g.font='500 36px "Instrument Sans", Arial'; g.fillText('Unfold the view', w*0.25, h*0.56); g.fillText('A6 Sportback e-tron', w*0.75, h*0.56);
    g.fillStyle='#e30613'; g.fillRect(w*0.25-30, h*0.6, 60, 5); g.fillRect(w*0.75-30, h*0.6, 60, 5); });
  const wings = [];
  for (const side of ['L','R']){
    const pivot = new THREE.Group(); const xc = side==='L' ? CX0 : CX0+CW; pivot.position.set(xc, 0, zC - INS_T/2); lid.add(pivot);
    const s = side==='L' ? 1 : -1;                                   // folded wing extends +x (L) or -x (R) from its crease
    const body = box(WW, IH, INS_T, white); at(body, s*WW/2, (yA+yB)/2, -INS_T/2); pivot.add(body);
    // art on the face that touches the centre panel when folded (local +z, just above z=0)
    const z1 = 0.05, z2 = -INS_T - 0.05;
    const u0 = side==='L' ? uL : uR, u1 = side==='L' ? 0 : 1;          // crease -> free edge
    pivot.add(quad([[0,yB,z1],[0,yA,z1],[s*WW,yA,z1],[s*WW,yB,z1]], [[u0,1],[u0,0],[u1,0],[u1,1]], pano, THREE.DoubleSide));
    // teaser on the outside face (seen when folded)
    const t0 = side==='L' ? 0 : 1, t1 = side==='L' ? WW/(CW) : 1 - WW/CW;
    pivot.add(quad([[0,yB,z2],[0,yA,z2],[s*WW,yA,z2],[s*WW,yB,z2]], [[t0,1],[t0,0],[t1,0],[t1,1]], teaser, THREE.DoubleSide));
    wings.push({pivot, s});
  }
  // ---- lid stays: two-bar folded card straps at the rear corners, attached in the 10 mm strip between hinge and insert ----
  const stayMat = std(0xb8925f, 0.9), stays = [];
  const B = new THREE.Vector2(IN - 28, 30);                         // base attachment (y,z) on the side wall
  const lidPt = (phi) => { const a = -THREE.MathUtils.degToRad(phi), d = 6, n = 2.4; // lid-local (y=-d, z=-n)
    const y = -d, z = -n; return new THREE.Vector2(HINGE.y + y*Math.cos(a) - z*Math.sin(a), HINGE.z + y*Math.sin(a) + z*Math.cos(a)); };
  const SL = B.distanceTo(lidPt(LID_MAX)) / 2;
  for (const x of [1.4, IN-1.4]){ const s1 = box(1.2, 1, 16, stayMat), s2 = box(1.2, 1, 16, stayMat); s1.position.x = s2.position.x = x; root.add(s1, s2); stays.push([s1,s2]); }
  function placeStays(phi){ const L = lidPt(phi), d = B.distanceTo(L); const h = Math.sqrt(Math.max(0, SL*SL - d*d/4));
    const mid = B.clone().add(L).multiplyScalar(0.5), dir = L.clone().sub(B).normalize(), perp = new THREE.Vector2(dir.y, -dir.x);
    const M = mid.clone().add(perp.multiplyScalar(h));                // fold point bends toward the front/down
    for (const [s1,s2] of stays){ for (const [s,P,Q] of [[s1,B,M],[s2,M,L]]){ const c=P.clone().add(Q).multiplyScalar(0.5), v=Q.clone().sub(P);
        s.position.y=c.x; s.position.z=c.y; s.scale.z=v.length()/16; s.rotation.x = Math.atan2(v.y, v.x) - Math.PI/2; } } }
  function setState(phi, w){ lid.rotation.x = -THREE.MathUtils.degToRad(phi);
    for (const {pivot,s} of wings) pivot.rotation.y = s * THREE.MathUtils.degToRad(w);
    placeStays(phi); }
  return {setState};
}

window.mountOpenRoad = function(el, steps, opts){
  opts = opts || {};
  el.innerHTML = `<div class="player"><div class="stage or-stage"><canvas aria-label="Interactive 3D model: drag to rotate"></canvas><span class="count"></span><span class="load">Loading…</span></div>
    <div class="talk"><div class="steps">${steps.map((s,i)=>`<button class="step" data-i="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><h3>${s.t}</h3><p>${s.b}</p></span></button>`).join('')}</div>
    <label class="rot"><span>Rotate view</span><input type="range" min="-60" max="60" value="0" step="1" aria-label="Rotate view"></label>
    <div class="ctrl"><button data-a="prev">← Back</button><button class="primary" data-a="next">Next step →</button><button data-a="replay">Replay</button></div></div></div>`;
  const cv = el.querySelector('canvas'), count = el.querySelector('.count'), load = el.querySelector('.load');
  const renderer = new THREE.WebGLRenderer({canvas:cv, antialias:true, preserveDrawingBuffer: !!opts.capture});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0xeae5df, 1);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(28, 1, 10, 10000); cam.up.set(0,0,1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f70, 0.75));
  const key = new THREE.DirectionalLight(0xfff6ea, 0.95); key.position.set(-500,-900,1300); key.castShadow = true; key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-700,right:700,top:700,bottom:-700,near:100,far:4000}); key.shadow.bias=-0.0005; key.shadow.radius=5; key.target.position.set(165,165,0); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(600,-400,500); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000,8000), new THREE.ShadowMaterial({opacity:0.18})); ground.position.z=-1.6; ground.receiveShadow=true; scene.add(ground);
  const ctrl = (THREE.OrbitControls && opts.orbit!==false) ? new THREE.OrbitControls(cam, cv) : null;
  const target = new THREE.Vector3(165, 190, 110), base = {r: 1250, el: 24, az: -90};
  function placeCam(azOff){ const az = THREE.MathUtils.degToRad(base.az + azOff), el = THREE.MathUtils.degToRad(base.el);
    cam.position.set(target.x + base.r*Math.cos(el)*Math.cos(az), target.y + base.r*Math.cos(el)*Math.sin(az), target.z + base.r*Math.sin(el)); cam.lookAt(target);
    if (ctrl){ ctrl.target.copy(target); ctrl.update(); } }
  if (ctrl){ ctrl.enableDamping = true; ctrl.enablePan = false; ctrl.minDistance = 500; ctrl.maxDistance = 2600; }
  placeCam(0);
  el.querySelector('.rot input').addEventListener('input', e => placeCam(+e.target.value));
  function resize(){ const w = cv.clientWidth, h = cv.clientHeight; if (!w) return; renderer.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); }
  let model = null, cur = 0, anim = null, state = {lid:0, wing:0};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const li = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  Promise.all([li(opts.texture || 'f/audi_panorama.jpg'), li(opts.cover || 'f/audi_cover.jpg'), li(opts.rings || 'f/audi_rings.png'), document.fonts ? document.fonts.ready : null])
    .then(([img, cover, rings]) => { if (!img) { load.textContent='Image failed to load'; return; } model = window.__orBuild(scene, img, {cover, rings}); load.textContent=''; go(0, true); });
  function animateTo(from, to, ms){ anim = {from:{...from}, to:{...to}, t0: performance.now(), ms: reduce ? 1 : ms}; }
  function go(i, instant){ cur = Math.max(0, Math.min(steps.length-1, i));
    el.querySelectorAll('.step').forEach((b,j)=>b.setAttribute('aria-current', j===cur)); count.textContent = `Step ${cur+1} of ${steps.length}`;
    el.querySelector('[data-a="next"]').textContent = cur===steps.length-1 ? 'Back to start' : 'Next step →';
    const end = STAGES[cur], start = cur ? STAGES[cur-1] : STAGES[0];
    if (instant){ state = {...end}; anim = null; } else animateTo(cur ? start : state, end, 1700); }
  el.querySelectorAll('.step').forEach(b=>b.onclick=()=>go(+b.dataset.i));
  el.querySelector('[data-a="prev"]').onclick=()=>{ const t = Math.max(0,cur-1); animateTo(state, STAGES[t], 1000); cur=t; el.querySelectorAll('.step').forEach((b,j)=>b.setAttribute('aria-current', j===cur)); count.textContent=`Step ${cur+1} of ${steps.length}`; el.querySelector('[data-a="next"]').textContent='Next step →'; };
  el.querySelector('[data-a="next"]').onclick=()=> cur===steps.length-1 ? go(0) : go(cur+1);
  el.querySelector('[data-a="replay"]').onclick=()=> go(cur);
  const ease = u => u<0.5 ? 2*u*u : 1-Math.pow(-2*u+2,2)/2;
  function tick(t){ if (!el.isConnected){ renderer.dispose(); return; }
    resize();
    if (anim){ const u = Math.min(1, (t - anim.t0)/anim.ms), e = ease(u);
      state = {lid: anim.from.lid + (anim.to.lid-anim.from.lid)*e, wing: anim.from.wing + (anim.to.wing-anim.from.wing)*e}; if (u>=1) anim=null; }
    if (model) model.setState(state.lid, state.wing);
    if (ctrl) ctrl.update(); renderer.render(scene, cam); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  el.__or = {setState:(l,w)=>{ anim=null; state={lid:l,wing:w}; }, placeCam, renderer, scene, cam, go:(i)=>go(i,true)};
  return {next:()=> cur===steps.length-1 ? go(0) : go(cur+1), prev:()=>el.querySelector('[data-a="prev"]').click(), go};
};
window.__orBuild = build;
window.__orDims = {IN, WALL, SIDE, H, LT, HINGE, INS_T, CW, WW, IH, IY0, CX0, LID_MAX, WING_MAX};
})();
