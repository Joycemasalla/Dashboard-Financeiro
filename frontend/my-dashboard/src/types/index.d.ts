export type Transacao = {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'despesa';
  data: string;
};