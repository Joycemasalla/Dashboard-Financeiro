// src/components/ResponsiveCharts.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Transacao } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

interface ResponsiveChartsProps {
  data: Transacao[];
}

export default function ResponsiveCharts({ data }: ResponsiveChartsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dados para o gráfico de pizza (despesas por categoria)
  const despesasPorCategoria = data
    .filter(item => item.tipo === 'despesa')
    .reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);

  const categorias = Object.keys(despesasPorCategoria);
  const valores = Object.values(despesasPorCategoria);

  // Cores para o gráfico de pizza
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', 
    '#3b82f6', '#ef4444', '#84cc16', '#06b6d4', '#f97316'
  ];

  const pieData = {
    labels: categorias.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      data: valores,
      backgroundColor: colors.slice(0, categorias.length).map(color => color + '60'),
      borderColor: colors.slice(0, categorias.length),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: isMobile ? 8 : 15,
    }],
  };

  // Dados para o gráfico de linha (evolução temporal)
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item.data).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = { receitas: 0, despesas: 0 };
    }
    if (item.tipo === 'receita') {
      acc[date].receitas += item.valor;
    } else {
      acc[date].despesas += item.valor;
    }
    return acc;
  }, {} as Record<string, { receitas: number; despesas: number }>);

  const sortedDates = Object.keys(groupedData)
    .sort((a, b) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
    .slice(-30);

  const receitas = sortedDates.map(date => groupedData[date].receitas);
  const despesas = sortedDates.map(date => groupedData[date].despesas);

  const lineData = {
    labels: sortedDates.map((date, index) => {
      // Mostrar menos labels no mobile
      if (isMobile && index % 3 !== 0) return '';
      return date.split('/').slice(0, 2).join('/');
    }),
    datasets: [
      {
        label: 'Receitas',
        data: receitas,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        tension: 0.4,
        borderWidth: isMobile ? 2 : 3,
        pointRadius: isMobile ? 3 : 4,
        pointHoverRadius: isMobile ? 5 : 6,
      },
      {
        label: 'Despesas',
        data: despesas,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: 'origin',
        tension: 0.4,
        borderWidth: isMobile ? 2 : 3,
        pointRadius: isMobile ? 3 : 4,
        pointHoverRadius: isMobile ? 5 : 6,
      }
    ],
  };

  // Opções dos gráficos otimizadas para mobile
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: isMobile ? 'bottom' as const : 'top' as const,
        labels: {
          padding: isMobile ? 15 : 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: isMobile ? 11 : 12,
            family: 'Inter, sans-serif'
          },
          color: '#d1d5db',
          boxWidth: isMobile ? 10 : 12,
          boxHeight: isMobile ? 10 : 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: isMobile ? 8 : 12,
        titleFont: { size: isMobile ? 12 : 14 },
        bodyFont: { size: isMobile ? 11 : 13 },
        padding: isMobile ? 8 : 12,
      },
    },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: {
        display: true,
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
        ticks: {
          color: '#9ca3af',
          font: { size: isMobile ? 10 : 11 },
          maxTicksLimit: isMobile ? 4 : 8,
        },
      },
      y: {
        display: true,
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
        ticks: {
          color: '#9ca3af',
          font: { size: isMobile ? 10 : 11 },
          callback: function(value: any) {
            return 'R$ ' + value.toFixed(0);
          }
        },
      },
    },
  };

  // Componente de gráfico expandido para mobile
  const ExpandedChart = ({ type, onClose }: { type: 'pie' | 'line', onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">
            {type === 'pie' ? 'Gastos por Categoria' : 'Evolução Temporal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="h-80">
          {type === 'pie' ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <Line data={lineData} options={lineOptions} />
          )}
        </div>
      </div>
    </div>
  );

  if (categorias.length === 0 && sortedDates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-400">Nenhum dado para exibir nos gráficos</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${isMobile ? 'space-y-6' : 'charts-grid'}`}>
        {/* Gráfico de Pizza - Gastos por Categoria */}
        {categorias.length > 0 && (
          <div className="card-glass rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="truncate">Gastos por Categoria</span>
              </h2>
              
              {isMobile && (
                <button
                  onClick={() => setExpandedChart('pie')}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg"
                  title="Expandir gráfico"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className={`chart-container ${isMobile ? 'h-64' : 'h-80'}`}>
              <Pie data={pieData} options={pieOptions} />
            </div>
            
            {/* Resumo estatístico */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">Total de Despesas</div>
              <div className="text-lg font-bold text-red-400">
                R$ {valores.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Linha - Evolução Temporal */}
        {sortedDates.length > 0 && (
          <div className="card-glass rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                  </svg>
                </div>
                <span className="truncate">Evolução Temporal</span>
              </h2>
              
              {isMobile && (
                <button
                  onClick={() => setExpandedChart('line')}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg"
                  title="Expandir gráfico"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className={`chart-container ${isMobile ? 'h-64' : 'h-80'}`}>
              <Line data={lineData} options={lineOptions} />
            </div>
            
            {/* Resumo do período */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">Período ({sortedDates.length} dias)</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-green-400 font-semibold text-sm">
                    R$ {receitas.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">Receitas</div>
                </div>
                <div>
                  <div className="text-red-400 font-semibold text-sm">
                    R$ {despesas.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">Despesas</div>
                </div>
                <div>
                  <div className={`font-semibold text-sm ${
                    (receitas.reduce((a, b) => a + b, 0) - despesas.reduce((a, b) => a + b, 0)) >= 0 
                      ? 'text-green-400' : 'text-red-400'
                  }`}>
                    R$ {(receitas.reduce((a, b) => a + b, 0) - despesas.reduce((a, b) => a + b, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">Saldo</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gráfico expandido para mobile */}
      {expandedChart && (
        <ExpandedChart
          type={expandedChart as 'pie' | 'line'}
          onClose={() => setExpandedChart(null)}
        />
      )}
    </>
  );
}