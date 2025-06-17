// src/components/ui/buttons/GradientButton.tsx
import React, { ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, MotionProps } from 'framer-motion';

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden',
  {
    variants: {
      gradient: {
        primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
        premium: 'bg-gradient-to-r from-purple-500 to-pink-500',
        success: 'bg-gradient-to-r from-green-400 to-green-600',
        danger: 'bg-gradient-to-r from-red-500 to-orange-500',
        gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        xl: 'h-14 px-10 rounded-lg text-lg',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
    },
    defaultVariants: {
      gradient: 'primary',
      size: 'default',
      shadow: 'md',
    },
  }
);

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants>,
    MotionProps {
  children: ReactNode;
  hoverEffect?: 'shine' | 'expand' | 'none';
  shineColor?: string;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      gradient,
      size,
      shadow,
      children,
      hoverEffect = 'shine',
      shineColor = 'rgba(255, 255, 255, 0.3)',
      whileHover = { scale: 1.03 },
      whileTap = { scale: 0.98 },
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
        className={gradientButtonVariants({ gradient, size, shadow, className })}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {hoverEffect === 'shine' && (
          <span
            className="absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="absolute -left-full top-0 h-full w-1/2 z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shine"
              style={{ backgroundColor: shineColor }}
            />
          </span>
        )}
        <span className="relative z-0 flex items-center justify-center">
          {children}
        </span>
        {hoverEffect === 'expand' && (
          <motion.span
            className="absolute inset-0 bg-white opacity-0 rounded-md"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

export { GradientButton, gradientButtonVariants };