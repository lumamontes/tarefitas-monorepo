/**
 * Calendar widget
 * Monthly calendar view with task indicators
 */

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '../../../entities/task';
import { formatCalendarDate } from '../../../shared/lib/time.utils';

interface CalendarProps {
  tasks: Task[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date | null;
}

export function Calendar({ tasks, onDateClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = formatCalendarDate(date);
    return tasks.filter((task) => task.date === dateStr && task.state === 'active');
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-theme-panel rounded-xl border border-theme-border p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-theme-sidebar text-theme-text transition-colors"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-theme-text">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-theme-sidebar text-theme-text transition-colors"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-theme-muted py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isOtherMonth = !isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-colors ${
                isOtherMonth
                  ? 'text-theme-muted opacity-50'
                  : 'text-theme-text hover:bg-theme-sidebar'
              } ${
                isCurrentDay
                  ? 'bg-theme-accent/10 border-2 border-theme-accent'
                  : ''
              } ${
                isSelected
                  ? 'bg-theme-accent/20 border-2 border-theme-accent'
                  : ''
              }`}
              onClick={() => handleDateClick(day)}
              aria-label={`${format(day, 'MMMM d, yyyy')}${dayTasks.length > 0 ? `, ${dayTasks.length} tasks` : ''}`}
            >
              <span className="text-sm font-medium">{format(day, 'd')}</span>
              {dayTasks.length > 0 && (
                <span className="text-xs text-theme-accent font-semibold" aria-label={`${dayTasks.length} tasks`}>
                  {dayTasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
