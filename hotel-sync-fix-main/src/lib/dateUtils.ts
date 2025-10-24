/**
 * Converte string de data do banco (YYYY-MM-DD) para Date object
 * sem problema de timezone (UTC vs Local)
 * 
 * @param dateString - Data no formato "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss"
 * @returns Date object no timezone local (não UTC)
 */
export function parseDateSafe(dateString: string): Date {
    // Se vier com hora (YYYY-MM-DDTHH:mm:ss), pegar só a data
    const dateOnly = dateString.split('T')[0];

    // Parse manual para evitar conversão UTC
    const [year, month, day] = dateOnly.split('-').map(Number);

    // Month é 0-indexed no JavaScript (Janeiro = 0)
    return new Date(year, month - 1, day);
}

/**
 * Formata data para display no formato brasileiro
 * 
 * @param dateString - Data no formato "YYYY-MM-DD"
 * @returns String formatada "DD/MM/YYYY"
 */
export function formatDateBR(dateString: string): string {
    const date = parseDateSafe(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (timezone local)
 * Corrige o bug do Android que após 21h mostra o dia seguinte
 * 
 * @returns String no formato "YYYY-MM-DD"
 */
export function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
