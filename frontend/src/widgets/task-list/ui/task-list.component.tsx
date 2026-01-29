/**
 * Task list widget
 * Displays tasks in a calm, accessible way
 */

import { Task } from '../../../entities/task';
import { TaskItem } from '../../../entities/task/ui/task-item.component';
import { usePauseMode } from '../../../features/use-pause-mode';

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  showDate?: boolean;
}

export function TaskList({ tasks, emptyMessage = 'No tasks', showDate = false }: TaskListProps) {
  const { isPaused } = usePauseMode();

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-theme-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} showDate={showDate} hideProgress={isPaused} />
        </li>
      ))}
    </ul>
  );
}
