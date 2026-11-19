import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {compileFunction} from 'node:vm';
import {build} from 'esbuild';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('server-rendered sign-in cannot accept credentials or submit before hydration', async () => {
  const {outputFiles} = await build({
    entryPoints: ['app/auth/page.tsx'],
    bundle: true, write: false, packages: 'external', format: 'cjs', platform: 'node', jsx: 'automatic'
  });
  const page = {exports: {}};
  compileFunction(outputFiles[0].text, ['require', 'module', 'exports'])(
    createRequire(import.meta.url), page, page.exports
  );
  const html = renderToStaticMarkup(createElement(page.exports.default));
  const controls = [...html.matchAll(/<(input|button)\b[^>]*>/g)].map(match => match[0]);
  assert.equal(controls.length, 5, 'email, password, submit, Google, and mode switch');
  for (const control of controls) assert.match(control, /\sdisabled(?:[\s=>])/, control);
});
