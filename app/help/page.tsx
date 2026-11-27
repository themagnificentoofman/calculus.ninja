'use client';

import { BookOpen, Trophy, Lightbulb, Shield, Mail, ArrowRight } from 'lucide-react';

import { RankIcon } from '@/components/RankDisplay';
import { MathDisplay } from '@/components/MathDisplay';
import { AnswerFormattingGuide } from '@/components/AnswerFormattingGuide';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="space-y-12"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Help & Information</h1>
            <nav className="mt-5 flex flex-wrap gap-3 text-sm" aria-label="Help sections"><a href="#formatting" className="text-emerald-400 underline">Answer formatting guide</a><a href="#notation" className="text-emerald-400 underline">Notation</a><a href="#sources" className="text-emerald-400 underline">Sources</a><a href="#legacy" className="text-emerald-400 underline">Legacy problems</a></nav>
          </div>

          <section className="flex flex-col gap-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Have a question or feedback?</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">Report a bug, flag a balance issue, or get in touch.</p>
            </div>
            <a href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"><Mail className="h-4 w-4" aria-hidden="true" />Contact Us<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </section>

          {/* Rules */}
          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Rules & Guidelines</h2>
            </div>
            <ul className="space-y-4 text-zinc-300 leading-relaxed list-disc list-inside">
              <li><strong>No cheating:</strong> Using external calculators (like WolframAlpha, Symbolab) or AI tools during ranked matches is strictly prohibited.</li>
              <li><strong>Time limits:</strong> Rapid uses the time limit you choose, and each incorrect answer removes 5 seconds. In PvP and Multiplayer, you race against others.</li>
              <li><strong>Scoring:</strong> Correct answers increase your score and earn XP. Rating changes only after competitive matches. Incorrect answers may result in penalties depending on the game mode.</li>
              <li><strong>Match results:</strong> Players who participate rank ahead of those who submit no answers. Players who participate and tie on score share a place. PvP ends when both players finish. A target-score match also ends when a player reaches the target. Timed games use a shared deadline. Other competitive games have a 30-minute limit.</li>
              <li><strong>Respect others:</strong> Maintain a positive environment in multiplayer modes.</li>
            </ul>
          </section>

          {/* Problem Sources */}
          <section id="sources" className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Problem Sources</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Calculus Ninja offers original problems and credited adaptations. Problems are checked for mathematical accuracy, clear explanations, and readable notation. If you find an error, choose Report Issue in the answer review. For an adapted problem, its review and saved replay include the original source, an explanation of the changes, and the applicable content license. Topics include:
            </p>
            <ul className="space-y-2 text-zinc-300 list-disc list-inside">
              <li>Integration</li>
              <li>Differentiation</li>
              <li>Limits</li>
              <li>Series</li>
              <li>Differential Equations</li>
              <li>Multivariable Calculus</li>
            </ul>
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Difficulty and problem reports</h2>
            <p className="text-zinc-300 leading-relaxed">Easy problems use fundamental rules. Medium problems combine familiar techniques. A Hard problem may take several steps or require a careful check of domains or convergence. An Olympiad problem often hinges on an unexpected identity or transformation. These labels describe the reasoning involved. Your solving time may vary. A category may be unavailable while its problems are under review.</p>
            <p className="mt-4 text-zinc-400 leading-relaxed">Include the problem ID and revision from the answer review when reporting an issue. Corrections preserve the questions and results in your previous games. New rounds avoid duplicate questions and limit closely related problems. If there are too few suitable unseen problems for a requested round, choose another topic or difficulty.</p>
          </section>

          {/* Ratings */}
          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Ratings & Ranks</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed mb-6">
              In PvP and Multiplayer, your rating reflects how you finish against each opponent. Beating a higher-rated player earns more than beating a lower-rated player. A tie counts as half a win. Your rating can change by at most 32 points per match, regardless of room size or difficulty. If nobody solves a problem, everyone keeps their rating.
            </p>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Overall and topic ratings start at zero and cannot fall below zero. For a topic rating, only questions in that topic that both players attempted count. You are Unrated until your first qualifying competitive result. After that, a zero rating is Bronze.
            </p>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Every correct answer earns 10 XP (Easy), 20 XP (Medium), 30 XP (Hard), or 50 XP (Olympiad), in every mode. There are no placement bonuses. Level L requires 100 × L² total XP: level 1 needs 100, level 2 needs 400, and level 3 needs 900. Topic levels follow the same curve.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={0} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-zinc-500">Unrated</div>
                  <div className="text-sm text-zinc-500 font-mono">No rated matches</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={1} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-amber-500">Bronze</div>
                  <div className="text-sm text-zinc-500 font-mono">Below 500 (rated)</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={500} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-zinc-300">Silver</div>
                  <div className="text-sm text-zinc-500 font-mono">500 - 999</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={1000} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-yellow-500">Gold</div>
                  <div className="text-sm text-zinc-500 font-mono">1000 - 1499</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={1500} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-cyan-400">Platinum</div>
                  <div className="text-sm text-zinc-500 font-mono">1500 - 1999</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={2000} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-purple-500">Diamond</div>
                  <div className="text-sm text-zinc-500 font-mono">2000 - 2499</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <RankIcon rating={2500} className="w-8 h-8" />
                <div>
                  <div className="font-bold text-red-500">Grandmaster</div>
                  <div className="text-sm text-zinc-500 font-mono">2500+</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">History, replay &amp; analysis</h2>
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>Your stored round history has no automatic record limit. History displays 25 rounds per page; use date ranges, mode, topic, difficulty, recorded result, and replay capability to find older rounds. Filters search the full stored history. Unknown dates remain available under All dates.</p>
              <p>Replays preserve the questions you saw, their answer choices when applicable, your submitted answers, and the recorded scores. They also show recorded actions from your browser. Replay is private to participants; only your own detailed perspective and public opponent scores are shown. Solutions and analysis unlock after the entire match ends, including when you finish your questions first.</p>
              <p>Recorded playback follows the original timeline, including countdowns, penalties and captured feedback. You can pause, seek, change speed, and jump between questions or events. Analysis shows solutions separately and labels any later explanation clarifications. Viewing a replay does not submit answers, generate problems, award XP, change ratings, or alter the match result.</p>
              <p>Recording means the round is still in progress. Syncing means recorded actions are waiting to upload. Available means the recording has finished uploading; Partial means some actions or timing could not be recovered. Unavailable means the replay could not be loaded. Legacy means replay was not recorded for that round, including rounds already in progress when replay became available.</p>
              <p>Keep this device’s site data until synchronization finishes. Recordings are saved on this device as you play and uploaded again after reconnecting. Closing the browser, clearing site data, blocked browser storage, or a crash can leave a partial replay. Missing timings are labeled as unknown.</p>
              <p>History and uploaded replays are not automatically deleted. Very long or unusually active sessions can reach a recording limit and leave a partial replay. This does not change gameplay or remove the round from history. Replays do not record chat messages or account credentials.</p>
            </div>
          </section>

          <section id="legacy" className="scroll-mt-24 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Legacy problems</h2>
            <p className="text-zinc-400 leading-relaxed">Legacy marks a problem from Calculus Ninja’s earlier collection, including revised versions of those problems. In <a href="/settings" className="text-emerald-400 underline">Settings → Experimental</a>, you can include reviewed legacy problems in new Test and Rapid rounds, when available. This is off by default. Legacy problems must meet the same standards for accuracy, explanations, and answer choices as other problems.</p>
            <p className="mt-3 text-zinc-400 leading-relaxed">PvP and Multiplayer use a shared pool without legacy problems. Changing the preference keeps current rounds, saved results and replays intact. It cannot bring back withdrawn or unreviewed questions.</p>
          </section>

          <section id="notation" className="scroll-mt-24 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Mathematical notation</h2>
            <p className="mb-5 text-zinc-400">We use common mathematical conventions, with <a className="text-emerald-400 underline" href="https://mathworld.wolfram.com/NaturalLogarithm.html" target="_blank" rel="noopener noreferrer">Wolfram MathWorld</a> as a reference. Where several conventions are accepted, the choices below apply throughout Calculus Ninja.</p>
            <p className="text-zinc-300 leading-relaxed mb-5">These conventions apply to questions, answer choices, and worked solutions. Any extra symbols are defined where they are introduced; a solution uses the values in your question.</p>
            <dl className="space-y-5 text-zinc-300 leading-relaxed">
              <div><dt className="font-semibold text-white">Logarithms</dt><dd><MathDisplay math={String.raw`\ln x`}/> is the natural logarithm (base <MathDisplay math="e"/>). Other bases are written explicitly, such as <MathDisplay math={String.raw`\log_{10}x`}/> or <MathDisplay math={String.raw`\log_b x\quad(b>0,\ b\ne1)`}/>.</dd></div>
              <div><dt className="font-semibold text-white">Products and special functions</dt><dd>We use <MathDisplay math={String.raw`(a)_n=a(a+1)\cdots(a+n-1),\quad(a)_0=1`}/> for the rising factorial. Less familiar functions and symbols are defined in the problem or solution.</dd></div>
              <div><dt className="font-semibold text-white">Angles and inverse functions</dt><dd>Angles are in radians unless degrees are stated. We write <MathDisplay math={String.raw`\arcsin x,\ \arccos x,\ \arctan x`}/> for inverse trigonometric functions, and <MathDisplay math={String.raw`1/\sin x`}/> for a reciprocal. Inverse hyperbolic functions use <MathDisplay math={String.raw`\operatorname{arcsinh},\ \operatorname{arccosh},\ \operatorname{arctanh}`}/>.</dd></div>
              <div><dt className="font-semibold text-white">Derivatives and integrals</dt><dd><MathDisplay math={String.raw`f'(x),\ \frac{\mathrm{d}f}{\mathrm{d}x},\ \frac{\partial f}{\partial x}`}/> distinguish ordinary and partial derivatives. Differentials use upright <MathDisplay math={String.raw`\mathrm{d}x`}/>. An indefinite integral includes its arbitrary constant <MathDisplay math="C"/>; logarithmic antiderivatives use absolute values when the stated real domain requires them.</dd></div>
              <div><dt className="font-semibold text-white">Domains and exact answers</dt><dd>Variables are real unless a problem states otherwise. Square roots are the principal nonnegative real roots on their domain. Any complex branches, convergence conditions, or unusual special functions are specified. Answers are exact unless an approximation is requested: <MathDisplay math={String.raw`=`}/> means equality, <MathDisplay math={String.raw`\approx`}/> approximation, and <MathDisplay math={String.raw`\sim`}/> asymptotic equivalence.</dd></div>
              <div><dt className="font-semibold text-white">Reading a solution</dt><dd>Each solution explains the method and shows the essential calculation steps. Symbols are defined when they first appear, and calculations use the values in your question. If an explanation is clarified later, your original question, submitted answer, and recorded result are preserved.</dd></div>
            </dl>
          </section>

          <AnswerFormattingGuide />

          {/* Tips */}
          <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Tips & How to Practice</h2>
            </div>
            <div className="space-y-6 text-zinc-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Start with Test Mode</h3>
                <p>Use Test mode to practice without time pressure. Choose separate multiple-choice and free-response counts, totaling 1–20 questions, and put either type first or shuffle all questions uniformly. Set either count to zero for a single-format round. Topic and difficulty apply to both types. A requested mix is available only when there are enough eligible problems. After answering, read the worked solution to understand the method and check each step.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Build Speed in Rapid Mode</h3>
                <p>Once you are comfortable with the concepts, use Rapid mode to improve your mental math and pattern recognition speed. Focus on accuracy first, then speed.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Memorize Common Derivatives & Integrals</h3>
                <p>Having common rules (power rule, trig functions, exponential/logarithmic rules) memorized will significantly decrease your solve time in competitive modes.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Review Your Mistakes</h3>
                <p>Don&apos;t just guess! If you get a problem wrong, take the time to read the explanation and understand why the correct answer is what it is.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
