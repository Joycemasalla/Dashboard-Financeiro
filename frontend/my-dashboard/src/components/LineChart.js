// src/components/LineChart.js
"use client";

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ data }) {
  // Agrupar dados por data
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
  }, {});

  // Ordenar por data e pegar últimos 30 dias
  const sortedDates = Object.keys(groupedData)
    .sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')))
    .slice(-30);

  if (sortedDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/50">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">Nenhum dado temporal</p>
          <p className="text-sm text-gray-500 mt-1">Adicione transações para ver a evolução</p>
        </div>
      </div>
    );
  }

  const receitas = sortedDates.map(date => groupedData[date].receitas);
  const despesas = sortedDates.map(date => groupedData[date].despesas);
  const saldo = sortedDates.map(date => groupedData[date].receitas - groupedData[date].despesas);

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Receitas',
        data: receitas,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#22c55e',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
      {
        label: 'Despesas',
        data: despesas,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: 'origin',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ef4444',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
      {
        label: 'Saldo',
        data: saldo,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [8, 4],
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          maxTicksLimit: 8,
          callback: function(value, index, values) {
            // Mostrar apenas algumas datas para não ficar poluído
            if (index % Math.ceil(values.length / 6) === 0) {
              return this.getLabelForValue(value);
            }
            return '';
          }
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          callback: function(value) {
            return 'R$ ' + value.toFixed(0);
          }
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
  };

  // Calcular estatísticas
  const totalReceitas = receitas.reduce((a, b) => a + b, 0);
  const totalDespesas = despesas.reduce((a, b) => a + b, 0);
  const saldoTotal = totalReceitas - totalDespesas;

  return (
    <div className="relative h-full">
      <Line data={chartData} options={options} />
      
      {/* Resumo estatístico melhorado */}
      <div className="absolute top-2 right-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-2 font-medium">
          Período ({sortedDates.length} dias)
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Receitas:</span>
            </div>
            <span className="font-semibold text-green-400">R$ {totalReceitas.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Despesas:</span>
            </div>
            <span className="font-semibold text-red-400">R$ {totalDespesas.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-gray-600/50 pt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Saldo:</span>
            </div>
            <span className={`font-semibold ${saldoTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {saldoTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}