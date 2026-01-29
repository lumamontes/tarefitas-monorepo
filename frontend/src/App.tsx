import { RouterProvider } from './app/providers/router-provider/ui/router-provider.component';
import { AppLayout } from './app/providers/theme-provider/ui/app-layout.component';
import { useSettingsStore } from './stores/settingsStore';
import { useEffect } from 'react';

function App() {
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);

  useEffect(() => {
    // Initialize settings on app mount
    initializeSettings();
  }, [initializeSettings]);

  return (
    <AppLayout>
      <RouterProvider />
    </AppLayout>
  );
}

export default App;
