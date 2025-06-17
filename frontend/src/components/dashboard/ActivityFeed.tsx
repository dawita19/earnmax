// src/components/dashboard/ActivityFeed.tsx
import { format } from 'date-fns';
import { useActivity } from '@/hooks/useActivity';

type ActivityItem = {
  id: string;
  type: 'task' | 'referral' | 'withdrawal' | 'purchase';
  title: string;
  amount: number;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'failed';
};

export const ActivityFeed = () => {
  const { activities, isLoading } = useActivity();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task':
        return '✅';
      case 'referral':
        return '👥';
      case 'withdrawal':
        return '💸';
      case 'purchase':
        return '🛒';
      default:
        return '🔔';
    }
  };

  const getAmountColor = (type: ActivityItem['type']) => {
    return type === 'withdrawal' ? 'text-red-500' : 'text-green-500';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
      
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center py-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse" />
            </div>
          </div>
        ))
      ) : activities.length > 0 ? (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start">
              <span className="text-xl mr-3 mt-1">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-800">{activity.title}</h3>
                  <span className={`font-medium ${getAmountColor(activity.type)}`}>
                    {activity.amount > 0 ? '+' : ''}
                    {activity.amount.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                  </span>
                  {activity.status && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center text-gray-500">
          No recent activity found
        </div>
      )}
      
      {!isLoading && activities.length > 0 && (
        <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
          View All Activity →
        </button>
      )}
    </div>
  );
};