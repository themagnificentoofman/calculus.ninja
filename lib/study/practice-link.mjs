// Practice links carry only curriculum IDs and the learner's original anchor.
// The server still owns eligibility, selection, answers and grades.
import {studySyllabusState,syllabusQuery} from './syllabus.mjs';
import {studyTechnique} from './practice-drills.mjs';
import {contactReturnHref} from '../contact-link.mjs';
import {competitiveSignInReturn,roundIdFromSearch} from '../round-url.mjs';

const id = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
const categories = Object.freeze({
  differentiation: 'differentiation', integration: 'integration', limits: 'limits',
  series: 'series', ode: 'differential equations', multivariable: 'multivariable', mixed: 'all',
});
const tiers = ['easy', 'medium', 'hard', 'olympiad'];

function studyOrigin(origin) {
  const query=new URLSearchParams();
  const syllabus=syllabusQuery(studySyllabusState(origin?.syllabus));
  if(syllabus)query.set('syllabus',syllabus);
  if(typeof origin?.result==='string' && /^[a-z0-9-]{1,180}$/.test(origin.result))query.set('result',origin.result);
  if(origin?.fromReadiness==='1')query.set('fromReadiness','1');
  if(id(origin?.fromLesson)) {
    query.set('fromLesson',origin.fromLesson);
    if(id(origin.fromPath))query.set('fromPath',origin.fromPath);
    if(['lesson-objectives','lesson-readiness','related-lessons'].includes(origin.fromSection))query.set('fromSection',origin.fromSection);
  }
  return query;
}

/** @param {{tag:string|null,format:string|null}|null} drill */
export function studyPracticeHref(lesson, section, path, topic, tier, origin = {}, drill = null) {
  if (!id(lesson) || !id(section) || (path && !id(path)) || !Object.hasOwn(categories,topic) || !tiers.includes(tier)) return null;
  const query = new URLSearchParams({studyLesson: lesson, studySection: section, topic, tier});
  if (drill) {
    const entry=studyTechnique(lesson,section,topic,tier);
    if (!entry || drill.tag!==entry.tag || !['multiple-choice','free-response'].includes(drill.format)) return null;
    query.set('technique',drill.tag);
    query.set('format',drill.format);
  }
  if (path) query.set('studyPath', path);
  studyOrigin(origin).forEach((v,k)=>query.set(k,v));
  return '/play/test?' + query;
}

export function readStudyPractice(search) {
  if (typeof search !== 'string' || search.length > 2048) return null;
  const query = new URLSearchParams(search);
  for (const key of ['studyLesson', 'studySection', 'studyPath', 'topic', 'tier','technique','format','syllabus','result','fromReadiness','fromLesson','fromPath','fromSection']) {
    if (query.getAll(key).length > 1) return null;
  }
  const [lesson, section, path, topic, tier] = ['studyLesson', 'studySection', 'studyPath', 'topic', 'tier'].map(key => query.get(key));
  const origin=studyOrigin(Object.fromEntries(query));
  const exact=query.has('technique')||query.has('format');
  const drill=exact?{tag:query.get('technique'),format:query.get('format')}:null;
  const href = studyPracticeHref(lesson, section, path, topic, tier, Object.fromEntries(origin), drill);
  if (!href) return null;
  const entry=drill&&studyTechnique(lesson,section,topic,tier);
  return {href, category: categories[topic], difficulty: tier, ...(entry&&drill?{drill:{...drill,label:entry.label},broaderHref:studyPracticeHref(lesson,section,path,topic,tier,Object.fromEntries(origin))}:{}),
    returnHref: '/study/lessons/' + lesson + (() => {
      const returning=new URLSearchParams();
      if(path)returning.set('path',path);
      origin.forEach((v,k)=>returning.set(k,v));
      return returning.size ? '?'+returning : '';
    })() + '#' + section};
}

export function practiceSignInReturn(search) {
  const context = readStudyPractice(search);
  const params=new URLSearchParams(typeof search==='string'&&search.length<=2048?search:'');
  if(!context&&(params.has('technique')||params.has('format')))return '/study';
  const result = new URL(context?.href ?? '/play/test', 'https://practice.invalid');
  const round = typeof search === 'string' && search.length <= 2048 && roundIdFromSearch(search);
  if (round && new URLSearchParams(search).getAll('round').length === 1) result.searchParams.set('round', round);
  return result.pathname + result.search;
}

export function studySignInReturn(next) {
  if (typeof next !== 'string' || next.length > 2400) return null;
  const match = /^\/study(?:\/(lessons|paths|tiers)\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?(?=[?#]|$)/.exec(next);
  if (!match || (match[2] && !id(match[2]))) return null;
  const suffix = next.slice(match[0].length);
  if (/[\\\r\n]/.test(suffix)) return null;
  const url = new URL(next, 'https://study.invalid');
  const source = url.searchParams;
  const query = new URLSearchParams();
  if (!match[1]) {
    const filters = syllabusQuery(studySyllabusState(url.search));
    new URLSearchParams(filters).forEach((v,k)=>query.set(k,v));
    if (source.getAll('result').length===1 && /^[a-z0-9-]{1,180}$/.test(source.get('result')??'')) query.set('result',source.get('result'));
  } else if (match[1] === 'lessons') {
    if (source.getAll('path').length===1 && id(source.get('path'))) query.set('path',source.get('path'));
    const origin={};
    for(const key of ['syllabus','result','fromReadiness','fromLesson','fromPath','fromSection']) {
      if(source.getAll(key).length===1)origin[key]=source.get(key);
    }
    studyOrigin(origin).forEach((v,k)=>query.set(k,v));
  }
  const hash = /^#[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.hash) && url.hash.length<=1000 ? url.hash : '';
  return url.pathname.replace(/\/$/, '') + (query.size ? '?'+query : '') + hash;
}

export function afterSignIn(next) {
  const study = studySignInReturn(next);
  if (study) return study;
  const contact = contactReturnHref(next);
  if (contact) return contact;
  if (next === '/play/test') return next;
  if (typeof next !== 'string' || !next.startsWith('/play/test?')) return competitiveSignInReturn(next) ?? '/';
  return practiceSignInReturn(next.slice('/play/test'.length));
}
