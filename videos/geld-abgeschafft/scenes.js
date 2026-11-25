/* Szenen für "Was wäre, wenn morgen das Geld abgeschafft wird?"
   Jede Szene: (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const doc=(label,s=1,o={})=>`<g transform="scale(${s}) rotate(${o.r||0})"><rect x="-90" y="-115" width="180" height="230" rx="12" fill="${o.fill||'#f3f4fb'}"/>${T(0,-70,label,{size:o.size||26,fill:o.col||'#22264a'})}
  ${[0,1,2,3,4].map(i=>`<rect x="-62" y="${-40+i*28}" width="${i%2?100:124}" height="10" rx="5" fill="#b9bdd6"/>`).join('')}<path d="M-50,95 q20,-24 40,0 t40,0" stroke="#4e63d6" stroke-width="5" fill="none"/></g>`;
const badge=(sym,col,s=1,op=1)=>`<g transform="scale(${s})" opacity="${op}"><circle r="84" fill="${col}" opacity=".18"/><circle r="70" fill="#141836" stroke="${col}" stroke-width="7" filter="url(#glowS)"/>${T(0,34,sym,{size:96,fill:col})}</g>`;
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5" ${o.glow?'filter="url(#glowS)"':''}/>${inner}</g>`;

const SCENES={
bed(t,d,S,h){
  const wake=h.wt('morgen'), k=h.p(t,0.2,d), awake=t>wake;
  let s=`<defs><linearGradient id="dawn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a62" stop-opacity="${0.15+0.6*k}"/><stop offset="1" stop-color="#2a2f6e" stop-opacity="1"/></linearGradient></defs>`;
  s+=`<rect x="150" y="420" width="330" height="380" rx="10" fill="url(#dawn)"/><rect x="150" y="420" width="330" height="380" rx="10" fill="none" stroke="${PAL.purpleD}" stroke-width="22"/>
      <rect x="306" y="420" width="18" height="380" fill="${PAL.purpleD}"/><rect x="150" y="600" width="330" height="18" fill="${PAL.purpleD}"/><rect x="118" y="400" width="40" height="440" rx="10" fill="${PAL.purple}"/><rect x="472" y="400" width="40" height="440" rx="10" fill="${PAL.purple}"/>`;
  s+=`<rect x="110" y="880" width="60" height="300" rx="14" fill="${PAL.wood}"/><rect x="120" y="1010" width="820" height="90" rx="20" fill="#d9dbf0"/>`;
  // Kopf auf Kissen
  s+=`<ellipse cx="270" cy="1000" rx="110" ry="40" fill="#f3f4fb"/>`;
  s+=G(`<circle r="60" fill="${PAL.skin}"/><path d="M-60,0 Q-64,-74 0,-72 Q60,-72 62,-6 Q40,-40 0,-44 Q-34,-42 -60,0Z" fill="#e8c17a"/>`+
     (awake?`<circle cx="-20" cy="2" r="13" fill="#fff"/><circle cx="20" cy="2" r="13" fill="#fff"/><circle cx="-18" cy="3" r="6" fill="#1b1b2b"/><circle cx="22" cy="3" r="6" fill="#1b1b2b"/><ellipse cx="0" cy="34" rx="9" ry="11" fill="#5a2430"/>`
            :`<path d="M-32,4 q12,8 24,0 M8,4 q12,8 24,0" stroke="#1b1b2b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-8,32 h16" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round"/>`),{x:280,y:950,r:-18+(awake?10*E.outBack(h.p(t,wake,wake+0.3)):0)});
  s+=`<rect x="330" y="960" width="620" height="150" rx="40" fill="#5867d6"/><rect x="330" y="960" width="620" height="34" rx="17" fill="#6c7ae0"/>`;
  // Nachttisch + Handy
  const buzz=(t%0.9)<0.45?Math.sin(t*80)*5:0;
  s+=`<rect x="800" y="880" width="200" height="60" rx="8" fill="${PAL.wood}"/><rect x="820" y="935" width="160" height="200" fill="${PAL.woodD}"/>`;
  s+=G(`<rect x="-62" y="-14" width="124" height="28" rx="8" fill="#1b1e3a"/><rect x="-54" y="-9" width="108" height="18" rx="5" fill="${PAL.blue}" opacity="${0.5+0.5*Math.abs(Math.sin(t*6))}" filter="url(#glowS)"/>`,{x:900+buzz,y:866});
  for(let i=0;i<3;i++){ const r=((t*1.4+i/3)%1); s+=ring(900,866,40+r*110,PAL.blue,(1-r)*0.6,4); }
  if(!awake) for(let i=0;i<3;i++){ const z=((t*0.7+i/3)%1); s+=T(360+z*60,880-z*160,'z',{size:40+i*10,fill:'#c7cdf6',op:1-z}); }
  return s;
},
news(t,d,S,h){
  const ab=h.wt('abgeschafft'), red=h.p(t,ab-0.05,ab+0.15);
  let inner=T(0,-330,'NACHRICHTEN',{size:30,fill:'#fff'})+T(-200,-376,'07:02',{size:20,font:'Mono',w:500,fill:'#8d93bd',anchor:'start'})+T(200,-376,'▮▮▮ 12%',{size:18,font:'Mono',w:500,fill:'#8d93bd',anchor:'end'});
  for(let i=0;i<4;i++){ const ti=0.15+i*0.32, k=E.outBack(h.p(t,ti,ti+0.3)); if(k<=0) continue;
    inner+=G(notif(0,0,420,'EILMELDUNG',['GELD WELTWEIT','ABGESCHAFFT – AB SOFORT']),{x:(1-k)*500,y:-290+i*150,op:clamp(k,0,1)}); }
  if(red>0) inner+=`<rect x="-230" y="-420" width="460" height="840" rx="46" fill="${PAL.red}" opacity="${0.25*red}"/>`;
  let s=hand(380,1150,1.1)+phone(540,780,460,840,inner)+`<ellipse cx="300" cy="1020" rx="40" ry="68" fill="${PAL.skin}" transform="rotate(18,300,1020)"/>`;
  return s;
},
globe(t,d,S,h){
  const night=h.p(t,h.wt('über'),h.wt('über')+0.7), nichts=h.wt('nichts'), dead=h.p(t,nichts,nichts+0.35);
  let s=spotlight(540,760,460,.6)+globe(540,770,300,t,{night:night*0.85});
  const syms=[['€',PAL.blue,300,500,h.wt('euro')],['$',PAL.green,790,520,h.wt('dollar')],['¥',PAL.yellow,230,960,nichts-0.45],['£',PAL.pink,860,990,nichts-0.3]];
  syms.forEach(([c,col,x,y,ti])=>{ const k=E.outBack(h.p(t,ti,ti+0.3)); if(k<=0) return;
    const fall=dead*dead; s+=G(badge(c,dead>0.5?'#6b6f8f':col,1)+(dead>0?bigX(0,0,0.55,PAL.red,dead):''),{x,y:y+fall*60,s:k*(1-0.25*dead),op:1-0.5*fall}); });
  const ww=h.wt('weltweit'); if(t>ww) for(let i=0;i<3;i++){ const r=((t-ww)*0.9+i/3)%1; s+=ring(540,770,300+r*260,PAL.yellow,(1-r)*0.5,5); }
  return s;
},
bank(t,d,S,h){
  const n=h.wt('null'), k=E.out(h.p(t,n-0.15,n+0.4)), v=2347.18*(1-k), bad=t>n-0.1;
  const val=fmtVal(v,'eur'), col=bad?PAL.red:'#fff';
  let inner=T(0,-280,'MEINE BANK',{size:30,fill:'#fff'})+
    `<rect x="-200" y="-230" width="400" height="220" rx="22" fill="${bad?'#5a1426':'#3b47b8'}"/>`+T(-170,-180,'KONTOSTAND',{size:20,font:'Mono',w:700,fill:'#d6dafc',anchor:'start'})+
    T(0,-90,val,{size:62,fill:col,filter:bad?'glowS':null})+T(-170,-40,'DE12 3456 7890 ●●●● 18',{size:16,font:'Mono',w:500,fill:'#b8bfef',anchor:'start'});
  ['Gehalt  +2.150,00','Miete   -780,00','Handy   -29,99','Netflix -13,99'].forEach((r,i)=>inner+=`<rect x="-200" y="${20+i*80}" width="400" height="64" rx="12" fill="#1f2450" opacity="${bad?0.4:1}"/>`+T(-180,62+i*80,r,{size:22,font:'Mono',w:500,fill:'#c9cdf0',anchor:'start',op:bad?0.4:1}));
  if(bad) inner+=G(`<circle r="46" fill="${PAL.red}"/>`+T(0,22,'!',{size:64}),{x:170,y:-220,s:E.outBack(h.p(t,n,n+0.3))});
  return spotlight(540,800,420,.5)+phone(540,840,460,760,inner);
},
debt(t,d,S,h){
  const w=h.wt('weg'), k=E.outBack(h.p(t,0,0.4)), st=h.p(t,w-0.05,w+0.22), sch=h.wt('schulden');
  let paper=`<rect x="-250" y="-330" width="500" height="660" rx="16" fill="${st>0?'#c9ccdf':'#f3f4fb'}"/>`+T(0,-250,'KREDITVERTRAG',{size:40,fill:'#22264a'})+
    [0,1,2,3,4,5].map(i=>`<rect x="-200" y="${-200+i*40}" width="${i%2?320:400}" height="14" rx="7" fill="#b9bdd6"/>`).join('')+
    T(0,110,'-12.480,00 €',{size:66,fill:st>0?'#8a8fb0':PAL.red,extra:`opacity="${t>sch-0.1?1:0.35}"`})+`<path d="M-160,250 q40,-50 80,0 t80,0 t80,0" stroke="#4e63d6" stroke-width="6" fill="none"/>`;
  if(st>0) paper+=`<line x1="-220" y1="92" x2="220" y2="92" stroke="${PAL.green}" stroke-width="10" opacity="${st}"/>`;
  let s=spotlight(540,780,460,.5)+G(paper,{x:540,y:790+(1-k)*600,r:-3});
  if(st>0) s+=G(stamp('GELÖSCHT',PAL.green,1,-14),{x:540,y:700,s:lerp(2.6,1,E.outBack(st)),op:clamp(st*3,0,1)});
  return s;
},
happy(t,d,S,h){
  const g=h.wt('genial'), jump=t>g?Math.abs(Math.sin((t-g)*7))*-60*Math.exp(-(t-g)*0.8):0, up=t>g?E.outBack(h.p(t,g,g+0.25)):0;
  let s=spotlight(540,900,460,.6);
  const fly=(label,ti,dx,r)=>{ const k=h.p(t,ti,ti+1.1); if(k<=0) return ''; return G(doc(label,1,{size:label.length>8?20:26}),{x:540+dx*E.out(k),y:900-720*E.inOut(k),r:r*k,s:1-0.4*k,op:1-k*k}); };
  s+=fly('KREDIT',h.wt('kredit'),-330,-40)+fly('HANDY-',h.wt('handyvertrag'),330,40)+fly('MIETE?',h.wt('alles'),-120,-25)+fly('RATEN',h.wt('alles')+0.15,150,30);
  s+=person({x:540,y:1180,s:1.25,mood:t>g?'happy':'think',hair:'long',hairC:'#e8c17a',armL:lerp(14,150,up),armR:lerp(-14,-150,up),bob:jump,look:t>g?0:1});
  if(t>g) s+=confetti(t,70,9,g);
  return s;
},
market(t,d,S,h){
  const ka=h.wt('kasse'), fe=h.wt('fehler'), err=t>fe-0.05, blink=err&&Math.floor((t-fe)*4)%2===0;
  let s=shelf(70,380,440,520,1,3)+shelf(570,380,440,520,1,4);
  s+=`<rect x="0" y="380" width="1080" height="520" fill="#0b0d20" opacity=".35"/>`;
  s+=G(`<rect x="-120" y="-34" width="240" height="68" rx="12" fill="#13361f" stroke="${PAL.green}" stroke-width="4"/>`+T(0,14,'OFFEN',{size:36,fill:PAL.green,font:'Mono',w:700}),{x:540,y:330});
  const disp=err?(blink?'FEHLER':''):(t>ka?'0,00':'----');
  s+=register(540,1000,disp,err?PAL.red:PAL.blue,{glow:true});
  if(err){ const a=t*8; s+=`<g transform="translate(580,812)"><rect x="-26" y="-10" width="52" height="20" fill="#3b4180"/><circle cx="0" cy="-30" r="26" fill="${PAL.red}" filter="url(#glow)"/><path d="M0,-30 L${Math.cos(a)*400},${-30+Math.sin(a)*160} L${Math.cos(a+0.3)*400},${-30+Math.sin(a+0.3)*160}Z" fill="${PAL.red}" opacity=".18"/></g>`; }
  return s;
},
rush(t,d,S,h){
  const le=h.wt('leere'), fill=1-0.97*E.inOut(h.p(t,0.3,le));
  let s=shelf(70,380,440,520,fill,3)+shelf(570,380,440,520,fill,4);
  const r=rng(21);
  for(let i=0;i<16;i++){
    const sp=260+r()*200, ph=r()*1600, row=i%3, yy=1010+row*70, x=((t*sp+ph)%1500)-200, bob=-Math.abs(Math.sin(t*14+i))*14;
    const carry=r()<0.6, col=['#3a4070','#454c82','#2e3361'][row], k=1-h.p(t,le,le+0.8);
    s+=G(figure(0,0,0.9+row*0.12,col,null)+(carry?`<rect x="-40" y="-230" width="80" height="60" rx="8" fill="${['#ffd23f','#ff5d73','#4ea8ff','#38f27e'][i%4]}"/>`:''),{x,y:yy+bob,op:k});
  }
  if(t>le) for(let i=0;i<14;i++){ const rr=rng(40+i), a=h.p(t,le,le+1.5); s+=`<circle cx="${200+rr()*680}" cy="${560+rr()*300-a*80}" r="${6+rr()*10}" fill="#9aa0c0" opacity="${(1-a)*0.5}"/>`; }
  return s;
},
cashier(t,d,S,h){
  const wa=h.wt('warum'), ar=h.wt('arbeiten');
  let s=spotlight(400,850,420,.5);
  s+=person({x:380,y:1220,s:1.15,shirt:'#2fae74',hair:'bun',hairC:'#ff7aa8',mood:t>wa?'think':'neutral',look:t>wa?1:0,blink:(t%3)>2.85});
  s+=`<rect x="80" y="1000" width="900" height="240" rx="18" fill="#2a2f5c"/><rect x="80" y="1000" width="900" height="26" rx="10" fill="#3b4180"/>`;
  s+=G(register(0,0,'0,00',PAL.blue),{x:760,y:880,s:0.7});
  const bk=E.outBack(h.p(t,wa-0.1,wa+0.25));
  if(bk>0){ const inner=t<ar?T(0,58,'?',{size:150,fill:PAL.pink}):(clockFace(-80,0,64,9,(t*240)%60)+T(20,22,'=',{size:70,fill:'#22264a'})+T(110,24,'0 €',{size:62,fill:PAL.red}));
    s+=bubble(700,560,380,250,inner,clamp(bk,0,1)); }
  return s;
},
city(t,d,S,h){
  const items=[['busfahrer',200,bus(0,40,{sign:'AUSSER BETRIEB'}),0.55],['bäcker',540,bakery(0,110,{closed:true}),0.6],['müllabfuhr',880,trash(0,110,1,1),0.85]];
  const ha=h.wt('hause'), dim=h.p(t,ha-0.2,ha+0.3);
  let s='';
  items.forEach(([w,x,art,sc])=>{ const k=E.outBack(h.p(t,h.wt(w)-0.05,h.wt(w)+0.3)); if(k<=0) return;
    s+=panel(x,560,300,300,G(art,{s:sc}),{s:k,op:1-0.55*dim}); });
  const lit=0.1+0.85*E.out(h.p(t,ha-0.2,ha+0.8));
  s+=house(170,1180,240,330,lit,5)+house(420,1180,220,420,lit,6)+house(660,1180,240,360,lit,7)+house(900,1180,220,300,lit,8);
  s+=`<rect x="0" y="1180" width="1080" height="80" fill="#14172f"/>`;
  return s;
},
swap(t,d,S,h){
  const n=h.wt('nudeln'), k=E.inOut(h.p(t,n,n+1.0));
  const L=[410,950], R=[670,950];
  let s=spotlight(540,900,460,.5);
  s+=person({x:230,y:1200,s:0.95,hair:'long',hairC:'#e8c17a',armR:-60,mood:'happy',look:1});
  s+=person({x:850,y:1200,s:0.95,shirt:'#2fae74',hair:'short',hairC:'#5a3a24',armL:60,mood:'neutral',look:-1});
  if(t>n-0.1){ s+=arrowCurve(L[0],L[1]-140,R[0],R[1]-140,300,PAL.yellow,E.out(h.p(t,n-0.1,n+0.4)),7); s+=arrowCurve(R[0],R[1]-40,L[0],L[1]-40,-160,PAL.blue,E.out(h.p(t,n,n+0.5)),7); }
  const arc=(a,b,bend,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)-Math.sin(k*Math.PI)*bend];
  const [nx,ny]=arc([L[0],L[1]-70],[R[0],R[1]-70],330,k), [tx,ty]=arc([R[0],R[1]-70],[L[0],L[1]-70],-120,k);
  s+=G(noodles(0.8),{x:nx,y:ny,r:k*360})+G(toiletPaper(0.75),{x:tx,y:ty,r:-k*360});
  return s;
},
baker(t,d,S,h){
  const wi=h.wt('will'), ke=h.wt('kein'), shake=t>wi&&t<wi+0.9?Math.sin((t-wi)*22):0;
  let s=spotlight(720,800,420,.5);
  s+=person({x:820,y:1150,s:1.05,shirt:'#f3f4fb',hat:'chef',hair:'none',mood:t>wi?'angry':'neutral',look:-1+shake*0.8,tilt:shake*4});
  s+=`<rect x="440" y="930" width="600" height="300" rx="14" fill="${PAL.wood}"/><rect x="440" y="930" width="600" height="26" rx="8" fill="#8f6038"/>`;
  const gone=E.in(h.p(t,ke+0.25,ke+0.9));
  s+=G(bread(1.0),{x:610,y:885,op:1-gone,s:1-0.3*gone});
  if(t>ke-0.05) s+=bigX(610,870,0.9,PAL.red,h.p(t,ke-0.05,ke+0.3));
  s+=person({x:250,y:1200,s:1,hair:'long',hairC:'#e8c17a',armR:-70,mood:t>ke?'sad':'happy',look:1,itemR:G(noodles(0.7),{y:-40})});
  return s;
},
cigs(t,d,S,h){
  const pl=h.wt('plötzlich'), zi=h.wt('zigaretten'), nr=h.wt('nichtraucher');
  let s='';
  const kp=E.outBack(h.p(t,zi-0.05,zi+0.35));
  if(kp>0){ for(let i=0;i<12;i++){ const a=i*30+t*20; s+=`<path d="M540,720 L${540+Math.cos(a*Math.PI/180)*700},${720+Math.sin(a*Math.PI/180)*700} L${540+Math.cos((a+8)*Math.PI/180)*700},${720+Math.sin((a+8)*Math.PI/180)*700}Z" fill="${PAL.yellow}" opacity="${0.07*kp}"/>`; }
    s+=`<circle cx="540" cy="720" r="${240*kp}" fill="${PAL.yellow}" opacity=".12" filter="url(#blur8)"/>`+G(cigPack(1.45),{x:540,y:730,s:kp,r:Math.sin(t*2)*5}); }
  else s+=G(T(0,0,'?',{size:340,fill:PAL.pink,filter:'glow'}),{x:540,y:840,s:E.outBack(h.p(t,0.05,0.35))*(1+0.06*Math.sin(t*6)),op:0.75});
  const r=rng(5);
  const pos=[[110,1120],[250,1160],[400,1190],[680,1190],[830,1160],[970,1120],[60,960],[1020,960],[180,1010],[900,1010]];
  pos.forEach(([x,y],i)=>{ const ti=0.1+i*0.12, k=E.outBack(h.p(t,ti,ti+0.3)); if(k<=0) return;
    s+=G(figure(0,0,1,'#353b6e',t>zi?PAL.yellow:'#9aa0c0'),{x,y,s:k*(0.85+r()*0.3)}); });
  const kn=E.outBack(h.p(t,nr-0.05,nr+0.3));
  if(kn>0) s+=G(figure(0,0,1.15,'#4a3f7a',PAL.yellow)+`<g transform="translate(70,-60)"><circle r="40" fill="#fff"/><circle r="34" fill="none" stroke="${PAL.red}" stroke-width="8"/><rect x="-22" y="-6" width="44" height="12" fill="#22264a"/><line x1="-24" y1="24" x2="24" y2="-24" stroke="${PAL.red}" stroke-width="8"/></g>`,{x:540,y:1180,s:kn});
  return s;
},
network(t,d,S,h){
  const mo=h.wt('morgen'), je=h.wt('jemand'), green=h.p(t,je-0.1,je+0.4);
  const N=8, R=330, cx=540, cy=760, pts=[...Array(N)].map((_,i)=>[cx+Math.cos(i/N*2*Math.PI-Math.PI/2)*R, cy+Math.sin(i/N*2*Math.PI-Math.PI/2)*R]);
  let s=spotlight(540,760,460,.5), lines='';
  const col=green>0?PAL.green:'#4e63d6';
  pts.forEach((a,i)=>{ [1,3].forEach(o=>{ const b=pts[(i+o)%N], k=h.p(t,0.05*i,0.05*i+0.4); lines+=`<line x1="${a[0]}" y1="${a[1]}" x2="${lerp(a[0],b[0],k)}" y2="${lerp(a[1],b[1],k)}" stroke="${col}" stroke-width="4" opacity="${0.45+0.4*green}"/>`; }); });
  s+=lines;
  pts.forEach(([x,y],i)=>{ s+=`<circle cx="${x}" cy="${y}" r="62" fill="#191d40" stroke="${col}" stroke-width="5"/>`+figure(x,y+52,0.55,i%2?'#7a62b5':'#2fae74',null); });
  // Zigarettenschachtel wandert von Person zu Person
  const sp=t*2.2, i0=Math.floor(sp)%N, i1=(i0+3)%N, f=E.inOut(sp%1), px=lerp(pts[i0][0],pts[i1][0],f), py=lerp(pts[i0][1],pts[i1][1],f);
  s+=G(cigPack(0.42),{x:px,y:py,r:f*30-15})+`<circle cx="${px}" cy="${py}" r="60" fill="${PAL.yellow}" opacity=".15" filter="url(#blur8)"/>`;
  const km=E.outBack(h.p(t,mo-0.05,mo+0.3));
  if(km>0) s+=G(`<rect x="-90" y="-80" width="180" height="170" rx="18" fill="#f3f4fb"/><rect x="-90" y="-80" width="180" height="50" rx="18" fill="${PAL.red}"/><rect x="-90" y="-50" width="180" height="20" fill="${PAL.red}"/>`+T(0,-42,'MORGEN',{size:26,fill:'#fff'})+T(0,60,'✓',{size:90,fill:PAL.green}),{x:540,y:760,s:km});
  return s;
},
history(t,d,S,h){
  const wi=h.wt('wirklich');
  let s='';
  // Ruinen-Skyline
  let sky='M0,960 ', x=0; const r=rng(45); while(x<1080){ const w=60+r()*90, hh=180+r()*260; sky+=`L${x},${960-hh} L${x+w*0.3},${960-hh-r()*60} L${x+w*0.6},${960-hh+20} L${x+w},${960-hh*0.7} `; x+=w; } sky+='L1080,960 Z';
  s+=`<path d="${sky}" fill="#2a2016"/><rect x="0" y="960" width="1080" height="300" fill="#1d160f"/>`;
  s+=G(`<rect x="-200" y="-50" width="400" height="100" rx="8" fill="#6b4a2a"/>`+T(0,18,'SCHWARZMARKT',{size:44,fill:'#f3e2b8',font:'Mono',w:700}),{x:540,y:430,r:-3});
  const rr=rng(8);
  for(let i=0;i<7;i++){ const xx=120+i*140+rr()*30, yy=1130+(i%2)*60; s+=G(figure(0,0,1,'#3a2e22',null,{hat:i%2===0,hatC:'#1e1712'}),{x:xx,y:yy+Math.sin(t*3+i)*4,s:0.95}); }
  const k=h.p(t,0.6,2.2);
  s+=G(cigPack(0.5),{x:lerp(300,760,E.inOut(k)),y:930-Math.sin(k*Math.PI)*120,r:k*20});
  s+=G(bread(0.55),{x:lerp(760,300,E.inOut(k)),y:960-Math.sin(k*Math.PI)*60});
  s+=`<rect x="30" y="340" width="1020" height="850" fill="none" stroke="#efe3c8" stroke-width="22" opacity=".9"/>`;
  s+=G(T(0,0,'1945',{size:120,fill:'#f3e2b8',font:'Mono',w:700}),{x:540,y:640,op:0.9,s:E.outBack(h.p(t,0.1,0.5))});
  const ks=h.p(t,wi-0.05,wi+0.22);
  if(ks>0) s+=G(stamp('WAHRE GESCHICHTE',PAL.red,0.85,-10),{x:540,y:800,s:lerp(2.4,1,E.outBack(ks)),op:clamp(ks*3,0,1)});
  return s;
},
coin(t,d,S,h){
  const ge=h.wt('geld'), er=h.wt('erfunden'), f=h.p(t,ge-0.2,ge+0.5), flip=Math.cos(f*Math.PI);
  let s=spotlight(540,760,480,.7);
  if(f<0.5) s+=G(cigPack(1.5),{x:540,y:760,s:1}).replace('scale(1.5)',`scale(${1.5*Math.max(0.05,Math.abs(flip))},1.5)`);
  else { const pulse=1+0.06*h.pulse(t,'erfunden',0.5); s+=`<circle cx="540" cy="760" r="${260}" fill="${PAL.yellow}" opacity=".12" filter="url(#blur8)"/>`+G(coin(1.6,'1',flip),{x:540,y:760,s:pulse}); }
  if(t>er){ const a=h.p(t,er,er+1.2); for(let i=0;i<16;i++){ const an=i/16*Math.PI*2, rr=200+a*300; s+=`<circle cx="${540+Math.cos(an)*rr}" cy="${760+Math.sin(an)*rr}" r="${10*(1-a)+2}" fill="${i%2?PAL.yellow:'#fff'}" opacity="${1-a}"/>`; }
    s+=ring(540,760,200+a*360,PAL.green,(1-a)*0.7,6); }
  return s;
},
promise(t,d,S,h){
  const pa=h.wt('papier'), ve=h.wt('versprechen'), cr=h.p(t,pa,pa+0.5), out=h.p(t,ve-0.6,ve-0.1);
  let s=spotlight(540,760,480,.6);
  if(out<1) s+=G(banknote(1.5,{grey:cr>0.2,r:cr*-14}),{x:540,y:740+out*300,s:1-0.25*cr,op:1-out}).replace('scale(1.5)',`scale(1.5,${1.5*(1-0.45*cr)})`);
  const k=E.outBack(h.p(t,ve-0.1,ve+0.35));
  if(k>0){
    s+=`<circle cx="540" cy="760" r="${300*k}" fill="${PAL.yellow}" opacity=".14" filter="url(#blur8)"/>`+ring(540,760,250*k,PAL.yellow,0.5,4);
    const sl=(1-k)*300;
    s+=`<rect x="${-60-sl}" y="700" width="540" height="120" rx="50" fill="${PAL.purple}"/><rect x="${600+sl}" y="700" width="540" height="120" rx="50" fill="#2fae74"/>`;
    s+=`<g transform="translate(540,760) scale(${k})"><ellipse cx="-40" cy="0" rx="110" ry="70" fill="${PAL.skin}"/><ellipse cx="40" cy="-6" rx="110" ry="66" fill="${PAL.skin2}"/>${[-30,0,30].map(y=>`<path d="M-10,${y} q50,-8 90,6" stroke="#c98f68" stroke-width="5" fill="none"/>`).join('')}<ellipse cx="-30" cy="-60" rx="40" ry="22" fill="${PAL.skin}"/></g>`;
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+t, rr=320; s+=T(540+Math.cos(a)*rr,780+Math.sin(a)*rr*0.6,'✦',{size:34,fill:PAL.yellow,op:0.6*k}); }
  }
  return s;
},
question(t,d,S,h){
  const we=h.wt('wer'), be=h.wt('bestimmt'), ne=h.wt('neue'), beat=1+0.08*Math.max(0,Math.sin(t*2.25*Math.PI*2))**8;
  let s='';
  const kq=E.outBack(h.p(t,we-0.05,we+0.3));
  if(kq>0) s+=G(T(0,140,'?',{size:430,fill:PAL.red,filter:'glow'}),{x:540,y:640,s:kq*beat});
  const icons=[['STAAT?',230,`<path d="M-110,0 h220 v-20 h-220z M-100,-20 v-120 h20 v120 M-50,-20 v-120 h20 v120 M10,-20 v-120 h20 v120 M60,-20 v-120 h20 v120 M-120,-140 h240 l-120,-60z" fill="#c9cdf0"/>`],
    ['BANKEN?',540,`<rect x="-60" y="-220" width="120" height="220" fill="#c9cdf0"/>${[0,1,2,3,4].map(i=>`<rect x="-40" y="${-200+i*40}" width="80" height="20" fill="#3a1028"/>`).join('')}`],
    ['WIR?',850,[-50,0,50].map((x,i)=>figure(x,0,0.55+(i===1?0.1:0),'#c9cdf0',null)).join('')]];
  icons.forEach(([lab,x,art],i)=>{ const ti=be+i*0.3, k=E.outBack(h.p(t,ti,ti+0.3)); if(k<=0) return;
    s+=G(art+T(0,70,lab,{size:36,font:'Mono',w:700,fill:PAL.yellow}),{x,y:1030,s:k}); });
  const kc=h.p(t,0.05,0.4); s+=spotlight(540,700,380,0.6)+G(coin(0.5,'?',Math.cos(t*2.5)),{x:540,y:400,s:E.outBack(kc)*(1+0.15*h.pulse(t,'neue',0.5))});
  return s;
},
};
