// Add this file to the existing survival spreadsheet's Apps Script project.
// At the start of doGet(e): if (e.parameter.action === 'defenseRanks') return defenseList(e);
// At the start of doPost(e): if (e.parameter.action === 'defenseSubmit') return defenseSubmit(e);
// Deploy a new version of the existing web app to preserve its /exec URL.
function defenseSheet_() {
  return SpreadsheetApp.openById('1yjxTcOmeLZQFRjKcWA8_T_VX7zNh4tzDoXkGViQa1Yg').getSheetByName('디펜스기록');
}
function defenseCompare_(a,b) {
  return Number(b.clear)-Number(a.clear)||b.stage-a.stage||b.night-a.night||b.stars-a.stars;
}
function defenseList(e) {
  const callback = String(e.parameter.callback||'');
  if (!/^redDefense_[a-z0-9]+$/.test(callback)) return ContentService.createTextOutput('Invalid callback');
  const sheet=defenseSheet_(), n=sheet.getLastRow()-1;
  const rows=n>0?sheet.getRange(2,2,n,6).getValues():[];
  const best=new Map();
  let received=false;
  for(const [id,name,stage,night,clear,stars] of rows){
    if(id===e.parameter.runId)received=true;
    const key=String(name).trim().toLowerCase(), r={name:String(name),stage,night,clear,stars};
    if(key&&(!best.has(key)||defenseCompare_(r,best.get(key))<0))best.set(key,r);
  }
  const sorted=Array.from(best.values()).sort(defenseCompare_).slice(0,50);
  sorted.forEach((r,i)=>r.rank=i&&defenseCompare_(r,sorted[i-1])===0?sorted[i-1].rank:i+1);
  return ContentService.createTextOutput(callback+'('+JSON.stringify({ok:true,mode:'defense',received,list:sorted})+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function defenseSubmit(e) {
  const r=JSON.parse(e.parameter.record||'{}');
  if(!/^[a-zA-Z0-9_-]{5,100}$/.test(r.runId)||typeof r.name!=='string'||!r.name.trim()||r.name.length>20||typeof r.clear!=='boolean')throw Error('Invalid record');
  for(const [key,lo,hi] of [['stage',1,7],['night',1,5],['stars',0,105],['kills',0,100000],['correct',0,100000],['total',0,100000]]){
    if(!Number.isInteger(r[key])||r[key]<lo||r[key]>hi)throw Error('Invalid '+key);
  }
  if(r.correct>r.total||(r.clear&&(r.stage!==7||r.night!==5)))throw Error('Invalid result');
  const lock=LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet=defenseSheet_(), n=sheet.getLastRow()-1;
    const exists=n>0&&sheet.getRange(2,2,n,1).createTextFinder(r.runId).matchEntireCell(true).findNext();
    if(!exists) {
      const row=sheet.getLastRow()+1;
      sheet.getRange(row,3).setNumberFormat('@');
      sheet.getRange(row,1,1,10).setValues([[new Date(),r.runId,/^[=+@\-]/.test(r.name.trim())?"'"+r.name.trim():r.name.trim(),r.stage,r.night,r.clear,r.stars,r.kills,r.correct,r.total]]);
      SpreadsheetApp.flush();
    }
  } finally {lock.releaseLock();}
  return ContentService.createTextOutput('OK');
}