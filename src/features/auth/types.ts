export interface LoginPayload { username: string; password: string }
export interface TokenPair { access: string; refresh: string }
export interface SignupPayload {
  username: string;
  password: string;
  technician_number: string;
  name: string;
  contact: string;
  discipline: string;
  qualification?: string;
  email?: string;
}
export interface CurrentAccount {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  /** "supervisor" for staff/superusers, "technician" for field technicians */
  role: "supervisor" | "technician";
  technician: number | null;
  approval_status: string | null;
  unread_notifications: number;
}
/** Shape returned by POST /api/auth/login — tokens + embedded user profile */
export interface LoginResponse extends TokenPair {
  user: CurrentAccount;
}
export interface ClientSession extends TokenPair {
  user: CurrentAccount;
}
export interface Administrator {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}
