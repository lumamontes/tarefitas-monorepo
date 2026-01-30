import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from './app/providers/router-provider/ui/router-provider.component';
import { AppLayout } from './app/providers/theme-provider/ui/app-layout.component';
import { TasksDataProvider } from './state/TasksDataContext';
import { queryClient } from './query/client';
import { useSettingsStore } from './stores/settingsStore';
import { useEffect } from 'react';

function App() {
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const loadSettingsFromDb = useSettingsStore((state) => state.loadSettingsFromDb);

  useEffect(() => {
    loadSettingsFromDb?.().then(() => {
      initializeSettings();
    });
  }, [initializeSettings, loadSettingsFromDb]);

  return (
    <QueryClientProvider client={queryClient}>
      <TasksDataProvider>
        <AppLayout>
          <RouterProvider />
        </AppLayout>
      </TasksDataProvider>
    </QueryClientProvider>
  );
}

export default App;
