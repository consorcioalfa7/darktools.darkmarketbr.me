// Auth API Types - camelCase para compatibilidade com backend VPS

// Tipos de plano disponíveis (valores exatos do banco de dados)
export type PlanId = 'DIÁRIO' | 'SEMANAL' | 'MENSAL' | 'VITALÍCIO';

// Interface da requisição de validação
export interface ValidateRequest {
  code: string; // Enviar 'code' em vez de 'token'
}

// Interface da resposta de validação (campos em camelCase)
export interface ValidateResponse {
  valid: boolean;
  message?: string;
  data?: {
    code: string;
    planId: PlanId;
    createdAt: string; // ISO date string
    expiresAt: string; // ISO date string
  };
}

// Interface para dados da sessão armazenada localmente
export interface SessionData {
  code: string;
  planId: PlanId;
  expiresAt: string;
  createdAt: string;
}

// Constantes dos nomes dos planos (para garantir consistência)
export const PLAN_NAMES = {
  DAILY: 'DIÁRIO' as PlanId,
  WEEKLY: 'SEMANAL' as PlanId,
  MONTHLY: 'MENSAL' as PlanId,
  LIFETIME: 'VITALÍCIO' as PlanId,
};

// Mapeamento de duração por plano (em dias)
export const PLAN_DURATION_DAYS: Record<PlanId, number> = {
  'DIÁRIO': 1,
  'SEMANAL': 7,
  'MENSAL': 30,
  'VITALÍCIO': 36500, // ~100 anos (praticamente vitalício)
};
