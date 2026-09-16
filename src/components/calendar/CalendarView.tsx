import React from 'react';
import { useJobContext } from '../../context/JobContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { interviews, followUps, applications } = useJobContext();
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 8, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    const dayInterviews = interviews.filter((i) => i.date === dateStr);
    const dayFollowUps = followUps.filter((f) => f.followUpDate === dateStr);
    return { dayInterviews, dayFollowUps };
  };

  const navBtnStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '0.75rem',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Calendar Header */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>
            {monthNames[month]} {year}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={prevMonth}
            style={navBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
          >
            <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 8, 1))}
            style={{
              ...navBtnStyle,
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            style={navBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
          >
            <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--surface)' }}>
        {/* Days of Week */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            textAlign: 'center',
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Day Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              style={{
                minHeight: '6.25rem',
                padding: '0.5rem',
                backgroundColor: 'var(--background)',
                borderRadius: '0.75rem',
                opacity: 0.3,
              }}
            />
          ))}

          {daysArray.map((d) => {
            const { dayInterviews, dayFollowUps } = getEventsForDay(d);
            const hasEvents = dayInterviews.length > 0 || dayFollowUps.length > 0;
            const isToday = d === 25 && month === 8 && year === 2026;

            return (
              <div
                key={d}
                style={{
                  minHeight: '6.25rem',
                  padding: '0.5rem',
                  borderRadius: '0.75rem',
                  border: isToday
                    ? '2px solid var(--primary)'
                    : hasEvents
                    ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)'
                    : '1px solid var(--border)',
                  backgroundColor: isToday
                    ? 'var(--primary-soft)'
                    : hasEvents
                    ? 'color-mix(in srgb, var(--primary) 5%, var(--surface))'
                    : 'var(--surface)',
                  boxShadow: isToday ? '0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)' : 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.375rem',
                      backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {d}
                  </span>
                  {hasEvents && (
                    <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dayInterviews.map((int) => {
                    const app = applications.find((a) => a.id === int.applicationId);
                    return (
                      <div
                        key={int.id}
                        style={{
                          padding: '0.25rem 0.375rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {int.type}
                        </div>
                        <div style={{ opacity: 0.9, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app ? app.companyName : 'Interview'}
                        </div>
                      </div>
                    );
                  })}
                  {dayFollowUps.map((fol) => (
                    <div
                      key={fol.id}
                      style={{
                        padding: '0.25rem 0.375rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Follow-up
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
