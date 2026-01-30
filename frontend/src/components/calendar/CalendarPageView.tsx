/**
 * CalendarPageView Component
 * Folder-like calendar: Year (folder) > Month (folder) > Day (folder) > tasks
 * Only years/months/days that have tasks are shown. Empty state: current year > current month > current day.
 * ND-safe: Outline view, easy to copy, similar to Obsidian/Notion
 */

import { useState, useMemo, useCallback } from 'react';
import {
  useTasksStore,
  getScheduledTasksForDate,
  getRecurringTasksForDate,
  getTaskProgress,
  selectTask,
  updateTask,
} from '../../stores/tasksStore';
import { useTasks } from '../../hooks/useTasks';
import { useAllSubtasks } from '../../hooks/useSubtasks';
import { useSettingsStore } from '../../stores/settingsStore';
import { setCurrentSection } from '../../stores/settingsStore';
import { parseDateLocal, getTodayString, getDateStringsInMonth } from '../../shared/lib/time.utils';
import { CalendarAssignModal } from './CalendarAssignModal';
import { ChevronDown, ChevronRight, Folder, FolderOpen, X } from 'lucide-react';

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function dayHasTasks(tasks: import('../../types').Task[], dateStr: string): boolean {
  return (
    getScheduledTasksForDate(tasks, dateStr).length > 0 ||
    getRecurringTasksForDate(tasks, dateStr).length > 0
  );
}

export function CalendarPageView() {
  const { tasks } = useTasks();
  const { subtasks } = useAllSubtasks();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const density = useSettingsStore((s) => s.density);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const showProgressBars = useSettingsStore((s) => s.showProgressBars);

  const todayStr = getTodayString();
  const today = parseDateLocal(todayStr);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Folder structure: only years/months/days that have tasks; empty state = current year > current month > current day
  const folderStructure = useMemo(() => {
    const yearsSet = new Set<number>();
    for (const t of tasks) {
      if (t.archived) continue;
      if (t.scheduledDate) {
        const y = parseInt(t.scheduledDate.slice(0, 4), 10);
        yearsSet.add(y);
      }
    }
    if (yearsSet.size === 0) yearsSet.add(currentYear);

    const monthsByYear: Record<number, number[]> = {};
    for (const year of yearsSet) {
      const months: number[] = [];
      for (let m = 0; m < 12; m++) {
        const daysInMonth = getDateStringsInMonth(year, m);
        const hasAny = daysInMonth.some((d) => dayHasTasks(tasks, d));
        if (hasAny) months.push(m);
      }
      if (months.length === 0 && year === currentYear) months.push(currentMonth);
      monthsByYear[year] = months;
    }

    const daysByYearMonth: Record<string, string[]> = {};
    for (const year of yearsSet) {
      for (const month of monthsByYear[year] ?? []) {
        const key = `${year}-${month}`;
        const daysInMonth = getDateStringsInMonth(year, month);
        const daysWithTasks = daysInMonth.filter((d) => dayHasTasks(tasks, d));
        const days =
          daysWithTasks.length > 0
            ? daysWithTasks
            : year === currentYear && month === currentMonth
              ? [todayStr]
              : [];
        daysByYearMonth[key] = days;
      }
    }

    return {
      years: Array.from(yearsSet).sort((a, b) => a - b),
      monthsByYear,
      daysByYearMonth,
    };
  }, [tasks, currentYear, currentMonth, todayStr]);

  // Expanded state: which folder nodes are open. Default: current year, current month, current day
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set([currentYear]));
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    () => new Set([`${currentYear}-${currentMonth}`])
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set([todayStr]));

  const [assignModalDate, setAssignModalDate] = useState<string | null>(null);

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }, []);

  const toggleMonth = useCallback((year: number, month: number) => {
    const key = `${year}-${month}`;
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleDay = useCallback((dateStr: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const years = new Set(folderStructure.years);
    const months = new Set<string>();
    const days = new Set<string>();
    for (const year of folderStructure.years) {
      for (const month of folderStructure.monthsByYear[year] ?? []) {
        months.add(`${year}-${month}`);
        for (const d of folderStructure.daysByYearMonth[`${year}-${month}`] ?? []) {
          days.add(d);
        }
      }
    }
    setExpandedYears(years);
    setExpandedMonths(months);
    setExpandedDays(days);
  }, [folderStructure]);

  const collapseAll = useCallback(() => {
    setExpandedYears(new Set());
    setExpandedMonths(new Set());
    setExpandedDays(new Set());
  }, []);

  const transitionClass = reduceMotion ? '' : 'transition-all duration-200';
  const paddingClass = density === 'compact' ? 'p-4' : 'p-6';

  return (
    <div
      data-section="calendar-page"
      className={`h-full flex flex-col bg-theme-panel overflow-hidden ${transitionClass}`}
    >
      <div className={`${paddingClass} flex-shrink-0 border-b border-theme-border`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-medium text-theme-muted hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent rounded px-2 py-1"
          >
            Expandir pastas
          </button>
          <span className="text-theme-border">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-medium text-theme-muted hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent rounded px-2 py-1"
          >
            Recolher pastas
          </button>
        </div>
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto ${paddingClass}`}>
        {folderStructure.years.map((year) => (
          <YearFolder
            key={year}
            year={year}
            months={folderStructure.monthsByYear[year] ?? []}
            daysByMonth={folderStructure.daysByYearMonth}
            isExpanded={expandedYears.has(year)}
            onToggle={() => toggleYear(year)}
            expandedMonths={expandedMonths}
            expandedDays={expandedDays}
            toggleMonth={toggleMonth}
            toggleDay={toggleDay}
            onAssignDate={setAssignModalDate}
            tasks={tasks}
            subtasks={subtasks}
            reduceMotion={reduceMotion}
            density={density}
            fontScale={fontScale}
            showProgressBars={showProgressBars}
            transitionClass={transitionClass}
          />
        ))}
      </div>

      {assignModalDate && (
        <CalendarAssignModal
          dateStr={assignModalDate}
          onClose={() => setAssignModalDate(null)}
          onAssign={() => {}}
        />
      )}
    </div>
  );
}

interface YearFolderProps {
  year: number;
  months: number[];
  daysByMonth: Record<string, string[]>;
  isExpanded: boolean;
  onToggle: () => void;
  expandedMonths: Set<string>;
  expandedDays: Set<string>;
  toggleMonth: (year: number, month: number) => void;
  toggleDay: (dateStr: string) => void;
  onAssignDate: (dateStr: string | null) => void;
  tasks: import('../../types').Task[];
  subtasks: import('../../types').Subtask[];
  reduceMotion: boolean;
  density: 'comfortable' | 'compact';
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  showProgressBars: boolean;
  transitionClass: string;
}

function YearFolder({
  year,
  months,
  daysByMonth,
  isExpanded,
  onToggle,
  expandedMonths,
  expandedDays,
  toggleMonth,
  toggleDay,
  onAssignDate,
  tasks,
  subtasks,
  reduceMotion,
  density,
  fontScale,
  showProgressBars,
  transitionClass,
}: YearFolderProps) {
  const fontCls =
    fontScale === 'sm' ? 'text-base' : fontScale === 'lg' ? 'text-2xl' : fontScale === 'xl' ? 'text-3xl' : 'text-lg';

  return (
    <section className="mb-4" role="tree" aria-label={`Ano ${year}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left py-2 px-2 rounded-lg hover:bg-theme-sidebar focus:outline-none focus:ring-2 focus:ring-theme-accent"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `Fechar ano ${year}` : `Abrir ano ${year}`}
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="w-5 h-5 text-theme-muted shrink-0" aria-hidden />
        )}
        {isExpanded ? (
          <FolderOpen className="w-5 h-5 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <Folder className="w-5 h-5 text-theme-muted shrink-0" aria-hidden />
        )}
        <span className={`font-semibold text-theme-text ${fontCls}`}>{year}</span>
      </button>
      {isExpanded && (
        <div className="ml-6 pl-2 border-l border-theme-border space-y-1" role="group">
          {months.map((monthIndex) => (
            <MonthFolder
              key={`${year}-${monthIndex}`}
              year={year}
              monthIndex={monthIndex}
              monthName={MONTHS[monthIndex]}
              days={daysByMonth[`${year}-${monthIndex}`] ?? []}
              isExpanded={expandedMonths.has(`${year}-${monthIndex}`)}
              onToggle={() => toggleMonth(year, monthIndex)}
              expandedDays={expandedDays}
              toggleDay={toggleDay}
              onAssignDate={onAssignDate}
              tasks={tasks}
              subtasks={subtasks}
              reduceMotion={reduceMotion}
              density={density}
              fontScale={fontScale}
              showProgressBars={showProgressBars}
              transitionClass={transitionClass}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface MonthFolderProps {
  year: number;
  monthIndex: number;
  monthName: string;
  days: string[];
  isExpanded: boolean;
  onToggle: () => void;
  expandedDays: Set<string>;
  toggleDay: (dateStr: string) => void;
  onAssignDate: (dateStr: string | null) => void;
  tasks: import('../../types').Task[];
  subtasks: import('../../types').Subtask[];
  reduceMotion: boolean;
  density: 'comfortable' | 'compact';
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  showProgressBars: boolean;
  transitionClass: string;
}

function MonthFolder({
  year,
  monthIndex,
  monthName,
  days,
  isExpanded,
  onToggle,
  expandedDays,
  toggleDay,
  onAssignDate,
  tasks,
  subtasks,
  reduceMotion,
  density,
  fontScale,
  showProgressBars,
  transitionClass,
}: MonthFolderProps) {
  const fontCls =
    fontScale === 'sm' ? 'text-sm' : fontScale === 'lg' ? 'text-lg' : fontScale === 'xl' ? 'text-xl' : 'text-base';

  return (
    <section className="py-1" role="treeitem" aria-label={`Mês ${monthName}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md hover:bg-theme-sidebar focus:outline-none focus:ring-2 focus:ring-theme-accent"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="w-4 h-4 text-theme-muted shrink-0" aria-hidden />
        )}
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <Folder className="w-4 h-4 text-theme-muted shrink-0" aria-hidden />
        )}
        <span className={`font-medium text-theme-text capitalize ${fontCls}`}>{monthName}</span>
      </button>
      {isExpanded && (
        <div className="ml-5 pl-2 border-l border-theme-border space-y-1" role="group">
          {days.map((dateStr) => (
            <DaySection
              key={dateStr}
              dateStr={dateStr}
              isExpanded={expandedDays.has(dateStr)}
              onToggle={() => toggleDay(dateStr)}
              onAssignDate={onAssignDate}
              tasks={tasks}
              subtasks={subtasks}
              reduceMotion={reduceMotion}
              density={density}
              fontScale={fontScale}
              showProgressBars={showProgressBars}
              transitionClass={transitionClass}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface DaySectionProps {
  dateStr: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAssignDate: (dateStr: string | null) => void;
  tasks: import('../../types').Task[];
  subtasks: import('../../types').Subtask[];
  reduceMotion: boolean;
  density: 'comfortable' | 'compact';
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  showProgressBars: boolean;
  transitionClass: string;
}

function DaySection({
  dateStr,
  isExpanded,
  onToggle,
  onAssignDate,
  tasks,
  subtasks,
  reduceMotion,
  density,
  fontScale,
  showProgressBars,
  transitionClass,
}: DaySectionProps) {
  const todayStr = getTodayString();
  const date = parseDateLocal(dateStr);
  const dayNum = date.getDate();
  const isToday = dateStr === todayStr;
  const scheduledTasks = useMemo(() => getScheduledTasksForDate(tasks, dateStr), [tasks, dateStr]);
  const recurringTasks = useMemo(() => getRecurringTasksForDate(tasks, dateStr), [tasks, dateStr]);
  const hasTasks = scheduledTasks.length > 0 || recurringTasks.length > 0;

  const fontCls =
    fontScale === 'sm' ? 'text-xs' : fontScale === 'lg' ? 'text-sm' : fontScale === 'xl' ? 'text-base' : 'text-xs';
  const paddingClass = density === 'compact' ? 'p-2' : 'p-3';
  const spacingClass = density === 'compact' ? 'space-y-1.5' : 'space-y-2';

  return (
    <section className="py-0.5" role="treeitem" aria-label={isToday ? `Hoje, dia ${dayNum}` : `Dia ${dayNum}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 w-full text-left py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-theme-accent hover:bg-theme-sidebar/80 ${transitionClass}`}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden />
        )}
        {isExpanded ? (
          <FolderOpen className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden />
        ) : (
          <Folder className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden />
        )}
        <span className={`${fontCls} ${isToday ? 'font-semibold text-theme-text' : 'text-theme-muted'}`}>
          {isToday ? `Hoje (${dayNum})` : `dia ${dayNum}`}
        </span>
        {hasTasks && (
          <span className="text-theme-muted text-xs ml-1">
            {scheduledTasks.length + recurringTasks.length} tarefa{scheduledTasks.length + recurringTasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>
      {isExpanded && (
        <div className={`ml-5 pl-2 border-l border-theme-border ${spacingClass}`}>
          {!hasTasks ? (
            <div className={`${paddingClass} rounded-lg bg-theme-sidebar/50 border border-theme-border`}>
              <p className={`text-theme-muted ${fontCls} mb-2`}>Nenhuma tarefa neste dia.</p>
              <button
                type="button"
                onClick={() => onAssignDate(dateStr)}
                className="text-xs font-medium text-theme-accent hover:underline focus:outline-none focus:ring-2 focus:ring-theme-accent rounded"
              >
                + Associar tarefa
              </button>
            </div>
          ) : (
            <>
              {scheduledTasks.length > 0 && (
                <div>
                  <p className={`text-theme-muted ${fontCls} mb-1`}>Tarefas do dia</p>
                  <div className={spacingClass}>
                    {scheduledTasks.map((task) => (
                      <DayTaskRow
                        subtasks={subtasks}
                        key={task.id}
                        task={task}
                        onUnassign={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, { scheduledDate: undefined });
                        }}
                        reduceMotion={reduceMotion}
                        density={density}
                        fontScale={fontScale}
                        showProgressBars={showProgressBars}
                        transitionClass={transitionClass}
                      />
                    ))}
                  </div>
                </div>
              )}
              {recurringTasks.length > 0 && (
                <div>
                  <p className={`text-theme-muted ${fontCls} mb-1`}>Rotinas</p>
                  <div className={spacingClass}>
                    {recurringTasks.map((task) => (
                      <DayTaskRow
                        subtasks={subtasks}
                        key={task.id}
                        task={task}
                        isRecurring
                        reduceMotion={reduceMotion}
                        density={density}
                        fontScale={fontScale}
                        showProgressBars={showProgressBars}
                        transitionClass={transitionClass}
                      />
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => onAssignDate(dateStr)}
                className="text-xs font-medium text-theme-accent hover:underline focus:outline-none focus:ring-2 focus:ring-theme-accent rounded"
              >
                + Associar tarefa
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

interface DayTaskRowProps {
  task: { id: string; title: string; description?: string; recurring?: { type: string } };
  subtasks: import('../../types').Subtask[];
  onUnassign?: (e: React.MouseEvent) => void;
  isRecurring?: boolean;
  reduceMotion: boolean;
  density: 'comfortable' | 'compact';
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  showProgressBars: boolean;
  transitionClass: string;
}

function DayTaskRow({
  task,
  subtasks,
  onUnassign,
  isRecurring = false,
  reduceMotion,
  density,
  fontScale,
  showProgressBars,
  transitionClass,
}: DayTaskRowProps) {
  const progress = getTaskProgress(subtasks, task.id);
  const paddingClass = density === 'compact' ? 'p-2' : 'p-3';

  const handleClick = () => {
    setCurrentSection('tasks');
    selectTask(task.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`w-full text-left ${paddingClass} bg-theme-sidebar border border-theme-border rounded-lg hover:border-theme-accent hover:bg-theme-bg focus:outline-none focus:ring-2 focus:ring-theme-accent cursor-pointer ${transitionClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={
                fontScale === 'sm' ? 'text-sm' : fontScale === 'lg' ? 'text-base' : fontScale === 'xl' ? 'text-lg' : 'text-sm'
              }
            >
              {task.title}
            </span>
            {isRecurring && (
              <span className="text-theme-muted text-xs bg-theme-bg px-1.5 py-0.5 rounded">
                {task.recurring?.type === 'daily' ? 'Diária' : 'Semanal'}
              </span>
            )}
          </div>
          {showProgressBars && progress.total > 0 && (
            <div className="mt-1 text-theme-muted text-xs">
              {progress.completed}/{progress.total}
            </div>
          )}
        </div>
        {onUnassign && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnassign(e);
            }}
            className="p-1 text-theme-muted hover:text-theme-text rounded focus:outline-none focus:ring-2 focus:ring-theme-accent"
            aria-label="Remover deste dia"
            title="Remover deste dia"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
