/**
 * Calendar Page
 * Calendar view for scheduling tasks and routines
 */

import { CalendarView } from '../../../components/calendar/CalendarView';

export function CalendarPage() {
  return (
    <main className="min-h-screen bg-theme-bg" data-section="calendar">
      <CalendarView />
    </main>
  );
}
