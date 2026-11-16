#!/usr/bin/env node
/* Lists every spoken line of a live lecture's sales call as JSON: [{key, who, text}].
   Usage: node tools/lecture/lines.mjs ch13 > lines.json   (then tools/lecture/voices.py makes the mp3 files) */
import fs from 'fs';import path from 'path';import vm from 'vm';
const id=process.argv[2]||'ch13',root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const src=fs.readFileSync(path.join(root,'lecture',id+'.js'),'utf8'),ctx={};vm.createContext(ctx);vm.runInContext(src+';this.L=LX_'+id.toUpperCase()+';',ctx);
const out=[],add=(key,arr)=>arr.forEach(([who,text],i)=>out.push({key:key+'-'+i,who,text}));
for(const [c,s] of Object.entries(ctx.L.call)){add(c+'-intro',s.intro);s.d.forEach((d,j)=>{add(c+'-d'+j+'-s',d.setup);d.opts.forEach((o,k)=>add(c+'-d'+j+'-o'+k,o.say))});add(c+'-outro',s.outro)}
process.stdout.write(JSON.stringify(out,null,1));
