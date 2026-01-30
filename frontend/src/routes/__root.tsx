import { useEffect } from "react";
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { PauseModeBanner } from "../widgets/pause-mode-banner";

const APP_ROUTES = ["/tasks", "/calendar", "/focus", "/settings", "/pomodoro"];

const ROUTE_TITLES: Record<string, string> = {
  "/": "Tarefitas — Início",
  "/tasks": "Tarefitas — Tarefas",
  "/calendar": "Tarefitas — Calendário",
  "/focus": "Tarefitas — Foco",
  "/pomodoro": "Tarefitas — Pomodoro",
  "/pomodoro-popup": "Tarefitas — Timer",
  "/settings": "Tarefitas — Configurações",
  "/onboarding/nome": "Tarefitas — Como te chamamos?",
};

function useShowSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return false;
  if (pathname.startsWith("/onboarding")) return false;
  if (pathname === "/pomodoro-popup") return false; // Popup window shouldn't show sidebar
  return APP_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function useDocumentTitle() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const title = ROUTE_TITLES[pathname] ?? "Tarefitas";
    document.title = title;
  }, [pathname]);
}

export const RootComponent: React.FC = () => {
  const showSidebar = useShowSidebar();
  useDocumentTitle();

  if (!showSidebar) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-theme-bg font-sans text-theme-text overflow-hidden">
      {/* Skip links — accessibility (MVP #12, DESIGN #7) */}
      <div className="sr-only">
        <a
          href="#main-content"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-theme-accent text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent"
        >
          Pular para o conteúdo principal
        </a>
        <a
          href="#sidebar-navigation"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 bg-theme-accent text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent"
        >
          Pular para a navegação
        </a>
      </div>

      <aside
        id="sidebar-navigation"
        className="w-80 bg-theme-sidebar border-r border-theme-border shrink-0 flex flex-col"
        role="navigation"
        aria-label="Navegação principal"
      >
        <Sidebar />
      </aside>

      <main
        id="main-content"
        className="flex-1 bg-theme-panel overflow-auto flex flex-col"
        role="main"
        aria-label="Conteúdo principal"
      >
        <PauseModeBanner />
        <Outlet />
      </main>
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
