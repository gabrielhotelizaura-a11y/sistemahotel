import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AlertMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

const icons = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

const variants = {
  error: 'destructive',
  success: 'default',
  warning: 'default',
  info: 'default',
} as const;

const colors = {
  error: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export function AlertMessage({ type, title, message, onClose }: AlertMessageProps) {
  const Icon = icons[type];

  return (
    <Alert variant={variants[type]} className="relative">
      <Icon className={`h-4 w-4 ${colors[type]}`} />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </Alert>
  );
}
