// src/components/LoansManager.tsx
"use client";

import { useState, useEffect } from 'react';

interface Loan {
  id: string;
  pessoa: string;
  valor: number;
  dataEmprestimo: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago';
  observacoes?: string;
  userId: string;
}

interface LoansManagerProps {
  userId: string;
}

export default function LoansManager({ userId }: LoansManagerProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newLoan, setNewLoan] = useState({
    pessoa: '',
    valor: '',
    observacoes: ''
  });

  // Carregar empréstimos do localStorage (simulando banco de dados)
  useEffect(() => {
  loadLoans();
}, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLoans = () => {
    try {
      const stored = localStorage.getItem(`loans_${userId}`);
      if (stored) {
        setLoans(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    }
  };

  const saveLoans = (updatedLoans: Loan[]) => {
    try {
      localStorage.setItem(`loans_${userId}`, JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
    } catch (error) {
      console.error('Erro ao salvar empréstimos:', error);
    }
  };

  // Adicionar novo empréstimo
  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLoan.pessoa.trim() || !newLoan.valor) {
      alert('❌ Preencha todos os campos obrigatórios');
      return;
    }

    const valor = parseFloat(newLoan.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('❌ Valor inválido');
      return;
    }

    setIsLoading(true);

    try {
      const loan: Loan = {
        id: Date.now().toString(),
        pessoa: newLoan.pessoa.trim(),
        valor,
        dataEmprestimo: new Date().toISOString(),
        status: 'pendente',
        observacoes: newLoan.observacoes.trim() || undefined,
        userId
      };

      const updatedLoans = [...loans, loan];
      saveLoans(updatedLoans);

      // Registrar como transação de saída (despesa)
      await registerLoanTransaction(loan, 'emprestimo');

      // Reset form
      setNewLoan({ pessoa: '', valor: '', observacoes: '' });
      setIsOpen(false);

      showNotification('✅ Empréstimo registrado!', `${loan.pessoa}: R$ ${loan.valor.toFixed(2)}`);
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao registrar empréstimo');
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar como pago
  const markAsPaid = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedLoans = loans.map(l => 
      l.id === loanId 
        ? { ...l, status: 'pago' as const, dataPagamento: new Date().toISOString() }
        : l
    );
    
    saveLoans(updatedLoans);

    // Registrar como transação de entrada (receita)
    await registerLoanTransaction(loan, 'pagamento');

    showNotification('💰 Pagamento recebido!', `${loan.pessoa}: R$ ${loan.valor.toFixed(2)}`);
  };

  // Registrar transação relacionada ao empréstimo
  const registerLoanTransaction = async (loan: Loan, tipo: 'emprestimo' | 'pagamento') => {
    try {
      const transactionData = {
        valor: loan.valor,
        categoria: tipo === 'emprestimo' ? 'empréstimo dado' : 'empréstimo recebido',
        tipo: tipo === 'emprestimo' ? 'despesa' : 'receita',
        descricao: `${tipo === 'emprestimo' ? 'Empréstimo para' : 'Pagamento de'} ${loan.pessoa}${loan.observacoes ? ` - ${loan.observacoes}` : ''}`,
        user_id: userId
      };

      await fetch('https://dashboard-financeiro-3zo4.onrender.com/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
    }
  };

  // Deletar empréstimo
  const deleteLoan = (loanId: string) => {
    if (window.confirm('❌ Tem certeza que deseja deletar este empréstimo?')) {
      const updatedLoans = loans.filter(l => l.id !== loanId);
      saveLoans(updatedLoans);
    }
  };

  // Mostrar notificação
  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[9999] transform transition-all duration-300 max-w-sm';
    
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <span class="text-sm">💰</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm">${title}</p>
          <p class="text-xs opacity-90 truncate">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  // Estatísticas
  const stats = {
    totalEmprestado: loans.reduce((sum, loan) => sum + loan.valor, 0),
    totalPendente: loans.filter(l => l.status === 'pendente').reduce((sum, loan) => sum + loan.valor, 0),
    totalRecebido: loans.filter(l => l.status === 'pago').reduce((sum, loan) => sum + loan.valor, 0),
    quantidadePendente: loans.filter(l => l.status === 'pendente').length,
  };

  // Lista de pessoas que devem
  const pessoasPendentes = loans
    .filter(l => l.status === 'pendente')
    .reduce((acc, loan) => {
      if (!acc[loan.pessoa]) {
        acc[loan.pessoa] = { total: 0, count: 0, loans: [] };
      }
      acc[loan.pessoa].total += loan.valor;
      acc[loan.pessoa].count += 1;
      acc[loan.pessoa].loans.push(loan);
      return acc;
    }, {} as Record<string, { total: number; count: number; loans: Loan[] }>);

  if (!isOpen) {
    return (
      // Botão para abrir gerenciador
      <button
        onClick={() => setIsOpen(true)}
        // MUDANÇA: Usar as classes padronizadas de FAB
        className="floating-button-base floating-button-loans"
        title="Gerenciar Empréstimos"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    );
  }


  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-gray-900 w-full md:max-w-2xl md:max-h-[90vh] rounded-t-3xl md:rounded-2xl border-gray-700 md:border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Controle de Empréstimos</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {/* Estatísticas */}
              <div className="p-6 bg-gray-800/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      R$ {stats.totalEmprestado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">Total Emprestado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">
                      R$ {stats.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">A Receber</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      R$ {stats.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">Recebido</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {stats.quantidadePendente}
                    </div>
                    <div className="text-xs text-gray-400">Pendentes</div>
                  </div>
                </div>
              </div>

              {/* Form para novo empréstimo */}
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Novo Empréstimo</h3>
                <form onSubmit={handleAddLoan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome da pessoa"
                      value={newLoan.pessoa}
                      onChange={(e) => setNewLoan({ ...newLoan, pessoa: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: 100 ou 150.50)"
                      value={newLoan.valor}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.,]/g, '');
                        setNewLoan({ ...newLoan, valor: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Observações (opcional)"
                    value={newLoan.observacoes}
                    onChange={(e) => setNewLoan({ ...newLoan, observacoes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !newLoan.pessoa.trim() || !newLoan.valor}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      isLoading || !newLoan.pessoa.trim() || !newLoan.valor
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        <span>Registrando...</span>
                      </div>
                    ) : (
                      'Registrar Empréstimo'
                    )}
                  </button>
                </form>
              </div>

              {/* Resumo por pessoa (pendentes) */}
              {Object.keys(pessoasPendentes).length > 0 && (
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Pessoas que Devem</h3>
                  <div className="space-y-3">
                    {Object.entries(pessoasPendentes).map(([pessoa, data]) => (
                      <div key={pessoa} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{pessoa}</h4>
                            <p className="text-sm text-gray-400">
                              {data.count} empréstimo{data.count > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400">
                              R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-gray-400">Total devido</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de empréstimos */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Histórico ({loans.length})
                </h3>
                
                {loans.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">Nenhum empréstimo registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {loans
                      .sort((a, b) => new Date(b.dataEmprestimo).getTime() - new Date(a.dataEmprestimo).getTime())
                      .map((loan) => (
                        <div
                          key={loan.id}
                          className={`p-4 rounded-xl border transition-all ${
                            loan.status === 'pendente'
                              ? 'bg-yellow-500/5 border-yellow-500/30'
                              : 'bg-green-500/5 border-green-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-white truncate">
                                  {loan.pessoa}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    loan.status === 'pendente'
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  }`}
                                >
                                  {loan.status === 'pendente' ? '⏳ Pendente' : '✅ Pago'}
                                </span>
                              </div>
                              
                              <div className="text-sm text-gray-400">
                                <p>Emprestado: {new Date(loan.dataEmprestimo).toLocaleDateString('pt-BR')}</p>
                                {loan.dataPagamento && (
                                  <p>Pago: {new Date(loan.dataPagamento).toLocaleDateString('pt-BR')}</p>
                                )}
                                {loan.observacoes && (
                                  <p className="truncate">Obs: {loan.observacoes}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-4">
                              <div className="text-right">
                                <div className={`font-bold text-lg ${
                                  loan.status === 'pendente' ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                  R$ {loan.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                {loan.status === 'pendente' && (
                                  <button
                                    onClick={() => markAsPaid(loan.id)}
                                    className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                                    title="Marcar como pago"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => deleteLoan(loan.id)}
                                  className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                                  title="Deletar empréstimo"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}