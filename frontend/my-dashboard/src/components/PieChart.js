// src/components/PieChart.js
"use client";

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Cores modernas e vibrantes para tema dark
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#a855f7', // Purple
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
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/50">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">Nenhuma despesa para exibir</p>
          <p className="text-sm text-gray-500 mt-1">Registre despesas pelo WhatsApp</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: categorias.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      label: 'Valor (R$)',
      data: valores,
      backgroundColor: CHART_COLORS.slice(0, categorias.length).map(color => color + '80'),
      borderColor: CHART_COLORS.slice(0, categorias.length),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 15,
      hoverBackgroundColor: CHART_COLORS.slice(0, categorias.length),
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
            weight: '500',
            family: 'Inter, sans-serif'
          },
          color: '#d1d5db',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
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
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      }
    },
  };

  return (
    <div className="relative h-full">
      <Pie data={chartData} options={options} />
      
      {/* Resumo estatístico melhorado */}
      <div className="absolute top-2 right-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-2 font-medium">Total Despesas</div>
        <div className="text-lg font-bold text-white mb-1">
          R$ {valores.reduce((a, b) => a + b, 0).toFixed(2)}
        </div>
        <div className="text-xs text-gray-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}