'use client';
import {createContext} from 'react';

export const StudyLearnerContext = createContext<{uid:string|null; loading:boolean}>({uid:null, loading:true});
