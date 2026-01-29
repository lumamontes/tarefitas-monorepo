/**
 * Tasks Page
 * Task list and detail view
 */

import { TasksView } from '../../../components/tasks/TasksView';

export function TasksPage() {
  return (
    <main className="min-h-screen bg-theme-bg w-full" data-section="tasks">
      <TasksView />
    </main>
  );
}
