// src/components/DashboardClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Transacao } from '@/types';
import StatCard from './StatCard';
import SearchFilter from './SearchFilter';
import AddTransactionForm from './AddTransactionForm';
import QuickExpenseInput from './QuickExpenseInput';
import LoansManager from './LoansManager';
import { supabase } from '../lib/supabaseClient';

// Carregamento dinâmico dos gráficos
const ResponsiveCharts = dynamic(() => import('./ResponsiveCharts'), {
  ssr: false,
  loading: () => (
    <div className="charts-grid">
      <div className="card-glass rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
      <div className="card-glass rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    </div>
  )
});

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
  const [showQuickInput, setShowQuickInput] = useState(false);

  useEffect(() => {
    setData(transacoes);
    setFilteredData(transacoes);
  }, [transacoes]);

  // Função para recarregar dados
  const handleTransactionAdded = () => {
    window.location.reload();
  };

  // Função para deletar transação
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
          alert('Erro ao deletar transação: ' + error.message);
        } else {
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

  // Estado vazio melhorado
  if (!data || data.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 float-animation">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 gradient-text">
            Comece registrando sua primeira transação!
          </h3>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Use o registro rápido ou adicione transações detalhadas
          </p>

          {/* Cards de tutorial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card-glass p-6 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Registro Rápido</h4>
              <p className="text-gray-400 text-sm mb-3">
                Digite apenas &quot;40 mercado&quot; e pronto! Sua despesa está registrada.              </p>
              <button
                onClick={() => setShowQuickInput(true)}
                className="text-blue-400 text-sm font-medium hover:text-blue-300"
              >
                Experimente agora →
              </button>
            </div>

            <div className="card-glass p-6 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Transação Completa</h4>
              <p className="text-gray-400 text-sm mb-3">
                Adicione receitas, despesas com categorias e descrições detalhadas.
              </p>
              <p className="text-green-400 text-sm font-medium">
                Clique no botão + azul →
              </p>
            </div>
          </div>
        </div>

        {/* Componentes necessários */}
        <AddTransactionForm userId={userId} onSuccess={handleTransactionAdded} />
        <LoansManager userId={userId} />

        {/* Quick Input sempre disponível */}
        {showQuickInput && (
          <QuickExpenseInput userId={userId} onSuccess={handleTransactionAdded} />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        {/* Cards de Estatísticas */}
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

        {/* Gráficos Responsivos */}
        <ResponsiveCharts data={filteredData} />

        {/* Lista de Transações */}
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
              {filteredData.slice(0, 100).map((transacao: Transacao) => (
                <div
                  key={transacao.id}
                  className="transaction-item flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                    {/* Ícone */}
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${transacao.tipo === 'receita'
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
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${transacao.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                        >
                          {transacao.tipo === 'receita' ? '💚 Receita' : '💸 Despesa'}
                        </span>
                      </div>
                      <p className="font-medium text-white truncate text-sm md:text-base">
                        {transacao.categoria.charAt(0).toUpperCase() + transacao.categoria.slice(1)}
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
                        className={`text-base md:text-lg font-bold block ${transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
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
      </div>

      {/* Botões flutuantes - POSICIONAMENTO CORRIGIDO */}
      {/* <div className="floating-buttons">
        <div className="floating-buttons-container">
          {/* Botão de adicionar (esquerda) */}
      {/* <button
            className="floating-button btn-add"
            title="Adicionar transação completa"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button> */}

      {/* Botão WhatsApp (direita) */}
      {/* <a
            href="https://wa.me/+14155238886?text=join%20machine-indeed"
            target="_blank"
            rel="noopener noreferrer"
            className="floating-button btn-whatsapp"
            title="Suporte WhatsApp"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
            </svg>
          </a>
        </div> */}
      {/* </div> */}

      {/* Componentes modais */}
      {/* Componentes modais */}
      <AddTransactionForm userId={userId} onSuccess={handleTransactionAdded} />
      <LoansManager userId={userId} />
      <QuickExpenseInput userId={userId} onSuccess={handleTransactionAdded} />
    </>
  );
}