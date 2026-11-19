import {notFound} from 'next/navigation';
import {studyPathIndex} from '@/lib/study/catalog';
import {StudyPathReader} from '@/components/study/StudyPathReader';

export default async function Page({params}:{params:Promise<{pathId:string}>}){
 const {pathId}=await params,path=(await studyPathIndex()).find(p=>p.id===pathId);if(!path)notFound();
 return <StudyPathReader path={path}/>;
}
