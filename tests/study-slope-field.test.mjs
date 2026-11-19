import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {compileFunction} from 'node:vm';
import {build} from 'esbuild';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {slopeFieldsLesson} from '../content/study/lessons/slope-fields.mjs';

test('the worked field plots all nine slopes on its labeled coordinate scales', async () => {
  const worked = slopeFieldsLesson.worked.find(example => example.id === 'constant-rows');
  const diagram = worked.solution.find(block => block.kind === 'diagram');
  assert.equal(diagram?.id, 'constant-slope-rows');

  const {outputFiles} = await build({
    entryPoints: ['components/study/StudyDiagram.tsx'],
    bundle: true, write: false, packages: 'external', format: 'cjs', platform: 'node', jsx: 'automatic'
  });
  const renderedModule = {exports: {}};
  compileFunction(outputFiles[0].text, ['require', 'module', 'exports'])(
    createRequire(import.meta.url), renderedModule, renderedModule.exports
  );
  const svg = renderToStaticMarkup(createElement(renderedModule.exports.StudyDiagram, {id: diagram.id}));
  const xTicks = new Map(), yTicks = new Map();
  for (const [, x, y, label] of svg.matchAll(/<text x="([^"]+)" y="([^"]+)">(-?\d+)<\/text>/g)) {
    if (y === '347') xTicks.set(Number(label), Number(x));
    if (x === '76') yTicks.set(Number(label), Number(y) - 6);
  }
  assert.deepEqual([...xTicks.keys()].sort((a,b) => a-b), [-1, 0, 1]);
  assert.deepEqual([...yTicks.keys()].sort((a,b) => a-b), [0, 2, 4]);
  const xScale = xTicks.get(1) - xTicks.get(0);
  const yScale = (yTicks.get(0) - yTicks.get(4)) / 4;
  assert.equal(xScale, yScale);
  assert.ok(xScale > 0);
  const samples = new Map();
  for (const match of svg.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)) {
    const [x1,y1,x2,y2] = match.slice(1).map(Number);
    const time = ((x1+x2)/2 - xTicks.get(0))/xScale;
    const height = (yTicks.get(0) - (y1+y2)/2)/yScale;
    assert.ok(xTicks.has(time) && yTicks.has(height) && x2 > x1);
    const key = time + ',' + height;
    assert.ok(!samples.has(key), 'Repeated field segment at '+key);
    samples.set(key, (y1-y2)/yScale / ((x2-x1)/xScale));
    assert.equal(samples.get(key), 2-height);
  }
  assert.equal(samples.size, 9);
  const label = /role="img" aria-labelledby="([^"]+)" aria-describedby="([^"]+)"/.exec(svg);
  assert.ok(label);
  assert.ok(svg.includes('<title id="'+label[1]+'">') && svg.includes('<desc id="'+label[2]+'">'));
});
