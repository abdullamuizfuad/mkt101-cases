#!/usr/bin/env node
/* Runs tools/tests/firebase.js against the Firebase Auth + Firestore emulators.
   Run from the repo root:  node tools/tests/firebase-run.js
   Needs: Java, firebase-tools (npx downloads it, or set FIREBASE_BIN), Playwright, and the real rules:
   python3 tools/build-rules.py <class list>   (writes firestore.rules, git-ignored), or set RULES=/path/to/firestore.rules */
const fs=require('fs'),os=require('os'),path=require('path'),{spawnSync}=require('child_process');
const ROOT=path.resolve(__dirname,'../..'),RULES=path.resolve(process.env.RULES||path.join(ROOT,'firestore.rules'));
if(!fs.existsSync(RULES)){console.error('No rules file at '+RULES+'\nRun: python3 tools/build-rules.py <class list>  (or set RULES=...)');process.exit(2)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mkt101-emu-'));
/* the real rules, plus the made-up test accounts added to the class list (the test roster in firebase.js uses the same IDs) */
const TEST=['S000001','S081441','S085542','S082110','S085651','S084517'].map(s=>"'"+s.toLowerCase()+"@student.mnu.edu.mv'");
let rules=fs.readFileSync(RULES,'utf8');const m=rules.match(/email in \[\s*\n/);if(!m){console.error('Unexpected rules format (no class list)');process.exit(2)}
rules=rules.replace(m[0],m[0]+TEST.map(e=>'      '+e+',\n').join(''));fs.writeFileSync(path.join(dir,'firestore.rules'),rules);
fs.writeFileSync(path.join(dir,'firebase.json'),JSON.stringify({firestore:{rules:'firestore.rules'},
  emulators:{auth:{port:9099,host:'127.0.0.1'},firestore:{port:8085,host:'127.0.0.1'},ui:{enabled:false},singleProjectMode:true}}));
const bin=process.env.FIREBASE_BIN||'npx -y firebase-tools@13';
const test=JSON.stringify(path.join(__dirname,'firebase.js'))+' '+process.argv.slice(2).join(' ');
const r=spawnSync(`${bin} emulators:exec --only auth,firestore --project demo-mkt101 "node ${test.replace(/"/g,'\\"')}"`,
  {cwd:dir,shell:true,stdio:'inherit',env:Object.assign({},process.env,{RULES2:/match \/meta\//.test(fs.readFileSync(path.join(dir,'firestore.rules'),'utf8'))?'1':'',MKT101_ROOT:ROOT})});
fs.rmSync(dir,{recursive:true,force:true});process.exit(r.status==null?1:r.status);
