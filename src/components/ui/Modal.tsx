import { forwardRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export const Modal = ({
  open,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}: ModalProps) => {
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full bg-background rounded-lg shadow-xl animate-slide-in-bottom',
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );

  // Use portal to render modal at document root
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, showCloseButton = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-border',
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-1.5">
          {children}
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, as: Component = 'h2', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ModalTitle.displayName = 'ModalTitle';

export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

ModalDescription.displayName = 'ModalDescription';

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';