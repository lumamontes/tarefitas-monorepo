/**
 * PomodoroView Component
 * Full pomodoro timer view for the main panel
 */

import { useEffect, useRef } from 'react';
import { PomodoroTimer } from '../PomodoroTimer';
import { useTasksStore } from '../../stores/tasksStore';
import { useTasks } from '../../hooks/useTasks';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { useMiniTimerStore } from '../../stores/miniTimerStore';
import { enableMiniTimer, disableMiniTimer, openPopupWindow } from '../../stores/miniTimerStore';
import { Button } from '../ui/Button';
import { isMobileDevice } from '../../shared/lib/tauri-env';

const POMODORO_NOTIFICATION_TAG = 'pomodoro-timer';

export function PomodoroView() {
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId);
  const { tasks } = useTasks();
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const isPomodoroActive = usePomodoroStore((s) => s.isActive);
  const minutes = usePomodoroStore((s) => s.minutes);
  const seconds = usePomodoroStore((s) => s.seconds);
  const mode = usePomodoroStore((s) => s.mode);
  const miniEnabled = useMiniTimerStore((s) => s.miniEnabled);
  const popupEnabled = useMiniTimerStore((s) => s.popupEnabled);
  const notificationRef = useRef<Notification | null>(null);
  const isMobile = isMobileDevice();

  // On mobile: show persistent-style notification while timer is active (stays in tray until dismissed)
  useEffect(() => {
    if (!isMobile || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (isPomodoroActive) {
      const label = mode === 'focus' ? 'Foco' : mode === 'break' ? 'Pausa' : 'Pausa longa';
      const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      if (notificationRef.current) {
        notificationRef.current.close();
      }
      const n = new Notification('Pomodoro – ' + label, {
        body: time + (selectedTask ? ` · ${selectedTask.title}` : ''),
        tag: POMODORO_NOTIFICATION_TAG,
        requireInteraction: true,
        silent: true,
      });
      notificationRef.current = n;
      const interval = setInterval(() => {
        const { minutes: m, seconds: s } = usePomodoroStore.getState();
        if (notificationRef.current) {
          notificationRef.current.close();
        }
        const taskTitle = selectedTask ? ` · ${selectedTask.title}` : '';
        notificationRef.current = new Notification('Pomodoro – ' + label, {
          body: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}${taskTitle}`,
          tag: POMODORO_NOTIFICATION_TAG,
          requireInteraction: true,
          silent: true,
        });
      }, 10000);
      return () => {
        clearInterval(interval);
        if (notificationRef.current) {
          notificationRef.current.close();
          notificationRef.current = null;
        }
      };
    }
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    return () => {
      if (notificationRef.current) {
        notificationRef.current.close();
        notificationRef.current = null;
      }
    };
  }, [isMobile, isPomodoroActive, mode, minutes, seconds, selectedTask?.title]);

  const handleEnableNotification = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') return;
    await Notification.requestPermission();
  };

  return (
    <div data-section="pomodoro" className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Optional: Show current task being worked on */}
        {selectedTask && (
          <div className="mb-6 p-4 bg-theme-sidebar rounded-xl border border-theme-border">
            <h3 className="text-sm font-medium text-theme-muted mb-1">Trabalhando em:</h3>
            <p className="text-lg font-semibold text-theme-text">{selectedTask.title}</p>
          </div>
        )}
        
        {/* Desktop: Destacar + Abrir em janela | Mobile: Notificação + note about widget */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          {miniEnabled || popupEnabled ? (
            <Button
              onClick={disableMiniTimer}
              variant="secondary"
              size="medium"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              }
            >
              Reanexar
            </Button>
          ) : isMobile ? (
            <>
              <Button
                onClick={handleEnableNotification}
                variant="secondary"
                size="medium"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
              >
                {typeof Notification !== 'undefined' && Notification.permission === 'granted'
                  ? 'Notificação ativa'
                  : 'Ativar notificação'}
              </Button>
              <p className="w-full text-right text-xs text-theme-muted mt-1">
                No celular: a notificação fica na bandeja. Widget na tela inicial em versões futuras.
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={enableMiniTimer}
                variant="secondary"
                size="medium"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                }
              >
                Destacar
              </Button>
              <Button
                onClick={async () => {
                  const opened = await openPopupWindow();
                  if (!opened) {
                    setTimeout(() => {
                      alert('Seu navegador bloqueou a janela. Usando mini timer aqui :)');
                    }, 100);
                  }
                }}
                variant="ghost"
                size="medium"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                }
              >
                Abrir em janela
              </Button>
            </>
          )}
        </div>
        
        {/* Pomodoro Timer */}
        <PomodoroTimer />
        
        {/* Idle State */}
        {!isPomodoroActive && (
          <div className="mt-8 text-center">
            <p className="text-theme-muted text-sm">
              Quando estiver pronto, aperte iniciar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}