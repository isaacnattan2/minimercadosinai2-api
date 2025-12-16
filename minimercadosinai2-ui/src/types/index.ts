export interface AccessLog {
  id: number;
  time: number;
  event: number;
  device_id: number;
  identifier_id?: number;
  user_id?: number;
  portal_id?: number;
  card_value?: number;
}

export interface User {
  id: number;
  name: string;
  registration?: string;
  begin_time?: number;
  end_time?: number;
}

export interface UserCreate {
  id: number;
  name: string;
  registration?: string;
}

export interface DeviceStatus {
  online: boolean;
  device_ip: string;
  session_active: boolean;
  message: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AccessLogsData {
  access_logs: AccessLog[];
  total: number;
}

export interface UsersData {
  users: User[];
  total: number;
}

export const EVENT_TYPES: Record<number, string> = {
  1: "Dispositivo Invalido",
  2: "Parametros Invalidos",
  3: "Nao Identificado",
  4: "Identificacao Pendente",
  5: "Tempo Expirado",
  6: "Acesso Negado",
  7: "Acesso Liberado",
  8: "Acesso Pendente",
  9: "Nao Administrador",
  10: "Acesso Nao Identificado",
  11: "Acesso via Botao",
  12: "Acesso via Web",
  13: "Cancelar Entrada",
  14: "Sem Resposta",
  15: "Acesso Interfone",
};
