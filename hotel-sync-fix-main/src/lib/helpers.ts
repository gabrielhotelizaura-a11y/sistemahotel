/**
 * Utility functions for formatting and data manipulation
 */

/**
 * Format currency to Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format date to Brazilian format
 */
export function formatDate(date: string | Date, includeTime = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(d);
}

/**
 * Format phone number to Brazilian format
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format CPF to Brazilian format
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
}

/**
 * Calculate number of days between two dates
 */
export function daysBetween(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500',
    future: 'bg-yellow-500',
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    maintenance: 'bg-orange-500',
    cleaning: 'bg-blue-500',
  };
  
  return colors[status] || 'bg-gray-500';
}

/**
 * Get status label in Portuguese
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    future: 'Futuro',
    available: 'Disponível',
    occupied: 'Ocupado',
    maintenance: 'Manutenção',
    cleaning: 'Limpeza',
  };
  
  return labels[status] || status;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generate random ID (for temporary use)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
