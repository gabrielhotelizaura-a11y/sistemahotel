export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type ReservationStatus = 'active' | 'future' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'funcionario';

export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  beds: number;
  price: number;
  amenities: string[];
  status: RoomStatus;
  created_at?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  created_at?: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  status: ReservationStatus;
  total_price: number;
  paid: boolean;
  created_at?: string;
  created_by?: string;
  room?: Room;
  guest?: Guest;
}

export interface Expense {
  id: string;
  guest_id: string;
  reservation_id?: string;
  description: string;
  value: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  created_at?: string;
}

export interface MonthlyStatistics {
  totalRevenue: number;
  totalReservations: number;
  occupancyRate: number;
  averageStay: number;
  totalExpenses: number;
  netRevenue: number;
  roomTypeStats: {
    type: string;
    count: number;
    revenue: number;
  }[];
}
