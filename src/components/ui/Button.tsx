import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, cva } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-secondary border border-secondary/30',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] focus:ring-accent border border-transparent hover:border-accent/30',
        danger: 'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-destructive border border-destructive/20',
        outline: 'border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:ring-primary',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';