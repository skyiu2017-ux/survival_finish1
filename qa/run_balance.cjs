// Usage: node qa/run_balance.cjs [seeds per strategy] > results.ndjson
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const game = script.slice(0, script.indexOf('\nrenderAchBox();'));
const simulator = fs.readFileSync(path.join(__dirname, 'survival_simulator.js'), 'utf8');
const element = {value:'',classList:{add(){},remove(){},toggle(){}},style:{},getContext(){return null;}};
class SimDate extends Date {static now(){return 1700000000000;}}
const store = new Map();
const env = {Date:SimDate,window:{},Image:class{},document:{body:element,getElementById:()=>element,createElement:()=>element},
  localStorage:{getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)},setTimeout(){},console};
const run = vm.runInNewContext('(function(){'+game+'\n'+simulator+'})()', env);
const count = Number(process.argv[2] || 20);
for(const accuracy of [1,.9,.8,.7,.6]){
  for(const mode of ['balanced','fortress','scavenge']){
    for(let seed=1;seed<=count;seed++){
      store.clear();
      const result=run(seed, accuracy, mode);
      if(result.error || result.why==='unfinished')throw Error(JSON.stringify(result));
      process.stdout.write(JSON.stringify(result)+'\n');
    }
  }
}
