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

  // Aplicar filtros
  useEffect(() => {
    let filtered = data;

    // Filtro de busca por texto
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoria === selectedCategory);
    }

    // Filtro por tipo
    if (selectedType) {
      filtered = filtered.filter(t => t.tipo === selectedType);
    }

    // Filtro por período
    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(t => new Date(t.data) >= startDate);
    }

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
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
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campo de busca */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filtro por categoria */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Todas as categorias</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        {/* Filtro por tipo */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>

        {/* Filtro por período */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="all">Todos os períodos</option>
          <option value="today">Hoje</option>
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
          <option value="year">Último ano</option>
        </select>
      </div>

      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Busca: &quot;{searchTerm}&quot;
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Categoria: {selectedCategory}
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Tipo: {selectedType}
              <button
                onClick={() => setSelectedType('')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {dateRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              Período: {dateRange === 'today' ? 'Hoje' : dateRange === 'week' ? 'Semana' : dateRange === 'month' ? 'Mês' : 'Ano'}
              <button
                onClick={() => setDateRange('all')}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}