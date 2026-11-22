// Appended after the game <script> in a JS VM. Not loaded by the live student game.
// Simulator replaces UI actions, not actual survival or battle-state computations.
let simQueue=[],simAccuracy=1,simMode='balanced',simError='',simSteps=0,simEnd=null,simActions={},simDays=[],simLastDay=0;
const simRealChange=change;
log=()=>{};render=()=>{};vignette=()=>{};sfx=()=>{};award=()=>{};checkAch=()=>{};renderRanks=()=>{};
gameOver=why=>{S.dead=true;simEnd={why,day:S.day,hp:S.hp,mo:S.mo,food:S.food,sup:S.sup,def:S.def,correct:S.correct,total:S.total}};
peaceEnding=()=>{S.dead=true;simEnd={why:'peace',day:S.day,hp:S.hp,mo:S.mo,food:S.food,sup:S.sup,def:S.def,correct:S.correct,total:S.total}};
puzzle=(kind,title,done,ctx='note')=>{
 let rv=null;
 if((ctx==='memory'||ctx==='rollcall')&&!S.forceIdx){
  rv=reviewDue();
  if(rv){const alt=reviewAlt(rv.kind,rv.idx),fresh=!S.used[alt.kind].has(alt.i);kind=fresh?alt.kind:rv.kind;S.forceIdx={kind,i:fresh?alt.i:rv.idx};}
 }
 S.quizRecap=false;const idx=draw(kind,ctx),recap=!!S.quizRecap;
 if(idx<0){simQueue.push(()=>done(true,null));return;}
 const actual=S.lastDrawKind;S.total++;
 const hit=Math.random()<simAccuracy;
 if(hit){S.correct++;S.streak++;S.maxStreak=Math.max(S.maxStreak,S.streak);if(!recap)simRealChange({kn:1});}
 else{S.streak=0;S.missed.push({q:'simulation',a:'simulation'});if(!rv)scheduleReview(actual,idx);}
 if(rv){S.review=S.review.filter(x=>x!==rv);if(!hit){rv.due=S.day+7;S.review.push(rv);}}
 simQueue.push(()=>done(hit,idx));
};
dfHeadlessAsk=cb=>{const d=dfAskData(),ok=Math.random()<simAccuracy;dfAnswer(d,ok);cb(ok)};
dfOpen=(P,done)=>{
 const place={units:dfDefault(P.units),traps:[]};
 for(let i=0;i<P.traps;i++)place.traps.push(150+i*40);
 P.ask=dfHeadlessAsk;
 simQueue.push(()=>{
  let r;
  if(P.auto)r=dfHeadless(P,place);
  else{
   const st=dfCreate(P,place);let next=0,usedNades=0,usedFires=0;
   while(!st.done){
    dfStep(st,.1);
    const b=dfBoss(st);
    if(b&&st.t>=next){next=st.t+(next?6:3);st.bq=(st.bq||0)+1;P.ask(ok=>{if(ok){st.br=(st.br||0)+1;dfBossHit(st)}else b.spd*=1.15;});}
    const enemies=st.z.filter(z=>z.hp>0&&!z.boss),near=enemies.filter(z=>z.x<230);
    if(st.t>5&&enemies.length>=5&&near.length>=3&&usedNades<Math.min(2,P.nades||0)){
      dfThrow(st,'nade',near[Math.floor(near.length/2)].x);usedNades++;
    }
    if(st.t>8&&near.length>=6&&st.supLeft>=8&&usedFires<1){dfThrow(st,'fire',near[Math.floor(near.length/2)].x);usedFires++;}
    const z=st.units.find(u=>u.id==='zofia');
    if(z&&st.supLeft>=4&&st.wall<st.max*.6&&st.repairAttempts<2)z.repair=true;
   }
   r=dfResult(st);
  }
  done(r);
 });
};
cont=fn=>{if(typeof fn==='function')simQueue.push(fn)};
choices=opts=>{
 const av=opts.filter(x=>!x.disabled);
 if(!av.length){simError='No available option on day '+S.day;return;}
 const get=p=>av.find(x=>x.label?.startsWith(p)),has=p=>opts.some(x=>x.label?.startsWith(p));
 let c=null;
 if(has('🔦 탐색 나가기')){
  if(simLastDay!==S.day){simLastDay=S.day;simDays.push({day:S.day,hp:S.hp,mo:S.mo,food:S.food,sup:S.sup,def:S.def});}
  const target=simMode==='fortress'?Math.min(64,24+S.day*.48):simMode==='scavenge'?Math.min(45,17+S.day*.3):Math.min(58,20+S.day*.44);
  const knowledgeReady=S.knUsedDay!==S.day &&
    ((S.kn>=5&&S.hp<72)||(S.kn>=6&&S.mo<53)||(S.kn>=5&&S.def<38&&S.nextAttack>0));
  if(knowledgeReady)c=get('📜 지식 활용');
  if(!c){
   const foodMin=simMode==='scavenge'?13:10,supMin=simMode==='scavenge'?14:10;
   c=(S.hp<50&&get('🛏️ 휴식'))||(S.mo<43&&get('🤝 동료 돌보기'))||
     (S.food<foodMin&&get('🔦 탐색'))||(S.sup<supMin&&get('🔦 탐색'))||
     (S.def<target&&S.sup>=4&&get('🛠️ 방어 공사'))||
     (S.hp<80&&get('🛏️ 휴식'))||get('📓 헤이스팅스')||
     (S.def<65&&get('🛠️ 방어 공사'))||get('🤝 동료 돌보기')||get('🔦 탐색')||get('🔭 종탑 정찰');
  }
 }else if(has('📍')){
  const scored=av.filter(x=>x.label?.startsWith('📍')).map(x=>{
   const p=PLACES.find(z=>x.label.includes(z.n));
   return {x,score:(p.f[0]+p.f[1])*(S.food<12?2.5:1)+(p.s[0]+p.s[1])*(S.sup<12?2.5:1)-exploreRisk(p)*(S.hp<60?30:simMode==='scavenge'?8:17)};
  });
  scored.sort((a,b)=>b.score-a.score);c=scored[0]?.x||get('↩');
 }else if(has('⛏️ 참호와 모래주머니'))c=(S.def>=40&&S.trap===0?get('🪤 함정 설치'):null)||get('⛏️ 참호와 모래주머니')||get('🪵 바리케이드')||get('🪤 함정 설치')||get('↩');
 else if(has('📡 암호 해독'))c=(S.hp<75&&get('🩺 야전 의술'))||(S.mo<60&&get('🤝 전쟁사 교훈'))||(S.def<40&&S.nextAttack>0&&get('🛡️ 방어 교범'))||get('↩ 작전회의 취소');
 else if(has('🔫 정면으로 막는다'))c=S.def<12&&S.hideUses<4&&S.darkNight?get('🕯️ 불을 끄고 숨는다'):get('🔫 정면으로 막는다');
 else if(has('바로 들여보내 함께 방어한다'))c=get('지휘관에게 확인')||get('오늘은 받아들이지 않는다');
 else if(has('그를 바로 들인다'))c=get('격리된 헛간')||get('돌려보낸다');
 else if(has('들여보내 바로 치료한다'))c=get('별채에서 격리')||get('문을 열지 않는다');
 else if(has('문을 연다')&&has('등잔불을 낮추고'))c=get('지식 2를 써서')||get('등잔불을 낮추고');
 else if(has('문을 열고 확인한다'))c=get('문은 잠그고')||get('불을 낮추고');
 else c=av.find(x=>!x.label?.startsWith('↩'))||av[0];
 if(!c)c=av[0];
 simActions[c.label]=(simActions[c.label]||0)+1;
 simQueue.push(()=>{if(!S.dead)c.fn();});
};
function simRun(seed,accuracy,mode){
 let r=(Math.imul(seed,11003)+113)>>>0;
 Math.random=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
 simAccuracy=accuracy;simMode=mode;simQueue=[];simError='';simSteps=0;simEnd=null;simActions={};simDays=[];simLastDay=0;
 S=newState('automatic');const team=S.squad.map(x=>x.id);
 simQueue.push(morning);
 let lastDay=0,stuck=0;
 while(simQueue.length&&!S.dead&&simSteps++<6000){
  try{simQueue.shift()();}catch(e){simError=String(e)+' (day '+S.day+')';break;}
  if(S.day===lastDay)stuck++;else{lastDay=S.day;stuck=0;}
  if(stuck>160){simError='Automated menu loop (day '+S.day+')';break;}
 }
 if(!simEnd)simEnd={why:simError?'agent-error':'unfinished',day:S.day,hp:S.hp,mo:S.mo,food:S.food,sup:S.sup,def:S.def,correct:S.correct,total:S.total};
 const knUses=Object.entries(simActions).filter(([key])=>['🩺 야전 의술','🤝 전쟁사 교훈','🛡️ 방어 교범','📡 암호 해독','🗺️ 지형 분석'].some(s=>key.startsWith(s))).reduce((n,[k,v])=>n+v,0);
 return {seed,mode,accuracy,team,knUses,...simEnd,error:simError,
  maxFood:Math.max(0,...simDays.map(x=>x.food)),maxSup:Math.max(0,...simDays.map(x=>x.sup)),maxDef:Math.max(0,...simDays.map(x=>x.def)),steps:simSteps};
}
return simRun;
