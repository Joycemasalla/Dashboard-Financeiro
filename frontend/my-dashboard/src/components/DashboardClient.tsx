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
};

export default function DashboardClient({ transacoes }: DashboardClientProps) {
  const [data, setData] = useState(transacoes);
  const [filteredData, setFilteredData] = useState(transacoes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(transacoes);
    setFilteredData(transacoes);
  }, [transacoes]);

  // Função para deletar uma transação
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta transação?')) {
      setLoading(true);
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Ocorreu um erro ao deletar a transação: ' + error.message);
      } else {
        // Mostra feedback de sucesso
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Transação deletada com sucesso!';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          document.body.removeChild(successDiv);
          window.location.reload();
        }, 2000);
      }
      setLoading(false);
    }
  };
  
  // Estatísticas calculadas
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

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(data.map(t => t.categoria))];
    return cats.filter(Boolean).sort();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-lg mx-auto">
          {/* Ícone animado */}
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow float-animation">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Bem-vindo ao seu Dashboard!</h3>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">Comece registrando suas transações via WhatsApp para visualizar seus dados financeiros aqui.</p>
          
          {/* Card de instruções melhorado */}
          <div className="card-glass p-8 rounded-3xl shadow-glow">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-success">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
              </div>
            </div>
            <h4 className="text-xl font-bold text-white mb-4">Como usar:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mt-0.5">
                    <span className="text-red-400 font-bold text-sm">💸</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">"mercado 50"</p>
                    <p className="text-gray-400 text-sm">Registrar despesa</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-0.5">
                    <span className="text-green-400 font-bold text-sm">💰</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">"ganhei 500 freela"</p>
                    <p className="text-gray-400 text-sm">Registrar receita</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
                    <span className="text-blue-400 font-bold text-sm">📊</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">"dashboard"</p>
                    <p className="text-gray-400 text-sm">Ver relatórios</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-0.5">
                    <span className="text-purple-400 font-bold text-sm">❓</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">"ajuda"</p>
                    <p className="text-gray-400 text-sm">Ver todos os comandos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                💡 <strong>Dica:</strong> Use comandos naturais como "compras 120" ou "salario 2000"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Gráfico de Pizza */}
        <div className="card-glass rounded-3xl p-6 shadow-soft hover:shadow-glow transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Gastos por Categoria
            </h2>
            <div className="w-3 h-3 bg-purple-500 rounded-full pulse-custom"></div>
          </div>
          <div className="h-80">
            <PieChart data={filteredData} />
          </div>
        </div>

        {/* Gráfico de Linha */}
        <div className="card-glass rounded-3xl p-6 shadow-soft hover:shadow-glow transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                </svg>
              </div>
              Evolução Temporal
            </h2>
            <div className="w-3 h-3 bg-blue-500 rounded-full pulse-custom"></div>
          </div>
          <div className="h-80">
            <LineChart data={filteredData} />
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="card-glass rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-glow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Transações Recentes
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full pulse-custom"></div>
            <span className="text-gray-400 text-sm font-medium">
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-400">Nenhuma transação encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredData.slice(0, 50).map((transacao: Transacao) => (
              <div
                key={transacao.id}
                className="group flex items-center justify-between p-5 bg-gray-800/40 backdrop-blur-sm rounded-2xl hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      transacao.tipo === 'receita'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-success'
                        : 'bg-gradient-to-br from-red-500 to-pink-600 shadow-danger'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? (
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          transacao.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                    <p className="font-semibold text-white text-lg truncate capitalize">{transacao.categoria}</p>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(transacao.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center space-x-4">
                  <span
                    className={`text-xl font-bold ${
                      transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                  </span>
                  
                  {/* Botão de lixeira melhorado */}
                  <button
                    onClick={() => handleDelete(transacao.id)}
                    disabled={loading}
                    className="p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-500/30"
                    title="Deletar transação"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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