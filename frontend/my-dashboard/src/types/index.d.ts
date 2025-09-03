export type Transacao = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  data: string; // ISO string format
  user_id: string; // Campo obrigatório para multiusuário
  created_at?: string; // Timestamp de criação (opcional, Supabase auto-gera)
  updated_at?: string; // Timestamp de atualização (opcional, Supabase auto-gera)
};

export type Usuario = {
  id: string;
  phone_number: string;
  created_at: string;
  last_seen?: string;
};

export type DashboardStats = {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalTransacoes: number;
};