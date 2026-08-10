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
  email?: string | null;
  rol_users?: UserRole;
  integrante_legislatura_id?: string | null;
  // Campos derivados del login (no vienen del modelo tal cual, sí de la respuesta)
  role?: string;
  nombreCompleto?: string;
}
