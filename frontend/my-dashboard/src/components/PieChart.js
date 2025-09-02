// src/components/PieChart.js
"use client";

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Cores modernas e vibrantes
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
];

export default function PieChart({ data }) {
  // Processar os dados para o formato do Chart.js
  const despesasPorCategoria = data
    .filter(item => item.tipo === 'despesa')
    .reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {});

  const categorias = Object.keys(despesasPorCategoria);
  const valores = Object.values(despesasPorCategoria);

  // Se não houver despesas
  if (categorias.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Nenhuma despesa para exibir</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: categorias.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      label: 'Valor (R$)',
      data: valores,
      backgroundColor: CHART_COLORS.slice(0, categorias.length),
      borderColor: CHART_COLORS.slice(0, categorias.length).map(color => color),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 10,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <div className="relative h-full">
      <Pie data={chartData} options={options} />
      
      {/* Resumo estatístico */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-xs text-gray-600">Total Despesas</div>
        <div className="text-sm font-semibold text-gray-900">
          R$ {valores.reduce((a, b) => a + b, 0).toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}