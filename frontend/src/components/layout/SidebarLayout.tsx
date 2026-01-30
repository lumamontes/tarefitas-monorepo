/**
 * SidebarLayout — Responsive layout: sidebar always visible on desktop,
 * drawer + overlay on mobile (collapsed by default).
 */

import { useLayoutEffect, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { SIDEBAR_MOBILE_QUERY } from './layout.constants';

interface SidebarLayoutProps {
  main: React.ReactNode;
}

export function SidebarLayout({ main }: SidebarLayoutProps) {
  const isMobile = useMediaQuery(SIDEBAR_MOBILE_QUERY);
  const isSidebarOpen = useSettingsStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);

  // Keep sidebar collapsed on mobile: run before paint and when viewport becomes mobile
  useLayoutEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, setSidebarOpen]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  // Close when clicking outside sidebar/hamburger on mobile
  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const sidebar = document.getElementById('sidebar-navigation');
      const hamburger = document.getElementById('hamburger-button');
      if (sidebar?.contains(target) || hamburger?.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMobile, isSidebarOpen, setSidebarOpen]);

  const showDrawer = isMobile && isSidebarOpen;
  const sidebarVisible = !isMobile || showDrawer;

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden flex-col lg:flex-row">
      {/* Skip links */}
      <div className="sr-only">
        <a
          href="#main-content"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 bg-theme-accent text-white px-4 py-2 rounded-lg"
        >
          Pular para o conteúdo principal
        </a>
        <a
          href="#sidebar-navigation"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-100 bg-theme-accent text-white px-4 py-2 rounded-lg"
        >
          Pular para a navegação
        </a>
      </div>

      {/* Overlay (mobile only, when drawer open; below header so X stays visible) */}
      {showDrawer && (
        <div
          className="fixed top-14 left-0 right-0 bottom-0 z-40 bg-black/50 lg:hidden"
          aria-hidden
          onClick={closeSidebar}
        />
      )}

      {/* Mobile: header bar so hamburger doesn't overlap content */}
      {isMobile && (
        <header
          className="shrink-0 h-14 px-4 flex items-center border-b border-theme-border bg-theme-panel/95 backdrop-blur-sm lg:hidden"
          aria-hidden
        >
          <button
            id="hamburger-button"
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-sidebar/80 active:bg-theme-sidebar transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 focus-visible:ring-offset-theme-panel"
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        </header>
      )}

      {/* Sidebar: fixed drawer on mobile (below header), static column on desktop */}
      <aside
        id="sidebar-navigation"
        className={`
          w-80 shrink-0 bg-theme-sidebar border-r border-theme-border
          transition-transform duration-300 ease-in-out
          ${isMobile
            ? `fixed left-0 top-14 bottom-0 z-40 ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}`
            : 'static translate-x-0'
          }
        `}
        role="navigation"
        aria-label="Navegação principal"
      >
        <Sidebar onClose={isMobile ? closeSidebar : undefined} />
      </aside>

      {/* Main content: on mobile has flex-1 and flows below header */}
      <main
        id="main-content"
        className="flex-1 min-w-0 min-h-0 bg-theme-panel overflow-hidden flex flex-col"
        role="main"
      >
        {main}
      </main>
    </div>
  );
}
