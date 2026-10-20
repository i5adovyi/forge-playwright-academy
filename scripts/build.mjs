import { cp, mkdir, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
await mkdir(`${root}/portal/downloads`,{recursive:true});
await rm(`${root}/portal/docs`,{recursive:true,force:true});
await cp(`${root}/docs`,`${root}/portal/docs`,{recursive:true});
const manualZip=`${root}/portal/downloads/forge-manuals.zip`;
await rm(manualZip,{force:true});
execFileSync('zip',['-qr',manualZip,'docs'],{cwd:root});
const projectZip=`${root}/portal/downloads/forge-academy.zip`;
await rm(projectZip,{force:true});
const include=['portal','lab','skills','quality','state','api-workshop','ui-workshop','tests','exercises','solutions','scripts','docs','package.json','package-lock.json','playwright.config.ts','playwright.matrix.config.ts','playwright.visual.config.ts','playwright.state-auth.config.ts','tsconfig.json','server.mjs','README.md','.github','.gitignore','LICENSE'];
const existing=[];
for(const name of include){try{await access(`${root}/${name}`);existing.push(name);}catch{}}
execFileSync('zip',['-qr',projectZip,...existing,'-x','portal/downloads/*','*/.DS_Store'],{cwd:root});
await rm(`${root}/dist`,{recursive:true,force:true});
await cp(`${root}/portal`,`${root}/dist`,{recursive:true});
console.log(`Built academy portal and downloadable project (${existing.length} source entries).`);
