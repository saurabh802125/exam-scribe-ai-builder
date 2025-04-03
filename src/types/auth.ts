
import { Session, User } from "@supabase/supabase-js";

export interface Educator {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: string;
  courses: string[];
}

export interface AuthContextType {
  currentUser: Educator | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
  semester: string;
  courses: string[];
}
