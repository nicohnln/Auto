/* Szenen für "Was wäre, wenn Roboter alle Arbeitsplätze übernehmen?"
   (t = Sekunden seit Segmentstart, d = Segmentdauer, S = Segment, h = Helfer) -> SVG-String */
const panel=(x,y,w,hh,inner,o={})=>`<g transform="translate(${x},${y}) scale(${o.s??1})" opacity="${o.op??1}"><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="24" fill="#191d40" stroke="${o.col||'#353b6e'}" stroke-width="5"/>${inner}</g>`;
const ME={hair:'short',hairC:'#6b4a2f',shirt:PAL.purple};
const tag=(txt,col)=>`<rect x="-150" y="-36" width="300" height="72" rx="16" fill="#141836" stroke="${col}" stroke-width="5"/>`+T(0,14,txt,{size:32,font:'Mono',w:700,fill:col});

const SCENES={
hook(t,d,S,h){
  const ro=h.wt('roboter'), turn=h.p(t,ro-0.1,ro+0.3), typing=Math.sin(t*30)>0;
  let s=`<rect x="0" y="380" width="1080" height="560" fill="#1a1e44" opacity=".6"/>`+[0,1,2].map(i=>`<rect x="${120+i*300}" y="440" width="220" height="150" rx="10" fill="#26306a" opacity=".5"/>`).join('');
  s+=desk(640,960,560);
  s+=robot({x:660,y:1180,s:0.85,look:-turn,armL:lerp(40,30,typing?1:0),armR:lerp(-40,-30,typing?0:1),eye:turn>0.5?PAL.red:PAL.blue,legs:false});
  s+=`<rect x="380" y="990" width="560" height="30" rx="8" fill="${PAL.wood}"/>`;
  const walk=E.out(h.p(t,0,1.0));
  s+=person({x:lerp(-60,210,walk),y:1220,s:0.9,...ME,mood:t>ro?'shock':'neutral',look:1,armR:-50,itemR:`<rect x="-22" y="-30" width="44" height="54" rx="8" fill="#f3f4fb"/><rect x="-22" y="-30" width="44" height="14" fill="${PAL.wood}"/>`});
  return s;
},
robot(t,d,S,h){
  let s=spotlight(540,820,460,.6)+robot({x:540,y:1200,s:1.25,eye:PAL.blue,bob:Math.sin(t*2)*4});
  [['pause','PAUSE: 0 MIN',PAL.blue,250,520],['krank','KRANK: NIE',PAL.pink,830,620],['nichts','0,02 € / STD',PAL.yellow,270,760]].forEach(([w,txt,col,x,y])=>{
    const k=E.outBack(h.p(t,h.wt(w)-0.1,h.wt(w)+0.2)); if(k>0) s+=G(tag(txt,col),{x,y,s:k*0.95}); });
  return s;
},
all(t,d,S,h){
  let s='';
  const items=[['lastwagenfahrer',200,truck(0,90,0.48,{driver:robotIcon(150,-110,0.7,PAL.blue)}),'LKW'],['kassierer',540,register(0,70,'0,00',PAL.blue)+robotIcon(-140,-60,0.8,PAL.blue),'KASSE'],
    ['übersetzer',880,T(-60,-20,'Hello',{size:44,fill:'#c9cdf0'})+T(60,50,'Hallo',{size:44,fill:PAL.green})+arrowCurve(-40,0,40,30,40,PAL.green,1,5),'ÜBERSETZEN']];
  const al=h.wt('alle'), dim=h.p(t,al-0.1,al+0.3);
  items.forEach(([w,x,art,lab])=>{ const k=E.outBack(h.p(t,h.wt(w)-0.05,h.wt(w)+0.25)); if(k<=0) return;
    s+=panel(x,520,300,260,G(art,{s:x===540?0.5:1})+T(0,110,lab,{size:22,font:'Mono',w:700,fill:'#8d93bd'}),{s:k,op:1-0.4*dim}); });
  // Wand aus Menschen, die zu Robotern werden
  const flip=h.p(t,al-0.15,al+1.2), r=rng(3);
  for(let i=0;i<24;i++){ const c=i%6, row=Math.floor(i/6), x=150+c*156, y=800+row*110, th=r();
    s+=th<flip?robotIcon(x,y,0.75,PAL.red):figure(x,y,0.55,['#7a62b5','#2fae74','#ff7aa8','#4ea8ff'][i%4],null); }
  return s;
},
dream(t,d,S,h){
  const tr=h.wt('traum'), we=h.wt('wecker'), up=E.outBack(h.p(t,tr-0.2,tr+0.2));
  let s=`<circle cx="780" cy="560" r="110" fill="${PAL.yellow}" filter="url(#glow)" opacity=".9"/>`;
  for(let i=0;i<10;i++){ const a=i*36+t*15; s+=`<rect x="776" y="400" width="8" height="40" rx="4" fill="${PAL.yellow}" opacity=".6" transform="rotate(${a},780,560)"/>`; }
  s+=person({x:420,y:1200,s:1.1,...ME,mood:'happy',armL:lerp(14,160,up),armR:lerp(-14,-160,up),bob:-Math.abs(Math.sin(t*3))*10*up});
  const kc=E.outBack(h.p(t,we-0.3,we)); if(kc>0){ const fly=h.p(t,we+0.3,we+1.2);
    s+=G(alarmClock(0,0,0.9,t,1)+bigX(0,0,1,PAL.red,h.p(t,we,we+0.3)),{x:800+fly*300,y:930-fly*500,s:kc,r:fly*120,op:1-fly}); }
  return s;
},
salary(t,d,S,h){
  const ge=h.wt('gehalt'), z=clamp((t-ge+0.15)/0.55,0,1);
  let s=spotlight(540,760,460,.5);
  const v=fmtVal(2450*(1-E.out(z)),'eur');
  s+=G(`<rect x="-260" y="-320" width="520" height="640" rx="16" fill="#f3f4fb"/>`+T(0,-240,'GEHALTSABRECHNUNG',{size:34,fill:'#22264a'})+
    [0,1,2,3].map(i=>`<rect x="-200" y="${-190+i*44}" width="${i%2?280:400}" height="14" rx="7" fill="#b9bdd6"/>`).join('')+
    T(-200,60,'AUSZAHLUNG',{size:24,font:'Mono',w:700,fill:'#8d93bd',anchor:'start'})+T(0,150,v,{size:84,fill:z>0.5?PAL.red:'#22264a'}),{x:540,y:780,r:-2,s:E.outBack(h.p(t,0,0.35))});
  if(z>0.6) s+=G(stamp('0 €',PAL.red,1,-12),{x:560,y:640,s:lerp(2.2,1,E.outBack(h.p(t,ge+0.1,ge+0.35)))});
  return s;
},
buy(t,d,S,h){
  const we=h.wt('wer'), r=rng(8);
  let s=`<rect x="60" y="960" width="960" height="40" rx="10" fill="#353b6e"/>`+[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${100+i*125}" cy="980" r="16" fill="#5c6390"/>`).join('');
  s+=robot({x:200,y:960,s:0.6,armR:-70+Math.sin(t*8)*15,legs:false})+robot({x:880,y:960,s:0.6,armL:70+Math.sin(t*8+1)*15,legs:false});
  const n=Math.floor(t*4); for(let i=0;i<Math.min(n,22);i++){ const c=i%8, row=Math.floor(i/8); s+=box(330+c*60-row*20+(row%2)*30, 905-row*90-(i>=16?0:0), 0.55,['#c98f4e','#b5793c','#d9a35a'][i%3]); }
  const mv=(t*120)%960; s+=box(60+mv,915,0.6);
  s+=G(`<rect x="-200" y="-60" width="400" height="120" rx="14" fill="#2a0d18" stroke="${PAL.red}" stroke-width="5"/>`+T(0,20,'KUNDEN: 0',{size:48,font:'Mono',w:700,fill:PAL.red}),{x:540,y:460,s:E.outBack(h.p(t,0.2,0.5))});
  const kq=E.outBack(h.p(t,we-0.05,we+0.3)); if(kq>0) s+=G(T(0,80,'?',{size:260,fill:PAL.yellow,filter:'glow'}),{x:540,y:640,s:kq});
  return s;
},
ubi(t,d,S,h){
  const tr=h.wt('trotzdem'), gr=h.wt('grundeinkommen');
  let s=spotlight(540,820,460,.5);
  s+=robot({x:300,y:1180,s:0.95,armR:-75,eye:PAL.green,smile:true});
  s+=person({x:800,y:1200,s:0.95,...ME,mood:t>tr?'happy':'neutral',armL:60,look:-1});
  if(t>tr-0.2) for(let i=0;i<6;i++){ const p=((t-tr)*0.9+i/6)%1; const x=lerp(470,640,p), y=860-Math.sin(p*Math.PI)*160; s+=G(coin(0.22,'€',Math.cos(t*6+i)),{x,y}); }
  const kg=E.outBack(h.p(t,gr-0.05,gr+0.3)); if(kg>0) s+=G(`<rect x="-260" y="-50" width="520" height="100" rx="20" fill="#13361f" stroke="${PAL.green}" stroke-width="5" filter="url(#glowS)"/>`+T(0,16,'GRUNDEINKOMMEN',{size:46,fill:PAL.green}),{x:540,y:480,s:kg});
  return s;
},
study(t,d,S,h){
  const ec=h.wt('echt'), kd=E.outBack(h.p(t,0.05,0.35));
  let s=G(`<rect x="-230" y="-150" width="460" height="300" rx="16" fill="#f3f4fb"/><rect x="-230" y="-150" width="460" height="16" fill="#111"/><rect x="-230" y="-134" width="460" height="16" fill="#dd0000"/><rect x="-230" y="-118" width="460" height="16" fill="#ffce00"/>`+
    T(0,-50,'PILOTPROJEKT',{size:38,fill:'#22264a'})+T(0,0,'GRUNDEINKOMMEN',{size:38,fill:'#4e63d6'})+[0,1].map(i=>`<rect x="-170" y="${40+i*34}" width="${i?240:340}" height="12" rx="6" fill="#b9bdd6"/>`).join(''),{x:540,y:560,s:kd,r:-2});
  const ks=h.p(t,ec-0.05,ec+0.2); if(ks>0) s+=G(stamp('ECHT',PAL.green,0.7,-14),{x:700,y:640,s:lerp(2.2,1,E.outBack(ks)),op:clamp(ks*3,0,1)});
  // 36 Monate: Kalender-Kacheln füllen sich
  const m=Math.floor(36*E.inOut(h.p(t,0.4,d-0.4)));
  for(let i=0;i<36;i++){ const c=i%12, row=Math.floor(i/12), x=150+c*71, y=860+row*80, on=i<m;
    s+=`<rect x="${x-28}" y="${y-28}" width="56" height="56" rx="10" fill="${on?'#13361f':'#1c2044'}" stroke="${on?PAL.green:'#353b6e'}" stroke-width="3"/>`+(on?T(x,y+11,'€',{size:30,fill:PAL.green}):''); }
  s+=T(540,1135,'36 MONATE',{size:26,font:'Mono',w:700,fill:'#8d93bd'});
  return s;
},
result(t,d,S,h){
  const ni=h.wt('nicht'), zu=h.wt('zufriedener');
  let s='';
  const bar=(x,label,a,b,col,k)=>{ const H1=a*300, H2=lerp(a,b,k)*300; return `<g transform="translate(${x},1060)">`+
    `<rect x="-120" y="${-H1}" width="100" height="${H1}" rx="10" fill="#5c6390"/><rect x="20" y="${-H2}" width="100" height="${H2}" rx="10" fill="${col}" ${k>0.9?'filter="url(#glowS)"':''}/>`+
    T(-70,40,'VORHER',{size:18,font:'Mono',w:700,fill:'#8d93bd'})+T(70,40,'NACHHER',{size:18,font:'Mono',w:700,fill:'#8d93bd'})+T(0,90,label,{size:30,font:'Mono',w:700,fill:'#fff'})+'</g>'; };
  s+=G(bar(0,'ARBEIT',0.8,0.8,PAL.blue,h.p(t,ni-0.2,ni+0.4)),{x:290,op:E.out(h.p(t,0,0.3))});
  s+=G(bar(0,'ZUFRIEDENHEIT',0.5,0.95,PAL.green,E.outBack(h.p(t,zu-0.2,zu+0.5))),{x:790,op:E.out(h.p(t,0.15,0.45))});
  if(t>ni) s+=G(T(0,0,'=',{size:120,fill:PAL.blue}),{x:290,y:620,s:E.outBack(h.p(t,ni,ni+0.3))});
  if(t>zu) s+=G(`<circle r="70" fill="${PAL.yellow}"/><circle cx="-24" cy="-16" r="9" fill="#22264a"/><circle cx="24" cy="-16" r="9" fill="#22264a"/><path d="M-36,14 q36,40 72,0" stroke="#22264a" stroke-width="9" fill="none" stroke-linecap="round"/>`,{x:790,y:560,s:E.outBack(h.p(t,zu,zu+0.35))});
  return s;
},
whisper(t,d,S,h){
  const br=h.wt('braucht'), k=h.p(t,0,d);
  let s=`<rect x="140" y="420" width="260" height="300" rx="10" fill="#141a40"/><rect x="140" y="420" width="260" height="300" rx="10" fill="none" stroke="${PAL.purpleD}" stroke-width="16"/>`+moon(270,520,36);
  s+=`<rect x="120" y="1010" width="840" height="90" rx="20" fill="#3b4180"/><rect x="760" y="900" width="200" height="130" rx="16" fill="#4b55a8"/>`;
  s+=`<circle cx="520" cy="900" r="${200+20*Math.sin(t*1.5)}" fill="${PAL.blue}" opacity=".08" filter="url(#blur8)"/>`;
  s+=person({x:520,y:1200,s:0.95,...ME,mood:t>br?'sad':'think',armL:30,armR:-30,look:0,blink:(t%3)>2.8});
  s+=G(clockFace(0,0,60,3,12,PAL.blue),{x:820,y:560,op:0.8});
  if(t>br) s+=`<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="${0.3*h.p(t,br,br+1)}"/>`;
  return s;
},
end(t,d,S,h){
  const pr=h.wt('problem'), flash=h.pulse(t,'problem',0.5);
  let s='';
  for(let row=0;row<3;row++) for(let i=0;i<7;i++){ const x=90+i*150+(row%2)*70, y=780+row*170, sc=0.5+row*0.18;
    s+=robotIcon(x,y,sc*1.4,t>pr-0.1?PAL.red:'#5c6390'); }
  s+=G(robot({x:0,y:0,s:1,eye:PAL.red,legs:false,body:'#9aa0c0',dark:'#6c7090'}),{x:540,y:1220,s:1+0.04*flash});
  if(flash>0) s+=`<rect x="0" y="0" width="1080" height="1920" fill="${PAL.red}" opacity="${0.15*flash}"/>`;
  return s;
},
};
