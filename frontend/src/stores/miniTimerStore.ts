/**
 * Mini Timer Store (Zustand)
 * Floating / popup timer visibility state and position/collapse
 */

import { create } from 'zustand';
import { isTauri } from '../shared/lib/tauri-env';

export interface MiniTimerPosition {
  x: number;
  y: number;
}

interface MiniTimerState {
  miniEnabled: boolean;
  popupEnabled: boolean;
  miniPosition: MiniTimerPosition | null;
  miniCollapsed: boolean;
}

interface MiniTimerStore extends MiniTimerState {
  enableMiniTimer: () => void;
  disableMiniTimer: () => void;
  openPopupWindow: () => Promise<boolean>;
  setMiniTimerPosition: (pos: MiniTimerPosition) => void;
  toggleMiniTimerCollapsed: () => void;
}

export const useMiniTimerStore = create<MiniTimerStore>()((set) => ({
  miniEnabled: false,
  popupEnabled: false,
  miniPosition: null,
  miniCollapsed: false,

  enableMiniTimer: () => set({ miniEnabled: true }),

  disableMiniTimer: () => set({ miniEnabled: false, popupEnabled: false }),

  openPopupWindow: async () => {
    if (isTauri()) {
      try {
        const { WebviewWindow } = await import('@tauri-apps/api/webview');
        const url =
          typeof window !== 'undefined'
            ? `${window.location.origin}/pomodoro-popup`
            : '/pomodoro-popup';
        const w = new WebviewWindow('pomodoro-popup', {
          url,
          width: 380,
          height: 420,
          title: 'Pomodoro',
        });
        return new Promise<boolean>((resolve) => {
          w.once('tauri://error', () => resolve(false));
          w.once('tauri://created', () => {
            set({ popupEnabled: true });
            resolve(true);
          });
        });
      } catch {
        return false;
      }
    }
    try {
      const w = window.open(
        '/pomodoro-popup',
        'pomodoro-popup',
        'width=380,height=420,menubar=no,toolbar=no,location=no'
      );
      if (w) {
        set({ popupEnabled: true });
        return true;
      }
    } catch {
      // ignored
    }
    return false;
  },

  setMiniTimerPosition: (pos) => set({ miniPosition: pos }),

  toggleMiniTimerCollapsed: () => set((s) => ({ miniCollapsed: !s.miniCollapsed })),
}));

export function enableMiniTimer(): void {
  useMiniTimerStore.getState().enableMiniTimer();
}

export function disableMiniTimer(): void {
  useMiniTimerStore.getState().disableMiniTimer();
}

export function openPopupWindow(): Promise<boolean> {
  return useMiniTimerStore.getState().openPopupWindow();
}

export function setMiniTimerPosition(pos: MiniTimerPosition): void {
  useMiniTimerStore.getState().setMiniTimerPosition(pos);
}

export function toggleMiniTimerCollapsed(): void {
  useMiniTimerStore.getState().toggleMiniTimerCollapsed();
}
