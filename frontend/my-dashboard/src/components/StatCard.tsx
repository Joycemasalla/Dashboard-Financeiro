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
    accent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shadow: 'shadow-blue-500/25',
    glow: 'neon-blue'
  },
  success: {
    bg: 'from-green-500 to-green-600',
    text: 'text-white',
    accent: 'bg-green-500/20 text-green-400 border-green-500/30',
    shadow: 'shadow-green-500/25',
    glow: 'neon-green'
  },
  danger: {
    bg: 'from-red-500 to-red-600',
    text: 'text-white',
    accent: 'bg-red-500/20 text-red-400 border-red-500/30',
    shadow: 'shadow-red-500/25',
    glow: 'neon-red'
  },
  warning: {
    bg: 'from-yellow-500 to-yellow-600',
    text: 'text-white',
    accent: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    shadow: 'shadow-yellow-500/25',
    glow: 'neon-yellow'
  }
};

export default function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorClass = colorMap[color];
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <div className={`group card-glass rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-soft hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${colorClass.bg} ${colorClass.text} flex items-center justify-center shadow-lg ${colorClass.shadow} group-hover:scale-110 transition-transform duration-300`}>
            {IconComponent}
          </div>
          {change && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClass.accent} backdrop-blur-sm`}>
              {change}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm lg:text-base text-gray-400 font-medium">{title}</p>
          <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-white break-all group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
            {value}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-white/3 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-transparent group-hover:border-gray-600/50 transition-all duration-300"></div>
    </div>
  );
}