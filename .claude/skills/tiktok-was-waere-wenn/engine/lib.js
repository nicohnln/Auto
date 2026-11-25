/* Zeichen-Bibliothek für flache 2D-Szenen (SVG-Strings). Alle Funktionen sind deterministisch (gleiche Zeit -> gleiches Bild). */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,k)=>a+(b-a)*k;
const E={
  lin:k=>k, out:k=>1-Math.pow(1-k,3), inOut:k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, in:k=>k*k*k,
  outBack:k=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2);},
  outElastic:k=>k===0?0:k===1?1:Math.pow(2,-10*k)*Math.sin((k*10-.75)*(2*Math.PI)/3)+1,
};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const PAL={navy:'#151936',panel:'#1c2044',line:'#2f3566',skin:'#f4c8a2',skin2:'#e0a982',purple:'#7a62b5',purpleD:'#5b4791',
  yellow:'#ffd23f',red:'#ff3355',pink:'#ff4fae',green:'#38f27e',blue:'#4ea8ff',white:'#f3f4fb',grey:'#8a8fb0',dark:'#0e1024',wood:'#7a4f2c',woodD:'#5a381d'};

/* Helfer pro Segment: Wortzeiten lokal zum Segmentstart */
function H(seg){
  const wt=(name,nth=0)=>{ name=name.toLowerCase(); let k=0;
    for(const w of seg.words){ if(w.n===name||w.n.startsWith(name)){ if(k++===nth) return w.t-seg.start; } }
    return name==='end'?seg.end-seg.start-0.3:(seg.end-seg.start)/2; };
  const p=(t,a,b)=>clamp((t-a)/(b-a),0,1);
  return {wt,p,
    after:(t,name,len=0.3,ease=E.outBack)=>ease(p(t,wt(name),wt(name)+len)),
    pulse:(t,name,len=0.4)=>{const x=t-wt(name);return x>0&&x<len?Math.sin(x/len*Math.PI):0;}};
}

const DEFS=`
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f2b631"/><stop offset="1" stop-color="#c98712"/></linearGradient>
<linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141836"/><stop offset="1" stop-color="#0c0f26"/></linearGradient>
<radialGradient id="spot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
`;

const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" font-family="${o.font||'Inter'}" font-weight="${o.w||900}" font-size="${o.size||40}" fill="${o.fill||'#fff'}" text-anchor="${o.anchor||'middle'}" letter-spacing="${o.ls||0}" opacity="${o.op??1}" ${o.filter?`filter="url(#${o.filter})"`:''} ${o.extra||''}>${s}</text>`;
const G=(inner,{x=0,y=0,s=1,r=0,op=1,ox=0,oy=0}={})=>`<g transform="translate(${x},${y}) rotate(${r}) scale(${s}) translate(${-ox},${-oy})" opacity="${op}">${inner}</g>`;
const spotlight=(x,y,r,op=1)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r}" fill="url(#spot)" opacity="${op}"/>`;
const shadow=(x,y,rx,op=.3)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx*0.16}" fill="#000" opacity="${op}"/>`;

/* ---------- Figur im flachen Stil (Ursprung = Füße) ---------- */
function person(o){
  const {x=540,y=1100,s=1,shirt=PAL.purple,pants='#2a2f57',skin=PAL.skin,hair='short',hairC='#e8c17a',mood='neutral',
    armL=12,armR=-12,look=0,blink=false,hat=null,bob=0,legs=true,item=null,itemR=null,cheeks=false,tilt=0}=o;
  const arm=(sx,ang,side)=>{
    return `<g transform="translate(${sx},-282) rotate(${ang})"><rect x="-15" y="-6" width="30" height="150" rx="15" fill="${shirt}"/><circle cx="0" cy="150" r="19" fill="${skin}"/></g>`;
  };
  let g=`<g transform="translate(${x},${y+bob}) scale(${s}) rotate(${tilt},0,-200)">`;
  g+=shadow(0,0,78,.28);
  if(legs) g+=`<rect x="-36" y="-150" width="30" height="146" rx="12" fill="${pants}"/><rect x="6" y="-150" width="30" height="146" rx="12" fill="${pants}"/>
    <ellipse cx="-22" cy="-4" rx="26" ry="11" fill="#14162c"/><ellipse cx="22" cy="-4" rx="26" ry="11" fill="#14162c"/>`;
  if(hair==='long') g+=`<path d="M-70,-390 Q-80,-250 -58,-230 L58,-230 Q80,-250 70,-390 Z" fill="${hairC}"/>`;
  g+=arm(-60,armL,1)+arm(60,armR,-1);
  g+=`<rect x="-64" y="-305" width="128" height="170" rx="44" fill="${shirt}"/><rect x="-64" y="-160" width="128" height="26" rx="10" fill="${pants}" opacity=".0"/>`;
  g+=`<rect x="-13" y="-322" width="26" height="24" fill="${PAL.skin2}"/>`;
  g+=`<circle cx="0" cy="-384" r="64" fill="${skin}"/>`;
  // Haare
  if(hair==='short') g+=`<path d="M-64,-384 Q-66,-458 0,-458 Q66,-458 64,-384 Q50,-420 0,-424 Q-40,-424 -64,-384Z" fill="${hairC}"/>`;
  if(hair==='long') g+=`<path d="M-66,-370 Q-70,-462 0,-460 Q70,-462 66,-370 Q60,-410 18,-420 Q-20,-400 -66,-370Z" fill="${hairC}"/>`;
  if(hair==='bun') g+=`<circle cx="0" cy="-462" r="28" fill="${hairC}"/><path d="M-64,-384 Q-66,-456 0,-456 Q66,-456 64,-384 Q46,-416 0,-420 Q-46,-416 -64,-384Z" fill="${hairC}"/>`;
  if(hair==='beanie') g+=`<path d="M-70,-392 Q-70,-470 0,-470 Q70,-470 70,-392 Z" fill="${hairC}"/><rect x="-72" y="-400" width="144" height="22" rx="10" fill="${hairC}" opacity=".85"/>`;
  if(hat==='chef') g+=`<rect x="-46" y="-470" width="92" height="44" fill="#f4f4f8"/><circle cx="-34" cy="-482" r="30" fill="#f4f4f8"/><circle cx="0" cy="-500" r="36" fill="#f4f4f8"/><circle cx="34" cy="-482" r="30" fill="#f4f4f8"/>`;
  if(hat==='fedora') g+=`<ellipse cx="0" cy="-430" rx="96" ry="16" fill="#3b2f25"/><path d="M-54,-432 Q-50,-490 0,-492 Q50,-490 54,-432Z" fill="#3b2f25"/><rect x="-54" y="-446" width="108" height="12" fill="#1e1712"/>`;
  // Gesicht
  const ex=look*8;
  if(blink) g+=`<path d="M${-34+ex},-384 q12,6 24,0 M${10+ex},-384 q12,6 24,0" stroke="#1b1b2b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else{
    const er=mood==='shock'?15:12, pr=mood==='shock'?5:7;
    g+=`<circle cx="${-22+ex*.4}" cy="-386" r="${er}" fill="#fff"/><circle cx="${22+ex*.4}" cy="-386" r="${er}" fill="#fff"/>
      <circle cx="${-22+ex}" cy="-385" r="${pr}" fill="#1b1b2b"/><circle cx="${22+ex}" cy="-385" r="${pr}" fill="#1b1b2b"/>`;
  }
  const brow={shock:'M-36,-412 q14,-10 28,0 M8,-412 q14,-10 28,0',angry:'M-36,-414 l28,9 M36,-414 l-28,9',sad:'M-36,-404 l26,-8 M36,-404 l-26,-8',think:'M-36,-410 q14,-6 28,0 M8,-416 l28,4'}[mood];
  if(brow) g+=`<path d="${brow}" stroke="#4a3426" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const mouth={neutral:'<path d="M-14,-350 h28" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round"/>',
    happy:'<path d="M-24,-356 q24,30 48,0 Z" fill="#7a2f3a"/><path d="M-16,-352 q16,8 32,0" fill="#fff" opacity=".9"/>',
    shock:'<ellipse cx="0" cy="-348" rx="13" ry="17" fill="#5a2430"/>',
    sad:'<path d="M-18,-344 q18,-14 36,0" stroke="#7a3b3b" stroke-width="5" fill="none" stroke-linecap="round"/>',
    angry:'<path d="M-18,-346 q18,-10 36,0" stroke="#7a3b3b" stroke-width="5" fill="none" stroke-linecap="round"/>',
    think:'<path d="M-6,-350 q12,-4 22,2" stroke="#7a3b3b" stroke-width="5" fill="none" stroke-linecap="round"/>'}[mood]||'';
  g+=mouth;
  if(cheeks||mood==='happy') g+=`<circle cx="-40" cy="-360" r="10" fill="#ff7b8a" opacity=".45"/><circle cx="40" cy="-360" r="10" fill="#ff7b8a" opacity=".45"/>`;
  if(item) g+=`<g transform="translate(${-60-Math.sin(armL*Math.PI/180)*150},${-282+Math.cos(armL*Math.PI/180)*150})">${item}</g>`;
  if(itemR) g+=`<g transform="translate(${60-Math.sin(armR*Math.PI/180)*150},${-282+Math.cos(armR*Math.PI/180)*150})">${itemR}</g>`;
  return g+'</g>';
}

/* Silhouette für Menschenmengen */
function figure(x,y,s=1,col='#3a4070',eye=null,o={}){
  let g=`<g transform="translate(${x},${y}) scale(${s})" opacity="${o.op??1}"><path d="M-62,0 Q-62,-92 0,-92 Q62,-92 62,0Z" fill="${col}"/><circle cx="0" cy="-128" r="38" fill="${col}"/>`;
  if(o.hat) g+=`<ellipse cx="0" cy="-158" rx="54" ry="9" fill="${o.hatC||'#2a2018'}"/><path d="M-32,-158 Q-30,-196 0,-196 Q30,-196 32,-158Z" fill="${o.hatC||'#2a2018'}"/>`;
  if(eye) g+=`<circle cx="-13" cy="-128" r="5" fill="${eye}" filter="url(#glowS)"/><circle cx="13" cy="-128" r="5" fill="${eye}" filter="url(#glowS)"/>`;
  return g+'</g>';
}

/* ---------- Objekte ---------- */
function phone(x,y,w,h,inner='',o={}){
  return `<g transform="translate(${x},${y}) rotate(${o.r||0})">
   <rect x="${-w/2-8}" y="${-h/2-8}" width="${w+16}" height="${h+16}" rx="54" fill="#1b1e3a" stroke="#30365f" stroke-width="4"/>
   <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="46" fill="url(#screen)"/>
   <rect x="-50" y="${-h/2+18}" width="100" height="22" rx="11" fill="#07081a"/>
   <g>${inner}</g></g>`;
}
function hand(x,y,s=1,col=PAL.purple){ // Hand + Ärmel von unten (hält ein Handy)
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-70" y="40" width="140" height="420" rx="40" fill="${col}"/>
   <ellipse cx="0" cy="20" rx="80" ry="95" fill="${PAL.skin}"/><ellipse cx="70" cy="-60" rx="34" ry="62" fill="${PAL.skin}" transform="rotate(-25,70,-60)"/></g>`;
}
function notif(x,y,w,title,body,col=PAL.red,op=1){
  return `<g transform="translate(${x},${y})" opacity="${op}"><rect x="${-w/2}" y="0" width="${w}" height="132" rx="18" fill="#232850"/>
   <rect x="${-w/2+18}" y="16" width="150" height="30" rx="6" fill="${col}"/>${T(-w/2+93,38,title,{size:17,font:'Mono',w:700,ls:1})}
   ${T(-w/2+190,38,'NEWS 24 · 07:02',{size:16,font:'Mono',w:500,fill:'#8d93bd',anchor:'start'})}
   ${T(-w/2+20,82,body[0],{size:27,w:900,anchor:'start'})}${T(-w/2+20,116,body[1]||'',{size:27,w:900,anchor:'start',fill:'#ff6f86'})}</g>`;
}
function globe(x,y,r,t,o={}){
  const rot=(t*30)%360;
  let m='';
  for(let i=0;i<6;i++){ const a=((i*30+rot)%180)-90, rx=Math.abs(Math.cos(a*Math.PI/180))*r; m+=`<ellipse cx="0" cy="0" rx="${rx}" ry="${r}" fill="none" stroke="#8fa3ff" stroke-opacity=".22" stroke-width="2"/>`; }
  for(let i=-2;i<=2;i++){ const yy=i*r/3, rx=Math.sqrt(r*r-yy*yy); m+=`<ellipse cx="0" cy="${yy}" rx="${rx}" ry="${rx*0.12}" fill="none" stroke="#8fa3ff" stroke-opacity=".18" stroke-width="2"/>`; }
  const sh=((t*24)%(2*r*2))-r*2; // Kontinente wandern
  const cont=[[-0.45,-0.35,.32,.22],[-0.2,0.2,.2,.32],[0.25,-0.25,.38,.24],[0.45,0.28,.2,.16],[-0.6,0.45,.18,.12]];
  const cs=cont.map(([cx,cy,rx,ry])=>{const xx=((cx*r+sh+r*3)%(r*4))-r*2;return `<ellipse cx="${xx}" cy="${cy*r}" rx="${rx*r}" ry="${ry*r}" fill="${o.land||'#4d63d8'}" opacity=".55"/>`}).join('');
  return `<g transform="translate(${x},${y})"><circle r="${r+40}" fill="#4c6bff" opacity=".10" filter="url(#blur8)"/>
   <clipPath id="gc"><circle r="${r}"/></clipPath><circle r="${r}" fill="#22307a"/><g clip-path="url(#gc)">${cs}${m}
   <circle cx="${o.night?r*0.35:r*2}" cy="0" r="${r*1.05}" fill="#050617" opacity="${o.night||0}"/></g>
   <circle r="${r}" fill="none" stroke="#9fb0ff" stroke-opacity=".35" stroke-width="3"/></g>`;
}
function shelf(x,y,w,h,fill=1,seed=3){
  const r=rng(seed), rows=4, cols=Math.floor(w/58), cols2=['#ff5d73','#ffd23f','#4ea8ff','#38f27e','#ff9b42','#b78bff','#f3f4fb'];
  let g=`<g transform="translate(${x},${y})"><rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="#22264a" stroke="#353b6e" stroke-width="4"/>`;
  const items=[];
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++) items.push([i,j,r(),cols2[Math.floor(r()*cols2.length)],0.6+r()*0.4]);
  items.forEach(([i,j,k,c,hh])=>{ if(k<fill){ const yy=(i+1)*h/rows-10, ph=(h/rows-26)*hh; g+=`<rect x="${14+j*58}" y="${yy-ph}" width="46" height="${ph}" rx="6" fill="${c}"/><rect x="${20+j*58}" y="${yy-ph+10}" width="34" height="10" rx="3" fill="#fff" opacity=".35"/>`; } });
  for(let i=1;i<=rows;i++) g+=`<rect x="0" y="${i*h/rows-10}" width="${w}" height="12" fill="#3a4180"/>`;
  return g+'</g>';
}
function register(x,y,disp,col=PAL.blue,o={}){
  return `<g transform="translate(${x},${y})"><rect x="-230" y="0" width="460" height="190" rx="22" fill="#2a2f5c"/>
   <rect x="-210" y="20" width="420" height="60" rx="10" fill="#151832"/>${[0,1,2,3,4,5].map(i=>`<rect x="${-190+i*64}" y="104" width="48" height="26" rx="6" fill="#3b4180"/>`).join('')}
   <rect x="-60" y="-150" width="200" height="130" rx="14" fill="#151832" stroke="${col}" stroke-width="5" ${o.glow?'filter="url(#glowS)"':''}/>
   ${T(40,-68,disp,{size:46,font:'Mono',w:700,fill:col})}<rect x="20" y="-20" width="40" height="22" fill="#2a2f5c"/></g>`;
}
function noodles(s=1){ return `<g transform="scale(${s})"><rect x="-55" y="-80" width="110" height="160" rx="12" fill="#ffd23f"/><rect x="-40" y="-40" width="80" height="70" rx="10" fill="#fff6d6"/>
  ${[0,1,2,3].map(i=>`<path d="M${-30+i*18},-30 q8,30 0,52" stroke="#e2a73a" stroke-width="6" fill="none"/>`).join('')}${T(0,-52,'NUDELN',{size:20,fill:'#7a4b00'})}</g>`; }
function toiletPaper(s=1){ return `<g transform="scale(${s})"><rect x="-55" y="-70" width="110" height="140" rx="10" fill="#f3f4fb"/><ellipse cx="0" cy="-70" rx="55" ry="18" fill="#ffffff"/><ellipse cx="0" cy="-70" rx="16" ry="6" fill="#b9bdd6"/><path d="M55,0 v90 h-40" fill="#f3f4fb" stroke="#d5d8ea" stroke-width="3"/></g>`; }
function bread(s=1){ return `<g transform="scale(${s})"><path d="M-90,30 Q-100,-60 0,-62 Q100,-60 90,30 Z" fill="#d08a3e"/><path d="M-90,30 h180 q0,20 -20,20 h-140 q-20,0 -20,-20Z" fill="#a8652a"/>${[-45,0,45].map(i=>`<path d="M${i-14},-30 l28,22" stroke="#f3c27a" stroke-width="7" stroke-linecap="round"/>`).join('')}</g>`; }
function cigPack(s=1,o={}){ return `<g transform="scale(${s})"><rect x="-70" y="-100" width="140" height="200" rx="10" fill="#f6f1e6"/><rect x="-70" y="-100" width="140" height="70" rx="10" fill="#d62f45"/>
  <rect x="-70" y="-40" width="140" height="10" fill="#d62f45"/>${[-38,-12,14,40].map((x,i)=>`<rect x="${x-10}" y="${-140+(i%2)*12}" width="20" height="50" rx="4" fill="#f3e2b8"/><rect x="${x-10}" y="${-140+(i%2)*12}" width="20" height="16" rx="4" fill="#d9a35a"/>`).join('')}
  <rect x="-70" y="-100" width="140" height="10" fill="#b1263a"/><circle cx="0" cy="40" r="30" fill="none" stroke="#d62f45" stroke-width="6"/>${T(0,52,'20',{size:30,fill:'#d62f45'})}</g>`; }
function coin(s=1,sym='€',flip=1){ return `<g transform="scale(${s*Math.max(0.06,Math.abs(flip))},${s})"><circle r="120" fill="url(#gold)"/><circle r="96" fill="none" stroke="#fff3b0" stroke-width="6" opacity=".7"/>${T(0,40,sym,{size:120,fill:'#9a5d00'})}</g>`; }
function banknote(s=1,o={}){ const c=o.grey?'#6c7090':'#4fb38a'; return `<g transform="scale(${s}) rotate(${o.r||0})"><rect x="-170" y="-85" width="340" height="170" rx="12" fill="${c}"/><rect x="-150" y="-65" width="300" height="130" rx="8" fill="none" stroke="#e8fff2" stroke-opacity=".5" stroke-width="4"/>
  <circle cx="-70" cy="0" r="44" fill="#e8fff2" opacity=".35"/>${T(80,24,'100',{size:64,fill:'#e8fff2'})}</g>`; }
function stamp(txt,col,s=1,r=-12){ return `<g transform="rotate(${r}) scale(${s})"><rect x="-200" y="-56" width="400" height="112" rx="12" fill="none" stroke="${col}" stroke-width="9"/>${T(0,24,txt,{size:66,fill:col,ls:4})}</g>`; }
function bus(x,y,o={}){ return `<g transform="translate(${x},${y})"><rect x="-200" y="-150" width="400" height="160" rx="26" fill="#ffd23f"/>${[0,1,2,3].map(i=>`<rect x="${-180+i*92}" y="-128" width="78" height="62" rx="8" fill="#21264c"/>`).join('')}
  <rect x="-200" y="-40" width="400" height="14" fill="#e0a920"/><circle cx="-120" cy="12" r="30" fill="#1b1d33"/><circle cx="120" cy="12" r="30" fill="#1b1d33"/>
  <rect x="-130" y="-200" width="260" height="42" rx="8" fill="#151832"/>${T(0,-170,o.sign||'AUSSER BETRIEB',{size:24,font:'Mono',w:700,fill:'#ff5a72'})}</g>`; }
function bakery(x,y,o={}){ return `<g transform="translate(${x},${y})"><rect x="-190" y="-230" width="380" height="240" rx="10" fill="#7a4f2c"/><path d="M-210,-230 h420 l-20,-50 h-380z" fill="#ff5d73"/>${[0,1,2,3,4].map(i=>`<rect x="${-190+i*76}" y="-282" width="38" height="52" fill="#fff" opacity=".85"/>`).join('')}
  <rect x="-160" y="-190" width="190" height="150" rx="6" fill="#2b2f58"/><rect x="60" y="-190" width="100" height="200" rx="6" fill="#4b2f1a"/>${o.closed?`<g transform="translate(-65,-115) rotate(-4)"><rect x="-80" y="-26" width="160" height="52" rx="6" fill="#fff"/>${T(0,10,'GESCHLOSSEN',{size:22,fill:'#d62f45'})}</g>`:''}
  ${T(0,-238,'BÄCKEREI',{size:30,fill:'#fff'})}</g>`; }
function trash(x,y,s=1,over=0){ let g=`<g transform="translate(${x},${y}) scale(${s})"><rect x="-70" y="-180" width="140" height="180" rx="12" fill="#4a5078"/><rect x="-82" y="-196" width="164" height="24" rx="8" fill="#5c6390"/>`;
  const r=rng(11); for(let i=0;i<Math.floor(over*7);i++){ g+=`<ellipse cx="${-90+r()*180}" cy="${-205-r()*70}" rx="${36+r()*18}" ry="${28+r()*10}" fill="${['#2c2f45','#3b3f5c','#1f2236'][i%3]}"/>`; }
  return g+'</g>'; }
function house(x,y,w,h,lit=0,seed=5){ const r=rng(seed); let g=`<g transform="translate(${x},${y})"><rect x="${-w/2}" y="${-h}" width="${w}" height="${h}" fill="#23284e"/>`;
  const cols=Math.floor(w/60), rows=Math.floor(h/70); for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){ const on=r()<lit; g+=`<rect x="${-w/2+16+j*60}" y="${-h+18+i*70}" width="34" height="44" rx="4" fill="${on?'#ffd98a':'#151935'}" ${on?'filter="url(#glowS)"':''}/>`; }
  return g+'</g>'; }
function arrowCurve(x1,y1,x2,y2,bend,col,k=1,w=8){ const mx=(x1+x2)/2, my=(y1+y2)/2-bend; const len=900; return `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len*(1-k)}" filter="url(#glowS)"/>`; }
function bigX(x,y,s,col=PAL.red,k=1){ const L=200; return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#glowS)"><path d="M-80,-80 L80,80" stroke="${col}" stroke-width="26" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L*(1-clamp(k*2,0,1))}"/><path d="M80,-80 L-80,80" stroke="${col}" stroke-width="26" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L*(1-clamp(k*2-1,0,1))}"/></g>`; }
function confetti(t,n=60,seed=9,t0=0){ const r=rng(seed); let g=''; const cs=[PAL.yellow,PAL.pink,PAL.green,PAL.blue,'#fff'];
  for(let i=0;i<n;i++){ const x0=r()*1080, vy=300+r()*400, vx=(r()-.5)*300, rot=r()*720, c=cs[i%5], dt=t-t0; if(dt<0) continue;
    const x=540+(x0-540)*Math.min(1,dt*3)+vx*dt, y=700-600*Math.exp(-dt*3)*r()+vy*dt*dt*0.8-200*(1-Math.min(1,dt*2)); g+=`<rect x="${x}" y="${y}" width="16" height="26" fill="${c}" transform="rotate(${rot*dt},${x},${y})" opacity="${clamp(2.5-dt,0,1)}"/>`; }
  return g; }
function ring(x,y,r,col,op,w=4){ return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`; }
function clockFace(x,y,r,h,m,col=PAL.yellow){ const ha=(h%12+m/60)*30, ma=m*6; return `<g transform="translate(${x},${y})"><circle r="${r}" fill="#26294a" stroke="#c9a64a" stroke-width="8"/>${[...Array(12)].map((_,i)=>`<rect x="-3" y="${-r+14}" width="6" height="18" fill="#8d93bd" transform="rotate(${i*30})"/>`).join('')}
  <rect x="-5" y="${-r*0.5}" width="10" height="${r*0.5}" rx="5" fill="#fff" transform="rotate(${ha})"/><rect x="-3.5" y="${-r*0.78}" width="7" height="${r*0.78}" rx="3.5" fill="${col}" transform="rotate(${ma})"/><circle r="10" fill="${col}"/></g>`; }
function bubble(x,y,w,h,inner,op=1){ return `<g transform="translate(${x},${y})" opacity="${op}"><rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${h/2}" fill="#f3f4fb"/><circle cx="${-w/4}" cy="${h/2+26}" r="18" fill="#f3f4fb"/><circle cx="${-w/4-24}" cy="${h/2+62}" r="10" fill="#f3f4fb"/>${inner}</g>`; }
function heartLine(x,y,w,t,col=PAL.red,bpm=135){ let d=`M${-w/2},0`; const n=60; for(let i=0;i<=n;i++){ const xx=-w/2+i*w/n, ph=((i/n)*3+t*bpm/60)%1; const yy=ph>0.45&&ph<0.5?-50:ph>0.5&&ph<0.55?40:0; d+=` L${xx},${yy}`; }
  return `<g transform="translate(${x},${y})"><rect x="${-w/2-20}" y="-80" width="${w+40}" height="160" rx="14" fill="#1a0d1c" stroke="${col}" stroke-width="4"/>${T(-w/2,-50,'PULS',{size:18,font:'Mono',w:500,fill:col,anchor:'start'})}${T(w/2,-50,bpm,{size:18,font:'Mono',w:500,fill:col,anchor:'end'})}<path d="${d}" stroke="${col}" stroke-width="5" fill="none" filter="url(#glowS)"/></g>`; }
