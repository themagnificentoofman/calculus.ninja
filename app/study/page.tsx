import {notFound} from 'next/navigation';
import {studySearchIndex,studyPathIndex,studyTierIndex} from '@/lib/study/catalog';
import {StudyLibrary} from '@/components/study/StudyLibrary';

export default async function StudyPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams;
 const filters=new URLSearchParams();
 for(const key of ['q','kind','tier','topic'])if(typeof query[key]==='string')filters.set(key,query[key] as string);
 const [lessons,paths,tiers]=await Promise.all([studySearchIndex(),studyPathIndex(),studyTierIndex()]);
 if(!lessons.length)notFound();
 return <StudyLibrary lessons={lessons} paths={paths} tiers={tiers} initialSearch={filters.toString()} restoreResult={typeof query.result==='string'?query.result:undefined}/>;
}
