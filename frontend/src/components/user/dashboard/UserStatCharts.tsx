
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getUserStats } from '../../../services/user/userStatsApi';
import type { UserStats } from '../../../services/user/userStatsApi';

Chart.register(ChartDataLabels);

const PIE_COLORS = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(201, 203, 207)',
];

const UserStatCharts = () => {
  const doughnutRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pieChart, setPieChart] = useState<Chart | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load statistics');
        setLoading(false);
      });
    return () => {
      if (pieChart) pieChart.destroy();
    };
  }, []);

  useEffect(() => {
    if (!doughnutRef.current) return;
    if (pieChart) {
      pieChart.destroy();
    }
    if (!stats) return;
    const filtered = stats.topicPoints.filter((t) => t.points > 0);
    if (filtered.length === 0) return;
    const chart = new Chart(doughnutRef.current, {
      type: 'pie',
      data: {
        labels: filtered.map((t) => t.topic),
        datasets: [
          {
            label: 'Points',
            data: filtered.map((t) => t.points),
            backgroundColor: PIE_COLORS.slice(0, filtered.length),
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: '#222',
            font: { weight: 'bold', size: 16 },
            formatter: (value: number, context: any) => {
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              if (total === 0) return '';
              const percent = Math.round((value / total) * 100);
              return percent > 0 ? `${percent}%` : '';
            },
            display: true,
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 16 },
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
    setPieChart(chart);
  }, [stats]);

  let content;
  if (loading) {
    content = <div className="w-full flex justify-center items-center h-64">Loading...</div>;
  } else if (error) {
    content = <div className="w-full flex justify-center items-center h-64 text-red-500">{error}</div>;
  } else if (!stats || stats.topicPoints.filter((t) => t.points > 0).length === 0) {
    content = <div className="w-full flex justify-center items-center h-64 text-gray-400">No points yet</div>;
  } else {
    content = (
      <canvas ref={doughnutRef} className="max-h-80" />
    );
  }

  return (
    <div className="rounded-2xl bg-gray-100 p-8 mt-16 shadow-lg">
      <div className="text-xl font-semibold">Statistics</div>
      <div className="flex flex-row justify-between my-6 gap-12 max-h-96">
        <div className="w-1/2" />
        <div className="w-1/2 bg-white rounded-2xl p-6 flex flex-col items-center">
          {content}
        </div>
      </div>
    </div>
  );
};

export default UserStatCharts;
