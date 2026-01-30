import { useEffect } from "react";
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { SidebarLayout } from "../components/layout/SidebarLayout";
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
      <SidebarLayout
        main={
          <div className="flex flex-col flex-1 overflow-auto">
            <PauseModeBanner />
            <Outlet />
          </div>
        }
      />
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
