import {env} from 'cloudflare:workers';
import {lessonPracticeAvailability} from '@/lib/server/study-practice-availability.mjs';
import {notFound} from 'next/navigation';
import {prerequisiteReturn, publicStudyLesson, studyPathPosition} from '@/lib/study/catalog';
import {StudyLessonReader} from '@/components/study/StudyLessonReader';

type Search = {path?: string; fromReadiness?: string; fromLesson?: string; fromPath?:string;syllabus?:string;result?:string;fromSection?:string};

export default async function StudyLessonPage({params, searchParams}: {
 params: Promise<{lessonId: string}>; searchParams: Promise<Search>;
}) {
 const [{lessonId}, query] = await Promise.all([params, searchParams]);
 const lesson = await publicStudyLesson(lessonId);
 if (!lesson) notFound();
 const [pathway, returnLesson] = await Promise.all([
   studyPathPosition(lessonId, query.path), prerequisiteReturn(lessonId, query.fromLesson, query.fromPath,query.fromSection,query.syllabus,query.result),
 ]);
 const practiceFormats=await lessonPracticeAvailability(env.DB,lesson,pathway);
 return <StudyLessonReader lesson={lesson} pathway={pathway} returnLesson={returnLesson} practiceFormats={practiceFormats}
   syllabus={query.syllabus} result={query.result} fromReadiness={query.fromReadiness === '1'}/>;
}
