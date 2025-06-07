import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Task, CalendarEvent } from '../../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const events: CalendarEvent[] = tasks.map(task => ({
    id: task.id,
    title: task.subject,
    start: new Date(task.dueDate || new Date()),
    end: new Date(task.dueDate || new Date()),
    allDay: true,
    resource: task,
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#60A5FA'; // Default blue

    switch (task.priority) {
      case 'High':
        backgroundColor = '#EF4444';
        break;
      case 'Medium':
        backgroundColor = '#F59E0B';
        break;
      case 'Low':
        backgroundColor = '#10B981';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
      },
    };
  };

  return (
    <div className="h-[calc(100vh-16rem)]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
};