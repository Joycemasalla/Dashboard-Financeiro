// src/components/DashboardClient.tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Transacao } from '@/types'; // Import the new type

const PieChart = dynamic(() => import('./PieChart'), { ssr: false });

// Define the component's props with the 'Transacao' type
type DashboardClientProps = {
  transacoes: Transacao[];
};

export default function DashboardClient({ transacoes }: DashboardClientProps) {
  const [data, setData] = useState(transacoes);

  useEffect(() => {
    setData(transacoes);
  }, [transacoes]);

  if (!data || data.length === 0) {
    return <p>Nenhuma transação encontrada. Envie uma mensagem no WhatsApp para começar!</p>;
  }

  return (
    <>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Últimas Transações</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-4">
            {data.map((t: Transacao) => ( // Use the 'Transacao' type here too
              <li key={t.id} className="border-b pb-2 last:border-b-0 flex justify-between items-center">
                <div>
                  <span className={`font-medium ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                  <span>: {t.categoria}</span>
                </div>
                <span className={`font-bold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {t.valor.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Análise de Gastos</h2>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <PieChart data={data} />
        </div>
      </section>
    </>
  );
}