/* גרסה 636: מנוע הדמיית שלד ומערכות (MDV). מצייר מודל קומה מקובץ JSON קטן — הכל מספריית אלמנטים קבועה.
 מבנה המודל: {v:1,n,fh,
   walls:[{a:[x,z],b:[x,z],t,m:'c'|'blk'|'stone'|'alu',o?,h?, ops?:[{k:'win'|'door'|'ldoor'|'x',at,w,h,s?}]}]   ← ops = פתחים בקיר: at = מרחק מרכז הפתח מנקודה a, w רוחב, h גובה, s גובה אדן (דלת 0)
   cols:[{x,z,w,d}], slab:{t,holes?:[{k:'shaft'|'stair'|'x',x,z,w,d}]}|null,
   open:[{a:[x,y,z],r,s:'sw'|'sp'|'el'|'wt'|'x',ax?,miss?:1}], pipes:[{s,pts:[[x,y,z]...],r}], starters:[{a:[x,z],b:[x,z]}],
   stair:[{x,z,w,d,fl?:2,lw?:1.3}], shaft:[{x,z,w,d}],
   zones?:[{k:'a1',n:'דירה 1',r:[x0,x1,z0,z1]},{k:'L',n:'לובי',r:[...]}]   ← דירות (k מתחיל ב-a) ולובי (k='L')
   rb?:[{d,kg?,L?,n}]  ← רשימת ברזל מהקונסטרוקטור (מדויק) · rbm?:{top:[d,s],bot:[d,s],st:[d,s,L],w:[d,s]} ← תוכנית זיון (הערכה) }
 מטרים, מרכז הקומה ב-0,0 */
(function(){
const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
function cnv(fn,s){s=s||256;const c=document.createElement('canvas');c.width=c.height=s;fn(c.getContext('2d'),s);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function texConcrete(){return cnv((g,s)=>{g.fillStyle='#9b9993';g.fillRect(0,0,s,s);for(let i=0;i<40;i++){const x=rnd()*s,y=rnd()*s,r=10+rnd()*50,gr=g.createRadialGradient(x,y,0,x,y,r),v=rnd()<.5?'255,255,255':'40,40,40';gr.addColorStop(0,`rgba(${v},${.05+rnd()*.06})`);gr.addColorStop(1,`rgba(${v},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}for(let i=0;i<3000;i++){const v=rnd()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${rnd()*.12})`;g.fillRect(rnd()*s,rnd()*s,1.5,1.5)}g.strokeStyle='rgba(60,60,60,.3)';g.lineWidth=2;g.strokeRect(1,1,s-2,s-2);g.fillStyle='rgba(35,35,35,.6)';for(const x of[.25,.75])for(const y of[.3,.7]){g.beginPath();g.arc(x*s,y*s,4,0,7);g.fill()}})}
function texStone(){return cnv((g,s)=>{g.fillStyle='#bfb5a2';g.fillRect(0,0,s,s);const rows=6,rh=s/rows;for(let r=0;r<rows;r++){let x=-(r%2)*s/6;while(x<s){const w=s/4+rnd()*s/5,L=200+rnd()*25|0;g.fillStyle=`rgb(${L},${L-12|0},${L-34|0})`;g.fillRect(x+2,r*rh+2,w-4,rh-4);x+=w}}})}
function texBlock(){return cnv((g,s)=>{g.fillStyle='#8f8f8b';g.fillRect(0,0,s,s);const rh=s/4;for(let r=0;r<4;r++)for(let k=-1;k<3;k++){g.fillStyle='#a7a6a1';g.fillRect(k*s/2+(r%2)*s/4+3,r*rh+3,s/2-6,rh-6)}})}
const SYS={sw:[0x5d6166,'ביוב'],sp:[0xc0392b,'ספרינקלרים'],el:[0xff7a12,'חשמל'],wt:[0x2f7fd0,'מים'],x:[0x7c5cbf,'אחר']};
const RW={8:.395,10:.617,12:.888,14:1.21,16:1.58,18:2.0,20:2.47,22:2.98,25:3.85,28:4.83,32:6.31};
const OPN={win:'חלון',door:'דלת כניסה',ldoor:'דלת מעלית',x:'פתח'},HLN={shaft:'פיר מעלית',stair:'חלל מדרגות',x:'חור בתקרה'};
function clipSeg(a,b,Z){let t0=0,t1=1;const dx=b[0]-a[0],dz=b[1]-a[1];for(const[p,q]of[[-dx,a[0]-Z[0]],[dx,Z[1]-a[0]],[-dz,a[1]-Z[2]],[dz,Z[3]-a[1]]]){if(p==0){if(q<0)return null}else{const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r}else{if(r<t0)return null;if(r<t1)t1=r}}}if(t1-t0<.001)return null;return[t0,t1]}
const inZ=(x,z,Z)=>x>=Z[0]-.01&&x<=Z[1]+.01&&z>=Z[2]-.01&&z<=Z[3]+.01;
/* חיתוך המודל לאזור (דירה / לובי): קירות נחתכים בקצה האזור, פתחים נשמרים במקומם */
function zone(M,Z){const o=JSON.parse(JSON.stringify(M)),P=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  o.walls=(M.walls||[]).map(w=>{const c=clipSeg(w.a,w.b,Z);if(!c)return null;const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),s=c[0]*L,e=c[1]*L;if(e-s<.05)return null;
    return Object.assign({},w,{a:P(w.a,w.b,c[0]),b:P(w.a,w.b,c[1]),ops:(w.ops||[]).filter(p=>p.at>s&&p.at<e).map(p=>Object.assign({},p,{at:p.at-s}))})}).filter(Boolean);
  o.starters=(M.starters||[]).map(w=>{const c=clipSeg(w.a,w.b,Z);return c?{a:P(w.a,w.b,c[0]),b:P(w.a,w.b,c[1])}:null}).filter(Boolean);
  o.cols=(M.cols||[]).filter(c=>inZ(c.x,c.z,Z));o.shaft=(M.shaft||[]).filter(c=>inZ(c.x,c.z,Z));o.stair=(M.stair||[]).filter(c=>inZ(c.x,c.z,Z));o.open=(M.open||[]).filter(h=>inZ(h.a[0],h.a[2],Z));
  if(o.slab&&o.slab.holes)o.slab.holes=o.slab.holes.filter(h=>inZ(h.x,h.z,Z));
  o.pipes=[];(M.pipes||[]).forEach(p=>{for(let i=0;i<p.pts.length-1;i++){const a=p.pts[i],b=p.pts[i+1];if(a[0]==b[0]&&a[2]==b[2]){if(inZ(a[0],a[2],Z))o.pipes.push({s:p.s,r:p.r,pts:[a,b]});continue}const c=clipSeg([a[0],a[2]],[b[0],b[2]],Z);if(!c)continue;const L=(t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];o.pipes.push({s:p.s,r:p.r,pts:[L(c[0]),L(c[1])]})}});
  o.zones=null;o.zr=Z;return o}
/* גבולות התקרה: ציר הקירות + חצי עובי הקיר החיצוני — אותו חישוב לציור ולכמויות */
function ext(M){let a=1e9,b=-1e9,c=1e9,d=-1e9,t=0;(M.walls||[]).forEach(w=>{[w.a,w.b].forEach(p=>{a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1])});t=Math.max(t,w.t||.25)});(M.cols||[]).forEach(k=>{a=Math.min(a,k.x);b=Math.max(b,k.x);c=Math.min(c,k.z);d=Math.max(d,k.z)});
  if(!isFinite(a))return null;const h=t/2;if(M.zr){return[Math.max(a-h,M.zr[0]),Math.min(b+h,M.zr[1]),Math.max(c-h,M.zr[2]),Math.min(d+h,M.zr[3])]}return[a-h,b+h,c-h,d+h]}
function holes(M){const H=((M.slab||{}).holes||[]).slice();(M.shaft||[]).forEach(s=>{if(!H.some(h=>Math.abs(h.x-s.x)<.3&&Math.abs(h.z-s.z)<.3))H.push({k:'shaft',x:s.x,z:s.z,w:s.w,d:s.d})});return H}
/* חיסור קטעים: [a,b] פחות רשימת חורים */
function sub(a,b,cut){let I=[[a,b]];cut.forEach(([c,d])=>{const N=[];I.forEach(([x,y])=>{if(d<=x||c>=y){N.push([x,y]);return}if(c>x)N.push([x,c]);if(d<y)N.push([d,y])});I=N});return I.filter(([x,y])=>y-x>.05)}

function open(el,M,o){o=o||{};const W=el.clientWidth||360,H=el.clientHeight||480;const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.setSize(W,H);R.shadowMap.enabled=true;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.85;el.appendChild(R.domElement);
  const S=new THREE.Scene();S.background=new THREE.Color(0xdfe3e6);const C=new THREE.PerspectiveCamera(38,W/H,.1,400);
  S.add(new THREE.HemisphereLight(0xeef3ff,0x8a8378,.65));const sun=new THREE.DirectionalLight(0xfff0d8,1);sun.position.set(-18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,far:90});S.add(sun);
  const mat=p=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},p));
  const tC=texConcrete(),tS=texStone(),tB=texBlock();
  const MC=mat({map:tC,bumpMap:tC,bumpScale:.04,color:0xa9a7a1}),MStone=mat({map:tS,roughness:.95}),MBlk=mat({map:tB,roughness:.95}),MAlu=mat({color:0xb9c3cc,metalness:.6,roughness:.35}),MRb=mat({color:0x3d2214,metalness:.5,roughness:.5}),MHole=mat({color:0x0d0d0e}),MRing=mat({color:0xf2c230,emissive:0x5a4200}),MMiss=mat({color:0xc0392b,emissive:0x770000});
  const MGl=mat({color:0x8fc3e6,transparent:true,opacity:.32,roughness:.1,metalness:.2,depthWrite:false}),MDr=mat({color:0x2f6b43,transparent:true,opacity:.16,depthWrite:false}),MHl=mat({color:0xf2c230,transparent:true,opacity:.13,depthWrite:false});
  const fh=M.fh||3,st=(M.slab&&M.slab.t)||.25,L={shell:new THREE.Group(),rebar:new THREE.Group(),sw:new THREE.Group(),sp:new THREE.Group(),el:new THREE.Group(),wt:new THREE.Group(),x:new THREE.Group(),slab:new THREE.Group()};Object.values(L).forEach(g=>S.add(g));
  const PK=[];const box=(g,w,h,d,x,y,z,m,ry)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);if(ry)b.rotation.y=ry;b.castShadow=b.receiveShadow=m.transparent?false:true;g.add(b);return b};
  const fm=n=>(+n).toFixed(2),dm=(a,b)=>'\u2066'+fm(a)+'×'+fm(b)+'\u2069';
  /* קיר עם פתחים: חלקים מלאים בין הפתחים, מעל ומתחת לכל פתח */
  (M.walls||[]).forEach(w=>{const[x1,z1]=w.a,[x2,z2]=w.b,len=Math.hypot(x2-x1,z2-z1),t=w.t||.25,h=w.h||fh,ang=-Math.atan2(z2-z1,x2-x1),cx=(x1+x2)/2,cz=(z1+z2)/2,ux=(x2-x1)/len,uz=(z2-z1)/len;
    const m=w.m=='blk'?MBlk:MC,cl=w.m=='stone'||w.m=='alu'?(w.m=='alu'?MAlu:MStone):null,oo=w.o||1,nx=Math.sin(-ang)*oo*(t/2+.035),nz=Math.cos(-ang)*oo*(t/2+.035);
    const piece=(s,e,y0,y1)=>{if(e-s<.01||y1-y0<.01)return;const c=(s+e)/2,px=x1+ux*c,pz=z1+uz*c;box(L.shell,e-s,y1-y0,t,px,(y0+y1)/2,pz,m,ang);if(cl)box(L.shell,e-s,y1-y0,.07,px-nx,(y0+y1)/2,pz+nz,cl,ang)};
    const ops=(w.ops||[]).map(p=>({p,s:Math.max(0,p.at-p.w/2),e:Math.min(len,p.at+p.w/2),y0:p.s!=null?p.s:(p.k=='win'?.9:0),y1:(p.s!=null?p.s:(p.k=='win'?.9:0))+p.h})).sort((a,b)=>a.s-b.s);
    let cur=0;ops.forEach(q=>{piece(cur,q.s,0,h);piece(q.s,q.e,0,q.y0);piece(q.s,q.e,Math.min(h,q.y1),h);cur=Math.max(cur,q.e);
      const c=(q.s+q.e)/2,g=box(L.shell,q.e-q.s,Math.min(h,q.y1)-q.y0,t*.6,x1+ux*c,(q.y0+Math.min(h,q.y1))/2,z1+uz*c,q.p.k=='win'?MGl:MDr,ang);g.userData.info=(OPN[q.p.k]||'פתח')+' · '+dm(q.p.w,q.p.h)+(q.p.k=='win'?' · אדן '+fm(q.y0):'');PK.push(g)});
    piece(cur,len,0,h)});
  (M.cols||[]).forEach(c=>box(L.shell,c.w||.4,fh,c.d||.4,c.x,fh/2,c.z,MC));
  (M.shaft||[]).forEach(c=>{const g=new THREE.Mesh(new THREE.BoxGeometry(c.w,.02,c.d),mat({color:0x22262b}));g.position.set(c.x,.02,c.z);L.shell.add(g)});
  (M.stair||[]).forEach(c=>{const n=12;for(let i=0;i<n;i++)box(L.shell,c.w,(i+1)*fh/n/2,c.d/n,c.x,(i+1)*fh/n/4,c.z-c.d/2+(i+.5)*c.d/n,MC)});
  const E=ext(M),HL=holes(M);let mnx=-10,mxx=10,mnz=-8,mxz=8;
  if(E){[mnx,mxx,mnz,mxz]=E;const fw=mxx-mnx,fd=mxz-mnz,cx=(mnx+mxx)/2,cz=(mnz+mxz)/2;
    /* תקרה (ורצפת הקומה) עם חורים אמיתיים לפיר ולמדרגות */
    const slabG=th=>{const sh=new THREE.Shape();sh.moveTo(mnx,-mnz);sh.lineTo(mxx,-mnz);sh.lineTo(mxx,-mxz);sh.lineTo(mnx,-mxz);sh.lineTo(mnx,-mnz);
      HL.forEach(h=>{const p=new THREE.Path(),a=h.x-h.w/2,b=h.x+h.w/2,c=-(h.z-h.d/2),d=-(h.z+h.d/2);p.moveTo(a,c);p.lineTo(a,d);p.lineTo(b,d);p.lineTo(b,c);p.lineTo(a,c);sh.holes.push(p)});
      const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false});g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);return g};
    tC.wrapS=tC.wrapT=THREE.RepeatWrapping;
    const fl=new THREE.Mesh(slabG(.3),MC);fl.position.y=-.3;fl.receiveShadow=true;L.shell.add(fl);
    if(M.slab!==null){const sl=new THREE.Mesh(slabG(st),mat({map:tC,color:0xa9a7a1,transparent:true,opacity:.55}));sl.position.y=fh;L.slab.add(sl)}
    HL.forEach(h=>{const g=box(L.slab,h.w,st,h.d,h.x,fh+st/2,h.z,MHl);g.userData.info=(HLN[h.k]||'חור בתקרה')+' · '+dm(h.w,h.d);PK.push(g)});
    /* רשת ברזל תקרה — המוטות נקטעים בחורים */
    const bar=new THREE.CylinderGeometry(.009,.009,1,6),o2=new THREE.Object3D(),seg=[];
    for(let x=mnx+.15;x<mxx;x+=.3){const cut=HL.filter(h=>Math.abs(h.x-x)<h.w/2).map(h=>[h.z-h.d/2,h.z+h.d/2]);sub(mnz+.1,mxz-.1,cut).forEach(([a,b])=>seg.push([x,(a+b)/2,b-a,0]))}
    for(let z=mnz+.15;z<mxz;z+=.3){const cut=HL.filter(h=>Math.abs(h.z-z)<h.d/2).map(h=>[h.x-h.w/2,h.x+h.w/2]);sub(mnx+.1,mxx-.1,cut).forEach(([a,b])=>seg.push([(a+b)/2,z,b-a,1]))}
    const im=new THREE.InstancedMesh(bar,MRb,seg.length);seg.forEach((s,k)=>{if(s[3]){o2.position.set(s[0],fh+.08,s[1]);o2.rotation.set(0,0,Math.PI/2)}else{o2.position.set(s[0],fh+.06,s[1]);o2.rotation.set(Math.PI/2,0,0)}o2.scale.set(1.6,s[2],1.6);o2.updateMatrix();im.setMatrixAt(k,o2.matrix)});L.rebar.add(im);
    (M.starters||[]).forEach(s=>{const[x1,z1]=s.a,[x2,z2]=s.b,len=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.floor(len/.2));for(let i=0;i<=n;i++){const t=i/n;const r=new THREE.Mesh(bar,MRb);r.scale.set(1.8,1,1.8);r.position.set(x1+(x2-x1)*t,fh+.6,z1+(z2-z1)*t);L.rebar.add(r)}})}
  const V=(p)=>new THREE.Vector3(p[0],p[1],p[2]);
  (M.pipes||[]).forEach(p=>{const g=L[p.s]||L.x,m=mat({color:(SYS[p.s]||SYS.x)[0],roughness:.4,metalness:.3});for(let i=0;i<p.pts.length-1;i++){const a=V(p.pts[i]),b=V(p.pts[i+1]),v=b.clone().sub(a),l=v.length();if(l<.01)continue;const c=new THREE.Mesh(new THREE.CylinderGeometry(p.r||.05,p.r||.05,l,14),m);c.position.copy(a).add(v.multiplyScalar(.5));c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());c.castShadow=true;g.add(c)}});
  (M.open||[]).forEach(h=>{const g=L[h.s]||L.x,r=h.r||.1,G=new THREE.Group(),hole=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.34,24),h.miss?MMiss:MHole);hole.rotation.x=Math.PI/2;const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.012,.016,8,32),h.miss?MMiss:MRing);ring.position.z=.17;const r2=ring.clone();r2.position.z=-.17;G.add(hole,ring,r2);G.position.set(h.a[0],h.a[1],h.a[2]);if(h.ax=='x')G.rotation.y=Math.PI/2;if(h.ax=='y')G.rotation.x=Math.PI/2;g.add(G);hole.userData.info=(h.miss?'⚠ פתח חסר בתוכנית · ':'')+((SYS[h.s]||SYS.x)[1])+' · קוטר '+Math.round(r*200)+' ס״מ';PK.push(hole)});
  /* תוויות דירות/לובי בתצוגת קומה — לחיצה נכנסת */
  const ZN=(o.zones&&M.zones)||[];ZN.forEach(z=>{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle=z.k=='L'?'rgba(34,38,43,.86)':'rgba(47,107,67,.92)';g.beginPath();g.roundRect?g.roundRect(8,14,240,68,34):g.rect(8,14,240,68);g.fill();g.fillStyle='#fff';g.font='bold 40px Heebo,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(z.n,128,50);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.renderOrder=9;sp.position.set((z.r[0]+z.r[1])/2,fh+1.3,(z.r[2]+z.r[3])/2);sp.scale.set(2.6,.975,1);sp.userData.zone=z.k;S.add(sp);PK.push(sp)});
  // camera orbit
  const ctr=new THREE.Vector3((mnx+mxx)/2,1.2,(mnz+mxz)/2),span=Math.max(mxx-mnx,mxz-mnz,6);let th=2.3,ph=.95,rd=span*1.35;
  const put=()=>{C.position.set(ctr.x+Math.cos(th)*Math.sin(ph)*rd,ctr.y+Math.cos(ph)*rd,ctr.z+Math.sin(th)*Math.sin(ph)*rd);C.lookAt(ctr)};put();
  const P=new Map();let d0=0,mv=0,dn=null;const cv=R.domElement;cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==1){mv=0;dn=[e.clientX,e.clientY]}else mv=99;if(P.size==2){const v=[...P.values()];d0=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1])}});
  cv.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId);if(dn)mv=Math.max(mv,Math.hypot(e.clientX-dn[0],e.clientY-dn[1]));if(P.size==1){th+=(e.clientX-p[0])*.008;ph=Math.max(.15,Math.min(1.5,ph-(e.clientY-p[1])*.006))}P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==2){const v=[...P.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);if(d0)rd=Math.max(span*.3,Math.min(span*3,rd*d0/d));d0=d}put()});
  const rc=new THREE.Raycaster(),tap=e=>{const r=cv.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(v,C);
    const vis=PK.filter(m=>{let q=m;while(q){if(q.visible===false)return false;q=q.parent}return true}),hit=rc.intersectObjects(vis,false)[0];
    if(hit&&hit.object.userData.zone){o.onZone&&o.onZone(hit.object.userData.zone);return}if(hit&&hit.object.userData.info){o.onPick&&o.onPick(hit.object.userData.info);return}
    if(ZN.length&&o.onZone){const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();if(rc.ray.intersectPlane(pl,pt)){const z=ZN.find(z=>inZ(pt.x,pt.z,z.r));if(z)o.onZone(z.k)}}};
  const up=e=>{const was=P.size==1&&mv<7;P.delete(e.pointerId);d0=0;if(was&&e.type=='pointerup')tap(e);dn=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('wheel',e=>{e.preventDefault();rd=Math.max(span*.3,Math.min(span*3,rd*(e.deltaY>0?1.1:.9)));put()},{passive:false});
  let run=1;const loop=()=>{if(!run)return;R.render(S,C);requestAnimationFrame(loop)};loop();
  return{layers:Object.keys(L),show(k,v){if(L[k])L[k].visible=v},dispose(){run=0;try{R.dispose()}catch(e){}cv.remove()},resize(){const w=el.clientWidth,h=el.clientHeight;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix()}}}

/* כמויות: בטון (קירות, עמודים, תקרה, מדרגות, קיזוז פתחים) וברזל (רשימת ברזל = מדויק, תוכנית זיון = הערכה). אין צורך ב-THREE */
function qty(M){const fh=M.fh||3,st=(M.slab&&M.slab.t)||.25,wh=fh-st,r2=v=>Math.round(v*100)/100,Q={fh,st,wh};
  let wl=0,wg=0;const OP={};(M.walls||[]).forEach(w=>{if(w.m=='blk')return;const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),t=w.t||.25,h=Math.min(w.h||wh,wh);wl+=len;wg+=len*t*h;
    (w.ops||[]).forEach(p=>{const hh=Math.min(p.h,h-(p.s!=null?p.s:(p.k=='win'?.9:0))),k=(p.k||'x')+'|'+r2(p.w)+'|'+r2(hh),v=p.w*hh*t;OP[k]=OP[k]||{k:p.k||'x',n:OPN[p.k]||'פתח',w:p.w,h:hh,c:0,v:0};OP[k].c++;OP[k].v+=v})});
  const ops=Object.values(OP),od=ops.reduce((s,p)=>s+p.v,0);Q.walls={len:r2(wl),gross:r2(wg),ops:ops.map(p=>Object.assign(p,{v:r2(p.v)})),ded:r2(od),net:r2(wg-od)};
  const cv=(M.cols||[]).reduce((s,c)=>s+(c.w||.4)*(c.d||.4)*wh,0);Q.cols={n:(M.cols||[]).length,v:r2(cv)};
  const E=ext(M),HL=holes(M);let sa=0,sh=0;if(E&&M.slab!==null){sa=(E[1]-E[0])*(E[3]-E[2]);sh=HL.reduce((s,h)=>s+h.w*h.d,0)}
  Q.slab={w:E?r2(E[1]-E[0]):0,d:E?r2(E[3]-E[2]):0,area:r2(sa),gross:r2(sa*st),holes:HL.map(h=>({k:h.k,n:HLN[h.k]||'חור',w:h.w,d:h.d,v:r2(h.w*h.d*st)})),ded:r2(sh*st),net:r2((sa-sh)*st),narea:r2(sa-sh)};
  let sv=0,nf=0;(M.stair||[]).forEach(s=>{const fl=s.fl||2,rise=fh/fl,n=Math.max(1,Math.round(rise/.17)),rr=rise/n,run=s.d,fw=s.fw||(fl>1?s.w/2:s.w);nf+=fl;sv+=fl*fw*Math.hypot(run,rise)*(.15+rr/2)+(fl-1)*s.w*(s.lw||1.3)*.18});Q.stairs={fl:nf,v:r2(sv)};
  const vv=Q.walls.net+Q.cols.v,vs=Q.slab.net+Q.stairs.v;Q.pours=[{k:'w',n:'קירות ועמודים',v:r2(vv),o:r2(vv*1.03),mx:Math.ceil(vv*1.03/12),pump:0},{k:'c',n:'תקרה ומדרגות',v:r2(vs),o:r2(vs*1.03),mx:Math.ceil(vs*1.03/12),pump:1}].filter(p=>p.v>0);Q.total=r2(vv+vs);
  /* ברזל */
  const RB={};const add=(d,L,n,kg)=>{const k=d+'|'+n;RB[k]=RB[k]||{d,n,L:0,kg:0};RB[k].L+=L||0;RB[k].kg+=kg!=null?kg:(L||0)*(RW[d]||d*d*.00617)};
  if(M.rb&&M.rb.length){Q.rbSrc='list';M.rb.forEach(r=>add(+r.d,r.L||0,r.n||'',r.kg!=null?+r.kg:null))}
  else if(M.rbm){Q.rbSrc='est';const m=M.rbm,A=Q.slab.narea;if(m.top)add(m.top[0],2*A/m.top[1],'רשת תקרה עליונה');if(m.bot)add(m.bot[0],2*A/m.bot[1],'רשת תקרה תחתונה');
    if(m.st){const Ls=(M.starters||[]).reduce((s,x)=>s+Math.hypot(x.b[0]-x.a[0],x.b[1]-x.a[1]),0);add(m.st[0],2*(Ls/m.st[1]+(M.starters||[]).length)*(m.st[2]||1),'קוצים לקירות')}
    if(m.w){const wa=Q.walls.len*wh;add(m.w[0],2*2*wa/m.w[1],'רשתות קירות')}}else Q.rbSrc='';
  const rows=Object.values(RB).map(r=>({d:r.d,n:r.n,L:Math.round(r.L),kg:Math.round(r.kg)})).sort((a,b)=>a.d-b.d);Q.rb=rows;const kg=rows.reduce((s,r)=>s+r.kg,0);Q.rbKg=kg;Q.rbOrder=Math.round(kg*(Q.rbSrc=='list'?1.03:1.07));
  const BD={};rows.forEach(r=>{BD[r.d]=(BD[r.d]||0)+r.kg});Q.rbByD=Object.keys(BD).map(d=>({d:+d,kg:BD[d]})).sort((a,b)=>a.d-b.d);return Q}
window.MDV={open,qty,zone,SYS,RW};
})();
