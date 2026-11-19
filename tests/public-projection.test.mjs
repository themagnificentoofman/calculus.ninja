import test from 'node:test';
import assert from 'node:assert/strict';
import {publicGame} from '../lib/server/game-engine.ts';
test('new private fields never enter a public round through a spread',()=>{
 const game={mode:'test',status:'active',players:['owner'],scores:{owner:1},privateNewField:'hidden',graderDiagnostics:{expected:'hidden'},questions:[{latexProblem:'1+1',options:['1','2','3','4'],correctIndex:1,explanation:['hidden'],topic:'limits',difficulty:'easy',expectedAnswer:'hidden'}],answers:{owner:{0:{correct:true,xp:10,timeMs:30,selectedOption:1,raw:'hidden',normalized:'hidden',contract:{expected:'hidden'},newPrivateField:'hidden'}}},timeline:{owner:[{questionIndex:0,timeMs:30,raw:'hidden',requestId:'hidden'}]}};
 const result=publicGame(game);assert.equal(JSON.stringify(result).includes('hidden'),false);assert.deepEqual(result.answers.owner[0],{correct:true,xp:10,timeMs:30});assert.deepEqual(result.timeline.owner,[{questionIndex:0,timeMs:30}]);
});
test('FR players receive exactly the saved contract assumptions, not private context',()=>{
 const q={responseFormat:'free-response',latexProblem:'f(x)=x^2',topic:'differentiation',difficulty:'easy',answerInstructions:'Enter a function.',freeResponse:{presentation:{assumptions:['x is real.']}},context:{assumptions:['private stale assumption'],techniqueTags:['hidden']},explanation:['hidden']};
 const result=publicGame({mode:'test',status:'active',players:['owner'],scores:{owner:0},questions:[q],answers:{}});
 assert.deepEqual(result.questions[0].assumptions,['x is real.']);assert.equal(JSON.stringify(result).includes('hidden'),false);assert.equal(JSON.stringify(result).includes('stale'),false);
});
