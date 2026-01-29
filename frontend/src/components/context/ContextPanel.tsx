/**
 * ContextPanel Component
 * Working memory support for ADHD users
 * Persistent "What was I doing?" reminder with breadcrumbs
 */

import { useNDStore } from '../../stores/ndStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { selectTask } from '../../stores/tasksStore';
import { Clock, ArrowLeft, Coffee } from 'lucide-react';
import { Button } from '../ui/Button';

export function ContextPanel() {
  const contextState = useNDStore((s) => s.contextState);
  const tasks = useTasksStore((s) => s.tasks);
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId);
  const currentSection = useSettingsStore((s) => s.currentSection);
  const contextReminders = useSettingsStore((s) => s.ndSettings?.contextReminders);
  const hyperfocusBreaks = useSettingsStore((s) => s.ndSettings?.hyperfocusBreaks);
  const needsBreak = useNDStore((s) => s.needsBreakReminder());
  const focusDuration = useNDStore((s) => s.getFocusSessionDuration());

  if (!contextReminders) {
    return null;
  }

  const currentTask = tasks.find(t => t.id === contextState.currentTask);
  const previousTask = tasks.find(t => t.id === contextState.previousTask);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleReturnToPrevious = () => {
    if (previousTask) {
      selectTask(previousTask.id);
    }
  };

  return (
    <div className="bg-theme-accent/5 border border-theme-accent/20 rounded-xl p-4 space-y-3">
      {/* Current Context */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-theme-accent rounded-full animate-pulse" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-theme-text">
            Onde você está
          </h3>
          <p className="text-xs text-theme-muted">
            {currentSection === 'tasks' && 'Gerenciando tarefas'}
            {currentSection === 'pomodoro' && 'Sessão de foco'}
            {currentSection === 'calendar' && 'Visualizando calendário'}
            {currentSection === 'configuracoes' && 'Ajustando configurações'}
          </p>
        </div>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="bg-white/50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-theme-text mb-1">
            Tarefa Atual
          </h4>
          <p className="text-sm text-theme-text line-clamp-2">
            {currentTask.title}
          </p>
          {contextState.sessionStart && (
            <div className="flex items-center gap-1 mt-2 text-xs text-theme-muted">
              <Clock className="w-3 h-3" />
              <span>
                Iniciada há {formatDuration(focusDuration)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Break Reminder */}
      {needsBreak && hyperfocusBreaks && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800">
            <Coffee className="w-4 h-4" />
            <span className="text-sm font-medium">
              Hora de uma pausa!
            </span>
          </div>
          <p className="text-xs text-orange-700 mt-1">
            Você está focado há {formatDuration(focusDuration)}. Que tal fazer uma pausa?
          </p>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {previousTask && previousTask.id !== selectedTaskId && (
        <div className="border-t border-theme-border pt-3">
          <Button
            onClick={handleReturnToPrevious}
            variant="ghost"
            size="small"
            className="w-full text-left justify-start"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            <span className="text-xs">
              Voltar para: {previousTask.title.slice(0, 30)}
              {previousTask.title.length > 30 && '...'}
            </span>
          </Button>
        </div>
      )}

      {/* Today's Progress */}
      <div className="border-t border-theme-border pt-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-theme-muted">Hoje</span>
          <div className="text-right">
            <div className="text-sm font-semibold text-theme-accent">
              {contextState.todayCompletions}
            </div>
            <div className="text-xs text-theme-muted">
              {contextState.todayCompletions === 1 ? 'tarefa' : 'tarefas'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}