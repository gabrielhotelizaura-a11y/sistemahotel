/**
 * Constants used throughout the application
 */

export const APP_CONFIG = {
  name: 'Sistema Hoteleiro',
  description: 'Sistema completo de gestão hoteleira',
  version: '1.0.0',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ROOMS: '/dashboard/rooms',
  PRICES: '/dashboard/prices',
  STATISTICS: '/dashboard/statistics',
  RESERVATIONS: '/dashboard/reservations',
  FUTURE: '/dashboard/future',
} as const;

export const RESERVATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FUTURE: 'future',
} as const;

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  FUNCIONARIO: 'funcionario',
  GUEST: 'guest',
} as const;

export const QUERY_KEYS = {
  RESERVATIONS: 'reservations',
  ROOMS: 'rooms',
  GUESTS: 'guests',
  STATISTICS: 'statistics',
  USER_ROLE: 'user-role',
} as const;

export const CACHE_TIME = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 15, // 15 minutes
  LONG: 1000 * 60 * 60, // 1 hour
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
} as const;
