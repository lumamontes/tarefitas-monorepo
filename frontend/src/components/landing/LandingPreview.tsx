/**
 * Landing Preview — Mini dashboard
 * Abstract demo of the app: tasks, today, focus. Theme-aware, no real data.
 */

import { useState, useEffect } from 'react';

const DEMO_TASKS = [
  { title: 'Organizar trabalho de casa', done: false },
  { title: 'Cuidar das plantas', done: true },
  { title: 'Responder e-mails', done: false },
];

const DEMO_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DEMO_TODAY_INDEX = 2; // e.g. "terça"
const DEMO_DOTS = [false, true, true, false, true, false, false]; // days with something

export function LandingPreview() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeZone, setActiveZone] = useState<'tasks' | 'today' | 'focus'>('tasks');

  // Gentle timer tick when "focus" is running
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        setMinutes((m) => (m > 0 ? m - 1 : 25));
        return 59;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  // Cycle highlighted zone for a bit of life
  useEffect(() => {
    const order: Array<'tasks' | 'today' | 'focus'> = ['tasks', 'today', 'focus'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % order.length;
      setActiveZone(order[i]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (m: number, s: number) =>
    `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div
      className="landing-preview w-full overflow-hidden rounded-xl border border-theme-border bg-theme-panel shadow-sm"
      aria-label="Prévia do app — mini dashboard"
    >
      {/* Abstract app chrome: thin nav strip */}
      <div className="flex border-b border-theme-border bg-theme-sidebar/60">
        <div className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-theme-border py-3">
          <NavIcon
            icon="tasks"
            label="Tarefas"
            active={activeZone === 'tasks'}
            aria-hidden
          />
          <NavIcon
            icon="calendar"
            label="Calendário"
            active={activeZone === 'today'}
            aria-hidden
          />
          <NavIcon
            icon="focus"
            label="Foco"
            active={activeZone === 'focus'}
            aria-hidden
          />
        </div>

        {/* Dashboard grid */}
        <div className="flex-1 min-w-0 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Tarefas */}
            <div
              className={`rounded-lg border bg-theme-bg/50 p-3 transition-colors ${
                activeZone === 'tasks' ? 'border-theme-accent/50' : 'border-theme-border'
              }`}
            >
              <p className="mb-2 text-[10px] uppercase tracking-wider text-theme-muted font-medium">
                Tarefas
              </p>
              <ul className="space-y-1.5" aria-hidden>
                {DEMO_TASKS.map((task, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-sm border ${
                        task.done ? 'border-theme-accent bg-theme-accent' : 'border-theme-border bg-theme-panel'
                      }`}
                    />
                    <span
                      className={`truncate text-xs ${
                        task.done ? 'text-theme-muted line-through' : 'text-theme-text'
                      }`}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hoje / Calendário */}
            <div
              className={`rounded-lg border bg-theme-bg/50 p-3 transition-colors ${
                activeZone === 'today' ? 'border-theme-accent/50' : 'border-theme-border'
              }`}
            >
              <p className="mb-2 text-[10px] uppercase tracking-wider text-theme-muted font-medium">
                Hoje
              </p>
              <div className="flex items-center gap-1" aria-hidden>
                {DEMO_DAYS.map((day, i) => (
                  <span
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium ${
                      i === DEMO_TODAY_INDEX
                        ? 'bg-theme-accent text-white'
                        : DEMO_DOTS[i]
                          ? 'bg-theme-accent/20 text-theme-text'
                          : 'text-theme-muted'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-theme-muted">2 tarefas hoje</p>
            </div>

            {/* Foco — spans both columns on sm */}
            <div
              className={`rounded-lg border bg-theme-bg/50 p-3 sm:col-span-2 transition-colors ${
                activeZone === 'focus' ? 'border-theme-accent/50' : 'border-theme-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-accent/15 text-theme-accent">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-theme-muted font-medium">
                      Sessão de foco
                    </p>
                    <p className="font-mono text-lg font-semibold tabular-nums text-theme-text" aria-live="polite">
                      {formatTime(minutes, seconds)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRunning((r) => !r)}
                  className="flex h-8 min-w-[72px] items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: isRunning ? 'var(--border)' : 'var(--accent)',
                    color: isRunning ? 'var(--text)' : '#fff',
                  }}
                  aria-pressed={isRunning}
                  aria-label={isRunning ? 'Pausar' : 'Iniciar'}
                >
                  {isRunning ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                      Pausar
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                      Iniciar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="border-t border-theme-border px-4 py-2 text-center text-[10px] text-theme-muted">
        Prévia do app — tarefas, calendário e foco
      </p>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  active,
  ...props
}: {
  icon: 'tasks' | 'calendar' | 'focus';
  label: string;
  active: boolean;
} & React.SVGAttributes<SVGSVGElement>) {
  const base = 'flex h-8 w-8 items-center justify-center rounded-lg transition-colors';
  const activeClass = active ? 'bg-theme-accent/20 text-theme-accent' : 'text-theme-muted';
  return (
    <span
      className={`${base} ${activeClass}`}
      title={label}
      aria-hidden
    >
      {icon === 'tasks' && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )}
      {icon === 'calendar' && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
      {icon === 'focus' && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </span>
  );
}
