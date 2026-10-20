import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { stages, lessons } from '../portal/content/curriculum.js';
import { resources, articles } from '../portal/content/library.js';
import { practiceTracks, skillTracks, accessibilityTracks, visualTracks } from '../portal/content/practice.js';

const root=resolve(import.meta.dirname,'..');
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const unique=(items,label)=>assert.equal(new Set(items.map(i=>i.id)).size,items.length,`${label} IDs must be unique`);
const prose=(value,label)=>assert(typeof value==='string'&&value.trim(),`${label} must be non-empty text`);
const texts=(values,label,min=1)=>{assert(Array.isArray(values)&&values.length>=min,`${label} must have at least ${min} entries`);values.forEach(v=>prose(v,label));};
const link=(value,label)=>{const url=new URL(value);assert(url.protocol==='https:'&&!url.username&&!url.password,`${label} must be an HTTPS link without credentials`);};
for(const [items,label] of [[stages,'Stage'],[lessons,'Lesson'],[resources,'Resource'],[articles,'Article'],[[...practiceTracks,...skillTracks,...accessibilityTracks,...visualTracks],'Drill']])unique(items,label);
assert.equal(stages.length,8);assert.equal(lessons.length,44);
for(const s of stages){prose(s.title,s.id);assert.equal(lessons.filter(l=>l.stage===s.id).length,['resilient-ui','delivery'].includes(s.id)?7:5,`Lesson count for ${s.id}`);}
let exercises=0;
for(const l of lessons){
  assert(stages.some(s=>s.id===l.stage),`${l.id}: unknown stage`);
  assert(/^\d{2}-\d{2}$/.test(l.id),`Unexpected lesson ID ${l.id}`);
  for(const key of ['title','summary','level'])prose(l[key],`${l.id}.${key}`);
  assert(Number.isFinite(l.minutes)&&l.minutes>0,`${l.id}: valid duration required`);
  texts(l.tags,`${l.id} tags`);texts(l.objectives,`${l.id} objectives`,2);
  assert(l.sections.length>=2);assert(l.exercises.length>=2);unique(l.exercises,`${l.id} exercise`);
  prose(l.quiz.question,`${l.id} question`);texts(l.quiz.options,`${l.id} options`,2);
  assert.equal(new Set(l.quiz.options).size,l.quiz.options.length,`${l.id} duplicate quiz options`);
  assert(Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length,`${l.id} invalid answer`);
  prose(l.quiz.explanation,`${l.id} explanation`);
  for(const e of l.exercises){
    assert(e.id.startsWith(l.id+'-'),`${e.id}: belongs to another lesson`);
    for(const key of ['title','brief','hint','solution'])prose(e[key],`${e.id}.${key}`);
    texts(e.steps,`${e.id} steps`);texts(e.acceptance,`${e.id} acceptance`);exercises++;
  }
  for(const s of l.sections){prose(s.heading,`${l.id} section heading`);prose(s.body,`${l.id} section body`);}
  for(const r of l.resources){prose(r.title,`${l.id} reference`);link(r.url,`${l.id} reference`);}
}
for(const r of resources){
  for(const key of ['title','description','author','level','verified'])prose(r[key],`${r.id}.${key}`);
  assert(['Documentation','Course','Video','Book','Article','Manual'].includes(r.type),`${r.id}: unknown format`);
  assert(['Free','Paid','Mixed'].includes(r.cost),`${r.id}: unknown price label`);
  texts(r.tags,`${r.id} tags`);link(r.url,r.id);
}
assert(articles.length>=8);
for(const a of articles){prose(a.title,a.id);assert(a.sections.length>=2);for(const s of a.sections){prose(s.heading,a.id);prose(s.body,a.id);}}
assert.equal(practiceTracks.length,24);assert.equal(skillTracks.length,6);assert.equal(accessibilityTracks.length,4);assert.equal(visualTracks.length,4);
for(const d of [...practiceTracks,...skillTracks,...accessibilityTracks,...visualTracks]){
  const solution=d.solution||d.file.replace(/^exercises\//,'solutions/');
  texts(d.lessons,`${d.id} lesson map`);
  assert(d.lessons.every(id=>lessons.some(l=>l.id===id)),`${d.id}: unknown lesson`);
  for(const file of [d.file,solution]){
    assert(!file.includes('..')&&!file.startsWith('/'),`${d.id}: unsafe repository path`);
    const body=await readFile(resolve(root,file),'utf8');
    assert(body.includes(d.id),`${d.id} is missing from ${file}`);
  }
  if(d.command){const script=d.command.match(/^npm run ([\w:-]+)/)?.[1];assert(script&&pkg.scripts[script],`${d.id}: unknown npm script`);}
}
let documentLinks=0;
for(const name of await readdir(resolve(root,'docs'))){
  if(!name.endsWith('.md'))continue;
  const file=resolve(root,'docs',name);
  const body=await readFile(file,'utf8');
  for(const match of body.matchAll(/\[[^\]]+\]\(([^\s)]+\.md)(?:#[^)]*)?\)/g)){
    if(/^https?:/.test(match[1]))continue;
    await access(resolve(dirname(file),match[1]));documentLinks++;
  }
}
console.log(`Validated ${stages.length} stages, ${lessons.length} lessons, ${exercises} challenges, ${resources.length} resources, ${articles.length} articles, ${practiceTracks.length+skillTracks.length+accessibilityTracks.length+visualTracks.length} executable drill mappings and ${documentLinks} local document links.`);
