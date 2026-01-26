import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
             "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === 'default',
             "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === 'destructive',
             "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === 'outline',
             "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === 'secondary',
             "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
             // Increased padding for all sizes
             "h-10 px-5 py-3": size === 'default',
             "h-9 rounded-md px-4 py-2 text-sm": size === 'sm',
             "h-12 rounded-md px-10 py-4": size === 'lg',
             "h-9 w-9": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
