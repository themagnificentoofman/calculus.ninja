import {useId} from 'react';
import type {StudyBlock} from '@/lib/study/contracts';

type DiagramId=Extract<StudyBlock,{kind:'diagram'}>['id'];
export function StudyDiagram({id}:{id:DiagramId}) {
 const uid=useId();
 if(id==='constant-slope-rows'){
  const times=[-1,0,1], heights=[0,2,4];
  const x=(time:number)=>190+65*time;
  const y=(height:number)=>300-65*height;
  const halfStep=0.2;
  return <figure id={`diagram-${id}`} className="scroll-mt-24 my-6 rounded-2xl border border-zinc-700 bg-zinc-950 p-3 sm:p-5">
   <svg viewBox="0 0 380 370" className="mx-auto w-full max-w-sm" role="img" aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-desc`}>
    <title id={`${uid}-title`}>Slope field for y prime equals two minus y</title>
    <desc id={`${uid}-desc`}>At times minus one, zero and one, each row has the same slope. The segments rise with slope two at height zero, are horizontal at height two, and fall with slope minus two at height four.</desc>
    <g stroke="#52525b" strokeDasharray="3 5">
     {times.map(t=><line key={t} x1={x(t)} x2={x(t)} y1="14" y2="330"/>)}
     {heights.map(h=><line key={h} x1="90" x2="290" y1={y(h)} y2={y(h)}/>)}
    </g>
    <path d="M90 300 H290 M190 330 V14" fill="none" stroke="#a1a1aa" strokeWidth="1.5"/>
    <g stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round">
     {heights.flatMap(height=>times.map(time=>{
      const slope=2-height;
      return <line key={`${time},${height}`} x1={x(time-halfStep)} y1={y(height-slope*halfStep)}
       x2={x(time+halfStep)} y2={y(height+slope*halfStep)}/>;
     }))}
    </g>
    <g fill="#e4e4e7" fontSize="18" textAnchor="middle">
     {heights.map(h=><text key={h} x="76" y={y(h)+6}>{h}</text>)}
     {times.map(t=><text key={t} x={x(t)} y="347">{t}</text>)}
     <text x="50" y="17">Height y</text><text x="190" y="367">Time t</text>
    </g>
   </svg>
   <figcaption className="mt-2 text-sm leading-relaxed text-zinc-400">Read each segment from left to right to see how the solution changes as time increases. Both axes use the same scale per unit.</figcaption>
  </figure>;
 }
 if(id==='signed-area')return <figure id={`diagram-${id}`} className="scroll-mt-24 my-6 rounded-2xl border border-zinc-700 bg-zinc-950 p-3 sm:p-5">
  <svg viewBox="0 0 560 320" className="w-full" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
   <title id={`${uid}-title`}>Signed area under the rate t minus one</title>
   <desc id={`${uid}-desc`}>From t equals zero to one, a triangle below the axis has signed area minus one half. From one to three, a triangle above the axis has area two. The net integral is three halves and the total area is five halves.</desc>
   <path d="M60 210 L60 280 L200 210 Z" fill="#fb923c" fillOpacity="0.25" stroke="#fb923c" strokeDasharray="5 4"/>
   <path d="M200 210 L480 70 L480 210 Z" fill="#34d399" fillOpacity="0.2" stroke="#34d399"/>
   <path d="M35 210 H515 M60 295 V35" fill="none" stroke="#a1a1aa" strokeWidth="1.5"/>
   <path d="M60 280 L480 70" stroke="#e4e4e7" strokeWidth="3"/>
   <g fill="#d4d4d8" fontSize="24"><text x="510" y="235">t</text><text x="18" y="35">f(t)</text><text x="47" y="233">0</text><text x="195" y="233">1</text><text x="475" y="233">3</text><text x="30" y="78">2</text><text x="23" y="285">−1</text></g>
   <text x="91" y="254" fill="#fdba74" fontSize="26">−1/2</text><text x="350" y="177" fill="#6ee7b7" fontSize="26">+2</text>
  </svg>
  <figcaption className="mt-2 text-sm leading-relaxed text-zinc-400">Below the axis, the contribution is negative. Total geometric area adds the magnitudes of both triangles.</figcaption>
 </figure>;
 const X=(t:number)=>60+(t-1.25)/1.5*440;
 const Y=(s:number)=>280-s/25*240;
 const curve=Array.from({length:81},(_,i)=>{const t=1.25+i*1.5/80;return `${i?'L':'M'}${X(t).toFixed(3)} ${Y(t*t*t-2*t+7).toFixed(3)}`;}).join(' ');
 return <figure id={`diagram-${id}`} className="scroll-mt-24 my-6 rounded-2xl border border-zinc-700 bg-zinc-950 p-3 sm:p-5">
  <svg viewBox="0 0 560 340" className="w-full" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
   <title id={`${uid}-title`}>Cubic position and its tangent at two seconds</title>
   <desc id={`${uid}-desc`}>The curve s equals t cubed minus two t plus seven meets its tangent eleven plus ten times t minus two at the point two, eleven. At that point their slopes agree. The curve bends above the tangent on this displayed interval.</desc>
   <path d="M45 280 H520 M60 290 V30" fill="none" stroke="#a1a1aa" strokeWidth="1.5"/>
   <path d={`M${X(1.25)} ${Y(3.5)} L${X(2.75)} ${Y(18.5)}`} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="8 5"/>
   <path d={curve} fill="none" stroke="#34d399" strokeWidth="3"/>
   <path d={`M${X(2)} 280 V${Y(11)} H60`} fill="none" stroke="#71717a" strokeDasharray="3 4"/>
   <circle cx={X(2)} cy={Y(11)} r="5" fill="#fafafa"/>
   <g fill="#d4d4d8" fontSize="24"><text x="450" y="330">t (s)</text><text x="12" y="22">s (m)</text><text x="47" y="304">1.25</text><text x={X(2)-5} y="304">2</text><text x="485" y="304">2.75</text><text x="30" y={Y(11)+5}>11</text><text x={X(2)+10} y={Y(11)+22}>(2, 11)</text></g>
   <text x="325" y="50" fill="#6ee7b7" fontSize="24">Position</text><text x="385" y="147" fill="#fcd34d" fontSize="24">Tangent</text>
  </svg>
  <figcaption className="mt-2 text-sm leading-relaxed text-zinc-400">The tangent matches the position and velocity at two seconds. Its error grows as you move away from that point. The horizontal axis shows 1.25 to 2.75 seconds.</figcaption>
 </figure>;
}
