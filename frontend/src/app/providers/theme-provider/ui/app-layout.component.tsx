/**
 * App layout component
 * Provides structure while maintaining calm, low-stimulation design
 */

import { ReactNode } from 'react';
import { useSettingsStore } from '../../../../stores/settingsStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-theme-bg text-theme-text font-sans ${
        reduceMotion ? '[&_*]:!transition-none [&_*]:!animate-none' : ''
      }`}
      data-reduce-motion={reduceMotion}
    >
      <div className="flex-1 flex flex-col ">
        {children}
      </div>
    </div>
  );
}
