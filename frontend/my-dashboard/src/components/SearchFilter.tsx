// src/components/SearchFilter.tsx
"use client";

import { useEffect } from 'react';
import { Transacao } from '@/types';

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  categories: string[];
  data: Transacao[];
  setFilteredData: (data: Transacao[]) => void;
}

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  categories,
  data,
  setFilteredData
}: SearchFilterProps) {

  // Aplicar filtros sempre que algum parâmetro mudar
  useEffect(() => {
    let filtered = [...data];

    // Filtro de busca por texto (categoria ou descrição)
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.categoria.toLowerCase().includes(termo) ||
        t.descricao.toLowerCase().includes(termo) ||
        t.tipo.toLowerCase().includes(termo)
      );
    }

    // Filtro por categoria específica
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoria === selectedCategory);
    }

    // Filtro por tipo (receita/despesa)
    if (selectedType) {
      filtered = filtered.filter(t => t.tipo === selectedType);
    }

    // Filtro por período de tempo
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
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
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
  }, [searchTerm, selectedCategory, selectedType, dateRange, data, setFilteredData]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setDateRange('all');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedType || dateRange !== 'all';

  return (
    <div className="card-glass rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          Buscar e Filtrar
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campo de busca melhorado */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por categoria, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
          />
          {/* Clear button no campo de busca */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtro por categoria */}
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

        {/* Filtro por tipo */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="">Todos os tipos</option>
          <option value="receita" className="bg-gray-800">💚 Receitas</option>
          <option value="despesa" className="bg-gray-800">💸 Despesas</option>
        </select>

        {/* Filtro por período expandido */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
        >
          <option value="all">Todos os períodos</option>
          <option value="today" className="bg-gray-800">📅 Hoje</option>
          <option value="yesterday" className="bg-gray-800">📅 Ontem</option>
          <option value="week" className="bg-gray-800">📅 Última semana</option>
          <option value="month" className="bg-gray-800">📅 Último mês</option>
          <option value="quarter" className="bg-gray-800">📅 Último trimestre</option>
          <option value="year" className="bg-gray-800">📅 Último ano</option>
        </select>
      </div>

      {/* Indicadores de filtros ativos melhorados */}
      {hasActiveFilters && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Filtros ativos:</span>
            <span className="text-xs text-gray-400">
              {data.length} total → {data.filter(t => {
                let passes = true;
                if (searchTerm.trim()) passes = passes && (t.categoria.toLowerCase().includes(searchTerm.toLowerCase()) || t.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
                if (selectedCategory) passes = passes && t.categoria === selectedCategory;
                if (selectedType) passes = passes && t.tipo === selectedType;
                return passes;
              }).length} filtradas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Busca: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
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
            {dateRange !== 'all' && (
              <span className="filter-tag">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateRange === 'today' ? 'Hoje' : 
                 dateRange === 'yesterday' ? 'Ontem' :
                 dateRange === 'week' ? 'Semana' : 
                 dateRange === 'month' ? 'Mês' : 
                 dateRange === 'quarter' ? 'Trimestre' : 'Ano'}
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