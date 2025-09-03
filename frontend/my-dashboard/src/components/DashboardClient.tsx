// src/components/DashboardClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Transacao } from '@/types';
import StatCard from './StatCard';
import SearchFilter from './SearchFilter';
import { supabase } from '../lib/supabaseClient';

const PieChart = dynamic(() => import('./PieChart'), { ssr: false });
const LineChart = dynamic(() => import('./LineChart'), { ssr: false });

type DashboardClientProps = {
  transacoes: Transacao[];
  userId: string;
};

export default function DashboardClient({ transacoes, userId }: DashboardClientProps) {
  const [data, setData] = useState(transacoes);
  const [filteredData, setFilteredData] = useState(transacoes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setData(transacoes);
    setFilteredData(transacoes);
  }, [transacoes]);

  // Função para recarregar dados do Supabase
  const reloadData = async () => {
    // Implementação de recarregar dados...
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta transação?')) {
      setIsDeleting(id);
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('user_id', userId)
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar:', error);
          alert('Ocorreu um erro ao deletar a transação: ' + error.message);
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro na conexão:', error);
        alert('Erro de conexão ao deletar transação');
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const stats = useMemo(() => {
    const receitas = filteredData.filter(t => t.tipo === 'receita');
    const despesas = filteredData.filter(t => t.tipo === 'despesa');
    
    const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0);
    const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      totalTransacoes: filteredData.length
    };
  }, [filteredData]);

  const categories = useMemo(() => {
    const cats = [...new Set(data.map(t => t.categoria))];
    return cats.filter(Boolean).sort();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
          <p className="text-gray-400 mb-6">Envie uma mensagem no WhatsApp para começar a registrar suas transações!</p>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl border border-green-500/30">
            <p className="font-semibold mb-3 text-lg">Como usar:</p>
            <div className="text-sm space-y-2 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <p><code className="bg-white/20 px-2 py-1 rounded">&quot;mercado 50&quot;</code> - Registrar despesa</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <p><code className="bg-white/20 px-2 py-1 rounded">&quot;ganhei 500 freela&quot;</code> - Registrar receita</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <p><code className="bg-white/20 px-2 py-1 rounded">&quot;dashboard&quot;</code> - Ver relatórios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas"
          value={`R$ ${stats.totalReceitas.toFixed(2)}`}
          icon="trending-up"
          color="success"
          change="+12%"
        />
        <StatCard
          title="Despesas"
          value={`R$ ${stats.totalDespesas.toFixed(2)}`}
          icon="trending-down"
          color="danger"
          change="+5%"
        />
        <StatCard
          title="Saldo"
          value={`R$ ${stats.saldo.toFixed(2)}`}
          icon="wallet"
          color={stats.saldo >= 0 ? "success" : "danger"}
          change={stats.saldo >= 0 ? "Positivo" : "Negativo"}
        />
        <StatCard
          title="Transações"
          value={stats.totalTransacoes.toString()}
          icon="list"
          color="primary"
          change="Total"
        />
      </div>

      {/* Filtros e Busca */}
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        categories={categories}
        data={data}
        setFilteredData={setFilteredData}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="card-glass rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Gastos por Categoria
          </h2>
          <div className="h-64 chart-container">
            <PieChart data={filteredData} />
          </div>
        </div>

        {/* Gráfico de Linha */}
        <div className="card-glass rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
              </svg>
            </div>
            Evolução Temporal
          </h2>
          <div className="h-64 chart-container">
            <LineChart data={filteredData} />
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="card-glass rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            </div>
            Últimas Transações ({filteredData.length})
        </h2>

        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma transação encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.slice(0, 50).map((transacao: Transacao, index: number) => (
              <div
                key={transacao.id}
                className="transaction-item flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transacao.tipo === 'receita'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transacao.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                    <p className="font-medium text-white">{transacao.categoria}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transacao.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <span
                    className={`text-lg font-bold ${
                      transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                  </span>
                  
                  {/* Botão de lixeira para deletar */}
                  <button
                    onClick={() => handleDelete(transacao.id)}
                    disabled={isDeleting === transacao.id}
                    className={`delete-btn ${isDeleting === transacao.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Deletar transação"
                  >
                    {isDeleting === transacao.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}