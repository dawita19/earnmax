import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export const StatCard = ({
  title,
  value,
  change = 0,
  changeType = 'percentage',
  description,
  icon,
  className,
  variant = 'default',
}: StatCardProps) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900',
    success: 'bg-green-50 dark:bg-green-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  };

  const textClasses = {
    default: 'text-gray-900 dark:text-gray-50',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className={cn(
      'rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="flex items-end gap-2">
            <p className={cn(
              'text-2xl font-bold',
              textClasses[variant]
            )}>
              {value}
            </p>
            {!isNeutral && (
              <span className={cn(
                'flex items-center text-sm font-medium',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {changeType === 'percentage' ? `${Math.abs(change)}%` : Math.abs(change)}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn(
            'rounded-lg p-2',
            isPositive ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
            isNeutral ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
            'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          )}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : 
             isNeutral ? <Minus className="h-5 w-5" /> : 
             <TrendingDown className="h-5 w-5" />}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

// Variant-specific components
StatCard.Success = (props: Omit<StatCardProps, 'variant'>) => (
  <StatCard {...props} variant="success" />
);

StatCard.Danger = (props: Omit<StatCardProps, 'variant'>) => (
  <StatCard {...props} variant="danger" />
);

StatCard.Warning = (props: Omit<StatCardProps, 'variant'>) => (
  <StatCard {...props} variant="warning" />
);

StatCard.Info = (props: Omit<StatCardProps, 'variant'>) => (
  <StatCard {...props} variant="info" />
);