/**
 * TaskSummaryStrip Component
 * Small, minimal summary strip with progress, tags, and calendar info
 */

import { useMemo } from 'react';
import { useTasksStore } from '../../stores/tasksStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Task } from '../../types';
import { parseDateLocal } from '../../shared/lib/time.utils';

interface TaskSummaryStripProps {
  task: Task;
}

export function TaskSummaryStrip({ task }: TaskSummaryStripProps) {
  const subtasksRaw = useTasksStore((s) => s.subtasks);
  const showProgressBars = useSettingsStore((s) => s.showProgressBars);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const progress = useMemo(() => {
    const taskSubtasks = subtasksRaw.filter((s) => s.taskId === task.id);
    const completed = taskSubtasks.filter((s) => s.done).length;
    const total = taskSubtasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [task.id, subtasksRaw]);

  const hasCalendar = !!task.scheduledDate || !!task.recurring;
  const hasProgress = showProgressBars && progress.total > 0;
  
  // Don't show if nothing to display
  if (!hasProgress && !hasCalendar) {
    return null;
  }

  return (
    <div className="px-6 py-2 bg-theme-sidebar border-b border-theme-border flex items-center gap-4 text-xs text-theme-muted">
      {hasProgress && (
        <div className="flex items-center gap-2">
          <span>{progress.completed}/{progress.total}</span>
          {showProgressBars && (
            <div className="w-16 h-1 bg-theme-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-theme-accent transition-all"
                style={{
                  width: `${progress.percentage}%`,
                  transitionDuration: reduceMotion ? '0ms' : '300ms'
                }}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      )}
      
      {hasCalendar && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {task.scheduledDate ? (
            <span className="break-words">
              {parseDateLocal(task.scheduledDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          ) : task.recurring?.type === 'daily' ? (
            <span>Rotina diária</span>
          ) : task.recurring?.type === 'weekly' && task.recurring.daysOfWeek ? (
            <span className="break-words">
              Semanal: {task.recurring.daysOfWeek
                .map(d => {
                  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                  return days[d];
                })
                .join(', ')}
            </span>
          ) : (
            <span>Semanal</span>
          )}
        </div>
      )}
    </div>
  );
}
