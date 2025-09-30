// src/components/TransactionDetailModal.tsx
"use client";

import { Transacao } from '@/types';
import React from 'react';

interface TransactionDetailModalProps {
  transaction: Transacao | null;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isReceita = transaction.tipo === 'receita';
  const headerColor = isReceita ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500';
  const accentColor = isReceita ? 'text-green-400' : 'text-red-400';
  const badgeColor = isReceita ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 md:p-6 rounded-t-2xl bg-gradient-to-r ${headerColor}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isReceita ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white truncate">
              Detalhes da {isReceita ? 'Receita' : 'Despesa'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-black/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 md:p-6 space-y-4">
          
          {/* Valor */}
          <div className="text-center pb-2 border-b border-gray-700/50">
            <p className="text-sm text-gray-400 font-medium mb-1">Valor da Transação</p>
            <p className={`text-4xl font-extrabold ${accentColor}`}>
              {isReceita ? '+' : '-'}R$ {transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Informações Principais */}
          <div className="space-y-3">
            <DetailItem 
              title="Categoria" 
              value={transaction.categoria.charAt(0).toUpperCase() + transaction.categoria.slice(1)} 
              icon="tag" 
              badgeClass={badgeColor}
            />
            <DetailItem 
              title="Tipo" 
              value={isReceita ? 'Receita' : 'Despesa'} 
              icon={isReceita ? 'arrow-up' : 'arrow-down'} 
              badgeClass={badgeColor}
            />
            <DetailItem 
              title="Data" 
              value={new Date(transaction.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} 
              icon="calendar" 
            />
          </div>

          {/* Título/Descrição Completa */}
          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400 font-medium mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              Descrição Completa
            </p>
            <p className="text-white text-base bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
              {transaction.descricao || transaction.categoria}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para os detalhes
// CORREÇÃO: Usando React.ReactNode em vez de JSX.Element
const DetailItem = ({ title, value, icon, badgeClass }: { title: string, value: string, icon: string, badgeClass?: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    'tag': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    'arrow-up': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>,
    'arrow-down': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>,
    'calendar': <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0 ${badgeClass ? badgeClass.replace(/text-[a-z]+-[0-9]+/g, 'text-white') : 'bg-gray-700/50'}`}>
          {iconMap[icon]}
        </div>
        <span className="text-gray-300 text-sm font-medium">{title}</span>
      </div>
      <span className={`text-sm font-semibold ${badgeClass || 'text-white'}`}>
        {value}
      </span>
    </div>
  );
};