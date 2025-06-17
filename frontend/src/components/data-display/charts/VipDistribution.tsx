import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface VipDistributionData {
  level: number;
  name: string;
  count: number;
  color: string;
  investment: number;
}

interface VipDistributionProps {
  data: VipDistributionData[];
  viewMode: 'count' | 'investment';
}

const VipDistribution: React.FC<VipDistributionProps> = ({ data, viewMode }) => {
  const sortedData = [...data].sort((a, b) => a.level - b.level);

  const chartData = {
    labels: sortedData.map(item => `${item.name} (VIP ${item.level})`),
    datasets: [
      {
        data: sortedData.map(item => viewMode === 'count' ? item.count : item.investment),
        backgroundColor: sortedData.map(item => item.color),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            
            if (viewMode === 'count') {
              return `${label}: ${value} users (${percentage}%)`;
            } else {
              return `${label}: ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ETB'
              }).format(value)} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">VIP Level Distribution</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === 'count' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {/* Handle view mode change */}}
          >
            By Users
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'investment' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {/* Handle view mode change */}}
          >
            By Investment
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
          <Pie data={chartData} options={options} />
        </div>
        <div className="md:w-1/3 mt-4 md:mt-0 md:pl-4">
          <div className="space-y-3">
            {sortedData.map((item) => (
              <div key={item.level} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium flex-1">
                  VIP {item.level} - {item.name}
                </span>
                <span className="text-sm">
                  {viewMode === 'count' ? (
                    `${item.count} users`
                  ) : (
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'ETB',
                      minimumFractionDigits: 0
                    }).format(item.investment)
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-800">Total {viewMode === 'count' ? 'Users' : 'Investment'}</h4>
            <p className="text-xl font-bold">
              {viewMode === 'count' ? (
                data.reduce((sum, item) => sum + item.count, 0).toLocaleString()
              ) : (
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'ETB',
                  minimumFractionDigits: 0
                }).format(data.reduce((sum, item) => sum + item.investment, 0))
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipDistribution;