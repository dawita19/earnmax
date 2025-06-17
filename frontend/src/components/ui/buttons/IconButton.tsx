// src/components/ui/buttons/IconButton.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, MotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        premium: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
      },
      size: {
        default: 'h-10 w-10',
        sm: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14'
      },
      effect: {
        none: '',
        glow: 'shadow-glow',
        pulse: 'animate-pulse'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      effect: 'none'
    }
  }
);

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants>,
    MotionProps {
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  label: string;
  badge?: number;
  badgeColor?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      effect,
      icon: Icon,
      isLoading = false,
      label,
      badge,
      badgeColor = 'bg-red-500',
      whileHover = { scale: 1.1 },
      whileTap = { scale: 0.9 },
      ...props
    },
    ref
  ) => {
    const motionProps = {
      whileHover,
      whileTap,
    };

    return (
      <motion.button
        className={iconButtonVariants({ variant, size, effect, className })}
        ref={ref}
        aria-label={label}
        {...motionProps}
        {...props}
      >
        <div className="relative">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
          {badge && (
            <span
              className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };