import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReferralData {
  level: '1st' | '2nd' | '3rd' | '4th';
  count: number;
  active: number;
  earnings: number;
}

interface ReferralChartProps {
  data: ReferralData[];
}

const ReferralChart: React.FC<ReferralChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => `${item.level} Level`),
    datasets: [
      {
        label: 'Total Referrals',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Active Referrals',
        data: data.map(item => item.active),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Earnings (ETB)',
        data: data.map(item => item.earnings),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        type: 'line' as const,
        yAxisID: 'y1'
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
        text: 'Referral Network Performance',
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
              if (context.dataset.label === 'Earnings (ETB)') {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'ETB'
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Referrals'
        }
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Earnings (ETB)'
        },
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'ETB',
              minimumFractionDigits: 0
            }).format(value);
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Referral Network</h3>
      <Bar data={chartData} options={options} />
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        {data.map((item) => (
          <div key={item.level} className="p-2 bg-gray-50 rounded">
            <h4 className="font-medium">{item.level} Level</h4>
            <p className="text-blue-600">{item.count} Total</p>
            <p className="text-green-600">{item.active} Active</p>
            <p className="text-purple-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ETB'
              }).format(item.earnings)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralChart;