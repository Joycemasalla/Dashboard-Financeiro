// src/components/StatCard.tsx
"use client";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'success' | 'danger' | 'warning';
  change?: string;
}

const iconMap = {
  'trending-up': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  'trending-down': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
  'wallet': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  'list': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
};

const colorMap = {
  primary: {
    bg: 'from-blue-500 to-blue-600',
    text: 'text-white',
    accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    glow: 'shadow-blue-500/25'
  },
  success: {
    bg: 'from-green-500 to-green-600',
    text: 'text-white',
    accent: 'bg-green-500/20 text-green-300 border-green-500/30',
    glow: 'shadow-green-500/25'
  },
  danger: {
    bg: 'from-red-500 to-red-600',
    text: 'text-white',
    accent: 'bg-red-500/20 text-red-300 border-red-500/30',
    glow: 'shadow-red-500/25'
  },
  warning: {
    bg: 'from-yellow-500 to-yellow-600',
    text: 'text-white',
    accent: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    glow: 'shadow-yellow-500/25'
  }
};

export default function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorClass = colorMap[color];
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <div className={`stat-card card-glass rounded-2xl p-4 md:p-6 shadow-soft hover:shadow-glow hover:${colorClass.glow} transition-all duration-300 transform hover:-translate-y-1 border border-gray-700/50`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${colorClass.bg} ${colorClass.text} flex items-center justify-center shadow-lg`}>
          {IconComponent}
        </div>
        {change && (
          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${colorClass.accent}`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-xs md:text-sm text-gray-400 mb-1 font-medium">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-white truncate">{value}</p>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClass.bg} opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
}