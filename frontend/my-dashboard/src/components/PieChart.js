// src/components/PieChart.js
"use client"; // Importante: Gráficos precisam ser componentes do cliente.

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Geração de cores dinâmicas para o gráfico
const generateColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * hueStep}, 70%, 50%)`);
  }
  return colors;
};

export default function PieChart({ data }) {
  // 1. Processar os dados para o formato do Chart.js
  const despesasPorCategoria = data
    .filter(item => item.tipo === 'despesa')
    .reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + item.valor;
      return acc;
    }, {});

  const categorias = Object.keys(despesasPorCategoria);
  const valores = Object.values(despesasPorCategoria);
  const cores = generateColors(categorias.length);

  const chartData = {
    labels: categorias,
    datasets: [{
      label: 'Despesas por Categoria',
      data: valores,
      backgroundColor: cores,
      borderColor: cores.map(color => color.replace('70%', '50%')),
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Despesas por Categoria',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}