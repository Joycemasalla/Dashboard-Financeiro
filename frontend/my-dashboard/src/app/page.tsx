// src/app/page.tsx
import { supabase } from '../lib/supabaseClient';
import DashboardClient from '../components/DashboardClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const userId = searchParams?.user_id as string | undefined;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 text-center">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-soft p-8 max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400 mb-6">
            Por favor, acesse o dashboard através do link enviado pelo WhatsApp.
          </p>
          <a
            href="https://wa.me/+14155238886" // Substitua pelo seu número de Twilio
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const { data: transacoes, error } = await supabase
    .from('transacoes')
    .select('*')
    // --- NOVO: Adiciona filtro por user_id na busca inicial
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-soft p-8 max-w-md w-full text-center border border-gray-700/50">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erro ao Carregar</h2>
          <p className="text-gray-400 mb-6">Não foi possível carregar as transações: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary w-full"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header moderno com gradiente dark */}
      <div className="header-gradient">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo/Icon */}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Dashboard Financeiro
                </h1>
                <p className="text-sm text-gray-400 hidden md:block">
                  Gerencie suas finanças via WhatsApp
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Mobile status */}
          <div className="md:hidden mt-4 flex justify-center">
            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Sistema Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        {/* --- NOVO: Passa o user_id para o DashboardClient */}
        <DashboardClient transacoes={transacoes} userId={userId} />
      </div>

      {/* WhatsApp Float Button aprimorado */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/+14155238886"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn w-14 h-14 flex items-center justify-center text-white transform hover:scale-110 transition-all duration-300"
          aria-label="Abrir WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
          </svg>
        </a>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Enviar mensagem
        </div>
      </div>
    </div>
  );
}