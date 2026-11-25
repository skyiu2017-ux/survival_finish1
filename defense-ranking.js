// Runs in the defense game's document, after its own startup script.
(function () {
  const originalEnd = dgEnd;
  const queueKey = 'redEyesDefensePendingV1';
  const pending = () => {try {return JSON.parse(localStorage.getItem(queueKey)) || [];} catch {return [];}};
  const panel = document.createElement('section');
  panel.innerHTML = '<h3>학급 디펜스 랭킹</h3><p class="sys" aria-live="polite"></p><ol></ol><button type="button">공용 기록 새로고침</button>';
  const status = panel.querySelector('p'), list = panel.querySelector('ol'), button = panel.querySelector('button');
  document.getElementById('dgRanks').after(panel);
  const endpoint = "https://script.google.com/macros/s/AKfycbyBQkt0AbRCt66KvT9M352wf6oHdRhelqiK0BUXNFAUJFoMOg1wgwXlMK4ZGwbPp_Bj/exec";
  function request(action, runId) {
    return new Promise((resolve,reject)=>{
      const key = 'redDefense_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const stop = () => {delete window[key];script.remove();clearTimeout(timer);};
      const timer = setTimeout(()=>{stop();reject(Error('timeout'));},7000);
      window[key] = data => {stop();data?.mode==='defense' && data.ok ? resolve(data) : reject(Error('backend'));};
      script.onerror = () => {stop();reject(Error('connection'));};
      script.src = endpoint+'?'+new URLSearchParams({action,callback:key,runId:runId||'',_:Date.now()});
      document.head.append(script);
    });
  }
  async function refresh() {
    if(button.disabled)return;
    button.disabled = true;
    try {
      let data = await request('defenseRanks');
      for(const record of pending()){
        await fetch(endpoint,{method:'POST',mode:'no-cors',body:new URLSearchParams({action:'defenseSubmit',record:JSON.stringify(record)})});
        data = await request('defenseRanks',record.runId);
        if(!data.received) break;
        localStorage.setItem(queueKey,JSON.stringify(pending().filter(x=>x.runId!==record.runId)));
      }
      list.replaceChildren();
      for(const r of data.list){
        const li=document.createElement('li');
        li.style.listStyle='none';
        li.textContent=r.rank+'위 · '+r.name+' · '+(r.clear?'전체 클리어':r.stage+'전장 '+r.night+'번째 밤')+' · 별 '+r.stars;
        list.append(li);
      }
      status.textContent=pending().length?'전송 대기 중인 기록이 있습니다.':data.list.length?'닉네임별 최고 기록 · 같은 성적은 공동 순위':'아직 학급 기록이 없습니다.';
    } catch {status.textContent='학급 랭킹에 연결하지 못했습니다. 이 기기의 기록은 보관됩니다.';}
    finally {button.disabled=false;}
  }
  button.onclick=refresh;
  dgEnd=function(kind){
    const g=S.dg;
    const record={runId:S.runId||('def_'+Date.now()+'_'+Math.random().toString(36).slice(2)),name:S.name,stage:g.stage+1,night:g.night,clear:kind==='clear',stars:g.starsTotal,kills:g.kills,correct:S.correct,total:S.total};
    originalEnd(kind);
    try{const q=pending().filter(x=>x.runId!==record.runId);q.push(record);localStorage.setItem(queueKey,JSON.stringify(q));}catch{}
    document.getElementById('endScreen').append(panel);
    const again=document.getElementById('dgAgain');
    again?.addEventListener('click',()=>{document.getElementById('dgRanks').after(panel);refresh();},{once:true});
    refresh();
  };
  refresh();
})();