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
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
          </svg>
          <p>Nenhum dado temporal para exibir</p>
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
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: '+1',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Saldo',
        data: saldo,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
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
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
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
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
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
      duration: 1000,
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
      
      {/* Resumo estatístico */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-xs text-gray-600 mb-2">Período (últimos {sortedDates.length} dias)</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">● Receitas:</span>
            <span className="font-semibold">R$ {totalReceitas.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-600">● Despesas:</span>
            <span className="font-semibold">R$ {totalDespesas.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t pt-1">
            <span className={saldoTotal >= 0 ? 'text-blue-600' : 'text-red-600'}>Saldo:</span>
            <span className={`font-semibold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}