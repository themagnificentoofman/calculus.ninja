'use client';

import {useContext,useEffect} from 'react';
import {StudyLearnerContext} from '@/lib/study/learner-context';
import {dashboardChange,recordModuleVisit} from '@/lib/study/dashboard.mjs';

export function StudyVisit({id}:{id:string}){
 const {uid,loading}=useContext(StudyLearnerContext);
 useEffect(()=>{
  if(loading)return;
  const save=()=>{
   try{
    recordModuleVisit(window.localStorage,uid,id,window.location.pathname+window.location.search+window.location.hash);
    window.dispatchEvent(new Event(dashboardChange));
   }catch{}
  };
  save();
  window.addEventListener('hashchange',save);
  window.addEventListener('pageshow',save);
  return ()=>{
   window.removeEventListener('hashchange',save);
   window.removeEventListener('pageshow',save);
  };
 },[id,uid,loading]);
 return null;
}
