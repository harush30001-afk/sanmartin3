/* גרסה 636-637: מנוע הדמיית שלד ומערכות (MDV). מצייר מודל קומה מקובץ JSON קטן — הכל מספריית אלמנטים קבועה.
 מבנה המודל: {v:1,n,fh,
   walls:[{a:[x,z],b:[x,z],t,m:'c'|'blk'|'stone'|'alu',o?,h?, ops?:[{k:'win'|'door'|'ldoor'|'x',at,w,h,s?}]}]   ← ops = פתחים בקיר: at = מרחק מרכז הפתח מנקודה a, w רוחב, h גובה, s גובה אדן (דלת 0)
   cols:[{x,z,w,d}], slab:{t,holes?:[{k:'shaft'|'stair'|'x',x,z,w,d}]}|null,
   open:[{a:[x,y,z],r,s:'sw'|'sp'|'el'|'wt'|'x',ax?,miss?:1}], pipes:[{s,pts:[[x,y,z]...],r}], starters:[{a:[x,z],b:[x,z]}],
   stair:[{x,z,w,d,fl?:2,lw?:1.3}], shaft:[{x,z,w,d}], pl?:{id,x0,z0,x1,z1} ← תמונת התוכנית המקורית (photos/<id>) וגבולותיה במטרים, להצגה מתחת למודל,
   q?:{g:'A'|'B'|'C'|'D',src:'pdf'|'img',sc:'1:50',dims:12,unc:[...],by,ok:{n,t}} ← אמינות: ציון, מקור, קנה מידה, לא ודאי, אישור מהנדס,
   zones?:[{k:'a1',n:'דירה 1',r:[x0,x1,z0,z1]},{k:'L',n:'לובי',r:[...]}]   ← דירות (k מתחיל ב-a) ולובי (k='L')
   rb?:[{d,kg?,L?,n}]  ← רשימת ברזל מהקונסטרוקטור (מדויק) · rbm?:{top:[d,s],bot:[d,s],st:[d,s,L],w:[d,s]} ← תוכנית זיון (הערכה) }
 מטרים, מרכז הקומה ב-0,0 */
(function(){
const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
function cnv(fn,s){s=s||256;const c=document.createElement('canvas');c.width=c.height=s;fn(c.getContext('2d'),s);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t}
/* גרסה 641: מרקמים בקנה מידה אמיתי — כל מרקם מכסה 2.44 מ' (לוח טפסנות), מוחל לפי מידות האלמנט (בלי מתיחה) */
const TILE=2.44;
function texConcrete(){return cnv((g,s)=>{g.fillStyle='#a6a39c';g.fillRect(0,0,s,s);
  for(let i=0;i<90;i++){const x=rnd()*s,y=rnd()*s,r=20+rnd()*90,gr=g.createRadialGradient(x,y,0,x,y,r),v=rnd()<.5?'255,255,250':'60,58,55';gr.addColorStop(0,`rgba(${v},${.04+rnd()*.05})`);gr.addColorStop(1,`rgba(${v},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
  for(let i=0;i<14000;i++){const v=rnd()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${rnd()*.09})`;g.fillRect(rnd()*s,rnd()*s,1.2,1.2)}
  for(let i=0;i<220;i++){g.fillStyle=`rgba(60,58,55,${.15+rnd()*.2})`;g.beginPath();g.arc(rnd()*s,rnd()*s,.4+rnd()*.8,0,7);g.fill()}  // בועות אוויר
  g.strokeStyle='rgba(70,68,64,.35)';g.lineWidth=1.5;g.beginPath();g.moveTo(s/2,0);g.lineTo(s/2,s);g.moveTo(0,1);g.lineTo(s,1);g.moveTo(1,0);g.lineTo(1,s);g.stroke();  // מישקי לוחות טפסנות 1.22×2.44
  g.fillStyle='rgba(45,43,40,.75)';for(let ix=0;ix<4;ix++)for(let iy=0;iy<4;iy++){const x=(ix+.5)*s/4,y=(iy+.5)*s/4;g.beginPath();g.arc(x,y,3.2,0,7);g.fill();g.fillStyle='rgba(120,118,112,.5)';g.beginPath();g.arc(x+.8,y+.8,1.6,0,7);g.fill();g.fillStyle='rgba(45,43,40,.75)'}  // חורי מותחנים
 },512)}
function texStone(){return cnv((g,s)=>{g.fillStyle='#8f8676';g.fillRect(0,0,s,s);const rows=8,rh=s/rows;  // נדבכים של 30 ס"מ
  for(let r=0;r<rows;r++){let x=-rnd()*s/4;while(x<s){const w=s/6+rnd()*s/5,L=196+rnd()*30|0,t=rnd()*10;g.fillStyle=`rgb(${L},${L-10-t|0},${L-30-t|0})`;g.fillRect(x+2,r*rh+2,w-4,rh-4);
      for(let k=0;k<60;k++){const v=rnd()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${rnd()*.08})`;g.fillRect(x+2+rnd()*(w-4),r*rh+2+rnd()*(rh-4),2,2)}
      const gr=g.createLinearGradient(0,r*rh,0,(r+1)*rh);gr.addColorStop(0,'rgba(255,255,255,.08)');gr.addColorStop(1,'rgba(0,0,0,.08)');g.fillStyle=gr;g.fillRect(x+2,r*rh+2,w-4,rh-4);x+=w}}
},512)}
function texBlock(){return cnv((g,s)=>{g.fillStyle='#8a8985';g.fillRect(0,0,s,s);const rows=12,rh=s/rows,bw=s/6;  // בלוק 40×20 בערך
  for(let r=0;r<rows;r++)for(let k=-1;k<7;k++){const L=158+rnd()*18|0;g.fillStyle=`rgb(${L},${L-1},${L-5})`;g.fillRect(k*bw+(r%2)*bw/2+2,r*rh+2,bw-4,rh-4);for(let q=0;q<40;q++){const v=rnd()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${rnd()*.1})`;g.fillRect(k*bw+(r%2)*bw/2+2+rnd()*(bw-4),r*rh+2+rnd()*(rh-4),2,2)}}},512)}
/* UV לפי מידות: כל פאה של קופסה מקבלת מרקם ביחס למטרים האמיתיים שלה */
function boxUV(geo,w,h,d,tile){const uv=geo.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*dims[f][0]/tile,uv.getY(k)*dims[f][1]/tile)}uv.needsUpdate=true;return geo}
const SYS={sw:[0x5d6166,'ביוב'],sp:[0xc0392b,'ספרינקלרים'],el:[0x1f5a2b,'חשמל'],wt:[0x2f7fd0,'מים'],x:[0x7c5cbf,'אחר']};
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
  if(!isFinite(a)||a>b)return null;const h=t/2;if(M.zr){return[Math.max(a-h,M.zr[0]),Math.min(b+h,M.zr[1]),Math.max(c-h,M.zr[2]),Math.min(d+h,M.zr[3])]}return[a-h,b+h,c-h,d+h]}
function holes(M){const H=((M.slab||{}).holes||[]).slice();(M.shaft||[]).forEach(s=>{if(!H.some(h=>Math.abs(h.x-s.x)<.3&&Math.abs(h.z-s.z)<.3))H.push({k:'shaft',x:s.x,z:s.z,w:s.w,d:s.d})});return H}
/* חיסור קטעים: [a,b] פחות רשימת חורים */
function sub(a,b,cut){let I=[[a,b]];cut.forEach(([c,d])=>{const N=[];I.forEach(([x,y])=>{if(d<=x||c>=y){N.push([x,y]);return}if(c>x)N.push([x,c]);if(d<y)N.push([d,y])});I=N});return I.filter(([x,y])=>y-x>.05)}

function open(el,M,o){o=o||{};const W=el.clientWidth||360,H=el.clientHeight||480;const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.setSize(W,H);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.9;el.appendChild(R.domElement);if(getComputedStyle(el).position=='static')el.style.position='relative';{const vg=document.createElement('div');vg.className='mdv-vg';vg.style.cssText='position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 45%,transparent 60%,rgba(20,22,26,.18))';el.appendChild(vg)};
  const S=new THREE.Scene();const C=new THREE.PerspectiveCamera(36,W/H,.1,600);
  /* גרסה 641: שמיים ותאורה סביבתית — השתקפויות אמיתיות באלומיניום ובזכוכית, צל רך מהשמש */
  const skyC=document.createElement('canvas');skyC.width=4;skyC.height=256;{const g=skyC.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#b9cce0');gr.addColorStop(.55,'#e4eaef');gr.addColorStop(.62,'#eceae4');gr.addColorStop(1,'#cfcac0');g.fillStyle=gr;g.fillRect(0,0,4,256)}
  const skyT=new THREE.CanvasTexture(skyC);skyT.encoding=THREE.sRGBEncoding;S.background=skyT;
  try{const es=new THREE.Scene(),sph=new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide}));es.add(sph);const sunB=new THREE.Mesh(new THREE.SphereGeometry(4,16,8),new THREE.MeshBasicMaterial({color:0xfff6e0}));sunB.position.set(-25,32,20);es.add(sunB);
    const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(es,.02).texture;pm.dispose()}catch(e){}
  S.add(new THREE.HemisphereLight(0xe8f0ff,0x8a8374,.3));const sun=new THREE.DirectionalLight(0xffe8c8,1.85);sun.castShadow=true;sun.shadow.mapSize.set((window.devicePixelRatio||1)>=2&&R.capabilities.maxTextureSize>=8192?4096:2048,(window.devicePixelRatio||1)>=2&&R.capabilities.maxTextureSize>=8192?4096:2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;S.add(sun);S.add(sun.target);
  const fill=new THREE.DirectionalLight(0xdce8ff,.28);S.add(fill);
  const mat=p=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},p));if(p&&p.color!=null&&!p.map)m.color.convertSRGBToLinear();if(p&&p.emissive!=null)m.emissive.convertSRGBToLinear();return m};
  const tC=texConcrete(),tS=texStone(),tB=texBlock();
  const MC=mat({map:tC,bumpMap:tC,bumpScale:.025,roughness:.88,envMapIntensity:.55}),MStone=mat({map:tS,bumpMap:tS,bumpScale:.02,roughness:.82,envMapIntensity:.5}),MBlk=mat({map:tB,bumpMap:tB,bumpScale:.02,roughness:.95,envMapIntensity:.4}),MAlu=mat({color:0xc9d1d7,metalness:.9,roughness:.26,envMapIntensity:1.2}),MRb=mat({color:0x4a2416,metalness:.25,roughness:.6,envMapIntensity:.25}),MHole=mat({color:0x0d0d0e}),MRing=mat({color:0xf2c230,emissive:0x5a4200}),MMiss=mat({color:0xc0392b,emissive:0x770000});
  const tGv=cnv((g,q)=>{g.fillStyle='#b8bdc1';g.fillRect(0,0,q,q);for(let i=0;i<900;i++){const x=rnd()*q,y=rnd()*q,r=4+rnd()*10,L=170+rnd()*60|0;g.fillStyle=`rgba(${L},${L+3},${L+6},.55)`;g.beginPath();const n=5+(rnd()*3|0);for(let k=0;k<n;k++){const a=k/n*6.283+rnd()*.5,rr=r*(.6+rnd()*.5);g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.fill()}},512);
  tGv.wrapS=tGv.wrapT=THREE.RepeatWrapping;
  /* גרסה 642: משקוף פלדה מגולוון — כסוף עם "פרחי" גלוון, לא אפור כהה */
  const MFr=mat({map:tGv,color:0xd8dde0,metalness:.8,roughness:.42,envMapIntensity:1.15}),MGl=mat({color:0xa8cbe0,transparent:true,opacity:.38,roughness:.04,metalness:.35,envMapIntensity:1.6,depthWrite:false}),MDr=mat({color:0x2f6b43,transparent:true,opacity:.16,depthWrite:false}),MHl=mat({color:0xf2c230,transparent:true,opacity:.13,depthWrite:false});
  /* גרסה 642: הצללה במפגשים (AO) — כהות עדינה איפה שקיר פוגש רצפה. זה מה שהופך הדמיה ל"אמיתית" */
  const aoT=cnv((g,s)=>{const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.25,'rgba(0,0,0,.22)');gr.addColorStop(.6,'rgba(0,0,0,.05)');gr.addColorStop(1,'rgba(0,0,0,0)');g.clearRect(0,0,s,s);g.fillStyle=gr;g.fillRect(0,0,s,s)},64);aoT.encoding=THREE.LinearEncoding;
  const MAO=new THREE.MeshBasicMaterial({map:aoT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),MEd=new THREE.LineBasicMaterial({color:0x2c2f33,transparent:true,opacity:.28});
  const E0=ext(M),inE=(x,z)=>!E0||(x>E0[0]+.05&&x<E0[1]-.05&&z>E0[2]+.05&&z<E0[3]-.05);
  const aoStrip=(g,len,cx,cz,ang,ox,oz,wd)=>{if(!inE(cx+ox,cz+oz))return null;const m=new THREE.Mesh(new THREE.PlaneGeometry(len,wd),MAO);m.rotation.set(-Math.PI/2,0,0);const o=new THREE.Group();o.add(m);m.position.set(0,0,0);o.position.set(cx+ox,.004,cz+oz);o.rotation.y=ang;g.add(o);return o};
  const fh=M.fh||3,st=(M.slab&&M.slab.t)||.25,L={dim:new THREE.Group(),shell:new THREE.Group(),rebar:new THREE.Group(),sw:new THREE.Group(),sp:new THREE.Group(),el:new THREE.Group(),wt:new THREE.Group(),x:new THREE.Group(),slab:new THREE.Group()};Object.values(L).forEach(g=>S.add(g));L.dim.visible=false;
  const PK=[];const box=(g,w,h,d,x,y,z,m,ry)=>{const geo=new THREE.BoxGeometry(w,h,d);if(m.map)boxUV(geo,w,h,d,m===MBlk?TILE*.66:TILE);const b=new THREE.Mesh(geo,m);b.position.set(x,y,z);if(ry)b.rotation.y=ry;if((m===MC||m===MStone||m===MBlk)&&Math.max(w,h,d)>.3)b.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),MEd));b.castShadow=b.receiveShadow=m.transparent?false:true;g.add(b);return b};
  const fm=n=>(+n).toFixed(2),dm=(a,b)=>'⁦'+fm(a)+'×'+fm(b)+'⁩',cm=n=>Math.round(n*100),WMN={c:'קיר בטון',blk:'קיר בלוקים',stone:'קיר בטון · חיפוי אבן',alu:'קיר · חיפוי אלומיניום'};
  /* גרסה 665: שכבת מידות — תוויות קריאות (ס"מ), כבויה כברירת מחדל */
  const dimLbl=(txt,x,y,z,sc)=>{const c=document.createElement('canvas'),g=c.getContext('2d');g.font='700 44px system-ui,Arial';const w=Math.ceil(g.measureText(txt).width)+36;c.width=w;c.height=64;g.font='700 44px system-ui,Arial';g.fillStyle='rgba(255,255,255,.94)';g.strokeStyle='#2f6b43';g.lineWidth=4;const r=14;g.beginPath();g.moveTo(r,2);g.lineTo(w-r,2);g.quadraticCurveTo(w-2,2,w-2,r);g.lineTo(w-2,62-r);g.quadraticCurveTo(w-2,62,w-r,62);g.lineTo(r,62);g.quadraticCurveTo(2,62,2,62-r);g.lineTo(2,r);g.quadraticCurveTo(2,2,r,2);g.fill();g.stroke();g.fillStyle='#16231b';g.textAlign='center';g.textBaseline='middle';g.direction=/[\u0590-\u05FF]/.test(txt)?'rtl':'ltr';g.fillText(txt,w/2,34);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.encoding=THREE.sRGBEncoding;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,fog:false,toneMapped:false}));const k=(sc||1)*.0075;sp.scale.set(w*k,64*k,1);sp.userData.s0=sp.scale.clone();sp.position.set(x,y,z);sp.renderOrder=12;L.dim.add(sp);return sp};
  const RBW=M.rbm&&M.rbm.w?' · זיון Ø'+M.rbm.w[0]+'/'+(M.rbm.w[1]<1?Math.round(M.rbm.w[1]*100):M.rbm.w[1]):'';
  /* קיר עם פתחים: חלקים מלאים בין הפתחים, מעל ומתחת לכל פתח */
  (M.walls||[]).forEach(w=>{const[x1,z1]=w.a,[x2,z2]=w.b,len=Math.hypot(x2-x1,z2-z1),t=w.t||.25,h=w.h||fh,ang=-Math.atan2(z2-z1,x2-x1),cx=(x1+x2)/2,cz=(z1+z2)/2,ux=(x2-x1)/len,uz=(z2-z1)/len;
    const m=w.m=='blk'?MBlk:MC,cl=w.m=='stone'||w.m=='alu'?(w.m=='alu'?MAlu:MStone):null,oo=w.o||1,nx=Math.sin(-ang)*oo*(t/2+.035),nz=Math.cos(-ang)*oo*(t/2+.035);
    const winfo=(WMN[w.m]||'קיר')+' · אורך '+cm(len)+' ס"מ · עובי '+cm(t)+' ס"מ · גובה '+cm(h)+' ס"מ'+(w.m=='blk'?'':RBW)+((w.ops||[]).length?' · '+((w.ops||[]).length==1?'פתח אחד':(w.ops||[]).length+' פתחים'):'');
    const piece=(s,e,y0,y1)=>{if(e-s<.01||y1-y0<.01)return;const c=(s+e)/2,px=x1+ux*c,pz=z1+uz*c;const pb=box(L.shell,e-s,y1-y0,t,px,(y0+y1)/2,pz,m,ang);pb.userData.info=winfo;PK.push(pb);if(cl)box(L.shell,e-s,y1-y0,.07,px-nx,(y0+y1)/2,pz+nz,cl,ang)};
    const ops=(w.ops||[]).map(p=>({p,s:Math.max(0,p.at-p.w/2),e:Math.min(len,p.at+p.w/2),y0:p.s!=null?p.s:(p.k=='win'?.9:0),y1:(p.s!=null?p.s:(p.k=='win'?.9:0))+p.h})).sort((a,b)=>a.s-b.s);
    let cur=0;ops.forEach(q=>{piece(cur,q.s,0,h);piece(q.s,q.e,0,q.y0);piece(q.s,q.e,Math.min(h,q.y1),h);cur=Math.max(cur,q.e);
      const c=(q.s+q.e)/2,g=box(L.shell,q.e-q.s,Math.min(h,q.y1)-q.y0,t*.6,x1+ux*c,(q.y0+Math.min(h,q.y1))/2,z1+uz*c,q.p.k=='win'?MGl:MDr,ang);g.userData.info=(OPN[q.p.k]||'פתח')+' · '+dm(q.p.w,q.p.h)+(q.p.k=='win'?' · אדן '+fm(q.y0):'')+(q.p.k=='door'?' · משקוף פלדה נוצק עם הקיר':'');PK.push(g);
      /* גרסה 642: חלון — מסגרת אלומיניום, מחיצה באמצע ואדן אבן */
      if(q.p.k=='win'){const yt=Math.min(h,q.y1),hh=yt-q.y0,fw=.05,fd=.07,wd=q.e-q.s;[q.s+fw/2,q.e-fw/2,c].forEach((a,i)=>{if(i==2&&wd<1)return;box(L.shell,fw*(i==2?.8:1),hh,fd,x1+ux*a,q.y0+hh/2,z1+uz*a,MAlu,ang)});
        [q.y0+fw/2,yt-fw/2].forEach(y=>box(L.shell,wd,fw,fd,x1+ux*c,y,z1+uz*c,MAlu,ang));
        box(L.shell,wd+.08,.04,t+.08,x1+ux*c,q.y0-.02,z1+uz*c,MStone,ang)}
      /* גרסה 637: משקוף כניסה לדירה — נוצק עם הקיר. שתי מזוזות ומשקוף עליון, פרופיל שעוטף את עובי הקיר */
      if(q.p.k=='door'){const fw=.055,fd=t+.05,yt=Math.min(h,q.y1),hh=yt-q.y0;[q.s+fw/2,q.e-fw/2].forEach(a=>{const f=box(L.shell,fw,hh,fd,x1+ux*a,q.y0+hh/2,z1+uz*a,MFr,ang);f.userData.info=g.userData.info;PK.push(f)});
        const hd=box(L.shell,q.e-q.s,fw,fd,x1+ux*c,yt-fw/2,z1+uz*c,MFr,ang);hd.userData.info=g.userData.info;PK.push(hd);
        [-1,1].forEach(sd=>{const nx2=Math.sin(-ang)*sd*(fd/2),nz2=Math.cos(-ang)*sd*(fd/2);[q.s-.012,q.e+.012].forEach(a=>box(L.shell,.024,hh+.024,.012,x1+ux*a-nx2,q.y0+(hh+.024)/2,z1+uz*a+nz2,MFr,ang));box(L.shell,q.e-q.s+.048,.024,.012,x1+ux*c-nx2,yt+.012,z1+uz*c+nz2,MFr,ang)})}});
    piece(cur,len,0,h);
    if(len>.6)dimLbl(cm(len)+' × '+cm(t),cx,h+.32,cz,len<1.5?.8:1);
    ops.forEach(q=>dimLbl(cm(q.p.w)+' × '+cm(q.p.h),x1+ux*(q.s+q.e)/2,(q.y0+Math.min(h,q.y1))/2,z1+uz*(q.s+q.e)/2,.75));
    [-1,1].forEach(sd=>{const off=t/2+.22,o=aoStrip(L.shell,len+.2,cx,cz,ang,Math.sin(-ang)*sd*off,Math.cos(-ang)*sd*off,.44);if(o)o.children[0].rotation.z=sd>0?Math.PI:0})});
  const aoR=cnv((g,q)=>{g.clearRect(0,0,q,q);const r=q/2,gr=g.createRadialGradient(r,r,r*.3,r,r,r);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(.35,'rgba(0,0,0,.2)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,q,q)},128),MAOr=new THREE.MeshBasicMaterial({map:aoR,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  (M.cols||[]).forEach(c=>{const m=new THREE.Mesh(new THREE.PlaneGeometry((c.w||.4)+.9,(c.d||.4)+.9),MAOr);m.rotation.x=-Math.PI/2;m.position.set(c.x,.004,c.z);L.shell.add(m)});
  (M.cols||[]).forEach(c=>{const b=box(L.shell,c.w||.4,fh,c.d||.4,c.x,fh/2,c.z,MC);b.userData.info='עמוד בטון · '+cm(c.w||.4)+'×'+cm(c.d||.4)+' ס"מ · גובה '+cm(fh)+' ס"מ'+(M.rbm&&M.rbm.col?' · זיון '+M.rbm.col:'');PK.push(b);dimLbl(cm(c.w||.4)+'×'+cm(c.d||.4),c.x,fh+.32,c.z,.8)});
  /* גרסה 667: שלט קבוע לפיר מעלית ולחדר מדרגות — רואים מיד איפה הם, גם מבפנים */
  const tagLbl=(txt,x,y,z,bg)=>{const c=document.createElement('canvas'),g=c.getContext('2d');g.font='800 46px system-ui,Arial';const w=Math.ceil(g.measureText(txt).width)+44;c.width=w;c.height=72;g.font='800 46px system-ui,Arial';g.fillStyle=bg;const r=20;g.beginPath();g.moveTo(r,0);g.lineTo(w-r,0);g.quadraticCurveTo(w,0,w,r);g.lineTo(w,72-r);g.quadraticCurveTo(w,72,w-r,72);g.lineTo(r,72);g.quadraticCurveTo(0,72,0,72-r);g.lineTo(0,r);g.quadraticCurveTo(0,0,r,0);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.direction='rtl';g.fillText(txt,w/2,38);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:(()=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t})(),depthTest:false,transparent:true,fog:false,toneMapped:false}));sp.scale.set(w*.0085,72*.0085,1);sp.position.set(x,y,z);sp.renderOrder=11;L.shell.add(sp);return sp};
  (M.shaft||[]).forEach(c=>{const g=new THREE.Mesh(new THREE.BoxGeometry(c.w,.02,c.d),mat({color:0x22262b}));g.position.set(c.x,.02,c.z);g.userData.info='פיר מעלית · '+Math.round(c.w*100)+'×'+Math.round(c.d*100)+' ס"מ';L.shell.add(g);PK.push(g);
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(c.w,fh,c.d)),new THREE.LineBasicMaterial({color:0xd98a1e}));e.position.set(c.x,fh/2,c.z);L.shell.add(e);
    tagLbl('פיר מעלית',c.x,fh*.62,c.z,'rgba(217,138,30,.95)')});
  (M.stair||[]).forEach(c=>tagLbl('חדר מדרגות',c.x,fh*.85,c.z,'rgba(47,107,67,.95)'));
  /* גרסה 665: מדרגות אמיתיות — שני מהלכים עם פודסט, שלבים על משטח משופע */
  (M.stair||[]).forEach(c=>{const fl=c.fl||2,lw=Math.min(c.lw||1.3,c.d*.4),rise=fh/fl,n=Math.max(1,Math.round(rise/.17)),rr=rise/n,fw=fl>1?c.w/2:c.w,run=c.d-(fl>1?lw:0),tr=run/n,wst=.15,info='מדרגות · '+fl+' מהלכים · '+n+' שלבים במהלך · רום '+(rr*100).toFixed(1)+' ס"מ · שלח '+cm(tr)+' ס"מ · רוחב מהלך '+cm(fw)+' ס"מ'+(fl>1?' · פודסט '+cm(lw)+' ס"מ':''),z0=c.z-c.d/2;
    for(let f=0;f<fl;f++){const up=f%2==0,xc=fl>1?c.x+(up?-1:1)*fw/2:c.x,base=f*rise,zs=up?z0:z0+run,dir=up?1:-1;
      for(let i=0;i<n;i++){const yt=base+(i+1)*rr,zz=zs+dir*(i+.5)*tr,hh=rr+wst*.9,b=box(L.shell,fw,hh,tr,xc,yt-hh/2,zz,MC);b.userData.info=info;PK.push(b)}
      const ang=Math.atan2(rise,run),Lh=Math.hypot(run,rise),wb=new THREE.Mesh(new THREE.BoxGeometry(fw,wst,Lh),MC);wb.rotation.x=dir>0?ang:-ang;wb.rotation.x=-dir*ang;wb.position.set(xc,base+rise/2-wst/2/Math.cos(ang)-rr/2,zs+dir*run/2);wb.castShadow=wb.receiveShadow=true;wb.userData.info=info;L.shell.add(wb);PK.push(wb);
      if(fl>1&&f<fl-1){const pb=box(L.shell,c.w,.18,lw,c.x,base+rise-.09,z0+run+lw/2,MC);pb.userData.info=info;PK.push(pb)}}
    dimLbl('רום '+(rr*100).toFixed(1)+' · שלח '+cm(tr),c.x,fh+.32,c.z,.8)});
  const E=ext(M),HL=holes(M);let mnx=-10,mxx=10,mnz=-8,mxz=8;
  if(E){[mnx,mxx,mnz,mxz]=E;const fw=mxx-mnx,fd=mxz-mnz,cx=(mnx+mxx)/2,cz=(mnz+mxz)/2;
    /* תקרה (ורצפת הקומה) עם חורים אמיתיים לפיר ולמדרגות */
    const slabG=th=>{const sh=new THREE.Shape();sh.moveTo(mnx,-mnz);sh.lineTo(mxx,-mnz);sh.lineTo(mxx,-mxz);sh.lineTo(mnx,-mxz);sh.lineTo(mnx,-mnz);
      HL.forEach(h=>{const p=new THREE.Path(),a=h.x-h.w/2,b=h.x+h.w/2,c=-(h.z-h.d/2),d=-(h.z+h.d/2);p.moveTo(a,c);p.lineTo(a,d);p.lineTo(b,d);p.lineTo(b,c);p.lineTo(a,c);sh.holes.push(p)});
      const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false});g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/TILE,uv.getY(i)/TILE);return g};
    tC.wrapS=tC.wrapT=THREE.RepeatWrapping;
    const fl=new THREE.Mesh(slabG(.3),MC);fl.position.y=-.3;fl.receiveShadow=true;L.shell.add(fl);
    if(M.slab!==null){const sl=new THREE.Mesh(slabG(st),mat({map:tC,color:0xa9a7a1,transparent:true,opacity:.55}));sl.position.y=fh;L.slab.add(sl)}
    HL.forEach(h=>{const g=box(L.slab,h.w,st,h.d,h.x,fh+st/2,h.z,MHl);g.userData.info=(HLN[h.k]||'חור בתקרה')+' · '+dm(h.w,h.d);PK.push(g)});
    /* רשת ברזל תקרה — המוטות נקטעים בחורים */
    const bar=new THREE.CylinderGeometry(.009,.009,1,8),o2=new THREE.Object3D(),seg=[];
    for(let x=mnx+.15;x<mxx;x+=.3){const cut=HL.filter(h=>Math.abs(h.x-x)<h.w/2).map(h=>[h.z-h.d/2,h.z+h.d/2]);sub(mnz+.1,mxz-.1,cut).forEach(([a,b])=>seg.push([x,(a+b)/2,b-a,0]))}
    for(let z=mnz+.15;z<mxz;z+=.3){const cut=HL.filter(h=>Math.abs(h.z-z)<h.d/2).map(h=>[h.x-h.w/2,h.x+h.w/2]);sub(mnx+.1,mxx-.1,cut).forEach(([a,b])=>seg.push([(a+b)/2,z,b-a,1]))}
    const im=new THREE.InstancedMesh(bar,MRb,seg.length);seg.forEach((s,k)=>{if(s[3]){o2.position.set(s[0],fh+.08,s[1]);o2.rotation.set(0,0,Math.PI/2)}else{o2.position.set(s[0],fh+.06,s[1]);o2.rotation.set(Math.PI/2,0,0)}o2.scale.set(1.6,s[2],1.6);o2.updateMatrix();im.setMatrixAt(k,o2.matrix)});L.rebar.add(im);
    /* גרסה 642: קשירות חוט בצמתים וספייסרים (כיסאות) מתחת לרשת */
    {const knot=new THREE.SphereGeometry(.014,6,4),MTie=mat({color:0x2a2a2a,metalness:.6,roughness:.5}),pts=[];
     for(let x=mnx+.15;x<mxx;x+=.6)for(let z=mnz+.15;z<mxz;z+=.6){if(!HL.some(h=>Math.abs(h.x-x)<h.w/2&&Math.abs(h.z-z)<h.d/2))pts.push([x,z])}
     const ki=new THREE.InstancedMesh(knot,MTie,pts.length);pts.forEach((p,k)=>{o2.position.set(p[0],fh+.07,p[1]);o2.rotation.set(0,0,0);o2.scale.set(1,.7,1);o2.updateMatrix();ki.setMatrixAt(k,o2.matrix)});L.rebar.add(ki);
     const ch=new THREE.CylinderGeometry(.018,.03,.05,8),MCh=mat({color:0x9a9a92,roughness:.8}),cp=pts.filter((p,i)=>i%4==0);
     const ci=new THREE.InstancedMesh(ch,MCh,cp.length);cp.forEach((p,k)=>{o2.position.set(p[0]+.15,fh+.025,p[1]+.15);o2.scale.set(1,1,1);o2.updateMatrix();ci.setMatrixAt(k,o2.matrix)});L.rebar.add(ci)}
    (M.starters||[]).forEach(s=>{const[x1,z1]=s.a,[x2,z2]=s.b,len=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.floor(len/.2));for(let i=0;i<=n;i++){const t=i/n;const r=new THREE.Mesh(bar,MRb);r.scale.set(1.8,1,1.8);r.position.set(x1+(x2-x1)*t,fh+.6,z1+(z2-z1)*t);L.rebar.add(r)}[.35,.85].forEach(y=>{const hb=new THREE.Mesh(bar,MRb);hb.scale.set(1.4,len,1.4);hb.position.set((x1+x2)/2,fh+y,(z1+z2)/2);hb.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x2-x1,0,z2-z1).normalize());L.rebar.add(hb)})})}
  const V=(p)=>new THREE.Vector3(p[0],p[1],p[2]);
  /* גרסה 642: מערכות ברמת פרט — כל מערכת נראית כמו בשטח:
     ספרינקלרים: צינור פלדה אדום, מצמדי חריץ בכל חיבור, ראש מתז (גוף פליז, מסגרת, מפזר ונורת זכוכית אדומה), תליות לתקרה
     חשמל: צינור שרשורי (מצולע) עם קופסאות חיבור בקצוות · מים: צינור עם מחברים בכל מפרק · ביוב: PVC עם פעמון בכל חיבור */
  const ribT=cnv((g,q)=>{g.fillStyle='#fff';g.fillRect(0,0,q,q);for(let i=0;i<16;i++){const gr=g.createLinearGradient(0,i*q/16,0,(i+1)*q/16);gr.addColorStop(0,'#fff');gr.addColorStop(.5,'#555');gr.addColorStop(1,'#fff');g.fillStyle=gr;g.fillRect(0,i*q/16,q,q/16)}},64);ribT.encoding=THREE.LinearEncoding;
  const MRod0=0;const MBrass=mat({color:0xc9a24a,metalness:.85,roughness:.3,envMapIntensity:1.2}),MBulb=mat({color:0xff2a1a,transparent:true,opacity:.85,roughness:.05,emissive:0x400000}),MRod=mat({color:0x8d949a,metalness:.8,roughness:.4}),MCpl=mat({color:0x2b2e33,metalness:.6,roughness:.45}),MBox=mat({color:0xe9e4d8,roughness:.6});
  const UP=new THREE.Vector3(0,1,0),cyl=(g,a,b,r,m,seg)=>{const v=b.clone().sub(a),l=v.length();if(l<.005)return null;const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,seg||14),m);c.position.copy(a).add(v.clone().multiplyScalar(.5));c.quaternion.setFromUnitVectors(UP,v.normalize());c.castShadow=true;c.receiveShadow=true;g.add(c);return c};
  const head=(g,P)=>{const H=new THREE.Group();H.position.copy(P);  // ראש מתז תלוי
    const nip=new THREE.Mesh(new THREE.CylinderGeometry(.011,.013,.05,10),MBrass);nip.position.y=-.025;H.add(nip);
    [-1,1].forEach(sd=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(.005,.045,.006),MBrass);arm.position.set(sd*.012,-.07,0);H.add(arm)});
    const bulb=new THREE.Mesh(new THREE.CylinderGeometry(.0035,.0035,.022,8),MBulb);bulb.position.y=-.068;H.add(bulb);
    const def=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.003,16),MBrass);def.position.y=-.094;H.add(def);
    for(let k=0;k<8;k++){const t=new THREE.Mesh(new THREE.BoxGeometry(.008,.003,.003),MBrass);const an=k*Math.PI/4;t.position.set(Math.cos(an)*.026,-.094,Math.sin(an)*.026);t.rotation.y=-an;H.add(t)}
    H.traverse(o=>{o.castShadow=true});g.add(H);return H};
  (M.pipes||[]).forEach(p=>{const g=L[p.s]||L.x,col=(SYS[p.s]||SYS.x)[0],r=p.r||.05,pts=p.pts.map(V);
    const isEl=p.s=='el',m=isEl?(()=>{const t=ribT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;return mat({color:col,roughness:.55,bumpMap:t,bumpScale:.006})})():mat({color:col,roughness:p.s=='sw'?.55:.32,metalness:p.s=='sp'?.45:.1,envMapIntensity:.8});
    let run=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],l=a.distanceTo(b);if(l<.01)continue;const c=cyl(g,a,b,r,m,isEl?10:18);if(c&&c.isObject3D){c.userData.info=((SYS[p.s]||SYS.x)[1])+' · קוטר Ø'+Math.round(r*2000)+' מ"מ';PK.push(c)}if(i==0)dimLbl('Ø'+Math.round(r*2000),(a.x+b.x)/2,(a.y+b.y)/2+.25,(a.z+b.z)/2,.7);
      if(isEl&&c){c.material=m.clone();c.material.bumpMap=m.bumpMap.clone();c.material.bumpMap.needsUpdate=true;c.material.bumpMap.wrapS=c.material.bumpMap.wrapT=THREE.RepeatWrapping;c.material.bumpMap.repeat.set(1,l/.06)}
      const d=b.clone().sub(a).normalize(),horiz=Math.abs(d.y)<.5;
      // מצמדים / פעמונים כל 6 מ' ובקצוות
      if(p.s=='sp'||p.s=='sw'||p.s=='wt'){const step=p.s=='sp'?6:p.s=='sw'?3:2.5;for(let t=step;t<l-.1;t+=step){const q=a.clone().add(d.clone().multiplyScalar(t));cyl(g,q.clone().add(d.clone().multiplyScalar(-.03)),q.clone().add(d.clone().multiplyScalar(.03)),r*1.22,p.s=='sp'?MCpl:m,20)}}
      // תליות לתקרה (מוט הברגה + חבק) כל 2.5 מ' בקטעים אופקיים
      if(horiz&&!isEl&&a.y<fh-.05){for(let t=.6;t<l-.2;t+=2.5){const q=a.clone().add(d.clone().multiplyScalar(t));cyl(g,new THREE.Vector3(q.x,q.y+r,q.z),new THREE.Vector3(q.x,fh,q.z),.006,MRod,8);const cl=new THREE.Mesh(new THREE.TorusGeometry(r+.006,.004,6,20),MRod);cl.position.copy(q);cl.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);g.add(cl)}}
      // ראשי מתזים כל ~3 מ' בצינורות ספרינקלר אופקיים
      if(p.s=='sp'&&horiz){for(let t=1.4;t<l-.3;t+=3){const q=a.clone().add(d.clone().multiplyScalar(t));const tee=cyl(g,q,new THREE.Vector3(q.x,q.y-r-.03,q.z),r*.45,m,12);head(g,new THREE.Vector3(q.x,q.y-r-.03,q.z))}}
      run+=l}
    // מפרקים: כדור/זווית בכל פינה, קופסת חיבור בקצה צינור חשמל
    for(let i=1;i<pts.length-1;i++){const e=new THREE.Mesh(new THREE.SphereGeometry(r*(isEl?1.05:1.18),16,12),p.s=='sp'?MCpl:m);e.position.copy(pts[i]);e.castShadow=true;g.add(e)}
    if(isEl)[pts[0],pts[pts.length-1]].forEach(P=>{const bx=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.06),MBox);bx.position.copy(P);bx.castShadow=true;g.add(bx);const lid=new THREE.Mesh(new THREE.BoxGeometry(.075,.075,.004),mat({color:0xffffff,roughness:.4}));lid.position.copy(P);lid.position.z+=.032;g.add(lid)})});
  (M.open||[]).forEach(h=>{const g=L[h.s]||L.x,r=h.r||.1,G=new THREE.Group(),hole=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.34,24),h.miss?MMiss:MHole);hole.rotation.x=Math.PI/2;const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.012,.016,8,32),h.miss?MMiss:MRing);ring.position.z=.17;const r2=ring.clone();r2.position.z=-.17;G.add(hole,ring,r2);G.position.set(h.a[0],h.a[1],h.a[2]);if(h.ax=='x')G.rotation.y=Math.PI/2;if(h.ax=='y')G.rotation.x=Math.PI/2;g.add(G);hole.userData.info=(h.miss?'⚠ פתח חסר בתוכנית · ':'')+((SYS[h.s]||SYS.x)[1])+' · קוטר '+Math.round(r*200)+' ס״מ';PK.push(hole)});
  /* גרסה 638: התוכנית המקורית מתחת למודל (שכבה 'pl') — לבדיקה בעין שהמודל תואם לתוכנית */
  L.pl=new THREE.Group();S.add(L.pl);L.pl.visible=false;
  if(M.pl&&o.planImg){const tl=new THREE.TextureLoader();tl.load(o.planImg,tx=>{tx.anisotropy=8;tx.encoding=THREE.sRGBEncoding;const w=M.pl.x1-M.pl.x0,d=M.pl.z1-M.pl.z0,pm=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:.92,depthWrite:false}));pm.rotation.x=-Math.PI/2;pm.position.set((M.pl.x0+M.pl.x1)/2,.012,(M.pl.z0+M.pl.z1)/2);pm.renderOrder=2;L.pl.add(pm)})}
  /* תוויות דירות/לובי בתצוגת קומה — לחיצה נכנסת */
  const ZN=(o.zones&&M.zones)||[];ZN.forEach(z=>{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle=z.k=='L'?'rgba(34,38,43,.86)':'rgba(47,107,67,.92)';g.beginPath();g.roundRect?g.roundRect(8,14,240,68,34):g.rect(8,14,240,68);g.fill();g.fillStyle='#fff';g.font='bold 40px Heebo,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(z.n,128,50);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.renderOrder=9;sp.position.set((z.r[0]+z.r[1])/2,fh+1.3,(z.r[2]+z.r[3])/2);sp.scale.set(2.6,.975,1);sp.userData.zone=z.k;S.add(sp);(S.userData.zl=S.userData.zl||[]).push(sp);PK.push(sp)});
  // camera orbit
  const ctr=new THREE.Vector3((mnx+mxx)/2,1.2,(mnz+mxz)/2),span=Math.max(mxx-mnx,mxz-mnz,6);let th=2.3,ph=.95,rd=span*1.35;
  /* גרסה 641: תנועת מצלמה חלקה (ריכוך) + שמש, קרקע וערפל לפי גודל המודל */
  /* גרסה 663: מבט מבפנים — גובה עיניים 1.6 מ', גרירה = הסתכלות, לחיצה על הרצפה = הליכה */
  const WK={on:0,x:0,z:0,tx:0,tz:0,yaw:0,pit:0,f:72};
  let cth=th,cph=ph,crd=rd;const place=()=>{if(WK.on){if(C.fov!=WK.f){C.fov=WK.f;C.near=.05;C.updateProjectionMatrix()}const cp=Math.cos(WK.pit);C.position.set(WK.x,1.6,WK.z);C.lookAt(WK.x+Math.sin(WK.yaw)*cp,1.6+Math.sin(WK.pit),WK.z-Math.cos(WK.yaw)*cp);return}if(C.fov!=38){C.fov=38;C.near=.1;C.updateProjectionMatrix()}C.position.set(ctr.x+Math.cos(cth)*Math.sin(cph)*crd,ctr.y+Math.cos(cph)*crd,ctr.z+Math.sin(cth)*Math.sin(cph)*crd);C.lookAt(ctr)};const put=()=>{};place();
  sun.position.set(ctr.x-span*.9,span*.95+8,ctr.z+span*.6);sun.target.position.copy(ctr);const sh=span*.85+4;Object.assign(sun.shadow.camera,{left:-sh,right:sh,top:sh,bottom:-sh,near:1,far:span*4+60});sun.shadow.camera.updateProjectionMatrix();fill.position.set(ctr.x+span,span*.6,ctr.z-span);
  {const gp=new THREE.Mesh(new THREE.PlaneGeometry(span*8,span*8),new THREE.ShadowMaterial({opacity:.22}));gp.rotation.x=-Math.PI/2;gp.position.set(ctr.x,-.005,ctr.z);gp.receiveShadow=true;S.add(gp);
   const gc=document.createElement('canvas');gc.width=gc.height=256;const g=gc.getContext('2d'),gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(170,164,152,.55)');gr.addColorStop(.6,'rgba(190,185,175,.25)');gr.addColorStop(1,'rgba(220,218,212,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
   const gb=new THREE.Mesh(new THREE.PlaneGeometry(span*3.2,span*3.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,depthWrite:false}));gb.rotation.x=-Math.PI/2;gb.position.set(ctr.x,-.01,ctr.z);gb.renderOrder=-1;S.add(gb)}
  S.fog=new THREE.Fog(0xe6e8e8,span*2.6,span*7);
  const P=new Map();let d0=0,mv=0,dn=null;const cv=R.domElement;cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==1){mv=0;dn=[e.clientX,e.clientY]}else mv=99;if(P.size==2){const v=[...P.values()];d0=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1])}});
  cv.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId);if(dn)mv=Math.max(mv,Math.hypot(e.clientX-dn[0],e.clientY-dn[1]));if(P.size==1){if(WK.on){WK.yaw-=(e.clientX-p[0])*.0055;WK.pit=Math.max(-1.1,Math.min(1.2,WK.pit+(e.clientY-p[1])*.0045));place()}else{th+=(e.clientX-p[0])*.008;ph=Math.max(.15,Math.min(1.5,ph-(e.clientY-p[1])*.006))}}P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==2){const v=[...P.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);if(d0){if(WK.on){WK.f=Math.max(35,Math.min(95,WK.f*d0/d));place()}else rd=Math.max(span*.3,Math.min(span*3,rd*d0/d))}d0=d}put()});
  const rc=new THREE.Raycaster(),tap=e=>{const r=cv.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(v,C);
    const vis=PK.filter(m=>{let q=m;while(q){if(q.visible===false)return false;q=q.parent}return true}),hit=rc.intersectObjects(vis,false)[0];
    if(WK.on){if(hit&&hit.object.userData.info){o.onPick&&o.onPick(hit.object.userData.info);return}const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();if(rc.ray.intersectPlane(pl,pt)&&pt.x>mnx-.3&&pt.x<mxx+.3&&pt.z>mnz-.3&&pt.z<mxz+.3){const dx=pt.x-WK.x,dz=pt.z-WK.z,dd=Math.hypot(dx,dz);if(dd>.35){const k=Math.max(0,dd-.45)/dd;WK.tx=WK.x+dx*k;WK.tz=WK.z+dz*k}}return}
    if(hit&&hit.object.userData.zone){o.onZone&&o.onZone(hit.object.userData.zone);return}if(hit&&hit.object.userData.info){o.onPick&&o.onPick(hit.object.userData.info);return}
    if(ZN.length&&o.onZone){const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();if(rc.ray.intersectPlane(pl,pt)){const z=ZN.find(z=>inZ(pt.x,pt.z,z.r));if(z)o.onZone(z.k)}}};
  const up=e=>{const was=P.size==1&&mv<7;P.delete(e.pointerId);d0=0;if(was&&e.type=='pointerup')tap(e);dn=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('wheel',e=>{e.preventDefault();if(WK.on){WK.f=Math.max(35,Math.min(95,WK.f*(e.deltaY>0?1.08:.93)));place();return}rd=Math.max(span*.3,Math.min(span*3,rd*(e.deltaY>0?1.1:.9)));put()},{passive:false});
  let run=1,idle=0;const loop=()=>{if(!run)return;if(WK.on){const mx=WK.tx-WK.x,mz=WK.tz-WK.z;if(Math.abs(mx)+Math.abs(mz)>.004){WK.x+=mx*.12;WK.z+=mz*.12;place();idle=0}}const k=.18,d=WK.on?0:Math.abs(th-cth)+Math.abs(ph-cph)+Math.abs(rd-crd)/span;if(d>1e-4){cth+=(th-cth)*k;cph+=(ph-cph)*k;crd+=(rd-crd)*k;place();idle=0}else if(idle<3&&!WK.on){cth=th;cph=ph;crd=rd;place()}if(idle++<4||d>1e-4||idle%20==0)R.render(S,C);requestAnimationFrame(loop)};loop();
  const kick=()=>{idle=0};['pointermove','pointerdown','pointerup','wheel'].forEach(t=>cv.addEventListener(t,kick));return{layers:Object.keys(L),walk(on,at){WK.on=on?1:0;if(on){const sd=(x,z,w)=>{const ax=w.a[0],az=w.a[1],bx=w.b[0]-ax,bz=w.b[1]-az,l2=bx*bx+bz*bz||1e-6,t=Math.max(0,Math.min(1,((x-ax)*bx+(z-az)*bz)/l2));return Math.hypot(x-ax-bx*t,z-az-bz*t)-(w.t||.25)/2},clr=(x,z)=>(M.walls||[]).reduce((m,w)=>Math.min(m,sd(x,z,w)),9)-((M.cols||[]).some(c=>Math.max(Math.abs(x-c.x)-(c.w||.4)/2,Math.abs(z-c.z)-(c.d||.4)/2)<.5)?9:0);let a=at;if(!a){let best=null,bs=1e9;for(let x=mnx+.6;x<=mxx-.6;x+=.4)for(let z=mnz+.6;z<=mxz-.6;z+=.4){const c=clr(x,z);if(c<.9)continue;const d=Math.hypot(x-ctr.x,z-ctr.z)-Math.min(c,2.5)*.6;if(d<bs){bs=d;best=[x,z]}}a=best||[ctr.x,ctr.z]}let by=cth-Math.PI/2,bd=-1;for(let k=0;k<16;k++){const y=k*Math.PI/8;let d=0;while(d<14&&clr(a[0]+Math.sin(y)*(d+.3),a[1]-Math.cos(y)*(d+.3))>.15)d+=.3;if(d>bd+.01){bd=d;by=y}}WK.x=WK.tx=a[0];WK.z=WK.tz=a[1];WK.yaw=by;WK.pit=-.05;S.fog&&(S.fog.near=40,S.fog.far=120)}else{S.fog&&(S.fog.near=span*2.6,S.fog.far=span*7)}(S.userData.zl||[]).forEach(x=>x.visible=!WK.on);L.dim.children.forEach(sp=>{if(sp.userData.s0)sp.scale.copy(sp.userData.s0).multiplyScalar(WK.on?.42:1)});place();idle=0;R.render(S,C);return WK.on},walking(){return !!WK.on},cam(o){o=o||{};if(o.c){ctr.set(o.c[0],o.c[1],o.c[2]);if(o.rd==null)place()}if(o.th!=null)th=cth=o.th;if(o.ph!=null)ph=cph=o.ph;if(o.rd!=null)rd=crd=o.rd*span;if(o.rm!=null)rd=crd=o.rm;place();idle=0;R.render(S,C)},show(k,v){if(L[k])L[k].visible=v;idle=0},dispose(){run=0;try{R.dispose()}catch(e){}cv.remove();const vg=el.querySelector('.mdv-vg');if(vg)vg.remove()},resize(){const w=el.clientWidth,h=el.clientHeight;R.setSize(w,h);C.aspect=w/h;C.updateProjectionMatrix();idle=0}}}

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
