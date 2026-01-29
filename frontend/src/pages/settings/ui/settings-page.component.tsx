/**
 * Settings Page
 * Settings with optional sidebar layout
 */

import { SettingsPageLayout } from '../../../components/settings/SettingsPageLayout';

export function SettingsPage() {
  return (
    <main className="min-h-screen bg-theme-bg" data-section="configuracoes">
      <SettingsPageLayout />
    </main>
  );
}
