'use client';
export function CancelledRound({onSettings,error}:{onSettings:()=>void;error:string}){
 return <main className="min-h-screen flex items-center justify-center p-4"><section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center">
  <h1 className="text-2xl font-bold">Round cancelled</h1>
  <p className="my-4 text-zinc-400">This round has ended. Choose your settings to start another round.</p>
  {error&&<p role="alert" className="my-4 text-sm text-red-300">{error}</p>}
  <button onClick={onSettings} className="min-h-11 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black">Choose settings</button>
  <a href="/" className="mt-3 block min-h-11 py-3 text-zinc-300 underline">Back to Dashboard</a>
 </section></main>;
}
