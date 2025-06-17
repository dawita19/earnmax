import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  border?: boolean;
  borderColor?: string;
}

export const GlassCard = ({
  children,
  className,
  blur = 8,
  opacity = 0.2,
  border = true,
  borderColor = 'rgba(255, 255, 255, 0.1)',
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl backdrop-blur-md transition-all duration-300',
        border && 'border',
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderColor: borderColor,
      }}
    >
      {/* Frosted glass effect */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-400/10 via-gray-200/5 to-gray-100/0"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

// Subcomponents
GlassCard.Header = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('border-b border-white/10 p-4', className)}>{children}</div>
);

GlassCard.Title = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-white/90', className)}>{children}</h3>
);

GlassCard.Content = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-4 text-white/80', className)}>{children}</div>
);

GlassCard.Footer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('border-t border-white/10 p-4', className)}>{children}</div>
);

GlassCard.Highlight = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn('font-bold text-white', className)}>{children}</span>
);