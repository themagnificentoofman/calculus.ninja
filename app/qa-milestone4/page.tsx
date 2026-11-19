import {notFound} from 'next/navigation';
import {EditorInspection} from '@/components/qa/EditorInspection';
export default function EditorQA(){if(process.env.NODE_ENV!=='development')notFound();return <EditorInspection/>;}
