/**
 * Task item component
 * Individual task display with subtasks
 */

import { useState } from 'react';
import { Task, useTaskStore } from '..';
import { formatDateDisplay, getTimeDistance } from '../../../shared/lib/time.utils';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Button } from '../../../shared/ui';
import { toast } from '../../../shared/ui/toast.component';

interface TaskItemProps {
  task: Task;
  showDate?: boolean;
  hideProgress?: boolean;
}

export function TaskItem({ task, showDate = false, hideProgress = false }: TaskItemProps) {
  const { updateTask, deleteTask, updateSubtask } = useTaskStore();
  const showTimeDistanceLabels = useSettingsStore((s) => s.showTimeDistanceLabels);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleComplete = async () => {
    const newState = task.state === 'completed' ? 'active' : 'completed';
    await updateTask(task.id, { state: newState });
    toast.success(newState === 'completed' ? 'Task completed' : 'Task reactivated');
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    await updateSubtask(task.id, subtaskId, { completed: !currentCompleted });
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(task.id);
      toast.info('Task deleted');
    }
  };

  const timeDistance = task.date ? getTimeDistance(task.date) : null;
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

  return (
    <article className={`p-4 rounded-xl border border-theme-border bg-theme-panel ${
      task.state === 'completed' ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={task.state === 'completed'}
              onChange={handleToggleComplete}
              className="mt-1 w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
              aria-label={`Mark task "${task.title}" as ${task.state === 'completed' ? 'active' : 'completed'}`}
            />
            <div className="flex-1">
              <h3 className={`text-base font-medium text-theme-text ${
                task.state === 'completed' ? 'line-through' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-theme-muted mt-1">{task.description}</p>
              )}
              {showDate && task.date && (
                <div className="flex items-center gap-2 mt-2 text-xs text-theme-muted">
                  <span>{formatDateDisplay(task.date)}</span>
                  {showTimeDistanceLabels && timeDistance && (
                    <span className={`px-2 py-0.5 rounded-full ${
                      timeDistance === 'today' ? 'bg-blue-100 text-blue-800' :
                      timeDistance === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                      timeDistance === 'past' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {timeDistance}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.subtasks.length > 0 && (
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-theme-sidebar text-theme-muted hover:text-theme-text transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          <button
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-theme-muted hover:text-red-600 transition-colors"
            onClick={handleDelete}
            aria-label={`Delete task "${task.title}"`}
          >
            ×
          </button>
        </div>
      </div>

      {!hideProgress && totalSubtasks > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-theme-sidebar rounded-full overflow-hidden">
            <div
              className="h-full bg-theme-accent transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-valuenow={completedSubtasks}
              aria-valuemin={0}
              aria-valuemax={totalSubtasks}
              aria-label={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            />
          </div>
          <p className="text-xs text-theme-muted mt-1">
            {completedSubtasks} of {totalSubtasks} subtasks completed
          </p>
        </div>
      )}

      {isExpanded && task.subtasks.length > 0 && (
        <ul className="mt-4 space-y-2 pl-8" aria-label="Subtasks">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(subtask.id, subtask.completed)}
                className="w-4 h-4 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                id={`subtask-${subtask.id}`}
              />
              <label
                htmlFor={`subtask-${subtask.id}`}
                className={`text-sm ${
                  subtask.completed
                    ? 'line-through text-theme-muted'
                    : 'text-theme-text'
                }`}
              >
                {subtask.title}
              </label>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
