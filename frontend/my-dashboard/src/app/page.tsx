// src/app/page.tsx
import { supabase } from '../lib/supabaseClient';
import DashboardClient from '../components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { data: transacoes, error } = await supabase
    .from('transacoes')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    return <div>Erro ao carregar as transações: {error.message}</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Financeiro Pessoal</h1>
      <DashboardClient transacoes={transacoes} />
    </main>
  );
}