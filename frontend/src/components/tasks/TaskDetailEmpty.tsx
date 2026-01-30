/**
 * TaskDetailEmpty
 * Minimal, warm empty state when no task is selected.
 */

import { useTasks } from '../../hooks/useTasks';
import { getUserName } from '../../shared/lib/user-helpers';
import { CheckSquare } from 'lucide-react';

export function TaskDetailEmpty() {
  const { tasks } = useTasks();
  const userName = getUserName();
  const isFirstTime = tasks.length === 0;

  return (
    <div className="h-full w-full bg-theme-panel flex items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <div
          className="w-14 h-14 mx-auto mb-5 rounded-full bg-theme-sidebar flex items-center justify-center text-theme-accent"
          aria-hidden
        >
          <CheckSquare className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-theme-text mb-1">
          {userName ? `Olá, ${userName}` : 'Nada selecionado'}
        </h2>
        <p className="text-theme-muted text-sm leading-relaxed">
          {isFirstTime
            ? 'Crie sua primeira tarefa com o botão ao lado.'
            : 'Selecione uma tarefa na lista ou crie uma nova.'}
        </p>
      </div>
    </div>
  );
}
