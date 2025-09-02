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
    accent: 'bg-blue-50 text-blue-600'
  },
  success: {
    bg: 'from-green-500 to-green-600',
    text: 'text-white',
    accent: 'bg-green-50 text-green-600'
  },
  danger: {
    bg: 'from-red-500 to-red-600',
    text: 'text-white',
    accent: 'bg-red-50 text-red-600'
  },
  warning: {
    bg: 'from-yellow-500 to-yellow-600',
    text: 'text-white',
    accent: 'bg-yellow-50 text-yellow-600'
  }
};

export default function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorClass = colorMap[color];
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <div className="card-glass rounded-2xl p-6 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass.bg} ${colorClass.text} flex items-center justify-center`}>
          {IconComponent}
        </div>
        {change && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass.accent}`}>
            {change}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}