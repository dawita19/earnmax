import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EarningsData {
  date: string;
  dailyEarnings: number;
  referralEarnings: number;
  bonusEarnings: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  timeframe: '7d' | '30d' | '90d';
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data, timeframe }) => {
  const filteredData = React.useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return data.slice(-days);
  }, [data, timeframe]);

  const chartData = {
    labels: filteredData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Earnings',
        data: filteredData.map(item => item.dailyEarnings),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Referral Earnings',
        data: filteredData.map(item => item.referralEarnings),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Bonus Earnings',
        data: filteredData.map(item => item.bonusEarnings),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Earnings Breakdown',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ETB'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'ETB',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Earnings History</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${timeframe === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {/* Handle timeframe change */}}
          >
            7D
          </button>
          <button
            className={`px-3 py-1 rounded ${timeframe === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {/* Handle timeframe change */}}
          >
            30D
          </button>
          <button
            className={`px-3 py-1 rounded ${timeframe === '90d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {/* Handle timeframe change */}}
          >
            90D
          </button>
        </div>
      </div>
      <Line data={chartData} options={options} />
      <div className="mt-4 text-sm text-gray-500">
        <p>Total: {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'ETB'
        }).format(filteredData.reduce((sum, item) => sum + item.dailyEarnings + item.referralEarnings + item.bonusEarnings, 0))}</p>
      </div>
    </div>
  );
};

export default EarningsChart;