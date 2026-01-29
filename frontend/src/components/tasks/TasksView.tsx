/**
 * TasksView Component
 * 3-column layout: Sidebar (filters) + TaskListPanel + TaskDetailPanel
 */

import { useStore } from '@nanostores/react';
import { $tasks, $selectedTaskId, selectTask, addTask, updateTask, deleteTask } from '../../../../old-frontend/src/stores/tasksStore';
import { $settings } from '../../../../old-frontend/src/stores/settingsStore';
import { $contextState, shouldShowCelebration, getCelebrationLevel, $streakMessage } from '../../../../old-frontend/src/stores/ndStore';
import { TaskDetail } from './TaskDetail';
import { TaskDetailEmpty } from './TaskDetailEmpty';
import { TaskListPanel } from './TaskListPanel';
import { TaskForm } from './TaskForm';
import { CelebrationOverlay } from '../celebration/CelebrationOverlay';
import { ResizableHandle } from '../ui/ResizableHandle';
import { useResizablePanels } from '../../../../old-frontend/src/hooks/useResizablePanels';
import { useState, useEffect } from 'react';
import type { Task } from '../../../../old-frontend/src/types';

export function TasksView() {
  const tasks = useStore($tasks);
  const selectedTaskId = useStore($selectedTaskId);
  const settings = useStore($settings);
  const contextState = useStore($contextState);
  const streakMessage = useStore($streakMessage);
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
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

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, taskData);
    } else {
      // Create new task
      const newTaskId = addTask(taskData);
      selectTask(newTaskId);
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleCancelTask = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
      if (selectedTaskId === taskId) {
        selectTask(null);
      }
    }
  };

  const handleSelectTask = (taskId: string) => {
    selectTask(taskId);
    setShowTaskForm(false);
  };

  // Create/edit task: centered overlay with backdrop (click backdrop = cancel)
  if (showTaskForm) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-theme-bg/80 p-6 pt-12 sm:p-8"
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
    <div data-section="tasks" className="h-full">
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
            settings.reduceMotion ? '' : 'transition-opacity duration-300 ease-out'
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
            settings.reduceMotion ? '' : 'transition-all duration-300 ease-out'
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
      <div className="lg:hidden h-full">
        {selectedTask ? (
          <div className="h-full flex flex-col">
            {/* Back button */}
            <div className="p-4 border-b border-theme-border bg-theme-sidebar">
              <button
                onClick={() => selectTask(null)}
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
