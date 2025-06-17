import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverShadow?: string;
  transitionDuration?: number;
}

export const AnimatedCard = ({
  children,
  className,
  hoverScale = 1.05,
  hoverShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transitionDuration = 0.3,
}: AnimatedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        className
      )}
      initial={false}
      animate={{
        scale: isHovered ? hoverScale : 1,
        boxShadow: isHovered ? hoverShadow : 'none',
      }}
      transition={{ duration: transitionDuration, ease: 'easeInOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
};

// Subcomponents for building card content
AnimatedCard.Header = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('border-b border-gray-200 p-4 dark:border-gray-800', className)}>{children}</div>
);

AnimatedCard.Title = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-gray-50', className)}>{children}</h3>
);

AnimatedCard.Content = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-4', className)}>{children}</div>
);

AnimatedCard.Footer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('border-t border-gray-200 p-4 dark:border-gray-800', className)}>{children}</div>
);