import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const UserStatCharts = () => {
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!barRef.current || !doughnutRef.current) return;

    const barChart = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [3.6, 4.2, 3.8, 4.1, 3.9, 4.3, 4.0],
            backgroundColor: [
              'rgba(255, 99, 132)',
              'rgba(255, 159, 64)',
              'rgba(255, 205, 86)',
              'rgba(75, 192, 192)',
              'rgba(54, 162, 235)',
              'rgba(153, 102, 255)',
              'rgba(201, 203, 207)',
            ],
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
            max: 5,
            ticks: {
              stepSize: 1,
              callback: (value: string | number) =>
                typeof value === 'number' ? `${value} hours` : value,
              color: '#A0AEC0',
              font: { size: 16 },
            },
            grid: {
              color: '#E2E8F0',
            },
          },
          x: {
            ticks: {
              color: '#A0AEC0',
              font: { size: 16 },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });

    const pieChart = new Chart(doughnutRef.current, {
      type: 'pie',
      data: {
        labels: ['Cybersecurity', 'AI', 'Safety'],
        datasets: [
          {
            label: 'Points',
            data: [40, 30, 30],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
            ],
          },
        ],
      },
    });
    return () => {
      barChart.destroy();
      pieChart.destroy();
    };
  }, []);

  return (
    <>
      <div className="rounded-2xl bg-gray-100 p-8 mt-16 shadow-lg">
        <div className="text-xl font-semibold">Statistics</div>

        <div className="flex flex-row justify-between my-6 gap-12 max-h-96">
          <div className="w-1/2 bg-white rounded-2xl p-6 flex flex-col items-center">
            <canvas ref={barRef} />
          </div>
          <div className="w-1/2 bg-white rounded-2xl p-6 flex flex-col items-center">
            <canvas ref={doughnutRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserStatCharts;
