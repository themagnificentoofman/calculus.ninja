import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';
import {compileFunction} from 'node:vm';
import {build} from 'esbuild';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {lessonPracticeAvailability} from '../lib/server/study-practice-availability.mjs';

test('the Study reader distinguishes an unknown drill status from a verified empty format list', async () => {
  const {outputFiles} = await build({
    stdin: {
      contents: "export {StudyLessonReader} from './components/study/StudyLessonReader'; export {publicStudyLesson} from './lib/study/catalog';",
      resolveDir: process.cwd(),
    },
    bundle: true, write: false, packages: 'external', format: 'cjs', platform: 'node', jsx: 'automatic',
    define: {'process.env.NODE_ENV': '"development"'},
  });
  const compiled = {exports: {}};
  compileFunction(outputFiles[0].text, ['require', 'module', 'exports'])(
    createRequire(import.meta.url), compiled, compiled.exports
  );
  const {StudyLessonReader, publicStudyLesson} = compiled.exports;
  const lesson = await publicStudyLesson('parts');
  const exerciseId = 'twice-trigonometric';
  const control = {epoch:8, version:3, incarnation:'a'.repeat(64), policy:'b'.repeat(64)};
  const manifest = {control, formats:{'integration/medium/*':['multiple-choice']}};
  async function render(row, formats = manifest.formats) {
    const db = {prepare: () => ({first: async () => row})};
    const practiceFormats = await lessonPracticeAvailability(db, lesson, undefined, {...manifest, formats}, control.policy);
    const html = renderToStaticMarkup(createElement(StudyLessonReader, {lesson, practiceFormats}));
    const article = html.split('id="exercise-' + exerciseId + '"')[1]?.split('</article>')[0];
    assert.ok(article, 'the actual linked exercise is rendered');
    return article;
  }
  const unknown = await render({...control, epoch:9});
  assert.match(unknown, /availability could not be (checked|verified)/i);
  assert.doesNotMatch(unknown, /drill is unavailable/i);
  const empty = await render(control);
  assert.match(empty, /drill is unavailable/i);
  assert.match(empty, /Broader practice supports multiple choice/i);
  const offered = await render(control, {...manifest.formats, 'integration/medium/integration-by-parts':['free-response']});
  assert.match(offered, /format=free-response/);
  assert.doesNotMatch(offered, /drill is unavailable/i);
});
