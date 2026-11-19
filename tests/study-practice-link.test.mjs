import assert from 'node:assert/strict';
import test from 'node:test';
import {afterSignIn, practiceSignInReturn, readStudyPractice, studyPracticeHref} from '../lib/study/practice-link.mjs';

test('practice links carry topic, difficulty and the exercise anchor across sign-in and round restoration', () => {
  const href = studyPracticeHref('spectral','exercise-zero-slope-spectrum','olympiad-ode','ode','olympiad');
  const search = href.slice('/play/test'.length);
  const round = 'a'.repeat(64);
  assert.deepEqual(readStudyPractice(search), {href,category:'differential equations',difficulty:'olympiad',
    returnHref:'/study/lessons/spectral?path=olympiad-ode#exercise-zero-slope-spectrum'});
  assert.equal(afterSignIn(practiceSignInReturn(search+'&round='+round)), href+'&round='+round);
  assert.equal(afterSignIn('/play/test?round='+round), '/play/test?round='+round);
  assert.equal(afterSignIn('/contact'), '/contact');
  assert.equal(studyPracticeHref('spectral','practice',null,'mixed','easy'),
    '/play/test?studyLesson=spectral&studySection=practice&topic=mixed&tier=easy');
});

test('return paths use local validated destinations and discard untrusted query fields', () => {
  const clean = studyPracticeHref('limits','practice',undefined,'limits','easy');
  const search = clean.slice('/play/test'.length);
  for (const next of ['//elsewhere','https://elsewhere','/play/test/../../outside',String.raw`/play/test\outside`]) {
    assert.equal(afterSignIn(next), '/');
  }
  for (const extra of ['&studyPath=../evil','&tier=hard','&topic=constructor','&studySection=%2F%2Fevil']) {
    assert.equal(readStudyPractice(search+extra),null);
  }
  assert.equal(afterSignIn(clean+'&next=https://elsewhere&round=..'),clean);
  assert.equal(practiceSignInReturn('?round=first&round=second'),'/play/test');
});

test('sign-in restores a single competitive destination through the existing account flow', () => {
  const code = 'c2'+'a'.repeat(28);
  for (const mode of ['pvp','multiplayer']) {
    const path = '/play/'+mode;
    for (const suffix of ['', '/lobbies', '?round='+code, '?join='+code, '?host=public']) {
      assert.equal(afterSignIn(path+suffix),path+suffix);
    }
    assert.equal(afterSignIn(path+'?round='+code+'&extra=true'),path+'?round='+code);
    for (const invalid of ['?round=one&round=two','?join='+code+'&host=public','?round=../outside','?join=a_b_c']) {
      assert.equal(afterSignIn(path+invalid),path);
    }
    assert.equal(afterSignIn(path+'/lobbies?join='+code),path+'/lobbies');
  }
  assert.equal(afterSignIn('/play/pvp?invite=friend_123'),'/play/pvp?invite=friend_123');
  assert.equal(afterSignIn('/play/pvp?round=__proto__'),'/play/pvp');
  assert.equal(afterSignIn('/play/pvp/../../outside'),'/');
  assert.equal(afterSignIn('//play/pvp?join='+code),'/');
});
