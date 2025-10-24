import { z } from 'zod';

/**
 * Validation schemas for form data and API requests
 */

// Guest validation
export const guestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
});

// Reservation validation
export const reservationSchema = z.object({
  room_id: z.string().uuid('ID do quarto inválido'),
  guest_id: z.string().uuid('ID do hóspede inválido'),
  check_in: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de check-in inválida',
  }),
  check_out: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de check-out inválida',
  }),
  num_guests: z.number().min(1, 'Deve ter pelo menos 1 hóspede').max(10),
  total_price: z.number().min(0, 'Preço deve ser positivo'),
}).refine((data) => {
  const checkIn = new Date(data.check_in);
  const checkOut = new Date(data.check_out);
  return checkOut > checkIn;
}, {
  message: 'Check-out deve ser após check-in',
  path: ['check_out'],
});

// Room validation
export const roomSchema = z.object({
  number: z.string().min(1, 'Número do quarto é obrigatório'),
  type: z.string().min(1, 'Tipo do quarto é obrigatório'),
  capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').max(10),
  price_per_night: z.number().min(0, 'Preço deve ser positivo'),
  amenities: z.array(z.string()).optional().default([]),
  description: z.string().optional().nullable(),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).default('available'),
});

// Auth validation
export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const signUpSchema = signInSchema.extend({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Type exports
export type GuestInput = z.infer<typeof guestSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
