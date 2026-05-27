export interface Role {
  id: number;
  name: string;
}

export interface UserRole {
  role_id: number;
  user_id: number;
  role?: Role;
}

export interface User {
  id?: number;
  name: string;
  password: string;
  rol_users?: UserRole;
  integrante_legislatura_id?: string | null;
  // Campo derivado del login (no viene del modelo pero sí de la respuesta)
  role?: string;
}
