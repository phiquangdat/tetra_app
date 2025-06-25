import { Chart } from 'chart.js/auto';
import { useEffect, useRef } from 'react';

const labels = [
  'Cybersecurity',
  'AI',
  'Safety',
  'Communication',
  'Leadership',
  'Teamwork',
];

const completion = [100, 150, 130, 145, 170, 160];

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
  useEffect(() => {
    if (!barRef.current) return;

    const barChart = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: completion,
            backgroundColor: colors,
            borderRadius: 8,
          },
        ],
      },
      options: {
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
              color: 'gray',
              font: { size: 20, weight: 'bold' },
            },
            max: 200,
            ticks: {
              stepSize: 50,
              color: '#A0AEC0',
              font: { size: 16 },
              padding: 15,
            },
          },
          x: {
            title: {
              display: true,
              text: 'Modules',
              color: 'gray',
              font: { size: 20, weight: 'bold' },
            },
            ticks: {
              color: '#A0AEC0',
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
  }, []);

  return (
    <>
      <div className="bg-white rounded-2xl mt-16 shadow-lg border border-gray-100">
        <div className="w-full p-6">
          <canvas ref={barRef} />
        </div>
      </div>
    </>
  );
};

export default ModuleCompletionChart;
