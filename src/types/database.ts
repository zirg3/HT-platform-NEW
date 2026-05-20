import type { UserRole } from "@/types/roles"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          role?: UserRole
        }
      }
    }
  }
}
