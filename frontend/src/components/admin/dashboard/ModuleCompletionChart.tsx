import { Chart } from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';
import {
  getModuleCompletionsByTopic,
  type ModuleCompletionsByTopic,
} from '../../../services/admin/adminApi';

const colors = [
  'rgba(255, 99, 132)',
  'rgba(255, 159, 64)',
  'rgba(255, 205, 86)',
  'rgba(75, 192, 192)',
  'rgba(54, 162, 235)',
  'rgba(153, 102, 255)',
  'rgba(201, 203, 207)',
];

const ModuleCompletionChart = () => {
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<ModuleCompletionsByTopic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getModuleCompletionsByTopic();
        const filtered = result.filter((r) => r.completions > 0);
        setData(filtered);
      } catch (error) {
        console.error('Failed to fetch module completions:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!barRef.current || data.length === 0) return;

    const maxY = Math.max(...data.map((d) => d.completions));

    const barChart = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: data.map((item) => item.topic),
        datasets: [
          {
            data: data.map((item) => item.completions),
            backgroundColor: colors.slice(0, data.length),
            borderRadius: 12,
            barThickness: Math.min(
              80,
              Math.max(40, barRef.current.offsetWidth / (data.length * 2)),
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          datalabels: {
            display: false,
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Completions',
              color: '#231942',
              font: { size: 20, weight: 'bold' },
            },
            max: Math.ceil(maxY * 1.1),
            ticks: {
              stepSize: Math.max(1, Math.ceil(maxY / 8)),
              color: '#14248a',
              font: { size: 16 },
              padding: 15,
            },
          },
          x: {
            title: {
              display: true,
              text: 'Modules',
              color: '#231942',
              font: { size: 20, weight: 'bold' },
            },
            ticks: {
              color: '#14248a',
              font: { size: 16 },
              padding: 15,
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });

    return () => {
      barChart.destroy();
    };
  }, [data]);

  return (
    <>
      <div className="bg-white rounded-2xl my-12 shadow-lg border border-highlight">
        <div className="w-full p-8">
          <canvas ref={barRef} />
        </div>
      </div>
    </>
  );
};

export default ModuleCompletionChart;
