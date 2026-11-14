/* גרסה 635: מנוע הדמיית שלד ומערכות (MDV). מצייר מודל קומה מקובץ JSON קטן — הכל מספריית אלמנטים קבועה.
 מבנה המודל: {v:1,n,fh, walls:[{a:[x,z],b:[x,z],t,m:'c'|'blk'|'stone'|'alu',h?}], cols:[{x,z,w,d}], slab:{t,pts?:[[x,z]...]}|null,
   open:[{a:[x,y,z],r,s:'sw'|'sp'|'el'|'wt'|'x',miss?:1}], pipes:[{s,pts:[[x,y,z]...],r}], starters:[{a:[x,z],b:[x,z]}],
   stair:[{x,z,w,d}], shaft:[{x,z,w,d}] } · מטרים, מרכז הקומה ב-0,0 */
(function(){
const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
function cnv(fn,s){s=s||256;const c=document.createElement('canvas');c.width=c.height=s;fn(c.getContext('2d'),s);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function texConcrete(){return cnv((g,s)=>{g.fillStyle='#9b9993';g.fillRect(0,0,s,s);for(let i=0;i<40;i++){const x=rnd()*s,y=rnd()*s,r=10+rnd()*50,gr=g.createRadialGradient(x,y,0,x,y,r),v=rnd()<.5?'255,255,255':'40,40,40';gr.addColorStop(0,`rgba(${v},${.05+rnd()*.06})`);gr.addColorStop(1,`rgba(${v},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}for(let i=0;i<3000;i++){const v=rnd()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${rnd()*.12})`;g.fillRect(rnd()*s,rnd()*s,1.5,1.5)}g.strokeStyle='rgba(60,60,60,.3)';g.lineWidth=2;g.strokeRect(1,1,s-2,s-2);g.fillStyle='rgba(35,35,35,.6)';for(const x of[.25,.75])for(const y of[.3,.7]){g.beginPath();g.arc(x*s,y*s,4,0,7);g.fill()}})}
function texStone(){return cnv((g,s)=>{g.fillStyle='#bfb5a2';g.fillRect(0,0,s,s);const rows=6,rh=s/rows;for(let r=0;r<rows;r++){let x=-(r%2)*s/6;while(x<s){const w=s/4+rnd()*s/5,L=200+rnd()*25|0;g.fillStyle=`rgb(${L},${L-12|0},${L-34|0})`;g.fillRect(x+2,r*rh+2,w-4,rh-4);x+=w}}})}
function texBlock(){return cnv((g,s)=>{g.fillStyle='#8f8f8b';g.fillRect(0,0,s,s);const rh=s/4;for(let r=0;r<4;r++)for(let k=-1;k<3;k++){g.fillStyle='#a7a6a1';g.fillRect(k*s/2+(r%2)*s/4+3,r*rh+3,s/2-6,rh-6)}})}
const SYS={sw:[0x5d6166,'ביוב'],sp:[0xc0392b,'ספרינקלרים'],el:[0xff7a12,'חשמל'],wt:[0x2f7fd0,'מים'],x:[0x7c5cbf,'אחר']};
function open(el,M,o){o=o||{};const W=el.clientWidth||360,H=el.clientHeight||480;const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.setSize(W,H);R.shadowMap.enabled=true;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.85;el.appendChild(R.domElement);
  const S=new THREE.Scene();S.background=new THREE.Color(0xdfe3e6);const C=new THREE.PerspectiveCamera(38,W/H,.1,400);
  S.add(new THREE.HemisphereLight(0xeef3ff,0x8a8378,.65));const sun=new THREE.DirectionalLight(0xfff0d8,1);sun.position.set(-18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,far:90});S.add(sun);
  const mat=p=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},p));
  const tC=texConcrete(),tS=texStone(),tB=texBlock();
  const MC=mat({map:tC,bumpMap:tC,bumpScale:.04,color:0xa9a7a1}),MStone=mat({map:tS,roughness:.95}),MBlk=mat({map:tB,roughness:.95}),MAlu=mat({color:0xb9c3cc,metalness:.6,roughness:.35}),MRb=mat({color:0x3d2214,metalness:.5,roughness:.5}),MHole=mat({color:0x0d0d0e}),MRing=mat({color:0xf2c230,emissive:0x5a4200}),MMiss=mat({color:0xc0392b,emissive:0x770000});
  const fh=M.fh||3,L={shell:new THREE.Group(),rebar:new THREE.Group(),sw:new THREE.Group(),sp:new THREE.Group(),el:new THREE.Group(),wt:new THREE.Group(),x:new THREE.Group(),slab:new THREE.Group()};Object.values(L).forEach(g=>S.add(g));
  const box=(g,w,h,d,x,y,z,m,ry)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);if(ry)b.rotation.y=ry;b.castShadow=b.receiveShadow=true;g.add(b);return b};
  let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;const ext=(x,z)=>{mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mnz=Math.min(mnz,z);mxz=Math.max(mxz,z)};
  (M.walls||[]).forEach(w=>{const[x1,z1]=w.a,[x2,z2]=w.b,len=Math.hypot(x2-x1,z2-z1),t=w.t||.25,h=w.h||fh,ang=-Math.atan2(z2-z1,x2-x1),cx=(x1+x2)/2,cz=(z1+z2)/2;ext(x1,z1);ext(x2,z2);
    const m=w.m=='blk'?MBlk:MC;const b=box(L.shell,len,h,t,cx,h/2,cz,m,ang);if(m===MC){m.map.repeat&&0}
    if(w.m=='stone'||w.m=='alu'){const o=w.o||1,nx=Math.sin(-ang)*o*(t/2+.035),nz=Math.cos(-ang)*o*(t/2+.035);box(L.shell,len,h,.07,cx-nx,h/2,cz+nz,w.m=='alu'?MAlu:MStone,ang)}});
  (M.cols||[]).forEach(c=>{box(L.shell,c.w||.4,fh,c.d||.4,c.x,fh/2,c.z,MC);ext(c.x,c.z)});
  (M.shaft||[]).forEach(c=>{const g=new THREE.Mesh(new THREE.BoxGeometry(c.w,.02,c.d),mat({color:0x22262b}));g.position.set(c.x,.02,c.z);L.shell.add(g)});
  (M.stair||[]).forEach(c=>{const n=12;for(let i=0;i<n;i++)box(L.shell,c.w,(i+1)*fh/n/2,c.d/n,c.x,(i+1)*fh/n/4,c.z-c.d/2+(i+.5)*c.d/n,MC)});
  if(isFinite(mnx)){const fw=mxx-mnx+.6,fd=mxz-mnz+.6,cx=(mnx+mxx)/2,cz=(mnz+mxz)/2;box(L.shell,fw,.3,fd,cx,-.15,cz,MC);
    if(M.slab!==null){const s=box(L.slab,fw,(M.slab&&M.slab.t)||.25,fd,cx,fh+.125,cz,mat({map:tC,color:0xa9a7a1,transparent:true,opacity:.55}))}
    const bar=new THREE.CylinderGeometry(.009,.009,1,6),o2=new THREE.Object3D(),nX=Math.floor(fw/.3),nZ=Math.floor(fd/.3),im=new THREE.InstancedMesh(bar,MRb,nX+nZ);let k=0;
    for(let i=0;i<nX;i++){o2.position.set(mnx-.3+.3*i+.15,fh+.06,cz);o2.rotation.set(Math.PI/2,0,0);o2.scale.set(1.6,fd-.2,1.6);o2.updateMatrix();im.setMatrixAt(k++,o2.matrix)}
    for(let j=0;j<nZ;j++){o2.position.set(cx,fh+.08,mnz-.3+.3*j+.15);o2.rotation.set(0,0,Math.PI/2);o2.scale.set(1.6,fw-.2,1.6);o2.updateMatrix();im.setMatrixAt(k++,o2.matrix)}im.count=k;L.rebar.add(im);
    (M.starters||[]).forEach(s=>{const[x1,z1]=s.a,[x2,z2]=s.b,len=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.floor(len/.2));for(let i=0;i<=n;i++){const t=i/n;const r=new THREE.Mesh(bar,MRb);r.scale.set(1.8,1,1.8);r.position.set(x1+(x2-x1)*t,fh+.6,z1+(z2-z1)*t);L.rebar.add(r)}})}
  const V=(p)=>new THREE.Vector3(p[0],p[1],p[2]);
  (M.pipes||[]).forEach(p=>{const g=L[p.s]||L.x,m=mat({color:(SYS[p.s]||SYS.x)[0],roughness:.4,metalness:.3});for(let i=0;i<p.pts.length-1;i++){const a=V(p.pts[i]),b=V(p.pts[i+1]),v=b.clone().sub(a),l=v.length(),c=new THREE.Mesh(new THREE.CylinderGeometry(p.r||.05,p.r||.05,l,14),m);c.position.copy(a).add(v.multiplyScalar(.5));c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());c.castShadow=true;g.add(c)}});
  (M.open||[]).forEach(h=>{const g=L[h.s]||L.x,r=h.r||.1,G=new THREE.Group(),hole=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.34,24),h.miss?MMiss:MHole);hole.rotation.x=Math.PI/2;const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.012,.016,8,32),h.miss?MMiss:MRing);ring.position.z=.17;const r2=ring.clone();r2.position.z=-.17;G.add(hole,ring,r2);G.position.set(h.a[0],h.a[1],h.a[2]);if(h.ax=='x')G.rotation.y=Math.PI/2;if(h.ax=='y')G.rotation.x=Math.PI/2;g.add(G)});
  // camera orbit
  const ctr=new THREE.Vector3(isFinite(mnx)?(mnx+mxx)/2:0,1.2,isFinite(mnz)?(mnz+mxz)/2:0),span=isFinite(mnx)?Math.max(mxx-mnx,mxz-mnz):20;let th=2.3,ph=.95,rd=span*1.35;
  const put=()=>{C.position.set(ctr.x+Math.cos(th)*Math.sin(ph)*rd,ctr.y+Math.cos(ph)*rd,ctr.z+Math.sin(th)*Math.sin(ph)*rd);C.lookAt(ctr)};put();
  const P=new Map();let d0=0;const cv=R.domElement;cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==2){const v=[...P.values()];d0=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1])}});
  cv.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId);if(P.size==1){th+=(e.clientX-p[0])*.008;ph=Math.max(.15,Math.min(1.5,ph-(e.clientY-p[1])*.006))}P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==2){const v=[...P.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);if(d0)rd=Math.max(span*.3,Math.min(span*3,rd*d0/d));d0=d}put()});
  const up=e=>{P.delete(e.pointerId);d0=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('wheel',e=>{e.preventDefault();rd=Math.max(span*.3,Math.min(span*3,rd*(e.deltaY>0?1.1:.9)));put()},{passive:false});
  let run=1;const loop=()=>{if(!run)return;R.render(S,C);requestAnimationFrame(loop)};loop();
  return{layers:Object.keys(L),show(k,v){if(L[k])L[k].visible=v},dispose(){run=0;try{R.dispose()}catch(e){}cv.remove()},resize(){const w=el.clientWidth,h=el.clientHeight;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix()}}}
window.MDV={open,SYS};
})();
