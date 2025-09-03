export type Transacao = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  data: string;
  // --- NOVO: Adiciona o user_id para multi-usuário
  user_id: string;
};