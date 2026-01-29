/**
 * Orientation panel widget
 * Context recovery after interruptions
 * Informational only, never evaluative
 */

import { formatDateDisplay } from '../../../shared/lib/time.utils';
import { Card } from '../../../components/ui/Card';
import { Heading } from '../../../components/ui/Heading';

interface OrientationPanelProps {
  currentView: string;
  activeFilters?: string[];
  dateContext?: string;
}

export function OrientationPanel({
  currentView,
  activeFilters = [],
  dateContext,
}: OrientationPanelProps) {
  return (
    <Card variant="sidebar" padding="md" className="space-y-3" aria-label="Context information">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-theme-muted">View:</span>
        <span className="text-sm text-theme-text">{currentView}</span>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-muted">Filters:</span>
          <span className="text-sm text-theme-text">{activeFilters.join(', ')}</span>
        </div>
      )}
      {dateContext && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-muted">Date:</span>
          <span className="text-sm text-theme-text">{formatDateDisplay(dateContext)}</span>
        </div>
      )}
    </Card>
  );
}
