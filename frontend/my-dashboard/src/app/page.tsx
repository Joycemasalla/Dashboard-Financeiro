// src/app/page.tsx
import { supabase } from '../lib/supabaseClient';
import DashboardClient from '../components/DashboardClient';

export const dynamic = 'force-dynamic';

// ✅ CORREÇÃO: searchParams agora é uma Promise no Next.js 15
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ CORREÇÃO: Aguardar a resolução da Promise
  const resolvedSearchParams = await searchParams;
  const userId = resolvedSearchParams?.user_id as string | undefined;

  // --- ALTERAÇÃO AQUI ---
  // Definição da mensagem e do número do WhatsApp para o link
  const twilioNumber = "+14155238886";
  const prefilledMessage = "join machine-indeed";
  const whatsappLink = `https://wa.me/${twilioNumber}?text=${encodeURIComponent(prefilledMessage)}`;
  // -------------------------

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card de acesso negado melhorado */}
          <div className="card-glass p-6 md:p-8 text-center shadow-soft">
            {/* Ícone animado */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30 float-animation">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-7V6a3 3 0 00-3-3H8a3 3 0 00-3 3v1m0 0a3 3 0 006 0m0 0v1m0 0h2m-2 0H7" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 gradient-text">
              Acesso Negado
            </h2>
            <p className="text-gray-400 mb-8 text-base leading-relaxed">
              Para acessar o dashboard, você precisa usar o link especial enviado pelo WhatsApp.
            </p>

            {/* Instruções */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Como obter acesso:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-300 text-sm">Clique no botão do WhatsApp abaixo</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-300 text-sm">Envie uma mensagem para se registrar</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-300 text-sm">Receba o link personalizado do seu dashboard</p>
                </div>
              </div>
            </div>

            {/* Botão do WhatsApp melhorado */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-lg py-4 hover:scale-105 transform transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
              </svg>
              Conectar via WhatsApp
            </a>

            {/* Link de ajuda */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 mb-2">Precisa de ajuda?</p>
              <p className="text-sm text-gray-400">
                Entre em contato pelo WhatsApp para suporte
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: transacoes, error } = await supabase
    .from('transacoes')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card-glass p-6 md:p-8 text-center shadow-soft">
            {/* Ícone de erro */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30 pulse-custom">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 gradient-text">
              Erro ao Carregar
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Não foi possível carregar suas transações. Verifique sua conexão e tente novamente.
            </p>

            {/* Detalhes do erro */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm font-medium mb-2">Detalhes do erro:</p>
              <p className="text-red-400 text-xs font-mono bg-red-900/20 p-2 rounded">
                {error.message}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tentar Novamente
              </button>
              
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
                Reportar Problema
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header moderno com gradiente dark - Melhorado para mobile */}
      <div className="header-gradient safe-top">
        <div className="main-container">
          <div className="py-4 md:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                {/* Logo/Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 truncate">
                    Dashboard Financeiro
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400 hidden sm:block truncate">
                    Gerencie suas finanças via WhatsApp
                  </p>
                </div>
              </div>

              {/* Status indicator - Redesenhado para mobile */}
              <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                <div className="flex items-center space-x-2 bg-green-500/20 px-2 md:px-3 py-1.5 md:py-2 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs md:text-sm font-medium">
                    <span className="hidden sm:inline">Sistema </span>Online
                  </span>
                </div>
                
                {/* Menu mobile futuro */}
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors md:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com melhor espaçamento */}
      <div className="main-container safe-bottom">
        <div className="py-4 md:py-6">
          <DashboardClient transacoes={transacoes || []} userId={userId} />
        </div>
      </div>

      {/* WhatsApp Float Button - Melhorado e mais acessível */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn transform hover:scale-110 transition-all duration-300 shadow-2xl"
          aria-label="Abrir WhatsApp para suporte"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
          </svg>
        </a>
        
        {/* Tooltip melhorado */}
        <div className="absolute bottom-16 right-0 bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-700/50 shadow-lg">
          💬 Suporte WhatsApp
        </div>
      </div>

      {/* Indicator de conexão mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-1 text-xs">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}