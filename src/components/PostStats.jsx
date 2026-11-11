// src/components/PostStats.jsx
// Total views, average read time, and a daily views bar chart for one post.
import { useQuery } from '@tanstack/react-query';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory';
import { getPostStats } from '../api/events.js';

const CHART_DAYS = 14;

// "YYYY-MM-DD" for a date in the browser's own timezone
const localDay = (date) => date.toLocaleDateString('en-CA');

// The backend only returns days that had views; fill the gaps with zeros
// so the chart shows a continuous run of days ending today
function fillDays(dailyViews) {
  const counts = new Map(dailyViews.map((d) => [d.day, d.views]));
  const today = new Date();
  const days = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = localDay(date);
    days.push({ x: day.slice(5), y: counts.get(day) ?? 0 });
  }
  return days;
}

export default function PostStats({ postId }) {
  const statsQuery = useQuery({
    queryKey: ['postStats', postId],
    queryFn: () => getPostStats(postId),
  });

  if (statsQuery.isLoading) return <p>Loading stats...</p>;
  if (statsQuery.isError) {
    return <p className="error">{statsQuery.error.message}</p>;
  }

  const { totalViews, dailyViews, avgDurationSeconds } = statsQuery.data;
  const chartData = fillDays(dailyViews);

  return (
    <section className="card">
      <h2>Post stats</h2>
      <div className="stat-row">
        <div className="stat">
          <span className="stat-value">{totalViews}</span>
          <span className="stat-label">total views</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {avgDurationSeconds == null
              ? 'n/a'
              : `${Math.round(avgDurationSeconds)}s`}
          </span>
          <span className="stat-label">average read time</span>
        </div>
      </div>

      <h3>Daily views, last {CHART_DAYS} days</h3>
      <VictoryChart domainPadding={{ x: 12 }} height={260} width={640}>
        <VictoryAxis
          style={{
            axis: { stroke: 'var(--border)' },
            tickLabels: { fill: 'var(--muted)', fontSize: 11, angle: -45 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => (Number.isInteger(t) ? t : '')}
          style={{
            axis: { stroke: 'var(--border)' },
            grid: { stroke: 'var(--border)', strokeDasharray: '4 4' },
            tickLabels: { fill: 'var(--muted)', fontSize: 11 },
          }}
        />
        <VictoryBar
          data={chartData}
          barRatio={0.7}
          cornerRadius={{ top: 3 }}
          labels={({ datum }) => (datum.y ? datum.y : '')}
          style={{
            data: { fill: 'var(--accent)' },
            labels: { fill: 'var(--text)', fontSize: 10 },
          }}
        />
      </VictoryChart>
    </section>
  );
}
