// src/components/AddTransactionForm.tsx
"use client";

import { useState, useEffect } from 'react';

interface AddTransactionFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function AddTransactionForm({ userId, onSuccess }: AddTransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    valor: '',
    categoria: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    descricao: ''
  });

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Categorias predefinidas organizadas por tipo
  const categoriasSugeridas = {
    despesa: [
      'mercado', 'gasolina', 'restaurante', 'farmácia', 'loja', 'salão',
      'aluguel', 'conta de luz', 'conta de água', 'internet', 'celular',
      'médico', 'dentista', 'roupas', 'transporte', 'uber', 'entretenimento'
    ],
    receita: [
      'salário', 'freelance', 'venda', 'investimento', 'bonus', 'comissão',
      'aluguel recebido', 'dividendos', 'cashback', 'outros'
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const valor = parseFloat(formData.valor.replace(',', '.'));

      if (!valor || valor <= 0) {
        alert('Por favor, insira um valor válido maior que zero');
        return;
      }

      if (!formData.categoria.trim()) {
        alert('Por favor, insira uma categoria');
        return;
      }

      const response = await fetch('https://dashboard-financeiro-3zo4.onrender.com/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor,
          categoria: formData.categoria.trim().toLowerCase(),
          tipo: formData.tipo,
          descricao: formData.descricao.trim() || `${formData.tipo} - ${formData.categoria}`,
          user_id: userId
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Resetar formulário
        setFormData({
          valor: '',
          categoria: '',
          tipo: 'despesa',
          descricao: ''
        });

        setIsOpen(false);
        onSuccess();

        // Feedback visual melhorado
        const emoji = formData.tipo === 'receita' ? '💚' : '💸';
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] transform transition-all duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-lg">${emoji}</span>
            <div>
              <p class="font-semibold">Transação registrada!</p>
              <p class="text-sm opacity-90">${formData.categoria}: R$ ${valor.toFixed(2)}</p>
            </div>
          </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.classList.add('translate-x-full', 'opacity-0');
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      } else {
        alert('Erro ao registrar transação: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoriaChange = (categoria: string) => {
    setFormData({ ...formData, categoria });
  };

  const handleValorChange = (value: string) => {
    // Aceitar números, vírgula e ponto - limitar a 2 casas decimais
    let cleaned = value.replace(/[^0-9.,]/g, '');

    // Permitir apenas uma vírgula ou ponto
    const separatorCount = (cleaned.match(/[.,]/g) || []).length;
    if (separatorCount > 1) {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf(cleaned.match(/[.,]/g)![separatorCount - 1]));
    }

    setFormData({ ...formData, valor: cleaned });
  };
  // Botão FAB
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fab bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-110 transform transition-all duration-300 shadow-2xl ${isMobile ? 'bottom-20' : 'bottom-24'
          } will-change-transform`}
        aria-label="Adicionar nova transação"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className={`bg-gray-900 shadow-2xl w-full border-gray-700 ${isMobile
          ? 'rounded-t-3xl max-h-[85vh] overflow-y-auto'
          : 'rounded-2xl max-w-lg border'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="truncate">Nova Transação</span>
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 flex-shrink-0"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Tipo - Redesenhado para mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Transação</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'despesa', categoria: '' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2 min-h-[80px] ${formData.tipo === 'despesa'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
                <span className="font-medium">Despesa</span>
                <span className="text-xs opacity-75">Gastos</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'receita', categoria: '' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2 min-h-[80px] ${formData.tipo === 'receita'
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="font-medium">Receita</span>
                <span className="text-xs opacity-75">Ganhos</span>
              </button>
            </div>
          </div>

          {/* Valor - Melhorado para mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Valor</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 font-medium">R$</span>
              </div>
              <input
                type="text"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleValorChange(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                required
                disabled={isLoading}
                inputMode="decimal"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Digite o valor usando vírgula ou ponto para decimais</p>
          </div>

          {/* Categoria - Melhorada para mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Categoria
              <span className="text-xs text-gray-500 ml-2">
                ({categoriasSugeridas[formData.tipo].length} sugestões)
              </span>
            </label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={`Digite uma categoria para ${formData.tipo}...`}
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
                list="categorias"
              />

              {/* Sugestões de categorias organizadas */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">
                  Categorias sugeridas para {formData.tipo}:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {categoriasSugeridas[formData.tipo].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoriaChange(cat)}
                      className={`text-sm text-left px-3 py-2 rounded-lg transition-all duration-200 ${formData.categoria.toLowerCase() === cat
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50 border border-transparent'
                        }`}
                      disabled={isLoading}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Descrição opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Descrição <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <textarea
              placeholder="Adicione detalhes sobre esta transação..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Buttons - Redesenhados para mobile */}
          <div className={`flex gap-3 pt-4 ${isMobile ? 'pb-8' : ''}`}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-4 bg-gray-800 text-gray-300 rounded-xl border border-gray-600 hover:bg-gray-700 transition-all duration-200 font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.valor || !formData.categoria}
              className={`flex-1 px-4 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${isLoading || !formData.valor || !formData.categoria
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : formData.tipo === 'receita'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/25 hover:scale-105'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 hover:scale-105'
                } transform will-change-transform`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Adicionar {formData.tipo === 'receita' ? 'Receita' : 'Despesa'}</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Preview card - Mostra como ficará a transação */}
        {(formData.valor || formData.categoria) && (
          <div className="mx-4 md:mx-6 mb-4 md:mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2 font-medium">Preview da transação:</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.tipo === 'receita'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {formData.tipo === 'receita' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {formData.categoria || 'Categoria não definida'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <span className={`font-bold ${formData.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                }`}>
                {formData.tipo === 'receita' ? '+' : '-'}R$ {formData.valor ? parseFloat(formData.valor.replace(',', '.')).toFixed(2) : '0,00'}
              </span>
            </div>
            {formData.descricao && (
              <p className="text-xs text-gray-500 mt-2 truncate">
                {formData.descricao}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Overlay para fechar no mobile */}
      {isMobile && (
        <div
          className="absolute inset-0 -z-10"
          onClick={() => !isLoading && setIsOpen(false)}
        />
      )}
    </div>
  );
}