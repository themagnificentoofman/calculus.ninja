import test from 'node:test';
import assert from 'node:assert/strict';
import {activityWindow,dayKey,lastModule,markGroup,recordModuleVisit,studyDashboard,trackStudyMark} from '../lib/study/dashboard.mjs';
import {studyMarkKey,writeStudyMark} from '../lib/study/marks.mjs';

function storage(){
 const values=new Map();
 return {get length(){return values.size;},key:i=>Array.from(values.keys())[i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
}
const algebra={id:'algebra',kind:'module',resource:'algebra@2',href:'/study/lessons/algebra'};
test('dashboard resumes an exact known module, scopes progress and counts activities once per day',()=>{
 const browser=storage(), date=new Date(2026,10,19), url='/study/lessons/algebra?path=algebra-functions#conjugates';
 assert.equal(lastModule(browser,null,[algebra]),null);
 recordModuleVisit(browser,null,'algebra',url,date);recordModuleVisit(browser,null,'algebra',url,date);
 assert.equal(lastModule(browser,null,[algebra]).resumeHref,url);
 assert.equal(lastModule(browser,'signed-in',[algebra]),null);
 assert.equal(lastModule(browser,null,[]),null);
 writeStudyMark(browser,studyMarkKey(null,'module',algebra.resource),'module','Practicing');
 for(let i=0;i<2;i++) trackStudyMark(browser,null,'module',algebra.resource,'Reading','Practicing',date);
 trackStudyMark(browser,null,'exercise','algebra/one@1','Solving','Solved',date);
 const dash=studyDashboard(browser,null,[algebra],date);
 assert.equal(markGroup(dash.statuses[algebra.resource]),'active');
 assert.deepEqual(dash.days.at(-1),{key:'2026-11-19',date,opened:1,practiced:1,solved:1});
 recordModuleVisit(browser,null,'algebra','//other.invalid/study/lessons/algebra',date);
 assert.equal(lastModule(browser,null,[algebra]),null);
 assert.equal(markGroup('Skipped'),'skipped');
 assert.equal(dayKey(activityWindow(date)[0]).length,10);
});
