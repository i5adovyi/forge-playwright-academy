import assert from 'node:assert/strict';
import { stages, lessons } from '../portal/content/curriculum.js';
import { resources, articles } from '../portal/content/library.js';
const unique=(items,label)=>assert.equal(new Set(items.map(i=>i.id)).size,items.length,`${label} IDs must be unique`);
unique(stages,'Stage');unique(lessons,'Lesson');unique(resources,'Resource');unique(articles,'Article');
assert.equal(stages.length,8);assert.equal(lessons.length,40);
for(const s of stages)assert.equal(lessons.filter(l=>l.stage===s.id).length,5,`5 lessons for ${s.id}`);
let exercises=0;
for(const l of lessons){assert(stages.some(s=>s.id===l.stage));assert(l.title&&l.summary&&l.minutes>0&&l.level);assert(l.objectives.length>=2);assert(l.sections.length>=2);assert(l.exercises.length>=2);assert(l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);assert(l.quiz.explanation);unique(l.exercises,l.id);for(const e of l.exercises){assert(e.brief&&e.hint&&e.solution);assert(e.steps.length&&e.acceptance.length);exercises++;}for(const s of l.sections)assert(s.heading&&s.body);}
for(const r of resources){assert(r.title&&r.type&&r.description&&r.url);assert(/^https?:\/\//.test(r.url));}
assert(articles.length>=8);for(const a of articles)assert(a.sections.length>=2);
console.log(`Validated ${stages.length} stages, ${lessons.length} lessons, ${exercises} exercises, ${resources.length} resources and ${articles.length} articles.`);
