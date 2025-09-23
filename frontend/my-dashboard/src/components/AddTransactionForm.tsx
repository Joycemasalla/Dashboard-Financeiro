// src/components/AddTransactionForm.tsx
"use client";

import { useState } from 'react';

interface AddTransactionFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function AddTransactionForm({ userId, onSuccess }: AddTransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    valor: '',
    categoria: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    descricao: ''
  });

  // Categorias predefinidas para facilitar
  const categoriasSugeridas = [
    'mercado', 'gasolina', 'restaurante', 'farmácia', 'loja', 'salão',
    'aluguel', 'conta de luz', 'conta de água', 'internet', 'celular',
    'médico', 'dentista', 'roupas', 'transporte', 'uber', 'freelance',
    'salário', 'venda', 'outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const valor = parseFloat(formData.valor.replace(',', '.'));
      
      if (!valor || valor <= 0) {
        alert('Por favor, insira um valor válido');
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
          categoria: formData.categoria.trim(),
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
        onSuccess(); // Callback para atualizar a lista
        
        // Feedback visual
        const emoji = formData.tipo === 'receita' ? '💚' : '💸';
        alert(`${emoji} Transação registrada com sucesso!\n${formData.categoria}: R$ ${valor.toFixed(2)}`);
      } else {
        alert('Erro ao registrar transação: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoriaChange = (categoria: string) => {
    setFormData({ ...formData, categoria });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 border-2 border-blue-400/30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            Nova Transação
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'despesa' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                  formData.tipo === 'despesa'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'receita' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                  formData.tipo === 'receita'
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                Receita
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">R$</span>
              </div>
              <input
                type="text"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => {
                  // Permitir apenas números, vírgula e ponto
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  setFormData({ ...formData, valor: value });
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Digite uma categoria..."
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              
              {/* Sugestões de categorias */}
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {categoriasSugeridas.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoriaChange(cat)}
                    className="text-xs text-left px-2 py-1 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded transition-all duration-200"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descrição opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Descrição adicional..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-600 hover:bg-gray-700 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.valor || !formData.categoria}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isLoading || !formData.valor || !formData.categoria
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : formData.tipo === 'receita'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/25'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Salvando...
                </div>
              ) : (
                `Adicionar ${formData.tipo === 'receita' ? 'Receita' : 'Despesa'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}