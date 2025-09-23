// src/components/DashboardClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Transacao } from '@/types';
import StatCard from './StatCard';
import SearchFilter from './SearchFilter';
import AddTransactionForm from './AddTransactionForm';
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setData(transacoes);
    setFilteredData(transacoes);
  }, [transacoes]);

  // Função para recarregar dados após adicionar nova transação
  const handleTransactionAdded = () => {
    window.location.reload();
  };

  // Função para deletar uma transação com melhor UX
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
          // Atualização otimizada sem reload
          setData(prev => prev.filter(t => t.id !== id));
          setFilteredData(prev => prev.filter(t => t.id !== id));
        }
      } catch (error) {
        console.error('Erro na conexão:', error);
        alert('Erro de conexão ao deletar transação');
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  // Estatísticas calculadas com melhor performance
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

  // Estado vazio melhorado
  if (!data || data.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          {/* Ícone animado */}
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 float-animation">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          {/* Conteúdo */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 gradient-text">
            Comece sua jornada financeira!
          </h3>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Registre sua primeira transação e acompanhe suas finanças de forma inteligente
          </p>

          {/* Tutorial Card */}
          <div className="card-glass p-6 md:p-8 mb-8 text-left">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-white text-lg">Como usar:</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Clique no botão +</p>
                  <p className="text-gray-400 text-sm">Localizado no canto inferior direito</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Preencha os dados</p>
                  <p className="text-gray-400 text-sm">Valor, categoria e tipo (receita/despesa)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Visualize seus dados</p>
                  <p className="text-gray-400 text-sm">Gráficos e relatórios atualizados automaticamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-3 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Primeira Transação
            </button>
          </div>
        </div>
        
        {/* Formulário para adicionar transações */}
        <AddTransactionForm userId={userId} onSuccess={handleTransactionAdded} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Cards de Estatísticas - Grid Responsivo Melhorado */}
      <div className="stats-grid">
        <StatCard
          title="Receitas"
          value={`R$ ${stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="trending-up"
          color="success"
          change="+12%"
        />
        <StatCard
          title="Despesas"
          value={`R$ ${stats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="trending-down"
          color="danger"
          change="+5%"
        />
        <StatCard
          title="Saldo"
          value={`R$ ${stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

      {/* Gráficos - Grid Responsivo */}
      <div className="charts-grid">
        {/* Gráfico de Pizza */}
        <div className="card-glass rounded-2xl p-4 md:p-6 shadow-soft">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="truncate">Gastos por Categoria</span>
          </h2>
          <div className="h-64 md:h-80 chart-container">
            <PieChart data={filteredData} />
          </div>
        </div>

        {/* Gráfico de Linha */}
        <div className="card-glass rounded-2xl p-4 md:p-6 shadow-soft">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
              </svg>
            </div>
            <span className="truncate">Evolução Temporal</span>
          </h2>
          <div className="h-64 md:h-80 chart-container">
            <LineChart data={filteredData} />
          </div>
        </div>
      </div>

      {/* Lista de Transações Melhorada */}
      <div className="card-glass rounded-2xl p-4 md:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="truncate">Transações ({filteredData.length})</span>
          </h2>
          
          {/* Indicador de carregamento */}
          {isLoading && (
            <div className="text-blue-400 text-sm flex items-center">
              <div className="loading-spinner w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
              Carregando...
            </div>
          )}
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/30 rounded-full flex items-center justify-center border border-gray-600/30">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-medium mb-2">Nenhuma transação encontrada</p>
            <p className="text-gray-500 text-sm">Ajuste os filtros ou adicione novas transações</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 md:max-h-[500px] overflow-y-auto">
            {filteredData.slice(0, 100).map((transacao: Transacao, index: number) => (
              <div
                key={transacao.id}
                className="transaction-item flex items-center justify-between bg-gray-800/40 hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                  {/* Ícone */}
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transacao.tipo === 'receita'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {transacao.tipo === 'receita' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          transacao.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {transacao.tipo === 'receita' ? '💚 Receita' : '💸 Despesa'}
                      </span>
                    </div>
                    <p className="font-medium text-white truncate text-sm md:text-base">
                      {transacao.categoria}
                    </p>
                    <div className="flex items-center text-xs md:text-sm text-gray-400 space-x-2">
                      <span>
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </span>
                      {transacao.descricao && transacao.descricao !== transacao.categoria && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-32 md:max-w-48">
                            {transacao.descricao}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valor e ações */}
                <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-base md:text-lg font-bold block ${
                        transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {/* Botão de deletar */}
                  <button
                    onClick={() => handleDelete(transacao.id)}
                    disabled={isDeleting === transacao.id}
                    className={`delete-btn ${isDeleting === transacao.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Deletar transação"
                  >
                    {isDeleting === transacao.id ? (
                      <div className="loading-spinner w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Indicador se há mais transações */}
            {filteredData.length > 100 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Mostrando 100 de {filteredData.length} transações
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Use os filtros para encontrar transações específicas
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulário para adicionar transações */}
      <AddTransactionForm userId={userId} onSuccess={handleTransactionAdded} />
    </div>
  );
}