// src/components/QuickExpenseInput.tsx
"use client";

import { useState } from 'react';

interface QuickExpenseInputProps {
  userId: string;
  onSuccess: () => void;
}

export default function QuickExpenseInput({ userId, onSuccess }: QuickExpenseInputProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Exemplos para ajudar o usuário
  const examples = [
    '40 mercado',
    '25 uber',
    '15.50 lanche',
    '100 gasolina',
    '80 farmácia',
    '200 aluguel'
  ];

  // Função para processar o texto e extrair valor e categoria
  const parseExpenseText = (text: string) => {
    // Remove espaços extras e converte para minúsculo
    const cleanText = text.trim().toLowerCase();
    
    // Regex para capturar valor (com vírgula ou ponto) e categoria
    const match = cleanText.match(/^(\d+(?:[.,]\d{1,2})?)\s+(.+)$/);
    
    if (!match) {
      return null;
    }

    const [, valorStr, categoria] = match;
    const valor = parseFloat(valorStr.replace(',', '.'));
    
    if (isNaN(valor) || valor <= 0) {
      return null;
    }

    return {
      valor,
      categoria: categoria.trim(),
      tipo: 'despesa' as const,
      descricao: `Despesa rápida: ${categoria}`
    };
  };

  // Função para registrar a despesa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const parsedData = parseExpenseText(inputText);
    
    if (!parsedData) {
      alert('❌ Formato inválido!\n\nUse: valor categoria\nExemplo: "40 mercado" ou "15.50 lanche"');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://dashboard-financeiro-3zo4.onrender.com/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parsedData,
          user_id: userId
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Limpar input
        setInputText('');
        setSuggestions([]);
        
        // Chamar callback de sucesso
        onSuccess();
        
        // Mostrar notificação de sucesso
        showSuccessNotification(parsedData.categoria, parsedData.valor);
        
        // Adicionar categoria às sugestões futuras (localStorage local)
        addToSuggestions(parsedData.categoria);
      } else {
        alert('❌ Erro ao registrar: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar notificação de sucesso
  const showSuccessNotification = (categoria: string, valor: number) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[9999] transform transition-all duration-300';
    notification.style.maxWidth = '400px';
    notification.style.margin = '0 auto';
    
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-lg">✅</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm">Despesa registrada!</p>
          <p class="text-xs opacity-90 truncate">${categoria}: R$ ${valor.toFixed(2)}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover após 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateY(-100px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  };

  // Adicionar categoria às sugestões
  const addToSuggestions = (categoria: string) => {
    try {
      const stored = localStorage.getItem('expense-suggestions');
      const currentSuggestions = stored ? JSON.parse(stored) : [];
      
      if (!currentSuggestions.includes(categoria)) {
        const updated = [categoria, ...currentSuggestions].slice(0, 20); // Manter apenas 20 sugestões
        localStorage.setItem('expense-suggestions', JSON.stringify(updated));
      }
    } catch (error) {
      // Ignorar erros de localStorage
    }
  };

  // Buscar sugestões do localStorage
  const loadSuggestions = () => {
    try {
      const stored = localStorage.getItem('expense-suggestions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  // Validar entrada em tempo real
  const handleInputChange = (value: string) => {
    setInputText(value);
    
    // Mostrar sugestões quando começar a digitar
    if (value.length > 2) {
      const stored = loadSuggestions();
      const filtered = stored.filter((s: string) => 
        s.toLowerCase().includes(value.toLowerCase().split(' ').pop() || '')
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  // Preview da despesa em tempo real
  const previewData = parseExpenseText(inputText);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 safe-bottom">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm">Registro Rápido</h3>
          </div>
          
          {/* Preview da despesa */}
          {previewData && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Preview:</span>
              <span className="text-red-400 font-medium">
                R$ {previewData.valor.toFixed(2)}
              </span>
              <span className="text-gray-300">
                {previewData.categoria}
              </span>
            </div>
          )}
        </div>

        {/* Form de entrada */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Ex: 40 mercado, 15.50 lanche, 100 gasolina..."
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={isLoading}
              autoComplete="off"
            />
            
            {/* Botão de enviar */}
            <button
              type="submit"
              disabled={isLoading || !inputText.trim() || !previewData}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isLoading || !inputText.trim() || !previewData
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          {/* Sugestões de categorias */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const currentValue = inputText.split(' ')[0];
                    setInputText(`${currentValue} ${suggestion}`);
                    setSuggestions([]);
                  }}
                  className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs hover:bg-gray-600/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Exemplos quando input estiver vazio */}
          {!inputText.trim() && (
            <div className="bg-gray-800/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">💡 Exemplos de uso:</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setInputText(example)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Validação em tempo real */}
          {inputText.trim() && !previewData && (
            <div className="flex items-center space-x-2 text-xs text-yellow-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Use o formato: valor categoria (ex: "40 mercado")</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}