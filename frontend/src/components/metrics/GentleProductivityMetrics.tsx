/**
 * GentleProductivityMetrics Component
 * Process-focused, validating metrics for neurodivergent users
 * Emphasizes effort and progress over pure output
 */

import { useStore } from '@nanostores/react';
import { $contextState, $todayEffortMessage } from '../../../../old-frontend/src/stores/ndStore';
import { $settings } from '../../../../old-frontend/src/stores/settingsStore';
import { Heart, Target, Clock, TrendingUp } from 'lucide-react';

export function GentleProductivityMetrics() {
  const contextState = useStore($contextState);
  const effortMessage = useStore($todayEffortMessage);
  const settings = useStore($settings);

  const metrics = [
    {
      icon: Target,
      label: 'Esforço de Hoje',
      value: effortMessage,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Tempo Investido',
      value: contextState.sessionStart 
        ? `${Math.floor((Date.now() - contextState.sessionStart.getTime()) / (1000 * 60))} min focados`
        : 'Pronto para começar',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Progresso Semanal',
      value: `${contextState.totalCompletions} tarefas concluídas`,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="bg-theme-sidebar rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-theme-accent" />
        <h3 className="text-lg font-semibold text-theme-text">
          Seu Progresso
        </h3>
      </div>

      <div className="space-y-4">
        {metrics.map(({ icon: Icon, label, value, color }, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${color} ${
              settings.reduceMotion ? '' : 'transition-all duration-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{label}</h4>
                <p className="text-sm">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement based on progress */}
      <div className="mt-6 p-4 bg-gradient-to-br from-theme-accent/10 to-theme-accent/5 rounded-lg border border-theme-accent/20">
        <h4 className="font-semibold text-theme-text mb-2">
          💚 Lembrete Gentil
        </h4>
        <p className="text-sm text-theme-text">
          {contextState.todayCompletions === 0 && (
            "Começar é muitas vezes a parte mais difícil. Você está aqui, e isso já é um passo importante."
          )}
          {contextState.todayCompletions > 0 && contextState.todayCompletions <= 2 && (
            "Cada tarefa concluída é uma vitória. Seu cérebro está fazendo um trabalho incrível hoje."
          )}
          {contextState.todayCompletions > 2 && (
            "Que progresso fantástico! Lembre-se de descansar quando precisar. Você merece."
          )}
        </p>
      </div>

      {/* Rest validation */}
      <div className="text-center">
        <p className="text-xs text-theme-muted italic">
          Pausas e descanso são parte produtiva do seu dia. 🌱
        </p>
      </div>
    </div>
  );
}