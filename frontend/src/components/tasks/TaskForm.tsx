/**
 * TaskForm
 * Minimal create/edit task: title + optional description.
 */

import React, { useState, useEffect } from 'react';
import type { Task } from '../../../../old-frontend/src/types';
import { Button } from '../ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, onSave, onCancel, isLoading = false }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setShowDetails(true);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Digite um título para a tarefa.');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      archived: task?.archived || false,
    });
  };

  const isEdit = !!task;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 id="task-form-title" className="text-xl font-semibold text-theme-text mb-1">
          {isEdit ? 'Editar tarefa' : 'Nova tarefa'}
        </h2>
        <p className="text-sm text-theme-muted">
          {isEdit ? 'Altere o que precisar e salve.' : 'Comece pelo título. Detalhes são opcionais.'}
        </p>
      </div>

      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-theme-text mb-2">
          Título
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          className={`w-full px-4 py-3 rounded-xl border bg-theme-bg text-theme-text placeholder:text-theme-muted
            focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent
            ${error ? 'border-red-400' : 'border-theme-border'}`}
          placeholder="Ex.: Revisar proposta do projeto"
          autoFocus
          maxLength={200}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {showDetails && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label htmlFor="task-description" className="block text-sm font-medium text-theme-text">
            Descrição (opcional)
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text placeholder:text-theme-muted resize-none
              focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent"
            placeholder="Mais detalhes sobre esta tarefa..."
            maxLength={1000}
          />
        </div>
      )}

      {!isEdit && (
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-theme-accent hover:opacity-80 transition-opacity"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar descrição
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Adicionar descrição
            </>
          )}
        </button>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-theme-border">
        <Button
          type="button"
          variant="ghost"
          size="medium"
          onClick={onCancel}
          disabled={isLoading}
          className="sm:min-w-[100px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          isLoading={isLoading}
          disabled={isLoading}
          className="sm:min-w-[120px]"
        >
          {isEdit ? 'Salvar' : 'Criar tarefa'}
        </Button>
      </div>
    </form>
  );
}
