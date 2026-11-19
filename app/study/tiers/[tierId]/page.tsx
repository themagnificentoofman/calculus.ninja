import {notFound} from 'next/navigation';
import {studyTierIndex} from '@/lib/study/catalog';
import {StudyTierReader} from '@/components/study/StudyTierReader';

export default async function StudyTierPage({params}:{params:Promise<{tierId:string}>}){
 const {tierId}=await params;
 const tiers=await studyTierIndex();
 const tier=tiers.find(t=>t.id===tierId);
 if(!tier)notFound();
 return <StudyTierReader tier={tier} navigation={tiers.map(({id,title,href})=>({id,title,href}))}/>;
}
