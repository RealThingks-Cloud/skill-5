import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLogo?: boolean;
}

export default function LoadingSpinner({ size = 'md', className, showLogo = false }: LoadingSpinnerProps) {
  // For full-page loading with logo
  if (showLogo) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
        <div className="relative">
          <img 
            src="/favicon.png" 
            alt="RealThings Logo" 
            className="h-20 w-20 animate-pulse"
          />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <p className="text-lg text-muted-foreground animate-fade-in">
          Please wait, your page is loading…
        </p>
      </div>
    );
  }

  // Simple spinner for inline loading
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2', 
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div 
      className={cn(
        'rounded-full border-primary border-t-transparent animate-spin',
        sizeClasses[size],
        className
      )} 
    />
  );
}