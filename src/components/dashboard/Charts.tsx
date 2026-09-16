import React, { useMemo } from 'react';
import { useJobContext } from '../../context/JobContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Palette matching design tokens: primary blue, amber accent, green success, red danger, slate pending
const CHART_COLORS = ['#0B84C6', '#F59E0B', '#16A34A', '#DC2626', '#64748B'];

export const DashboardCharts: React.FC = () => {
  const { applications } = useJobContext();

  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      const dateKey = app.applicationDate;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    const sortedDates = Object.keys(counts).sort();
    return sortedDates.map((date) => ({
      date: date.substring(5),
      applications: counts[date],
    }));
  }, [applications]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    borderRadius: '0.75rem',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--border)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3-2">
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '2fr 1fr' }}>
        {/* Activity Chart */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            Application Activity
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
            Applications submitted over time
          </p>
          <div style={{ height: '16rem', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData.length > 0 ? activityData : [{ date: 'Today', applications: 0 }]}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B84C6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0B84C6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#0B84C6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--surface)' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Status Breakdown
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
              Distribution of application stages
            </p>
          </div>
          <div style={{ height: '13rem', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)',
              fontSize: '0.6875rem',
            }}
          >
            {statusData.slice(0, 3).map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                <span
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
