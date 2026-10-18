/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number to Colombian Peso currency string: "$ 350.000 COP"
 */
export function formatCOP(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `$ ${formatted} COP`;
}

/**
 * Formats ISO date string YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateCO(dateStr?: string): string {
  if (!dateStr) return '—';
  // If already in DD/MM/YYYY format
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/**
 * Calculates days remaining from reference date (2026-10-09) to target date
 */
export function getDaysRemaining(targetDateStr: string, refDateStr = '2026-10-09'): number {
  try {
    const target = new Date(targetDateStr);
    const ref = new Date(refDateStr);
    const diffTime = target.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Formats mileage with thousands separator: "94.520 km"
 */
export function formatKm(km: number): string {
  return `${new Intl.NumberFormat('es-CO').format(km)} km`;
}

/**
 * Formats tonnage with decimal: "17.5 t"
 */
export function formatTons(tons: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(tons)} t`;
}
