// src/components/ui/buttons/ActionButton.tsx
import React, { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
        premium: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ActionButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    MotionProps {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  animationType?: 'pulse' | 'bounce' | 'none';
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      animationType = 'pulse',
      whileHover = { scale: 1.05 },
      whileTap = { scale: 0.95 },
      ...props
    },
    ref
  ) => {
    const motionProps = {
      ...(animationType === 'pulse' && {
        animate: {
          scale: [1, 1.05, 1],
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
        },
      }),
      ...(animationType === 'bounce' && {
        animate: {
          y: [0, -5, 0],
        },
        transition: {
          duration: 1,
          repeat: Infinity,
        },
      }),
      whileHover,
      whileTap,
    };

    return (
      <motion.button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...motionProps}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

export { ActionButton, buttonVariants };