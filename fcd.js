/* 897 (יהב 27.11): FCD — בניין 1 בתלת־ממד: חזית לפי הצילומים + חיתוך קומה + שלד לפי נתוני האפליקציה.
   three.js r128. שימוש: const h = FCD(mount, {data, title, onApt(n,f), onLobby(f), plan:'fcd-b1-plan.jpg'}) → h.refresh(data), h.openFloor(f), h.closeFloor(), h.st(), h.destroy()
   data = { b:1,
     fl: { [f]: { apts:[{n, typ:'A', pc, stg:'טיח', ids:[מזהי שלבים גמורים 1..50]}], lob:{pc, stg} } },   ← מצב הגמרים לכל קומה (0 = קרקע, 17 = פנטהאוזים)
     sk: null | { S:[שמות שלבי השלד], fl: { [f]: [{n:'קיר צפון', ty:'f'|'w'|'c', s:{שלב:זמן}}] } } }  ← שלד: רצפה / קירות / תקרה לכל קומה
   מידות: תוכנית קומה 9 בניין 1 (25.14 × 24.54 מ'), קומה ≈3.2, קרקע ≈4.8. קרקע · 1–16 · 17 פנטהאוז · גג עם פרגולה וחדר משאבות.
   חזית: אבן בהירה, פסי פח כהים, עמודת מרפסות כפולה באמצע (באותו מפלס), מעקה ברזל שחור (אף פעם לא זכוכית). */
(function(){
'use strict';
window.FCD=function(MOUNT,CFG){
CFG=CFG||{};const T=window.THREE;
const MOB=/iPhone|iPad|Android/i.test(navigator.userAgent)||Math.min(innerWidth,innerHeight)<600;
// ---------- DOM ----------
MOUNT.innerHTML='<style>'+FCD.css+'</style><div class="fcd"><div class="fcd-st"></div>'+
 '<div class="fcd-top"><div class="fcd-ttl"><b></b><small></small></div><div class="fcd-md"></div></div>'+
 '<div class="fcd-hint">נגיעה בקומה פותחת אותה · גרירה מסובבת · צביטה מקרבת</div>'+
 '<div class="fcd-vw"><button data-v="front" class="on">חזית</button><button data-v="corner">פינה</button><button data-v="street">מהרחוב</button><button data-v="roof">גג</button></div>'+
 '<div class="fcd-sh" role="dialog"><div class="fcd-h"><div><b class="fcd-sT"></b><small class="fcd-sS"></small></div><button class="fcd-x" aria-label="חזרה לבניין">✕</button></div><div class="fcd-sB"></div></div></div>';
const ROOT=MOUNT.querySelector('.fcd'),host=ROOT.querySelector('.fcd-st'),q=s=>ROOT.querySelector(s);
q('.fcd-ttl b').textContent=CFG.title||'בניין 1';q('.fcd-ttl small').textContent=CFG.sub||'לפי הצילומים והתוכניות · ≈';

// ---------- מידות ----------
const W=25.14,D=24.54,GH=4.8,FH=3.2;
const PH=CFG.ph||17,RF=PH+1;/* קומת הפנטהאוז: בניין 1 = 17, בניין 2 = 9 */
const yF=f=>f<=0?0:GH+(f-1)*FH;
const BX=3.75,BD=2.1,PHX=5.0,PHD=1.4,TOP=yF(RF),PG=4.2;
const fOf=y=>y<GH-.05?0:y>=TOP-.05?RF:Math.min(PH,Math.floor((y-GH+.05)/FH)+1);

// ---------- רנדרר ----------
const R=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(MOB?1.5:2,devicePixelRatio||1));
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.82;
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.shadowMap.autoUpdate=false;
host.appendChild(R.domElement);
const scene=new T.Scene();scene.fog=new T.Fog(0xcfd9e2,180,520);
const cam=new T.PerspectiveCamera(42,1,.5,1500);
function skyMesh(){const m=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
 uniforms:{top:{value:new T.Color(0x5f8fc6)},mid:{value:new T.Color(0xb9d0e6)},bot:{value:new T.Color(0xe7e5df)}},
 vertexShader:'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,mid,bot;varying vec3 vp;void main(){float h=vp.y;vec3 c=h>0.?mix(mid,top,pow(clamp(h*1.6,0.,1.),.7)):mix(mid,bot,clamp(-h*4.,0.,1.));gl_FragColor=vec4(c,1.);}'});
 return new T.Mesh(new T.SphereGeometry(900,32,16),m)}
scene.add(skyMesh());
try{const pm=new T.PMREMGenerator(R),es=new T.Scene();es.add(skyMesh());const g=new T.Mesh(new T.PlaneGeometry(2000,2000),new T.MeshBasicMaterial({color:0x8a8780}));g.rotation.x=-Math.PI/2;g.position.y=-5;es.add(g);scene.environment=pm.fromScene(es,.04).texture;pm.dispose()}catch(e){}
scene.add(new T.HemisphereLight(0xdfe9f5,0x8c8476,.5));
const sun=new T.DirectionalLight(0xfff1dc,1.35),SUN=new T.Vector3(-.55,.78,.62).normalize();
sun.position.copy(SUN).multiplyScalar(140).add(new T.Vector3(0,25,0));sun.target.position.set(0,25,0);
sun.castShadow=true;const SM=MOB?1024:2048;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:20,far:320});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
scene.add(sun,sun.target);

// ---------- טקסטורות ----------
function rnd(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
const ANI=Math.min(8,R.capabilities.getMaxAnisotropy());
function tex(w,h,fn,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(srgb!==false)t.encoding=T.sRGBEncoding;t.anisotropy=ANI;t.wrapS=t.wrapT=T.RepeatWrapping;return t}
const stoneT=tex(512,512,(g,w,h)=>{const r=rnd(7),ch=h/10;g.fillStyle='#cdc6b8';g.fillRect(0,0,w,h);
 for(let row=0;row<10;row++){let x=-r()*120;while(x<w){const L=70+r()*110,v=(r()-.5)*16,wa=r()*6;g.fillStyle=`rgb(${205+v+wa|0},${199+v|0},${187+v-wa|0})`;g.fillRect(x,row*ch,L,ch);
  for(let i=0;i<40;i++){g.fillStyle=`rgba(${r()<.5?'90,85,75':'255,255,250'},${.05+r()*.08})`;g.fillRect(x+r()*L,row*ch+r()*ch,1+r()*2,1+r()*2)}
  g.fillStyle='rgba(150,144,132,.55)';g.fillRect(x,row*ch,1.2,ch);x+=L}g.fillStyle='rgba(150,144,132,.6)';g.fillRect(0,row*ch,w,1.2)}});
const paveT=tex(512,512,(g,w,h)=>{const r=rnd(11),ch=32,cw=64;g.fillStyle='#c2c0b8';g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=ch){const off=((y/ch)%2)*cw/2;for(let x=-off;x<w;x+=cw){const v=(r()-.5)*30,wa=r()*10-3;g.fillStyle=`rgb(${136+v+wa|0},${137+v|0},${134+v-wa|0})`;g.fillRect(x+1.5,y+1.5,cw-3,ch-3)}}});
const cladT=tex(128,128,(g,w,h)=>{const r=rnd(3);g.fillStyle='#6c6d6a';g.fillRect(0,0,w,h);for(let i=0;i<300;i++){g.fillStyle=`rgba(${r()<.5?'40,40,40':'200,200,200'},.06)`;g.fillRect(r()*w,r()*h,2,2)}g.fillStyle='rgba(40,40,40,.55)';for(let y=0;y<h;y+=32)g.fillRect(0,y,w,2)});
const railT=tex(32,128,(g,w,h)=>{g.fillStyle='#1d1e20';g.fillRect(13,0,6,h);g.fillRect(0,0,w,9);g.fillRect(0,h-6,w,6)});railT.wrapT=T.ClampToEdgeWrapping;
const concT=tex(256,256,(g,w,h)=>{const r=rnd(5);g.fillStyle='#a9a6a0';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=r()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${r()*.08})`;g.fillRect(r()*w,r()*h,1.5,1.5)}g.strokeStyle='rgba(80,78,74,.35)';g.lineWidth=1.2;g.strokeRect(0,0,w/2,h);g.strokeRect(w/2,0,w/2,h)});
const plyT=tex(256,256,(g,w,h)=>{const r=rnd(9);g.fillStyle='#b8743a';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.fillStyle=`rgba(${r()<.5?'90,45,15':'230,170,110'},${.08+r()*.1})`;g.fillRect(0,r()*h,w,1+r()*3)}g.fillStyle='rgba(60,30,10,.6)';g.fillRect(0,0,w,2);g.fillRect(0,h/2,w,2);g.fillRect(0,0,2,h)});
const rebarT=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#5a3b26';for(let i=0;i<w;i+=16){g.fillRect(i,0,3,h);g.fillRect(0,i,w,3)}g.fillStyle='rgba(140,90,55,.9)';for(let i=0;i<w;i+=16){g.fillRect(i+1,0,1,h);g.fillRect(0,i+1,w,1)}});
const meshT=tex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#8f969b';g.lineWidth=2;for(let i=0;i<=w;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}});
const latT=tex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#e0ad1c';g.lineWidth=5;g.strokeRect(2,2,w-4,h-4);g.beginPath();g.moveTo(2,2);g.lineTo(w-2,h-2);g.stroke()});
const leafT=tex(256,256,(g,w,h)=>{const r=rnd(29);g.clearRect(0,0,w,h);
 for(let i=0;i<420;i++){const a=r()*6.283,d=Math.pow(r(),.7)*w*.44,x=w/2+Math.cos(a)*d,y=h/2+Math.sin(a)*d*.92,L=7+r()*6,hu=78+r()*30,sa=22+r()*26,li=26+r()*30;g.save();g.translate(x,y);g.rotate(r()*6.283);
  g.fillStyle=`hsl(${hu},${sa}%,${li}%)`;g.beginPath();g.ellipse(0,0,L,L*.36,0,0,6.283);g.fill();g.fillStyle=`hsla(${hu},${sa}%,${li+18}%,.55)`;g.beginPath();g.ellipse(-L*.15,-L*.08,L*.6,L*.14,0,0,6.283);g.fill();g.restore()}
 g.strokeStyle='rgba(70,58,44,.8)';g.lineWidth=1.4;for(let i=0;i<10;i++){const a=r()*6.283;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2+Math.cos(a)*w*.3,h/2+Math.sin(a)*h*.3);g.stroke()}});
// אבן החומות ההיקפיות — כמו בהדמיית הדירה (apt.html): נדבכים בגוון חם
const wallT=tex(256,256,(g)=>{const r=rnd(13),P=['#d9cfb4','#cfc4a6','#e0d7c0','#c9bf9f','#d4c9a8','#ddd0ad'];g.fillStyle='#d9cfb4';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=32)for(let x=((y/32)%2)*32-32;x<256;x+=64){g.fillStyle=P[(r()*6)|0];g.fillRect(x+1.5,y+1.5,61,29);g.fillStyle='rgba(255,255,255,.10)';g.fillRect(x+1.5,y+1.5,61,3);g.fillStyle='rgba(80,65,45,.10)';g.fillRect(x+1.5,y+27,61,3.5)}});

// ---------- חומרים ----------
const SM_=(o)=>new T.MeshStandardMaterial(o);
const M={stone:SM_({map:stoneT,roughness:.88}),dark:SM_({color:0x0e0f11,roughness:.55,metalness:.1,envMapIntensity:.25}),alu:SM_({color:0x1b1c1f,roughness:.5,metalness:.2,envMapIntensity:.3}),
 glass:SM_({color:0x3d4954,roughness:.06,metalness:.85,envMapIntensity:.9}),plaster:SM_({color:0xd9d7d1,roughness:.95}),clad:SM_({map:cladT,roughness:.75,metalness:.1}),
 rail:SM_({map:railT,transparent:true,alphaTest:.02,depthWrite:false,side:T.DoubleSide,roughness:.6,metalness:.1}),pave:SM_({map:paveT,roughness:.92}),asph:SM_({color:0x4b4d50,roughness:.95}),
 earth:SM_({color:0x8f8b78,roughness:1}),lstone:SM_({color:0xeee9de,roughness:.8}),soil:SM_({color:0x3b2e25,roughness:1}),trunk:SM_({color:0x4a4037,roughness:1}),
 shop:SM_({color:0x2c3035,roughness:.2,metalness:.6,envMapIntensity:.7}),pump:SM_({color:0xb5b1a7,roughness:.9}),door:SM_({color:0x4a4f52,roughness:.5,metalness:.3}),
 wall:SM_({map:wallT,roughness:1}),cap:SM_({color:0xe6dcc2,roughness:1}),mesh:SM_({map:meshT,transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:.5,metalness:.5}),
 conc:SM_({map:concT,roughness:.9}),ply:SM_({map:plyT,roughness:.8}),rebar:SM_({map:rebarT,transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:.7,metalness:.3}),
 yel:SM_({color:0xe8b923,roughness:.6}),lat:SM_({map:latT,transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:.6}),hole:SM_({color:0x26282a,roughness:1}),
 leaf:SM_({map:leafT,alphaTest:.45,side:T.DoubleSide,vertexColors:true,roughness:.85}),grn:SM_({color:0x2f5a3a,roughness:.9})};
const UVS={stone:4,pave:3.2,clad:2,rail:1,wall:3.2,conc:2.44,ply:2.44,rebar:1.6,mesh:.4,lat:1.4};
// שלד: קומות גמורות = אבן + בטון, בלי אלומיניום/זכוכית/פח
const SKM={glass:M.hole,alu:M.hole,shop:M.hole,door:M.hole,dark:M.conc,clad:M.conc};
const SKHIDE={rail:1};

// ---------- גאומטריה: איחוד לפי (קומה, חומר) ----------
let BKT=null;const BUF={};
function buf(b,k){const o=BUF[b]||(BUF[b]={});return o[k]||(o[k]={p:[],n:[],u:[],c:null})}
function addGeom(k,geo,bk){const g=geo.index?geo.toNonIndexed():geo;const P=g.attributes.position.array,N=g.attributes.normal.array,s=1/(UVS[k]||1);
 let b=bk;if(b==null){if(BKT!=null)b=BKT;else{g.computeBoundingBox();const c=new T.Vector3();g.boundingBox.getCenter(c);b=fOf(c.y)}}
 const B=buf(b,k);for(let i=0;i<P.length;i+=3){const x=P[i],y=P[i+1],z=P[i+2],ax=Math.abs(N[i]),ay=Math.abs(N[i+1]),az=Math.abs(N[i+2]);B.p.push(x,y,z);B.n.push(N[i],N[i+1],N[i+2]);
  if(ax>=ay&&ax>=az)B.u.push(z*s,y*s);else if(ay>=az)B.u.push(x*s,z*s);else B.u.push(x*s,y*s)}}
// קופסה; בבניין — נחתכת בגבולות הקומות כדי שכל קומה תהיה קבוצה נפרדת (חיתוך / שלד)
function box(k,x0,x1,y0,y1,z0,z1,bk){if(x1<x0)[x0,x1]=[x1,x0];if(y1<y0)[y0,y1]=[y1,y0];if(z1<z0)[z0,z1]=[z1,z0];if(x1-x0<1e-4||y1-y0<1e-4||z1-z0<1e-4)return;
 if(BKT==null&&bk==null){const cuts=[GH];for(let f=2;f<=RF;f++)cuts.push(yF(f));for(const c of cuts)if(c>y0+.06&&c<y1-.06){box(k,x0,x1,y0,c,z0,z1);box(k,x0,x1,c,y1,z0,z1);return}}
 addGeom(k,new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),bk)}
function railQ(a,b,y0,y1,k,bk){k=k||'rail';const L=Math.hypot(b.x-a.x,b.z-a.z),sc=k=='rail'?.11:(UVS[k]||1),U=L/sc,V=k=='rail'?1:(y1-y0)/sc,nx=(b.z-a.z)/L,nz=-(b.x-a.x)/L;
 const B=buf(bk!=null?bk:BKT!=null?BKT:fOf((y0+y1)/2),k);
 for(const q of [[a.x,y0,a.z,0,0],[b.x,y0,b.z,U,0],[b.x,y1,b.z,U,V],[a.x,y0,a.z,0,0],[b.x,y1,b.z,U,V],[a.x,y1,a.z,0,V]]){B.p.push(q[0],q[1],q[2]);B.n.push(nx,0,nz);B.u.push(q[3],q[4])}}
const FAC={front:{ua:'x',su:1,base:D/2,sn:1,half:W/2,bal:true},back:{ua:'x',su:-1,base:-D/2,sn:-1,half:W/2,bal:true},right:{ua:'z',su:-1,base:W/2,sn:1,half:D/2},left:{ua:'z',su:1,base:-W/2,sn:-1,half:D/2}};
function fb(F,k,u0,u1,y0,y1,w0,w1){const a=F.su*u0,b=F.su*u1,c=F.base+F.sn*w0,d=F.base+F.sn*w1;if(F.ua=='x')box(k,a,b,y0,y1,c,d);else box(k,c,d,y0,y1,a,b)}
function fpt(F,u,w){const a=F.su*u,c=F.base+F.sn*w;return F.ua=='x'?{x:a,z:c}:{x:c,z:a}}
function frail(F,u0,u1,y,w){railQ(fpt(F,u0,w),fpt(F,u1,w),y,y+1.05)}
const PA=[1,4,5,8,11,12,15].filter(f=>f<PH).concat([PH,RF]),PB=[1,3,6,7,10,13,14,16].filter(f=>f<PH).concat([PH,RF]);
function pat(F,u){const uw=F.su*u;let sx,sz;if(F.ua=='x'){sx=Math.sign(uw)||1;sz=F.sn}else{sz=Math.sign(uw)||1;sx=F.sn}return sx*sz<0?PA:PB}
function fieldLen(P,f){let lo=f,hi=f+1;while(lo>1&&!P.includes(lo))lo--;while(hi<RF&&!P.includes(hi))hi++;return hi-lo}
let H=1;const hash=()=>{H=(H*9301+49297)%233280;return H/233280};
function win(F,u,yb,w,h,o){o=o||{};const t=.07,wo=o.wo||0,x0=u-w/2,x1=u+w/2,y1=yb+h;
 fb(F,'alu',x0,x1,y1-t,y1,wo-.03,wo+.07);fb(F,'alu',x0,x1,yb,yb+t,wo-.03,wo+.09);fb(F,'alu',x0,x0+t,yb,y1,wo-.03,wo+.07);fb(F,'alu',x1-t,x1,yb,y1,wo-.03,wo+.07);
 if(w>.9)fb(F,'alu',u-.03,u+.03,yb,y1,wo-.02,wo+.04);if(o.tr)fb(F,'alu',x0,x1,yb+h*.62,yb+h*.62+.05,wo-.02,wo+.04);
 fb(F,o.shut?'dark':'glass',x0+t,x1-t,yb+t,y1-t,wo-.04,wo+.005);fb(F,'lstone',x0-.03,x1+.03,yb-.05,yb,wo-.02,wo+.1)}
function panel(F,u,w,y0,y1){if(y1-y0>.05)fb(F,'dark',u-w/2,u+w/2,y0,y1,-.02,.05)}
const COL={A:{w:2.0,s:.9,h:1.55},B:{w:1.2,s:1.0,h:1.45},C:{w:.65,s:1.35,h:.65}};
function column(F,u,type,f0,f1){const c=COL[type];for(let f=f0;f<=f1;f++){const P=pat(F,u),y=yF(f),shut=type=='B'&&hash()<.22;win(F,u,y+c.s,c.w,c.h,{tr:type=='A',shut});if(type=='C')continue;
 const nxt=f+1,strip=type=='B'||fieldLen(P,f)>=3;if(strip&&!P.includes(nxt)&&f<f1)panel(F,u,c.w+.1,y+c.s+c.h,yF(nxt)+c.s);if(type=='B'&&P.includes(f))panel(F,u,c.w+.1,y+.35,y+c.s);if(type=='B'&&P.includes(nxt))panel(F,u,c.w+.1,y+c.s+c.h,yF(nxt)-.15)}}
function bands(F,u0,u1){for(const f of pat(F,(u0+u1)/2)){if(f==1)continue;const y=yF(f);fb(F,'dark',u0,u1,y-.3,y+.45,-.02,.08)}}
function shop(F,u,w,lobby){const y1=lobby?3.9:3.55;fb(F,'dark',u-w/2-.28,u+w/2+.28,y1,y1+.7,-.02,.35);fb(F,'dark',u-w/2-.28,u-w/2,0,y1,-.02,.35);fb(F,'dark',u+w/2,u+w/2+.28,0,y1,-.02,.35);
 fb(F,'shop',u-w/2,u+w/2,.05,y1,-.02,.03);const n=Math.max(2,Math.round(w/1.2));for(let i=1;i<n;i++){const x=u-w/2+i*w/n;fb(F,'alu',x-.03,x+.03,.05,y1,0,.07)}fb(F,'alu',u-w/2,u+w/2,2.6,2.66,0,.07);
 if(lobby){fb(F,'dark',u-3.2,u+3.2,y1+.7,y1+.95,-.02,2.4);BKT='site';fb(F,'lstone',u-3,u+3,0,.12,0,2.2);BKT=null}}

// ---------- הבניין ----------
box('stone',-W/2,W/2,0,GH,-D/2,D/2);
box('stone',-W/2,-BX,GH,yF(PH),-D/2,D/2);box('stone',BX,W/2,GH,yF(PH),-D/2,D/2);
box('stone',-W/2,-PHX,yF(PH),TOP,-D/2,D/2);box('stone',PHX,W/2,yF(PH),TOP,-D/2,D/2);
box('stone',-BX,BX,GH,yF(PH),-D/2+BD,D/2-BD);
box('clad',-PHX,PHX,yF(PH),TOP,-D/2+PHD,D/2-PHD);
box('plaster',-PHX,PHX,yF(PH),yF(PH)+.02,-D/2,D/2);
box('dark',-W/2-.1,W/2+.1,GH-.4,GH-.06,-D/2-.1,D/2+.1,0);box('dark',-W/2-.1,W/2+.1,GH+.06,GH+.35,-D/2-.1,D/2+.1,1);
box('dark',-W/2-.08,W/2+.08,TOP-.15,TOP-.06,-D/2-.08,D/2+.08,PH);box('dark',-W/2-.08,W/2+.08,TOP+.06,TOP+.35,-D/2-.08,D/2+.08,RF);
for(const key in FAC){const F=FAC[key],h=F.half;
 if(F.bal){
  for(const s of [-1,1]){bands(F,s<0?-h-.08:BX,s<0?-BX:h+.08);column(F,s*6.3,'A',1,PH);column(F,s*10.9,'B',1,PH-1);win(F,s*10.9,yF(PH)+1.35,.65,.65)}
  fb(F,'dark',-.3,.3,GH,yF(PH),-.35,.1);fb(F,'stone',-.15,.15,GH,yF(PH),-BD,-.35);
  for(const s of [-1,1]){const u0=s<0?-BX:.24,u1=s<0?-.24:BX;
   for(let f=1;f<=PH-1;f++){const ys=yF(f);
    if(f>1)fb(F,'plaster',u0,u1,ys,ys+.02,-BD,0);
    /* 939 (יהב): פס המרפסת בדיוק בגובה הקורה של החזית (y-0.30 עד y+0.45) — קו אחד רציף */fb(F,'dark',u0-(s<0?.08:0),u1+(s>0?.08:0),f>1?ys-.3:ys+.04,ys+.45,-.04,.18);
    frail(F,u0+.05,u1-.05,ys+.45,.07);win(F,(u0+u1)/2-s*.3,ys+.04,2.1,2.3,{wo:-BD});fb(F,'plaster',u0,u1,ys+FH-.22,ys+FH-.04,-BD,0)}}
  for(const u of [-2.6,0,2.6])win(F,u,yF(PH)+.05,2.2,2.5,{wo:-PHD});
  fb(F,'dark',-PHX,PHX,yF(PH)-.3,yF(PH)+.45,-.04,.18);frail(F,-PHX,PHX,yF(PH)+.45,.07);
  if(key=='front'){shop(F,0,3.6,true);for(const u of [-10.4,-6.4,6.4,10.4])shop(F,u,3.0)}else for(const u of [-10.4,-6.4,6.4,10.4])win(F,u,1.0,1.6,1.9,{tr:true})
 }else{
  for(const s of [-1,1]){bands(F,s<0?-h-.08:0,s<0?0:h+.08);column(F,s*3.2,'A',1,PH);column(F,s*8.6,'B',1,PH-1)}
  fb(F,'dark',-.35,.35,GH+.35,TOP-.15,-.02,.06);column(F,-1.6,'C',1,PH);column(F,1.6,'C',1,PH);
  if(key=='right')for(const u of [-9,-3.5,3.5,9])shop(F,u,3.0)}}
// גג: מסגרת בטון (פרגולה), חדר משאבות עם דלת
BKT=RF;
{const t=.9,y0=TOP+.35,y1=TOP+PG;
 for(const s of [-1,1]){box('clad',-W/2,W/2,y1-t,y1,s*D/2-(s>0?t:0),s*D/2+(s<0?t:0));box('clad',s*W/2-(s>0?t:0),s*W/2+(s<0?t:0),y1-t,y1,-D/2,D/2);
  box('clad',-W/2,W/2,y0,y0+.9,s*D/2-(s>0?t:0),s*D/2+(s<0?t:0));box('clad',s*W/2-(s>0?t:0),s*W/2+(s<0?t:0),y0,y0+.9,-D/2,D/2)}
 const tp=t*1.3;for(const [x,z] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2],[-PHX,-D/2],[PHX,-D/2],[-PHX,D/2],[PHX,D/2],[-W/2,-5],[-W/2,5],[W/2,-5],[W/2,5]]){const x0=Math.max(-W/2,Math.min(W/2-tp,x-tp/2)),z0=Math.max(-D/2,Math.min(D/2-tp,z-tp/2));box('clad',x0,x0+tp,y0,y1,z0,z0+tp)}
 for(let x=-PHX+.4;x<=PHX-.3;x+=.9)for(const s of [-1,1])box('clad',x-.1,x+.1,y1-.45,y1-.05,s>0?D/2-PHD:-D/2,s>0?D/2:-D/2+PHD);
 for(const s of [-1,1]){railQ({x:-W/2+.9,z:s*(D/2-.9)},{x:W/2-.9,z:s*(D/2-.9)},TOP+.35,TOP+1.4);railQ({x:s*(W/2-.9),z:-D/2+.9},{x:s*(W/2-.9),z:D/2-.9},TOP+.35,TOP+1.4)}
 const x0=-4.6,x1=4.6,z0=-6.2,z1=1.6,ya=TOP+.35,yb=TOP+3.7;
 box('pump',x0,x1,ya,yb,z0,z1);box('dark',x0-.1,x1+.1,yb,yb+.25,z0-.1,z1+.1);box('alu',-.68,.68,ya,ya+2.32,z1,z1+.06);box('door',-.56,.56,ya,ya+2.2,z1,z1+.09);
 box('alu',.3,.46,ya+1.02,ya+1.07,z1+.09,z1+.15);box('lstone',-1.1,1.1,ya-.05,ya+.12,z1,z1+.9);
 for(const s of [-1,1])for(let i=0;i<6;i++){const yy=ya+1.9+i*.17;box('dark',s>0?x1:x0-.06,s>0?x1+.06:x0,yy,yy+.08,-3.6,-1.4)}
 for(const zz of [-4.8,-4.2])addGeom('door',new T.CylinderGeometry(.12,.12,4.2,10).rotateZ(Math.PI/2).translate(x1+2.1,ya+.5,zz))}
BKT=null;

// ---------- פיתוח, חומות היקפיות, עצים ----------
BKT='site';const SITE_F=D/2+16,ZB=-40,XS=55;
box('pave',-XS,XS,-.1,0,ZB,SITE_F);box('earth',-300,300,-.4,-.12,-300,300);box('lstone',-XS,XS,-.1,.14,SITE_F,SITE_F+.3);
box('asph',-300,300,-.2,-.02,SITE_F+.3,SITE_F+10);box('pave',-300,300,-.1,.14,SITE_F+10,SITE_F+13);
for(let x=-50;x<50;x+=6)box('lstone',x,x+3,-.01,0,SITE_F+4.9,SITE_F+5.1);
// חומות אבן היקפיות (כמו בהדמיית הדירה): גבוהה מאחור, חומות צד מדורגות שיורדות לכיוון הכביש, מעקה על הראש, אדמה מאחור
{const HW=4*FH;box('wall',-XS-1,XS+1,0,HW,ZB-1.2,ZB);box('cap',-XS-1.2,XS+1.2,HW,HW+.35,ZB-1.4,ZB+.1);
 for(let x=-XS+3;x<XS;x+=7)box('wall',x-.55,x+.55,0,HW,ZB,ZB+.6);
 for(const s of [-1,1]){const L=SITE_F-ZB,n=4;for(let i=0;i<n;i++){const h=HW-(HW-3)*i/(n-1),z0=ZB+i*L/n,z1=z0+L/n;box('wall',s*XS,s*(XS+1),0,h,z0,z1);box('cap',s*(XS-.1),s*(XS+1.15),h,h+.3,z0,z1)}}
 for(let x=-XS;x<=XS;x+=1.5)box('dark',x-.025,x+.025,HW+.35,HW+1.4,ZB-.6,ZB-.55);box('dark',-XS,XS,HW+1.35,HW+1.42,ZB-.62,ZB-.53);
 box('earth',-300,300,0,HW-.05,ZB-60,ZB-1.2)}
const LEAF={p:[],n:[],u:[],c:[]},UP=new T.Vector3(0,1,0);
function limb(x0,y0,z0,x1,y1,z1,r0,r1){const a=new T.Vector3(x0,y0,z0),b=new T.Vector3(x1,y1,z1),d=b.clone().sub(a),L=d.length();const g=new T.CylinderGeometry(r1,r0,L,6,1);
 g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(UP,d.normalize())));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);addGeom('trunk',g)}
function treeAt(x,y,z,s){const r=rnd(Math.abs(x*131+z*71|0)+5),th=(2.0+r()*.5)*s,lx=(r()-.5)*.5*s,lz=(r()-.5)*.5*s,mx=x+lx*.4,mz=z+lz*.4,tx=x+lx,tz=z+lz,ty=y+th;
 limb(x,y,z,mx,y+th*.55,mz,.2*s,.15*s);limb(mx,y+th*.55,mz,tx,ty,tz,.15*s,.11*s);
 const C=new T.Vector3(tx,ty+1.25*s,tz),RX=(1.7+r()*.5)*s,RY=(1.25+r()*.3)*s,RZ=(1.6+r()*.5)*s,nb=5+(r()*3|0);
 for(let i=0;i<nb;i++){const a=i/nb*6.283+r()*.6,l=(.9+r()*.7)*s,ex=tx+Math.cos(a)*l,ez=tz+Math.sin(a)*l,ey=ty+(.6+r()*.8)*s;limb(tx,ty-.1*s,tz,ex,ey,ez,.09*s,.04*s);if(r()<.7)limb(ex,ey,ez,ex+Math.cos(a+1)*.5*s,ey+.4*s,ez+Math.sin(a+1)*.5*s,.04*s,.02*s)}
 for(let i=0;i<54;i++){let px,py,pz;do{px=r()*2-1;py=r()*2-1;pz=r()*2-1}while(px*px+py*py+pz*pz>1);const k=.55+.45*r(),P=new T.Vector3(C.x+px*RX*k,C.y+py*RY*k,C.z+pz*RZ*k),qq=(.75+r()*.55)*s,N=new T.Vector3(px,py*1.2+.35,pz).normalize(),sh=.78+.3*r()+.12*py,tint=[sh*(.92+r()*.1),sh,sh*(.82+r()*.12)];
  for(let j=0;j<2;j++){const ang=r()*3.14+j*1.57,tilt=(r()-.5)*.9,A=new T.Vector3(Math.cos(ang),0,Math.sin(ang)).multiplyScalar(qq/2),B=new T.Vector3(-Math.sin(ang)*tilt,1,Math.cos(ang)*tilt).normalize().multiplyScalar(qq/2),fl=r()<.5;
   for(const [ua,ub,uu,vv] of [[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,-1,0,0],[1,1,1,1],[-1,1,0,1]]){LEAF.p.push(P.x+A.x*ua+B.x*ub,P.y+A.y*ua+B.y*ub,P.z+A.z*ua+B.z*ub);LEAF.n.push(N.x,N.y,N.z);LEAF.u.push(fl?1-uu:uu,vv);LEAF.c.push(...tint)}}}}
function planter(x,z){box('lstone',x-1.7,x+1.7,0,.45,z-1.7,z+1.7);box('lstone',x-1.2,x+1.2,.45,.95,z-1.2,z+1.2);box('soil',x-1.05,x+1.05,.95,.97,z-1.05,z+1.05);treeAt(x,.95,z,1)}
/* 933 (יהב): העצים חזרו לריבוע מול הכניסה (כמו קודם); גן הילדים האמיתי בין הבניינים — לא מצויר כאן */
for(const x of [-5,5])for(const z of [D/2+4.6,D/2+12.6])planter(x,z);
for(const x of [-22,22])planter(x,0);
for(const [x,z] of [[-30,D/2+8],[30,D/2+8],[-32,-8],[32,-12],[-14,-D/2-8],[14,-D/2-8]])treeAt(x,0,z,1.4);
for(const x of [-26,-11,11,26]){box('dark',x-.08,x+.08,0,5.5,SITE_F-3.92,SITE_F-4.08);box('dark',x-.25,x+.25,5.5,5.75,SITE_F-4.5,SITE_F-3.85)}
// גדר אתר (בזמן בנייה): פנלי רשת על רגלי בטון לאורך הרחוב והצדדים, שער פתוח מול הכניסה
BKT='fence';
{const z=SITE_F-1.2,pan=(a,b)=>{railQ(a,b,.25,2.25,'mesh');const L=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.round(L/3.5));for(let i=0;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,zz=a.z+(b.z-a.z)*i/n;box('door',x-.03,x+.03,.2,2.3,zz-.03,zz+.03);box('conc',x-.35,x+.35,0,.22,zz-.18,zz+.18)}};
 pan({x:-XS+1,z},{x:-4,z});pan({x:4,z},{x:XS-1,z});for(const s of [-1,1])pan({x:s*(XS-1),z},{x:s*(XS-1),z:ZB+2});
 box('grn',-XS+1,-4,.25,2.25,z-.02,z+.02);box('grn',4,XS-1,.25,2.25,z-.02,z+.02)}
BKT=null;

// ---------- רשתות לקבוצות ----------
const FG=[],SITE=new T.Group(),FEN=new T.Group(),BLD=new T.Group(),MESHES=[];scene.add(BLD,SITE,FEN);
for(let f=0;f<=RF;f++){const g=new T.Group();g.userData.f=f;FG.push(g);BLD.add(g)}
function mkMesh(k,b){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.u,2));
 const m=new T.Mesh(g,M[k]);m.userData.k=k;m.castShadow=!['pave','earth','asph','glass','shop','mesh'].includes(k);m.receiveShadow=true;
 if(k=='rail'||k=='mesh'||k=='rebar'||k=='lat')m.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:M[k].map,alphaTest:.5});return m}
for(const bk in BUF)for(const k in BUF[bk]){const m=mkMesh(k,BUF[bk][k]);if(bk=='site')SITE.add(m);else if(bk=='fence')FEN.add(m);else{FG[+bk].add(m);MESHES.push(m)}}
for(const k in BUF)delete BUF[k];
{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(LEAF.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(LEAF.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(LEAF.u,2));g.setAttribute('color',new T.Float32BufferAttribute(LEAF.c,3));
 const m=new T.Mesh(g,M.leaf);m.castShadow=m.receiveShadow=true;m.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:leafT,alphaTest:.45});SITE.add(m)}
// חומרים שקופים לקומות שמעל החיתוך
const GH_={};function ghost(k){if(!GH_[k]){const m=M[k].clone();m.transparent=true;m.depthWrite=false;GH_[k]=m}return GH_[k]}
// קבוצה זמנית: שלד בעבודה / קומה פתוחה — נבנית מחדש מהנתונים
function flush(group){for(const bk in BUF){for(const k in BUF[bk]){const m=mkMesh(k,BUF[bk][k]);group.add(m)}delete BUF[bk]}}
function clear(g){for(let i=g.children.length-1;i>=0;i--){const c=g.children[i];g.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.userData.own)o.material.dispose()})}}

// ---------- נתונים ----------
let DATA=CFG.data||{fl:{}},MODE='fin',SK=null;
const has=(o,re)=>Object.keys(o||{}).some(k=>re.test(k)&&o[k]);
function skInfo(){const sk=DATA.sk;if(!sk||!sk.fl)return null;const fl=sk.fl;let any=0,cur=-1;
 for(let f=0;f<=PH;f++){const els=fl[f]||[];if(els.some(e=>Object.keys(e.s||{}).some(k=>e.s[k])))any=1}
 if(!any)return null;
 for(let f=0;f<=PH;f++){const els=fl[f]||[],S=sk.S||[];const done=els.length&&els.every(e=>S.every(x=>(e.s||{})[x]));if(!done){cur=f;break}}
 return cur<0?null:{cur,S:sk.S||[],fl}}
// שלב של אלמנט שלד: 0 כלום · 1 תבנית · 2 ברזל · 3 יצוק (עם תבנית) · 4 יצוק בלי תבנית; stone = סידור אבן (ברנוביץ')
function elSt(e){const s=e.s||{};const c=has(s,/יציק/),x=has(s,/פירוק/);return{lv:x?4:c?3:has(s,/ברזל/)?2:has(s,/תבנית/)?1:0,stone:has(s,/אבן/),nx:(SK&&SK.S.find(k=>!s[k]))||''}}

// ---------- שלד בעבודה ----------
const SKG=new T.Group();scene.add(SKG);
function sideOf(n){return /צפון/.test(n)?'back':/דרום/.test(n)?'front':/מזרח/.test(n)?'right':/מערב/.test(n)?'left':''}
function skSlab(y,st){BKT='tmp';const t=.25;
 if(st.lv>=1&&st.lv<4){box('ply',-W/2,W/2,y-t-.04,y-t,-D/2,D/2);for(let x=-W/2+1;x<W/2;x+=2.4)for(let z=-D/2+1;z<D/2;z+=2.4)box('door',x-.04,x+.04,y-FH,y-t-.04,z-.04,z+.04)}
 if(st.lv==1)for(const s of [-1,1]){box('ply',-W/2,W/2,y-t,y+.05,s*D/2-(s>0?.03:0),s*D/2+(s<0?.03:0));box('ply',s*W/2-(s>0?.03:0),s*W/2+(s<0?.03:0),y-t,y+.05,-D/2,D/2)}
 if(st.lv==2){const B=buf('tmp','rebar');for(const yy of [y-t+.06,y-.05])for(const q of [[-W/2,yy,-D/2,-W/2/1.6,-D/2/1.6],[W/2,yy,-D/2,W/2/1.6,-D/2/1.6],[W/2,yy,D/2,W/2/1.6,D/2/1.6],[-W/2,yy,-D/2,-W/2/1.6,-D/2/1.6],[W/2,yy,D/2,W/2/1.6,D/2/1.6],[-W/2,yy,D/2,-W/2/1.6,D/2/1.6]]){B.p.push(q[0],q[1],q[2]);B.n.push(0,1,0);B.u.push(q[3],q[4])}
  for(const s of [-1,1]){box('ply',-W/2,W/2,y-t,y+.05,s*D/2-(s>0?.03:0),s*D/2+(s<0?.03:0));box('ply',s*W/2-(s>0?.03:0),s*W/2+(s<0?.03:0),y-t,y+.05,-D/2,D/2)}}
 if(st.lv>=3)box('conc',-W/2,W/2,y-t,y,-D/2,D/2);BKT=null}
function skWall(side,y0,st){BKT='tmp';const F=FAC[side],h=F.half,t=.3,y1=y0+FH-.25;
 if(st.lv>=3){fb(F,st.stone?'stone':'conc',-h,h,y0,y1,-t,0);if(F.bal)fb(F,'hole',-BX+.3,BX-.3,y0+.1,y1-.1,-t-.01,.01)}
 if(st.lv==2||(st.lv==1&&st.stone)){railQ(fpt(F,-h,-t/2),fpt(F,h,-t/2),y0,y1+.6,'rebar');railQ(fpt(F,-h,-t+.04),fpt(F,h,-t+.04),y0,y1+.6,'rebar')}
 if(st.stone&&st.lv<3)fb(F,'stone',-h,h,y0,y1,-.06,0);
 if(st.lv>=1&&st.lv<4){fb(F,'ply',-h,h,y0,y1+.05,.0,.04);fb(F,'ply',-h,h,y0,y1+.05,-t-.04,-t);for(let u=-h+1;u<h;u+=2.4)fb(F,'door',u-.05,u+.05,y0,y1,.04,.14)}
 BKT=null}
function skCore(y0,st){BKT='tmp';const y1=y0+FH-.25,x0=-3.7,x1=3.3,z0=-6.6,z1=6.5;
 if(st.lv>=3){for(const [a,b,c,d] of [[x0,x1,z0,z0+.3],[x0,x1,z1-.3,z1],[x0,x0+.3,z0,z1],[x1-.3,x1,z0,z1],[x0,x1,-.15,.15]])box('conc',a,b,y0,y1,c,d)}
 else if(st.lv>=1){for(const [a,b,c,d] of [[x0,x1,z0,z0],[x0,x1,z1,z1],[x0,x0,z0,z1],[x1,x1,z0,z1]])railQ({x:a,z:c},{x:b,z:d},y0,y1+.6,'rebar')}
 // עמודים בהיקף ובפנים
 for(const [x,z] of [[-9,-8],[9,-8],[-9,8],[9,8],[-9,0],[9,0],[0,-10],[0,10]]){if(st.lv>=3)box('conc',x-.25,x+.25,y0,y1,z-.25,z+.25);else if(st.lv>=1){railQ({x:x-.2,z},{x:x+.2,z},y0,y1+.6,'rebar');railQ({x,z:z-.2},{x,z:z+.2},y0,y1+.6,'rebar')}}
 BKT=null}
function crane(yTop){BKT='tmp';const x=W/2+7,z=-D/2+3,h=Math.max(30,yTop+14),j=48;
 const B=(a,b)=>railQ(a,b,0,h,'lat');B({x:x-1,z:z-1},{x:x+1,z:z-1});B({x:x+1,z:z-1},{x:x+1,z:z+1});B({x:x+1,z:z+1},{x:x-1,z:z+1});B({x:x-1,z:z+1},{x:x-1,z:z-1});
 box('conc',x-3,x+3,0,1.2,z-3,z+3);box('yel',x-1.3,x+1.3,h,h+1,z-1.3,z+1.3);box('yel',x-j,x+14,h+1,h+2.2,z-.6,z+.6);box('yel',x-.8,x+.8,h+2.2,h+7,z-.8,z+.8);
 box('conc',x+9,x+13.5,h-1,h+1,z-1.2,z+1.2);box('glass',x+.9,x+2.6,h-1.4,h+.6,z+.9,z+2.4);box('yel',x+.8,x+2.7,h-1.6,h-1.4,z+.8,z+2.5);
 box('dark',x-30-.02,x-30+.02,yTop+4,h+1,z-.02,z+.02);box('yel',x-30.6,x-29.4,yTop+3.4,yTop+4,z-.4,z+.4);BKT=null}
function edgeRail(y){BKT='tmp';for(const s of [-1,1]){for(let x=-W/2;x<=W/2;x+=2.1){box('yel',x-.04,x+.04,y,y+1.15,s*D/2-.04,s*D/2+.04)}for(let z=-D/2;z<=D/2;z+=2.1)box('yel',s*W/2-.04,s*W/2+.04,y,y+1.15,z-.04,z+.04);
  box('yel',-W/2,W/2,y+1.05,y+1.12,s*D/2-.03,s*D/2+.03);box('yel',s*W/2-.03,s*W/2+.03,y+1.05,y+1.12,-D/2,D/2);box('ply',-W/2,W/2,y,y+.15,s*D/2-.02,s*D/2+.02);box('ply',s*W/2-.02,s*W/2+.02,y,y+.15,-D/2,D/2)}BKT=null}
function buildSkel(){clear(SKG);if(!SK)return;const c=SK.cur,fl=SK.fl;let topY=0;
 for(let f=c;f<=PH;f++){const els=fl[f]||[];if(f>c&&!els.some(e=>Object.keys(e.s||{}).some(k=>e.s[k])))break;
  const y0=yF(f);let wl=null;
  for(const e of els){const st=elSt(e),ty=e.ty||(/תקר/.test(e.n)?'c':/רצפ/.test(e.n)?'f':'w');if(!st.lv&&!st.stone)continue;
   if(ty=='f'){skSlab(y0+.001,st);if(st.lv>=3)topY=Math.max(topY,y0)}
   else if(ty=='c'){skSlab(yF(f+1),st);if(st.lv>=3)topY=Math.max(topY,yF(f+1))}
   else{const sd=sideOf(e.n);if(sd)skWall(sd,y0,st);else skCore(y0,st);if(!wl||st.lv>wl.lv)wl=st}}
  if(wl)skCore(y0,wl)}
 topY=Math.max(topY,yF(c));edgeRail(topY);crane(topY);flush(SKG);SKG.userData.top=topY}

// ---------- קומה פתוחה (חיתוך): התוכנית האמיתית על הרצפה, דירות, לובי ומצב הגמרים ----------
const DIO=new T.Group();scene.add(DIO);
let planTex=null;if(CFG.plan){new T.TextureLoader().load(CFG.plan,t=>{t.encoding=T.sRGBEncoding;t.anisotropy=ANI;planTex=t;if(OPEN!=null){buildDio(OPEN);dirty=true}},undefined,()=>{})}
// אזורים בקומה טיפוסית לפי תוכנית קומה 9 (u ימינה, v למטה, 0..1 על קווי החוץ); חלק העליון של הדף = החזית
const ZT=[{i:4,r:[[0,.478,0,.288],[0,.316,.288,.76]]},{i:0,r:[[.478,1,0,.25]]},{i:1,r:[[.677,1,.25,.706]]},{i:2,r:[[.538,1,.706,1]]},{i:3,r:[[0,.538,.76,1]]},{i:'L',r:[[.316,.677,.288,.76]]}];
const CORE=[.367,.614,.285,.709];
const ZG=[{i:'S',r:[[0,1,0,.32]]},{i:'L',r:[[.35,.65,.32,.7]]},{i:0,r:[[0,.35,.32,1]]},{i:1,r:[[.65,1,.32,1]]}];
const ZP=[{i:0,r:[[0,.5,0,.4]]},{i:1,r:[[.5,1,0,.4]]},{i:2,r:[[.5,1,.6,1]]},{i:3,r:[[0,.5,.6,1]]},{i:'L',r:[[.25,.75,.4,.6]]}];
const U2X=u=>(.5-u)*W,V2Z=v=>(.5-v)*D;
const ZPICK=[];
function stg(a){const ids=new Set(a&&a.ids||[]);return{blk:ids.has(1),pl:ids.has(7),tl:ids.has(11)||ids.has(12),pt:ids.has(27),al:ids.has(28),kt:ids.has(36),fin:ids.has(48)||ids.has(49)||(a&&a.pc>=100)}}
function lbl(lines,col){const c=document.createElement('canvas');c.width=512;c.height=200;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.93)';
 const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.fill()};rr(6,6,500,188,34);
 g.fillStyle=col;rr(6,150,500*Math.max(.04,Math.min(1,lines[2]||0)),44,20);g.direction='rtl';g.textAlign='center';g.fillStyle='#1f2328';g.font='800 64px Heebo,system-ui,Arial';g.fillText(lines[0],256,78);g.font='600 40px Heebo,system-ui,Arial';g.fillStyle='#4b504c';g.fillText(lines[1],256,134);
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.userData.own=1;s.scale.set(6.2,2.42,1);s.renderOrder=10;return s}
function buildDio(f){clear(DIO);ZPICK.length=0;const y=yF(f),fd=(DATA.fl||{})[f]||{},apts=fd.apts||[],Z=f==0?ZG:f==PH?ZP:ZT,wallH=2.6;
 // רצפה: התוכנית האמיתית (קומה טיפוסית) על בטון / ריצוף לפי מצב כל דירה
 const mats={};const fm=k=>mats[k]||(mats[k]=(()=>{const m=new T.MeshStandardMaterial({color:k=='tl'?0xf1ebdf:k=='fin'?0xf5f1e8:0xb9b6b0,roughness:.9,map:(f>=1&&f<=PH-1)?planTex:null});m.userData.own=1;return m})());
 BKT='tmp';box('conc',-W/2,W/2,y-.3,y-.02,-D/2,D/2);
 // קירות חוץ בגובה חתך (1.2 מ') באבן
 for(const s of [-1,1]){box('stone',-W/2,W/2,y,y+1.2,s*D/2-(s>0?.3:0),s*D/2+(s<0?.3:0));box('stone',s*W/2-(s>0?.3:0),s*W/2+(s<0?.3:0),y,y+1.2,-D/2,D/2)}
 // גרעין: מעליות ומדרגות
 if(f>=1){const [a,b,c,d]=CORE,x0=U2X(b),x1=U2X(a),z0=V2Z(d),z1=V2Z(c);for(const [p,q,r,s2] of [[x0,x1,z0,z0+.3],[x0,x1,z1-.3,z1],[x0,x0+.3,z0,z1],[x1-.3,x1,z0,z1]])box('conc',p,q,y,y+wallH,r,s2);
  for(let i=0;i<3;i++){const xx=x0+.6+i*((x1-x0-1.2)/3);box('hole',xx,xx+1.6,y,y+.05,z1-3.2,z1-.5)}for(let i=0;i<8;i++)box('conc',x0+.6,x0+2.2,y,y+.18*(i+1),z0+.6+i*.32,z0+.92+i*.32)}
 flush(DIO);
 for(const z of Z){const isL=z.i=='L',isS=z.i=='S',a=isL||isS?null:apts[z.i],st=stg(a),
   key=isL?'lob':isS?'s':(st.fin?'fin':st.tl?'tl':'c');
  for(const [u0,u1,v0,v1] of z.r){const x0=U2X(u1),x1=U2X(u0),z0=V2Z(v1),z1=V2Z(v0);
   const g=new T.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);g.translate((x0+x1)/2,y+.005,(z0+z1)/2);
   const uv=g.attributes.uv,P=g.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,.5-P.getX(i)/W,.5+P.getZ(i)/D)}
   const m=new T.Mesh(g,fm(isL?'tl':key=='s'?'c':key));m.receiveShadow=true;m.userData.z=isL?{L:f}:a?{n:a.n}:null;DIO.add(m);if(m.userData.z)ZPICK.push(m);
   // קירות הדירה לפי השלב: בלוקים → טיח → צבע (בגובה חתך)
   if(a||isL){BKT='tmp';const wk=isL?'plaster':st.pt?'lstone':st.pl?'plaster':st.blk?'conc':null;
    if(wk){const t=.12;box(wk,x0+.02,x1-.02,y,y+wallH,z0+.02,z0+.02+t);box(wk,x0+.02,x1-.02,y,y+wallH,z1-.02-t,z1-.02);box(wk,x0+.02,x0+.02+t,y,y+wallH,z0,z1);box(wk,x1-.02-t,x1-.02,y,y+wallH,z0,z1)}
    else{box('yel',x0+.05,x1-.05,y,y+.03,z0+.05,z0+.1);box('yel',x0+.05,x1-.05,y,y+.03,z1-.1,z1-.05)}
    BKT=null;flush(DIO)}}
  // תווית מעל הדירה
  const r0=z.r[0],cx=U2X((r0[0]+r0[1])/2),cz=V2Z((r0[2]+r0[3])/2);
  if(a){const pc=Math.max(0,Math.min(100,a.pc|0)),col=pc>=100?'#3e7659':pc>0?'#d9a441':'#9aa09c';const s=lbl(['דירה '+a.n+(a.typ?' · '+a.typ:''),(a.stg||'לא התחיל')+' · '+pc+'%',pc/100],col);s.position.set(cx,y+wallH+2.4,cz);DIO.add(s)}
  else if(isL&&f>=1){const lb=fd.lob||{},pc=lb.pc|0;const s=lbl(['לובי קומה '+f,(lb.stg||'')+(lb.pc!=null?' · '+pc+'%':''),pc/100],'#0F4C2F');s.position.set(cx,y+wallH+2.4,cz);DIO.add(s)}
  else if(isS){const s=lbl(['חנויות ולובי ראשי','קומת קרקע',0],'#9aa09c');s.position.set(cx,y+wallH+2.4,cz);DIO.add(s)}}
 DIO.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}

// ---------- מצב תצוגה ----------
let OPEN=null,CUT=0,CUTG=0;
function applyMode(){SK=skInfo();const sk=MODE=='today'&&SK;
 for(const m of MESHES){const k=m.userData.k;m.visible=!(sk&&SKHIDE[k]);m.userData.base=sk&&SKM[k]?SKM[k]:M[k]}
 FG.forEach((g,f)=>{g.visible=!sk||(f<SK.cur)});if(sk&&SK.cur<=PH)FG[RF].visible=false;
 FEN.visible=!!sk;SKG.visible=!!sk;if(sk)buildSkel();else clear(SKG);
 const md=q('.fcd-md');md.innerHTML=SK?'<button data-m="today" class="'+(MODE=='today'?'on':'')+'">היום · שלד</button><button data-m="fin" class="'+(MODE=='fin'?'on':'')+'">בסיום</button>':'';
 q('.fcd-ttl small').textContent=SK&&MODE=='today'?'שלד: קומה '+(SK.cur==0?'קרקע':SK.cur)+' בעבודה · לפי סימוני מנהל העבודה':(CFG.sub||'לפי הצילומים והתוכניות · ≈');
 setCut(CUT);R.shadowMap.needsUpdate=true;dirty=true}
function setCut(c){CUT=c;const f=OPEN;
 FG.forEach((g,i)=>{const above=f!=null&&i>f;g.position.y=above?c*38:0;
  g.children.forEach(m=>{const base=m.userData.base||M[m.userData.k];if(above&&c>0){const gm=ghost(m.userData.k);gm.map=base.map;gm.color.copy(base.color);gm.opacity=Math.max(0,1-c*1.1);m.material=gm;m.castShadow=false}else{m.material=base;m.castShadow=!['pave','earth','asph','glass','shop','mesh'].includes(m.userData.k)}});
  const bv=!(MODE=='today'&&SK)||i<SK.cur;g.visible=(f!=null&&i==f)?(c<.02&&bv):bv})
 SKG.position.y=(f!=null&&MODE=='today'&&SK)?c*38:0;DIO.visible=f!=null&&c>.02;dirty=true}

// ---------- מצלמה ----------
const VIEWS={front:{yaw:-.22,pit:.06,dist:104,ty:30},photo:{yaw:.16,pit:-.5,dist:64,ty:43},corner:{yaw:-.8,pit:.2,dist:88,ty:29},street:{yaw:.42,pit:.1,dist:46,ty:11},roof:{yaw:.6,pit:.42,dist:56,ty:52},trees:{yaw:.22,pit:.06,dist:46,ty:5}};
let V=Object.assign({},VIEWS[CFG.view]||VIEWS.front),goal=null,dirty=true,dead=false;
const tgt=new T.Vector3();
function place(){tgt.set(0,V.ty,0);const c=Math.cos(V.pit);cam.position.set(V.dist*Math.sin(V.yaw)*c,V.ty+V.dist*Math.sin(V.pit),V.dist*Math.cos(V.yaw)*c);if(cam.position.y<1.6)cam.position.y=1.6;cam.lookAt(tgt)}
function resize(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?55:42;cam.updateProjectionMatrix();dirty=true}
const RO=window.ResizeObserver?new ResizeObserver(resize):null;if(RO)RO.observe(host);addEventListener('resize',resize);resize();
const pts=new Map();let drag=null,pinch=null,mid=null,mv=0,multi=false;
const hint=q('.fcd-hint'),hideHint=()=>hint.classList.add('gone');
host.addEventListener('pointerdown',e=>{if(!pts.size){mv=0;multi=false}try{host.setPointerCapture(e.pointerId)}catch(x){}pts.set(e.pointerId,[e.clientX,e.clientY]);goal=null;if(pts.size==1)drag=[e.clientX,e.clientY];if(pts.size==2){multi=true;const v=[...pts.values()];pinch=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);mid=(v[0][1]+v[1][1])/2}});
host.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
 if(pts.size==2&&pinch){const v=[...pts.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]),m=(v[0][1]+v[1][1])/2;V.dist=Math.max(14,Math.min(170,V.dist*pinch/d));pinch=d;V.ty=Math.max(2,Math.min(66,V.ty+(m-mid)*V.dist*.0025));mid=m;dirty=true;hideHint();return}
 if(drag){const dx=e.clientX-drag[0],dy=e.clientY-drag[1];mv+=Math.abs(dx)+Math.abs(dy);if(mv<8)return;V.yaw-=dx*.006;V.pit=Math.max(-.35,Math.min(1.4,V.pit+dy*.004));drag=[e.clientX,e.clientY];dirty=true;hideHint()}});
const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(!pts.size&&!multi&&mv<8&&e.type=='pointerup')tap(e.clientX,e.clientY);if(pts.size<2)pinch=null;if(!pts.size)drag=null;else{const v=[...pts.values()][0];drag=[v[0],v[1]]}};
host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
host.addEventListener('wheel',e=>{e.preventDefault();V.dist=Math.max(14,Math.min(170,V.dist*(1+Math.sign(e.deltaY)*.08)));dirty=true},{passive:false});
ROOT.querySelectorAll('.fcd-vw button').forEach(b=>b.onclick=()=>{ROOT.querySelectorAll('.fcd-vw button').forEach(x=>x.classList.toggle('on',x==b));if(OPEN!=null)closeFloor(1);goal=Object.assign({},VIEWS[b.dataset.v]);hideHint()});
q('.fcd-md').addEventListener('click',e=>{const b=e.target.closest('button[data-m]');if(!b)return;MODE=b.dataset.m;if(OPEN!=null)closeFloor(1);applyMode()});
q('.fcd-x').onclick=()=>{q('.fcd-sh').classList.remove('on');closeFloor()};
setTimeout(hideHint,4500);

// ---------- נגיעה ----------
const BB=new T.Box3(new T.Vector3(-W/2-.4,0,-D/2-.4),new T.Vector3(W/2+.4,TOP,D/2+.4)),RC=new T.Raycaster(),HV=new T.Vector3();
function tap(cx,cy){const r=host.getBoundingClientRect();RC.setFromCamera(new T.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),cam);
 if(OPEN!=null&&CUT>.5){const h=RC.intersectObjects(ZPICK,false)[0];if(h){const z=h.object.userData.z;if(z.L!=null)CFG.onLobby&&CFG.onLobby(z.L);else CFG.onApt&&CFG.onApt(z.n,OPEN);return}}
 const h=RC.ray.intersectBox(BB,HV);if(!h){if(OPEN!=null)closeFloor();return}
 const f=h.y<GH?0:Math.min(PH,Math.floor((h.y-GH)/FH)+1);
 if(OPEN!=null&&f>=OPEN){const hh=RC.intersectObjects(ZPICK,false)[0];if(!hh)closeFloor();return}
 openFloor(f)}
function sheet(f){const fd=(DATA.fl||{})[f]||{},apts=fd.apts||[],sk=MODE=='today'&&SK;
 q('.fcd-sT').textContent=f==0?'קומת קרקע':'קומה '+f;
 let sub=f==0?(PH==17?'חנויות · לובי ראשי · דירות גן':'לובי ראשי · דירת גן'):f==PH?'פנטהאוזים':apts.length+' דירות';let h='';
 if(sk&&f>=SK.cur){const els=SK.fl[f]||[];sub='שלד · '+(f==SK.cur?'בעבודה':'עוד לא התחיל');
  h+='<div class="fcd-sk">'+(els.length?els.map(e=>{const st=elSt(e);return '<div><b>'+esc(e.n)+'</b><span class="l'+st.lv+'">'+(st.lv==4?'✓ יצוק':st.lv==3?'יצוק · תבנית עדיין':st.nx?esc(st.nx):'—')+'</span></div>'}).join(''):'<div class="mu">אין סימונים לקומה הזאת</div>')+'</div>'}
 else{h+='<div class="fcd-ap">'+apts.map(a=>'<button data-n="'+a.n+'"><b>דירה '+a.n+'</b><small>'+(a.typ?a.typ+' · ':'')+esc(a.stg||'')+(a.pc!=null?' · '+(a.pc|0)+'%':'')+'</small></button>').join('')+'</div>';
  if(f>=1)h+='<button class="fcd-lb" data-l="'+f+'">לובי קומה '+f+'</button>'}
 {const L=(DATA.wk||{})[f];if(L&&L.length){const tot=L.reduce((a,x)=>a+(+x.n||0),0);h='<div class="fcd-wk">ביומן היום'+(tot?': '+tot+' פועלים':'')+' — '+esc(L.map(x=>(x.n?x.n+' ':'')+x.tr).join(', '))+'</div>'+h}}
 q('.fcd-sS').textContent=sub;const B=q('.fcd-sB');B.innerHTML=h;
 B.querySelectorAll('button[data-n]').forEach(b=>b.onclick=()=>CFG.onApt&&CFG.onApt(+b.dataset.n,f));
 B.querySelectorAll('button[data-l]').forEach(b=>b.onclick=()=>CFG.onLobby&&CFG.onLobby(+b.dataset.l));
 q('.fcd-sh').classList.add('on')}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
let anim=null,saveV=null;
function openFloor(f){hideHint();f=Math.max(0,Math.min(PH,f|0));if(MODE=='today'&&SK&&f>=SK.cur){if(OPEN!=null)closeFloor();sheet(f);return}if(OPEN!=null&&OPEN!=f)setCut(0);OPEN=f;buildDio(f);sheet(f);
 if(!saveV)saveV=Object.assign({},V);goal={yaw:V.yaw,pit:.95,dist:MOB?50:44,ty:yF(f)-(MOB?8:3)};anim={from:CUT,to:1,t0:performance.now()};CUTG=1}
function closeFloor(quick){if(OPEN==null)return;q('.fcd-sh').classList.remove('on');CUTG=0;anim={from:CUT,to:0,t0:performance.now(),end:1};if(saveV&&!quick)goal=saveV;saveV=null;if(quick){setCut(0);OPEN=null;clear(DIO);ZPICK.length=0;anim=null;R.shadowMap.needsUpdate=true}}

// ---------- לולאה ----------
function loop(){if(dead)return;requestAnimationFrame(loop);
 if(anim){const k=Math.min(1,(performance.now()-anim.t0)/650),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;setCut(anim.from+(anim.to-anim.from)*e);if(k>=1){if(anim.end){OPEN=null;clear(DIO);ZPICK.length=0;setCut(0)}anim=null;R.shadowMap.needsUpdate=true}}
 if(goal){let done=true;for(const k in goal){const d=goal[k]-V[k];if(Math.abs(d)>1e-3){V[k]+=d*.12;done=false}}if(done){V=Object.assign({},goal);goal=null}dirty=true}
 if(WKT.length){const t=performance.now();if(t-(WKT.t||0)>66){WKT.t=t;wkTick(t);dirty=true}}if(!dirty)return;dirty=false;place();R.render(scene,cam);FCD.frames=(FCD.frames||0)+1}
/* 932 (יהב): יומן העבודה של היום על החזית — פועלים בווסטים במרפסות של הקומה שרשומה ביומן + תווית כמה ומי. data.wk = {קומה:[{tr,n}]} */
const WKM={v1:new T.MeshStandardMaterial({color:0xff7a1a,roughness:.7}),v2:new T.MeshStandardMaterial({color:0xe6d21e,roughness:.7}),pn:new T.MeshStandardMaterial({color:0x34404c,roughness:.9}),sk:new T.MeshStandardMaterial({color:0xc69a74,roughness:.8}),hm:new T.MeshStandardMaterial({color:0xf5f5f0,roughness:.5})};
/* 937 (יהב): פועלים איכותיים — גוף חלק בפרופורציות אמיתיות, פנים, קסדה עם מצחייה, ווסט עם פסים מחזירי אור, כפפות, חגורת כלים ומגפיים. 6 סוגים קבועים לפי עבודה, עם תנועת עבודה עדינה */
const MW=(c,r,m)=>new T.MeshStandardMaterial({color:c,roughness:r==null?.75:r,metalness:m||0});
const WKX={skin:MW(0xc89a76,.6),skin2:MW(0x9a6b4c,.6),pants:MW(0x1c2530,.9),shirt:MW(0x283646,.85),vY:MW(0xe8e02a,.55),vO:MW(0xff6a13,.55),refl:MW(0xe9eef2,.25,.4),boot:MW(0x3b2a1e,.7),glove:MW(0x6d5a3e,.85),belt:MW(0x4a3424,.7),hatW:MW(0xf4f4f0,.35),hatY:MW(0xf1d21c,.35),hair:MW(0x2a211c,.9),eye:new T.MeshBasicMaterial({color:0x161616}),steel:MW(0xcfd5da,.35,.6),wood:MW(0x8a6236,.7),grn:MW(0x1d7a3e,.5),dark:MW(0x2c3238,.5,.3),bucket:MW(0xe0e3e6,.6),brush:MW(0xc9a25a,.9)};
function lath(pts,mat,seg){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||18);const m=new T.Mesh(g,mat);m.castShadow=true;return m}
function limbM(r0,r1,L,mat){/* איבר חלק: גליל מעוגל בקצוות */const pts=[];for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;pts.push([r0*Math.sin(a),-r0*Math.cos(a)+r0])}for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;pts.push([r1*Math.cos(a),L-r1+r1*Math.sin(a)])}const m=lath(pts,mat,14);return m}
const WKT=[];/* פועלים לאנימציה */
function man(x,y,z,i,rot){
 const ty=i%6,g=new T.Group(),VS=i%2?WKX.vY:WKX.vO,SK=i%3==2?WKX.skin2:WKX.skin,add=(o,px,py,pz)=>{o.position.set(px||0,py||0,pz||0);o.castShadow=true;g.add(o);return o};
 /* רגליים ומגפיים */
 const legs=[];for(const s of [-1,1]){const lg=new T.Group();lg.position.set(s*.1,.95,0);lg.rotation.z=s*.035;const L=lath([[0,0],[.06,0],[.068,.06],[.066,.2],[.072,.32],[.07,.42],[.082,.6],[.092,.78],[.094,.86],[0,.9]],WKX.pants,16);L.position.y=-.9;lg.add(L);const bt=lath([[0,0],[.075,0],[.08,.03],[.075,.11],[.06,.12],[0,.12]],WKX.boot,14);bt.scale.set(1,1,1.6);bt.position.set(0,-.95,.04);lg.add(bt);g.add(lg);legs.push(lg)}
 /* אגן, חגורת כלים, גוף (חולצה), ווסט עם פסים */
 add(lath([[0,0],[.17,0],[.18,.06],[.17,.14],[0,.14]],WKX.pants),0,.88,0);
 add(lath([[0,0],[.185,0],[.19,.06],[0,.06]],WKX.belt),0,.96,0);add(new T.Mesh(new T.BoxGeometry(.11,.12,.06),WKX.belt),.13,.93,.1);
 add(lath([[0,0],[.17,0],[.18,.14],[.2,.3],[.22,.42],[.2,.5],[.1,.55],[0,.56]],WKX.shirt),0,.97,0).scale.set(1,1,.68);
 const vest=add(lath([[0,0],[.178,0],[.19,.14],[.21,.3],[.228,.42],[.205,.48],[.11,.53],[0,.535]],VS),0,1.0,0);vest.scale.set(1,1,.71);
 for(const [yy,rr] of [[1.12,.196],[1.27,.218]]){const b=add(lath([[0,0],[rr,0],[rr,.035],[0,.035]],WKX.refl),0,yy,0);b.scale.set(1.02,1,.73)}
 /* צוואר וראש */
 add(limbM(.05,.05,.09,SK),0,1.5,0);
 const hd=new T.Group();hd.position.set(0,1.6,0);g.add(hd);const head=new T.Mesh(new T.SphereGeometry(.105,20,16),SK);head.scale.set(.92,1.12,1);head.castShadow=true;hd.add(head);
 const jaw=new T.Mesh(new T.SphereGeometry(.08,14,10),SK);jaw.position.set(0,-.06,.025);jaw.scale.set(1,.8,1);hd.add(jaw);
 const nose=new T.Mesh(new T.ConeGeometry(.018,.045,8),SK);nose.rotation.x=Math.PI/2;nose.position.set(0,.0,.105);hd.add(nose);
 for(const s of [-1,1]){const e=new T.Mesh(new T.SphereGeometry(.013,8,6),WKX.eye);e.position.set(s*.036,.025,.094);hd.add(e);const br=new T.Mesh(new T.BoxGeometry(.035,.008,.01),WKX.hair);br.position.set(s*.036,.048,.097);hd.add(br);const ear=new T.Mesh(new T.SphereGeometry(.022,8,6),SK);ear.scale.set(.5,1,.8);ear.position.set(s*.097,0,0);hd.add(ear)}
 {const hr=new T.Mesh(new T.SphereGeometry(.108,16,12,0,6.283,0,2.0),WKX.hair);hr.position.set(0,.0,-.012);hr.scale.set(.95,1.1,1);hd.add(hr)}
 const HT=i%4==1?WKX.hatY:WKX.hatW,hat=new T.Mesh(new T.SphereGeometry(.125,20,12,0,6.283,0,1.5),HT);hat.position.y=.035;hat.scale.set(1,.92,1.08);hat.castShadow=true;hd.add(hat);
 const brim=new T.Mesh(new T.CylinderGeometry(.14,.145,.012,24),HT);brim.position.set(0,.04,.03);brim.scale.set(1,1,1.18);hd.add(brim);const rdg=new T.Mesh(new T.BoxGeometry(.03,.02,.2),HT);rdg.position.set(0,.15,0);hd.add(rdg);
 /* ידיים: כתף ← מרפק ← כפפה, עם כלי לפי הסוג */
 const arms=[];for(const s of [-1,1]){const sh=new T.Group();sh.position.set(s*.225,1.42,0);g.add(sh);const sb=new T.Mesh(new T.SphereGeometry(.066,12,10),WKX.shirt);sb.castShadow=true;sh.add(sb);const up=limbM(.058,.05,.3,WKX.shirt);up.rotation.x=Math.PI;sh.add(up);const el=new T.Group();el.position.y=-.27;const elb=new T.Mesh(new T.SphereGeometry(.05,10,8),WKX.shirt);el.add(elb);sh.add(el);const fa=limbM(.05,.04,.27,WKX.shirt);fa.rotation.x=Math.PI;fa.position.y=.02;el.add(fa);const hn=new T.Mesh(new T.SphereGeometry(.05,10,8),WKX.glove);hn.scale.set(.85,1.1,.7);hn.position.y=-.3;el.add(hn);const hand=new T.Group();hand.position.y=-.31;el.add(hand);arms.push({sh,el,hand,s})}
 const R=arms[1],Lf=arms[0],tool=new T.Group();R.hand.add(tool);
 if(ty==0){/* טייח: מאלג' מול הקיר */R.sh.rotation.set(-1.9,0,.15);R.el.rotation.x=-.5;const pl=new T.Mesh(new T.BoxGeometry(.12,.01,.26),WKX.steel);pl.position.set(0,-.04,.06);const hdl=new T.Mesh(new T.CylinderGeometry(.015,.015,.1,8),WKX.wood);hdl.position.set(0,0,.02);tool.add(pl,hdl);Lf.sh.rotation.set(-.5,0,-.15);Lf.el.rotation.x=-.9;const hawk=new T.Mesh(new T.BoxGeometry(.26,.01,.26),WKX.steel);hawk.position.y=-.02;Lf.hand.add(hawk)}
 else if(ty==1){/* מברגה */R.sh.rotation.set(-1.25,0,.1);R.el.rotation.x=-.35;const bd=new T.Mesh(new T.BoxGeometry(.07,.1,.2),WKX.grn);bd.position.set(0,0,.06);const gr=new T.Mesh(new T.BoxGeometry(.05,.13,.06),WKX.dark);gr.position.set(0,-.08,0);const bt=new T.Mesh(new T.BoxGeometry(.07,.05,.08),WKX.dark);bt.position.set(0,-.16,0);const bit=new T.Mesh(new T.CylinderGeometry(.008,.004,.1,6),WKX.steel);bit.rotation.x=Math.PI/2;bit.position.z=.21;tool.add(bd,gr,bt,bit);Lf.sh.rotation.set(-.2,0,-.1);Lf.el.rotation.x=-.4}
 else if(ty==2){/* פטיש */R.sh.rotation.set(-2.3,0,.2);R.el.rotation.x=-.7;const hd2=new T.Mesh(new T.CylinderGeometry(.016,.016,.3,8),WKX.wood);hd2.rotation.x=Math.PI/2;hd2.position.z=.12;const hh=new T.Mesh(new T.BoxGeometry(.05,.05,.13),WKX.dark);hh.rotation.y=Math.PI/2;hh.position.z=.27;tool.add(hd2,hh);Lf.sh.rotation.set(-.9,0,-.2);Lf.el.rotation.x=-.6}
 else if(ty==3){/* דלי ביד שמאל */Lf.sh.rotation.set(0,0,-.12);const bk=lath([[0,0],[.1,0],[.12,.22],[.115,.22],[.095,.01],[0,.01]],WKX.bucket);bk.position.y=-.26;Lf.hand.add(bk);const hb=new T.Mesh(new T.TorusGeometry(.1,.006,6,16,Math.PI),WKX.dark);hb.position.y=-.04;Lf.hand.add(hb);R.sh.rotation.set(.15,0,.12);R.el.rotation.x=-.25}
 else if(ty==4){/* מטאטא — ניקיון */R.sh.rotation.set(-.6,0,.05);R.el.rotation.x=-.6;Lf.sh.rotation.set(-.9,0,-.05);Lf.el.rotation.x=-.3;tool.rotation.x=1.2;const st=new T.Mesh(new T.CylinderGeometry(.012,.012,1.3,8),WKX.wood);st.position.set(0,-.45,.12);st.rotation.x=.28;tool.add(st);const br=new T.Mesh(new T.BoxGeometry(.34,.06,.09),WKX.brush);br.position.set(0,-1.05,.3);tool.add(br)}
 else{/* קרש על הכתף */R.sh.rotation.set(-2.6,0,.35);R.el.rotation.x=-1.6;const pk=new T.Mesh(new T.BoxGeometry(.05,.1,2.2),WKX.wood);pk.position.set(.23,1.66,.1);pk.rotation.y=.12;pk.castShadow=true;g.add(pk);Lf.sh.rotation.set(-.15,0,-.08);Lf.el.rotation.x=-.3}
 g.position.set(x,y,z);g.rotation.y=rot+((i*.37)%1-.5)*.6;g.userData.wk={ty,R,Lf,hd,ph:i*1.7,b:{rx:R.sh.rotation.x,ex:R.el.rotation.x,lx:Lf.sh.rotation.x}};WKT.push(g);return g}
function wkTick(t){/* תנועת עבודה עדינה */for(let k=WKT.length-1;k>=0;k--){const g=WKT[k];if(!g.parent){WKT.splice(k,1);continue}const u=g.userData.wk,s=Math.sin(t*.0034+u.ph),f=Math.sin(t*.0062+u.ph);
  if(u.ty==0){u.R.sh.rotation.x=u.b.rx+s*.18;u.R.sh.rotation.z=.15+f*.08}else if(u.ty==1){u.R.el.rotation.x=u.b.ex+f*.03}else if(u.ty==2){u.R.el.rotation.x=u.b.ex+Math.max(0,s)*.9}else if(u.ty==4){u.R.sh.rotation.x=u.b.rx+s*.25;u.Lf.sh.rotation.x=u.b.lx+s*.2}else u.hd.rotation.y=s*.25}}
function buildWk(){FG.forEach(g=>{for(let i=g.children.length-1;i>=0;i--)if(g.children[i].userData.wk){const c=g.children[i];g.remove(c);c.traverse(o=>{if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}})}});
 const W0=DATA.wk||{};for(const f in W0){const fi=+f,L=W0[f]||[];if(!(fi>=0&&fi<=PH)||!FG[fi]||!L.length)continue;const tot=L.reduce((a,x)=>a+(+x.n||0),0),n=Math.min(14,tot||L.length),y=yF(fi)+.02,grp=new T.Group();grp.userData.wk=1;
  for(let i=0;i<n;i++){const bk=i>=7,k=bk?i-7:i;grp.add(man(-3+(k%7),y,(bk?-D/2+1.05:D/2-1.05)+(k%2?(bk?.35:-.35):0),i,bk?Math.PI:0))}
  const sp=lbl([tot?tot+' פועלים':'עבודה היום',L.map(x=>(x.n?x.n+' ':'')+x.tr).join(' · ').slice(0,26),1],'#f08a24');sp.position.set(W/2-6.2,y+1.6,D/2+1.4);grp.add(sp);FG[fi].add(grp)}
 R.shadowMap.needsUpdate=true;dirty=true}
let SKSEEN=!!skInfo();MODE=SKSEEN?'today':'fin';applyMode();try{buildWk()}catch(e){}
R.shadowMap.needsUpdate=true;loop();
return{
 refresh(d){DATA=d||DATA;try{buildWk()}catch(e){}const si=skInfo();if(!si&&MODE=='today')MODE='fin';if(si&&!SKSEEN)MODE='today';SKSEEN=!!si;applyMode();if(OPEN!=null){buildDio(OPEN);sheet(OPEN);setCut(CUT)}},
 openFloor,closeFloor,
 view(v){if(VIEWS[v])goal=Object.assign({},VIEWS[v])},
 mode(m){MODE=m;applyMode()},
 st(){return{open:OPEN,cut:CUT,mode:MODE,sk:SK?{cur:SK.cur}:null,zones:ZPICK.map(m=>m.userData.z),skel:SKG.children.length,frames:FCD.frames||0}},
 destroy(){dead=true;try{RO&&RO.disconnect()}catch(e){}removeEventListener('resize',resize);scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});R.dispose();try{R.forceContextLoss()}catch(e){}MOUNT.innerHTML=''}};
};
window.FCD.css='.fcd{position:absolute;inset:0;overflow:hidden;font:15px/1.45 Heebo,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#1f2328;direction:rtl;-webkit-user-select:none;user-select:none;background:#cfd8df}'+
'.fcd-st{position:absolute;inset:0;touch-action:none}.fcd-st canvas{display:block;width:100%;height:100%}'+
'.fcd-top{position:absolute;top:10px;right:10px;left:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;z-index:2;pointer-events:none}.fcd-top>*{pointer-events:auto}'+
'.fcd-ttl{background:rgba(255,255,255,.94);border-radius:14px;padding:6px 12px;border:1px solid #d8dcd5}.fcd-ttl b{display:block;font-weight:800}.fcd-ttl small{display:block;font-size:12px;color:#5d625e}'+
'.fcd-md{display:flex;gap:6px}.fcd button{font:700 14px inherit;color:#1f2328;cursor:pointer}'+
'.fcd-md button,.fcd-vw button{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #d8dcd5;background:rgba(255,255,255,.94)}.fcd-md button.on,.fcd-vw button.on{background:#0F4C2F;border-color:#0F4C2F;color:#fff}'+
'.fcd-vw{position:absolute;bottom:calc(12px + env(safe-area-inset-bottom));right:10px;left:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;z-index:2}'+
'.fcd-hint{position:absolute;top:74px;right:50%;transform:translateX(50%);z-index:2;background:rgba(20,23,28,.84);color:#fff;border-radius:12px;padding:6px 12px;font-size:13px;transition:opacity .6s;pointer-events:none;white-space:nowrap}.fcd-hint.gone{opacity:0}'+
'.fcd-sh{position:absolute;right:10px;left:10px;bottom:calc(66px + env(safe-area-inset-bottom));z-index:4;max-width:440px;margin:0 auto;background:rgba(255,255,255,.74);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.85);border-radius:20px;box-shadow:0 8px 28px rgba(0,0,0,.22);padding:10px 12px 12px;display:none;max-height:46%;overflow:auto}.fcd-sh.on{display:block}'+
'.fcd-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.fcd-h b{font-size:17px}.fcd-h small{display:block;color:#5d625e;font-size:12.5px}'+
'.fcd-x{width:44px;height:44px;border-radius:50%;border:1px solid #d8dcd5;background:rgba(255,255,255,.9)}'+
'.fcd-ap{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.fcd-ap button{min-height:52px;border-radius:14px;border:1px solid #d8dcd5;background:rgba(255,255,255,.92);text-align:right;padding:6px 10px}.fcd-ap small{display:block;font-weight:500;color:#5d625e;font-size:12px}'+
'.fcd-lb{width:100%;min-height:44px;margin-top:8px;border-radius:14px;border:0;background:#0F4C2F!important;color:#fff!important}'+
'.fcd-wk{background:#fff3e6;border:1px solid #f5c79a;color:#7a3d06;border-radius:12px;padding:8px 10px;margin:4px 0 8px;font-weight:700;font-size:14px}'+
'.fcd-sk{display:grid;gap:4px;margin-top:8px}.fcd-sk div{display:flex;justify-content:space-between;gap:8px;background:rgba(255,255,255,.9);border-radius:12px;padding:8px 10px}.fcd-sk span{font-weight:700;font-size:13px}.fcd-sk .l4{color:#2f6b43}.fcd-sk .l3{color:#2f6b43}.fcd-sk .l2,.fcd-sk .l1{color:#a0661c}.fcd-sk .l0{color:#8a8178}.fcd .mu{color:#5d625e;font-size:13px}';
})();
