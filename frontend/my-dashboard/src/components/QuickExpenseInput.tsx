// src/components/QuickExpenseInput.tsx
"use client";

import { useState } from 'react';

interface QuickExpenseInputProps {
  userId: string;
  onSuccess: () => void;
  initialExpanded?: boolean; 
}

export default function QuickExpenseInput({ userId, onSuccess, initialExpanded = false }: QuickExpenseInputProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded); 

  // EXEMPLOS ATUALIZADOS para incluir Receita
  const examples = ['40 mercado', '+100 salário', '25 uber', '15,50 lanche', '+50 venda'];

  const parseExpenseText = (text: string) => {
    const cleanText = text.trim();
    
    // 1. Detecta o tipo e remove o sinal, se houver.
    let tipo: 'receita' | 'despesa' = 'despesa';
    let normalizedText = cleanText;

    // Se começar com '+', é Receita. Remove o sinal para extrair o valor.
    if (cleanText.startsWith('+')) {
      tipo = 'receita';
      normalizedText = cleanText.substring(1).trim();
    } else if (cleanText.startsWith('-')) {
      // Se começar com '-', é Despesa. Remove o sinal.
      normalizedText = cleanText.substring(1).trim();
    }
    // Se não tiver sinal, assume o padrão 'despesa' e usa o texto original/limpo.
    
    // 2. Procura por (valor) + (espaço) + (categoria)
    const match = normalizedText.match(/^(\d+(?:[.,]\d{1,2})?)\s+(.+)$/i);

    if (!match) return null;

    const [, valorStr, categoria] = match;
    const valor = parseFloat(valorStr.replace(',', '.'));

    if (isNaN(valor) || valor <= 0) return null;

    const descricaoPrefix = (tipo === 'receita') ? 'Receita rápida:' : 'Despesa rápida:';

    return {
      valor,
      categoria: categoria.trim().toLowerCase(),
      tipo: tipo,
      descricao: `${descricaoPrefix} ${categoria}`
    };
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    const parsedData = parseExpenseText(inputText);

    if (!parsedData) {
      alert('Formato inválido! Use: valor categoria ou +valor categoria\nExemplo: 40 mercado ou +100 salário');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://dashboard-financeiro-3zo4.onrender.com/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsedData, user_id: userId }),
      });

      const result = await response.json();

      if (result.success) {
        setInputText('');
        setIsExpanded(false);
        onSuccess();

        const emoji = parsedData.tipo === 'receita' ? '💚' : '💸';
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] max-w-sm';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <span class="text-xl">${emoji}</span>
            <div>
              <p class="font-semibold text-sm">Transação registrada!</p>
              <p class="text-xs opacity-90">${parsedData.categoria}: ${parsedData.tipo === 'receita' ? '+' : '-'}R$ ${parsedData.valor.toFixed(2)}</p>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const previewData = parseExpenseText(inputText);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="floating-button-base floating-button-quick-expense shadow-2xl"
        title="Registro Rápido"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900/98 backdrop-blur-lg border-t border-gray-700 shadow-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm">Registro Rápido</h3>
          </div>

          {previewData && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Preview:</span>
              <span className={`${previewData.tipo === 'receita' ? 'text-green-400' : 'text-red-400'} font-medium`}>
                {previewData.tipo === 'receita' ? '+' : '-'}R$ {previewData.valor.toFixed(2)}
              </span>
              <span className="text-gray-300">{previewData.categoria}</span>
            </div>
          )}

          <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex: 40 mercado, +100 salário, 15,50 lanche..."
            className="w-full px-4 py-3 pr-14 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 text-base"
            disabled={isLoading}
            autoFocus
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || !previewData}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isLoading || !previewData ? 'bg-gray-600 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {!inputText.trim() && (
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">Exemplos de uso:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setInputText(example)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30 hover:bg-blue-500/30"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {inputText.trim() && !previewData && (
          <div className="flex items-center space-x-2 text-xs text-yellow-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
            <span>Use: [+/-]valor categoria (ex: &quot;40 mercado&quot; ou &quot;+100 salário&quot;)</span>
          </div>
        )}
      </div>
    </div>
  );
}