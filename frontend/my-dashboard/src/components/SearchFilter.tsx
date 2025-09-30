// src/components/SearchFilter.tsx
"use client";

import { useEffect } from 'react';
import { Transacao } from '@/types';

interface SearchFilterProps {
  // Filtros existentes
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  categories: string[];
  data: Transacao[];
  setFilteredData: (data: Transacao[]) => void;
  selectedLoanFilter: string;
  setSelectedLoanFilter: (filter: string) => void;
  // CORREÇÃO: Adiciona filteredData para exibir a contagem
  filteredData: Transacao[];
}

export default function SearchFilter({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  categories,
  data,
  setFilteredData,
  selectedLoanFilter,
  setSelectedLoanFilter,
  // CORREÇÃO: Desestrutura filteredData
  filteredData,
}: SearchFilterProps) {

  // Aplicar filtros sempre que algum parâmetro mudar
  useEffect(() => {
    let filtered = [...data];
    
    // Auxiliar para identificar transações de empréstimo
    const isLoanCategory = (category: string) => 
      category.toLowerCase().includes('empréstimo'); 

    // Filtro por tipo (receita/despesa)
    if (selectedType) {
      filtered = filtered.filter(t => t.tipo === selectedType);
    }
    
    // Filtro por categoria específica (aplica-se após o filtro de tipo)
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoria === selectedCategory);
    }

    // NOVO FILTRO: Empréstimos
    if (selectedLoanFilter) {
      switch (selectedLoanFilter) {
        case 'loans':
          filtered = filtered.filter(t => isLoanCategory(t.categoria));
          break;
        case 'non-loans':
          filtered = filtered.filter(t => !isLoanCategory(t.categoria));
          break;
      }
    }

    // Filtro por período de tempo - OPÇÕES AMPLIADAS
    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_7_days': // NOVO
          startDate.setDate(now.getDate() - 7);
          break;
        case 'current_month': // NOVO
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'last_30_days': // NOVO
          startDate.setDate(now.getDate() - 30);
          break;
        case 'current_year': // NOVO
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      filtered = filtered.filter(t => {
        const transacaoDate = new Date(t.data);
        return transacaoDate >= startDate;
      });
    }

    // Ordenar por data mais recente
    filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    setFilteredData(filtered);
  }, [selectedCategory, selectedType, dateRange, selectedLoanFilter, data, setFilteredData]); 

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedType('');
    setDateRange('all');
    setSelectedLoanFilter(''); 
  };

  // REMOVIDO: searchTerm
  const hasActiveFilters = selectedCategory || selectedType || dateRange !== 'all' || selectedLoanFilter; 

  // MUDANÇA: O campo de busca (input de texto) foi removido, a UI está focada nos selects.
  return (
    <div className="card-glass rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586A1 1 0 0110 21v-3.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          Filtros de Transações
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FILTRO 1: Tipo (Receita/Despesa) - MANTIDO como SELECT principal */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="">Todos os tipos</option>
          <option value="receita" className="bg-gray-800">💚 Receitas</option>
          <option value="despesa" className="bg-gray-800">💸 Despesas</option>
        </select>
        
        {/* FILTRO 2: Categoria */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="">Todas as categorias ({categories.length})</option>
          {categories.map(category => (
            <option key={category} value={category} className="bg-gray-800">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        {/* FILTRO 3: Empréstimos - NOVO */}
        <select
          value={selectedLoanFilter}
          onChange={(e) => setSelectedLoanFilter(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="">Todos (Empréstimo/Não)</option>
          <option value="loans" className="bg-gray-800">💰 Apenas Empréstimos</option>
          <option value="non-loans" className="bg-gray-800">🚫 Excluir Empréstimos</option>
        </select>

        {/* FILTRO 4: Período Expandido */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="all">🗓️ Todos os períodos</option>
          <option value="today" className="bg-gray-800">📅 Hoje</option>
          <option value="yesterday" className="bg-gray-800">📅 Ontem</option>
          <option value="last_7_days" className="bg-gray-800">📅 Últimos 7 dias</option>
          <option value="last_30_days" className="bg-gray-800">📅 Últimos 30 dias</option>
          <option value="current_month" className="bg-gray-800">📅 Mês atual</option>
          <option value="current_year" className="bg-gray-800">📅 Ano atual</option>
        </select>
      </div>

      {/* Indicadores de filtros ativos melhorados */}
      {hasActiveFilters && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Filtros ativos:</span>
            <span className="text-xs text-gray-400">
              {data.length} total → {filteredData.length} filtradas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {selectedType && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                {selectedType === 'receita' ? 'Receitas' : 'Despesas'}
                <button
                  onClick={() => setSelectedType('')}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLoanFilter && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {selectedLoanFilter === 'loans' ? 'Apenas Empréstimos' : 'Excluir Empréstimos'}
                <button
                  onClick={() => setSelectedLoanFilter('')}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {dateRange !== 'all' && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateRange === 'today' ? 'Hoje' : 
                 dateRange === 'yesterday' ? 'Ontem' :
                 dateRange === 'last_7_days' ? 'Últimos 7 dias' :
                 dateRange === 'last_30_days' ? 'Últimos 30 dias' :
                 dateRange === 'current_month' ? 'Mês atual' : 
                 dateRange === 'current_year' ? 'Ano atual' : 'Período'}
                <button
                  onClick={() => setDateRange('all')}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}