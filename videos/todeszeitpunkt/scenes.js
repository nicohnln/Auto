/* Szenen für "Was wäre, wenn jeder Mensch seinen eigenen Todeszeitpunkt sehen könnte?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const FRIEND={hair:'short',hairC:'#e8c17a',shirt:'#2fae74'};
const tag=(txt,col)=>`<rect x="-170" y="-36" width="340" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:32,font:'Mono',w:700,fill:col});
// Countdown-Anzeige über dem Kopf (tickt mit t)
const pad=n=>String(n).padStart(2,'0');
function cd(x,y,years,days,t,col=PAL.red,s=1,o={}){
  const sec=Math.max(0,86399-Math.floor(t*(o.fast||1))%86400), hh=Math.floor(sec/3600), mm=Math.floor(sec/60)%60, ss=sec%60;
  const txt=o.text||(years>0?`${years} J · ${days} T`:`${days} TAGE`);
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-150" y="-46" width="300" height="92" rx="14" fill="#0e0f22" stroke="${col}" stroke-width="4" filter="url(#glowS)"/>
    ${T(0,-6,txt,{size:30,font:'Mono',w:700,fill:col})}${T(0,30,`${pad(hh)}:${pad(mm)}:${pad(ss)}`,{size:22,font:'Mono',w:500,fill:'#c9cdf0'})}</g>`; }
const youHead=(x,y,s,mood='neutral',r=0)=>G(`<circle r="60" fill="${PAL.skin}"/><path d="M-60,-4 Q-64,-74 0,-72 Q60,-72 62,-6 Q40,-40 0,-44 Q-34,-42 -60,-4Z" fill="${ME.hairC}"/>`+
  (mood==='sleep'?`<path d="M-32,4 q12,8 24,0 M8,4 q12,8 24,0" stroke="#1b1b2b" stroke-width="5" fill="none" stroke-linecap="round"/>`:
   `<circle cx="-20" cy="2" r="13" fill="#fff"/><circle cx="20" cy="2" r="13" fill="#fff"/><circle cx="-18" cy="3" r="6" fill="#1b1b2b"/><circle cx="22" cy="3" r="6" fill="#1b1b2b"/>`)+
  (mood==='shock'?`<ellipse cx="0" cy="34" rx="9" ry="11" fill="#5a2430"/>`:`<path d="M-10,32 h20" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round"/>`),{x,y,s,r});
// Leben in Wochen: n Kästchen, filled = Anzahl gefüllt, lived = Anzahl "schon gelebt" (pink)
function weeksGrid(cx,y0,n,filled,lived=0,t=0,o={}){
  const cols=o.cols||78, sz=o.sz||10.5, g=o.gap||2.4, w=cols*(sz+g); let s='';
  for(let i=0;i<n;i++){ if(i>=filled && !o.showEmpty) continue; const c=i%cols, r=Math.floor(i/cols), x=cx-w/2+c*(sz+g), y=y0+r*(sz+g);
    const col=i<lived?PAL.pink:(i<filled?'#ffd23f':'#262b55'); s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sz}" height="${sz}" rx="2" fill="${col}" opacity="${i<filled?0.9:1}"/>`; }
  if(o.today!==undefined){ const i=o.today, c=i%cols, r=Math.floor(i/cols), x=cx-w/2+c*(sz+g), y=y0+r*(sz+g), b=0.5+0.5*Math.sin(t*8);
    s+=`<rect x="${x-4}" y="${y-4}" width="${sz+8}" height="${sz+8}" rx="3" fill="none" stroke="#fff" stroke-width="3" opacity="${b}"/>`; }
  return s; }

const SCENES={
hook(t,d,S,h){
  const awake=t>h.wt('morgen'), co=h.wt('countdown'), kc=E.outBack(h.p(t,co-0.15,co+0.2));
  let s=`<rect x="150" y="420" width="330" height="380" rx="10" fill="#3a3f8a"/><rect x="150" y="620" width="330" height="180" fill="#ff9a62" opacity=".25"/>`;
  s+=`<rect x="150" y="420" width="330" height="380" rx="10" fill="none" stroke="${PAL.purpleD}" stroke-width="22"/><rect x="306" y="420" width="18" height="380" fill="${PAL.purpleD}"/><rect x="150" y="600" width="330" height="18" fill="${PAL.purpleD}"/>`;
  s+=`<rect x="110" y="880" width="60" height="300" rx="14" fill="${PAL.wood}"/><rect x="120" y="1010" width="820" height="90" rx="20" fill="#d9dbf0"/><ellipse cx="270" cy="1000" rx="110" ry="40" fill="#f3f4fb"/>`;
  s+=youHead(280,950,1,awake?(t>co?'shock':'neutral'):'sleep',-18+(awake?12*E.outBack(h.p(t,h.wt('morgen'),h.wt('morgen')+0.3)):0));
  s+=`<rect x="330" y="960" width="620" height="150" rx="40" fill="#5867d6"/><rect x="330" y="960" width="620" height="34" rx="17" fill="#6c7ae0"/>`;
  if(kc>0) s+=G(cd(0,0,52,118,t*3),{x:360,y:800,s:kc});
  return s;
},
everyone(t,d,S,h){
  let s=skyline(1080,0.25,6,{min:240,var:300})+`<rect x="0" y="1080" width="1080" height="200" fill="#1a1d38"/>`;
  const ppl=[[150,'#ff7aa8',61,22],[360,'#4ea8ff',47,301],[560,PAL.purple,52,118],[760,'#ffd23f',38,9],[950,'#38f27e',70,190]];
  ppl.forEach(([x,c,y,dd],i)=>{ const k=E.outBack(h.p(t,0.1+i*0.12,0.4+i*0.12));
    s+=figure(x,1230,0.95,c,null); if(k>0) s+=G(cd(0,0,y,dd,t*5+i*1000,x===560?PAL.red:'#ff8fa3',0.62),{x,y:1030,s:k}); });
  return s;
},
big(t,d,S,h){
  const ri=h.wt('riesige');
  let s=spotlight(540,850,460,.5);
  s+=person({x:540,y:1220,s:1,...ME,mood:t>h.wt('ehrlich')?'happy':'neutral'});
  s+=G(cd(0,0,52,118,t*3,PAL.green),{x:540,y:690,s:1+0.25*E.outBack(h.p(t,ri-0.1,ri+0.3))});
  [['fünfzig',230,520,'50 J'],['sechzig',850,560,'60 J']].forEach(([w,x,y,txt])=>{ const k=E.outBack(h.p(t,h.wt(w)-0.1,h.wt(w)+0.2)); if(k>0) s+=G(tag(txt,PAL.green),{x,y,s:k*0.7}); });
  return s;
},
friend(t,d,S,h){
  const dr=h.wt('drei'), shock=t>dr;
  let s=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity=".2"/>`+spotlight(760,850,380,.5);
  s+=person({x:300,y:1220,s:0.95,...ME,mood:shock?'shock':'happy',look:1});
  s+=person({x:780,y:1220,s:0.95,...FRIEND,mood:'happy',look:-1});
  s+=G(cd(0,0,48,40,t*3,'#ff8fa3'),{x:300,y:700,s:0.7,op:0.6});
  const k=E.outBack(h.p(t,dr-0.15,dr+0.2));
  if(k>0) s+=G(cd(0,0,0,21,t*40,PAL.red,1,{text:'3 WOCHEN',fast:1}),{x:780,y:690,s:k*1.1});
  if(shock) for(let i=0;i<3;i++){ const p=((t-dr)*0.8+i/3)%1; s+=ring(780,690,170+p*200,PAL.red,(1-p)*0.4,4); }
  return s;
},
change(t,d,S,h){
  const items=[['kündigen',230,`<rect x="-80" y="-100" width="160" height="200" rx="10" fill="#f3f4fb"/>`+T(0,-60,'KÜNDIGUNG',{size:22,fill:'#22264a'})+[0,1,2].map(i=>`<rect x="-56" y="${-30+i*26}" width="${i%2?80:112}" height="10" rx="5" fill="#b9bdd6"/>`).join(''),'JOB'],
    ['reisen',540,globe(0,0,95,t),'WELTREISE'],['eltern',850,`<rect x="-60" y="-110" width="120" height="210" rx="20" fill="#1b1e3a" stroke="#c9cdf0" stroke-width="6"/>`+T(0,-30,'MAMA',{size:30,fill:PAL.pink})+`<circle cy="40" r="30" fill="${PAL.green}"/>`+T(0,52,'☎',{size:34,fill:'#fff'}),'ANRUF']];
  let s='';
  items.forEach(([w,x,art,lab])=>{ const tw=h.wt(w), k=E.outBack(h.p(t,tw-0.2,tw+0.1)); if(k<=0) return;
    let inner=art+T(0,150,lab,{size:24,font:'Mono',w:700,fill:'#8d93bd'});
    if(w==='kündigen'){ const ks=h.p(t,tw,tw+0.2); if(ks>0) inner+=G(stamp('RAUS!',PAL.red,0.5,-14),{y:20,s:lerp(2,1,E.outBack(ks))}); }
    if(w==='reisen') inner+=G(`<path d="M-40,0 l80,-10 l10,10 l-80,10z M-10,-4 l-20,-30 h14 l26,30 M-10,4 l-20,30 h14 l26,-30" fill="#f3f4fb"/>`,{x:Math.cos(t*2)*110,y:Math.sin(t*2)*110,r:t*115+90});
    s+=panel(x,620,290,360,inner,{s:k}); });
  s+=person({x:540,y:1230,s:0.62,...ME,mood:'happy',armL:150,armR:-150,bob:-Math.abs(Math.sin(t*5))*16});
  return s;
},
brave(t,d,S,h){
  const un=h.wt('unbesiegbar'), up=E.outBack(h.p(t,un-0.2,un+0.2));
  let s=`<circle cx="540" cy="760" r="${260+30*up}" fill="${PAL.green}" opacity="${0.06+0.08*up}" filter="url(#blur8)"/>`;
  s+=`<path d="M470,${900} Q540,${1150} 400,${1230} L680,${1230} Q540,${1150} 610,${900}Z" fill="${PAL.red}" opacity=".9" transform="rotate(${Math.sin(t*4)*4},540,900)"/>`;
  s+=person({x:540,y:1230,s:1.05,shirt:'#4ea8ff',hair:'short',hairC:'#2b2b3a',mood:'happy',armL:lerp(20,150,up),armR:lerp(-20,-60,up)});
  s+=G(cd(0,0,71,3,t*3,PAL.green,1,{text:'STIRBT MIT 90'}),{x:540,y:620,s:0.85});
  if(up>0.5) s+=G(`<path d="M0,-60 L52,-38 V10 Q52,50 0,70 Q-52,50 -52,10 V-38Z" fill="${PAL.green}" filter="url(#glowS)"/>`+T(0,22,'∞',{size:60,fill:'#0e2a1a'}),{x:800,y:800,s:E.outBack(h.p(t,un,un+0.3))});
  return s;
},
twist(t,d,S,h){
  const za=h.wt('zahl'), sc=h.wt('schon');
  let s=G(T(0,80,'?',{size:300,fill:PAL.yellow,filter:'glow'}),{x:540,y:720,s:E.outBack(h.p(t,0.05,0.35))*(1+0.05*Math.sin(t*5)),op:1-h.p(t,sc-0.1,sc+0.2)});
  const k=E.outBack(h.p(t,sc-0.1,sc+0.25)); if(k>0) s+=G(cd(0,0,0,0,t*20,PAL.yellow,1.3,{text:'? WOCHEN'}),{x:540,y:740,s:k});
  return s;
},
weeks(t,d,S,h){
  const f=Math.round(4230*E.inOut(h.p(t,0.3,d-0.5)));
  let s=weeksGrid(540,430,4230,f,0,t);
  s+=T(540,1190,'1 KÄSTCHEN = 1 WOCHE',{size:24,font:'Mono',w:700,fill:'#8d93bd'});
  return s;
},
nurse(t,d,S,h){
  const be=h.wt('bereuen');
  let s=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity=".2"/><rect x="760" y="430" width="200" height="260" rx="10" fill="#141a40" stroke="${PAL.purpleD}" stroke-width="14"/>`+moon(860,520,30);
  s+=`<rect x="140" y="1000" width="560" height="60" rx="14" fill="#d9dbf0"/><rect x="140" y="940" width="40" height="260" rx="10" fill="#8a8fb0"/><rect x="660" y="980" width="40" height="220" rx="10" fill="#8a8fb0"/><ellipse cx="240" cy="990" rx="80" ry="28" fill="#f3f4fb"/><rect x="280" y="970" width="400" height="50" rx="20" fill="#9fb0e8"/>`;
  s+=person({x:820,y:1220,s:0.9,shirt:'#7fd1c7',hair:'bun',hairC:'#3b2a20',mood:'think',armL:40,armR:-50,look:-1,itemR:`<rect x="-30" y="-40" width="60" height="80" rx="6" fill="#f3f4fb"/><rect x="-20" y="-24" width="40" height="6" fill="#b9bdd6"/><rect x="-20" y="-10" width="40" height="6" fill="#b9bdd6"/>`});
  s+=heartLine(420,720,360,t,'#7fd1c7',58).replace('stroke="#7fd1c7" stroke-width="4"','stroke="#7fd1c7" stroke-width="3"');
  if(t>be-0.2) s+=G(T(0,0,'„Ich wünschte …“',{size:46,fill:'#fff',w:800}),{x:420,y:560,op:E.out(h.p(t,be-0.2,be+0.4))});
  return s;
},
regret(t,d,S,h){
  const ge=h.wt('gearbeitet'), ei=h.wt('eigenes');
  let s='';
  const k1=E.outBack(h.p(t,0.05,0.35)), x1=h.p(t,ge,ge+0.35);
  s+=panel(540,560,800,190,T(0,18,'ZU WENIG GEARBEITET',{size:50,fill:x1>0?'#6b6f8f':'#fff'})+(x1>0?`<line x1="-340" y1="0" x2="${-340+680*x1}" y2="0" stroke="${PAL.red}" stroke-width="12" stroke-linecap="round"/>`:''),{s:k1,op:1-0.4*x1});
  const k2=E.outBack(h.p(t,ei-0.3,ei+0.05));
  if(k2>0) s+=`<circle cx="540" cy="900" r="${300*k2}" fill="${PAL.pink}" opacity=".1" filter="url(#blur8)"/>`+panel(540,900,860,230,T(0,-14,'NICHT MEIN EIGENES',{size:52,fill:PAL.pink})+T(0,52,'LEBEN GELEBT',{size:52,fill:PAL.pink}),{s:k2,col:PAL.pink});
  return s;
},
end(t,d,S,h){
  const lived=1350, ve=h.wt('verschenkt'), k=E.out(h.p(t,0.1,0.9));
  let s=weeksGrid(540,430,4230,4230,Math.round(lived*k),t,{showEmpty:true,today:Math.round(lived*k)});
  if(t>ve) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.25*h.p(t,ve,ve+0.6)}"/>`;
  s+=T(540,1190,'PINK = SCHON GELEBT',{size:24,font:'Mono',w:700,fill:PAL.pink});
  return s;
},
};
