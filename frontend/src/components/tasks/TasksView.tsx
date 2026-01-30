/**
 * TasksView Component
 * 3-column layout: Sidebar (filters) + TaskListPanel + TaskDetailPanel
 */

import { useTasksStore } from '../../stores/tasksStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNDStore } from '../../stores/ndStore';
import { useTasks } from '../../hooks/useTasks';
import { addTask, updateTask, deleteTask } from '../../stores/tasksStore';
import { shouldShowCelebration, getCelebrationLevel } from '../../stores/ndStore';
import { TaskDetail } from './TaskDetail';
import { TaskDetailEmpty } from './TaskDetailEmpty';
import { TaskListPanel } from './TaskListPanel';
import { TaskForm } from './TaskForm';
import { CelebrationOverlay } from '../celebration/CelebrationOverlay';
import { ResizableHandle } from '../ui/ResizableHandle';
import { Button } from '../ui/Button';
import { useResizablePanels } from '../../hooks/useResizablePanels';
import { toast } from '../../shared/ui/toast.component';
import { useState, useEffect } from 'react';
import type { Task } from '../../types';

export function TasksView() {
  const { tasks } = useTasks();
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const contextState = useNDStore((s) => s.contextState);
  const streakMessage = useNDStore((s) => s.getStreakMessage());
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showDecompositionPrompt, setShowDecompositionPrompt] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<'small' | 'medium' | 'large'>('small');

  // Resizable panels functionality
  const {
    leftPanelWidth,
    isResizing,
    containerRef,
    startResize,
    handleKeyDown
  } = useResizablePanels({
    defaultLeftWidth: 320,
    minLeftWidth: 280,
    maxLeftWidth: 600,
    storageKey: 'task-panels-width'
  });

  // Handle task completion celebrations
  useEffect(() => {
    if (shouldShowCelebration()) {
      setCelebrationLevel(getCelebrationLevel());
      setShowCelebration(true);
    }
  }, [contextState.totalCompletions]);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const selectedTask = selectedTaskId 
    ? tasks.find(t => t.id === selectedTaskId) 
    : null;

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setShowTaskForm(false);
        setEditingTask(undefined);
      } else {
        const newTaskId = await addTask(taskData);
        useTasksStore.getState().selectTask(newTaskId);
        setShowTaskForm(false);
        setEditingTask(undefined);
        setShowDecompositionPrompt(newTaskId);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Tauri app') || msg.includes('pnpm tauri dev')) {
        toast.error('Tasks are saved only in the Tauri app. Run: pnpm tauri dev');
      } else {
        toast.error(msg || 'Failed to save task');
      }
    }
  };

  const handleCancelTask = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const handleSelectTask = (taskId: string) => {
    useTasksStore.getState().selectTask(taskId);
    setShowTaskForm(false);
  };

  // Create/edit task: centered overlay with backdrop (click backdrop = cancel)
  if (showTaskForm) {
    return (
      <div
        className="inset-0 z-50 flex items-start justify-center overflow-y-auto bg-theme-bg/80 p-6 pt-12 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={handleCancelTask}
      >
        <div
          className="w-full max-w-lg rounded-2xl border border-theme-border bg-theme-panel p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <TaskForm
            task={editingTask}
            onSave={handleSaveTask}
            onCancel={handleCancelTask}
          />
        </div>
      </div>
    );
  }

  // Mobile: Single column with conditional rendering
  // Desktop: 3-column layout (Sidebar already rendered) + TaskListPanel + TaskDetailPanel
  return (
    <div data-section="tasks" className="h-full relative">
      {showDecompositionPrompt && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/80"
          role="dialog"
          aria-modal="true"
          aria-labelledby="decomposition-prompt-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-theme-border bg-theme-panel p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="decomposition-prompt-title" className="text-lg font-semibold text-theme-text mb-2">
              Quer dividir em passos menores?
            </h2>
            <p className="text-sm text-theme-muted mb-6">
              Você pode adicionar subtarefas manualmente no painel da tarefa!
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="medium"
                onClick={() => setShowDecompositionPrompt(null)}
                className="flex-1"
              >
                Sim
              </Button>
              <Button
                variant="ghost"
                size="medium"
                onClick={() => setShowDecompositionPrompt(null)}
                className="flex-1"
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        level={celebrationLevel}
        message={streakMessage || 'Parabéns!'}
        onComplete={handleCelebrationComplete}
      />
      {/* Desktop: Resizable 2-column (TaskListPanel + TaskDetailPanel) */}
      <div ref={containerRef} className="hidden lg:flex h-full overflow-hidden">
        {/* Task List Panel (Left) - Resizable */}
        <div 
          style={{ width: `${leftPanelWidth}px` }}
          className={`shrink-0 ${
            reduceMotion ? '' : 'transition-opacity duration-300 ease-out'
          }`}
        >
          <TaskListPanel
            onTaskSelect={handleSelectTask}
            onCreateTask={handleCreateTask}
          />
        </div>

        {/* Resizable Handle */}
        <ResizableHandle
          onMouseDown={startResize}
          onKeyDown={handleKeyDown}
          isResizing={isResizing}
        />

        {/* Task Detail Panel (Right) - Always visible: task detail or warm welcome */}
        <div
          className={`flex-1 min-w-0 flex flex-col bg-theme-panel overflow-hidden ${
            reduceMotion ? '' : 'transition-all duration-300 ease-out'
          }`}
        >
          {selectedTaskId ? (
            <TaskDetail onDelete={handleDeleteTask} />
          ) : (
            <div className="h-full overflow-y-auto">
              <TaskDetailEmpty />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Single column with back button */}
      <div className="lg:hidden h-full bg-red-400">
        {selectedTask ? (
          <div className="h-full flex flex-col">
            {/* Back button */}
            <div className="p-4 border-b border-theme-border bg-theme-sidebar">
              <button
                onClick={() => useTasksStore.getState().selectTask(null)}
                className="flex items-center gap-2 text-theme-text hover:text-theme-accent transition-colors"
                aria-label="Voltar para lista de tarefas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Voltar</span>
              </button>
            </div>
            {/* Task Detail */}
            <div className="flex-1 overflow-y-auto">
              <TaskDetail onDelete={handleDeleteTask} />
            </div>
          </div>
        ) : (
          <TaskListPanel
            onTaskSelect={handleSelectTask}
            onCreateTask={handleCreateTask}
          />
        )}
      </div>
    </div>
  );
}
