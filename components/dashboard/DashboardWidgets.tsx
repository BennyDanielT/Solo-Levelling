'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Sample data
const goalProgressData = [
  { name: 'Mon', completed: 4, total: 6 },
  { name: 'Tue', completed: 3, total: 5 },
  { name: 'Wed', completed: 6, total: 7 },
  { name: 'Thu', completed: 5, total: 6 },
  { name: 'Fri', completed: 7, total: 8 },
  { name: 'Sat', completed: 2, total: 3 },
  { name: 'Sun', completed: 3, total: 4 },
];

const categoryData = [
  { name: 'Work', value: 35, color: '#01befe' },
  { name: 'Health', value: 25, color: '#ffdd00' },
  { name: 'Personal', value: 20, color: '#ff7d00' },
  { name: 'Learning', value: 20, color: '#adff02' },
];

const weeklyStatsData = [
  { name: 'Week 1', goals: 12, achievements: 8 },
  { name: 'Week 2', goals: 15, achievements: 11 },
  { name: 'Week 3', goals: 18, achievements: 14 },
  { name: 'Week 4', goals: 20, achievements: 16 },
];

const chartVariants: Record<string, string> = {
  aurora: 'bg-gradient-to-br from-[#3f2b96] via-[#251E61] to-[#000] text-white',
  citrus:
    'bg-gradient-to-br from-[#ffb347] via-[#ffcc33] to-[#e96443] text-gray-900',
  mint: 'bg-gradient-to-br from-[#11998e] via-[#38ef7d] to-[#0f2027] text-white',
};

interface ChartCardProps {
  title: string;
  variant?: keyof typeof chartVariants;
  children: React.ReactNode;
}

function ChartCard({ title, variant = 'aurora', children }: ChartCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 shadow-xl p-6 ${chartVariants[variant]}`}
    >
      <h3 className='text-lg font-semibold mb-4 drop-shadow'>{title}</h3>
      {children}
    </div>
  );
}

export function GoalProgressChart() {
  return (
    <ChartCard title='Weekly Goal Progress' variant='aurora'>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={goalProgressData}>
          <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
          <XAxis
            dataKey='name'
            className='text-gray-600 dark:text-gray-400'
            fontSize={12}
          />
          <YAxis className='text-gray-600 dark:text-gray-400' fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Area
            type='monotone'
            dataKey='completed'
            stackId='1'
            stroke='#01befe'
            fill='#01befe'
            fillOpacity={0.6}
          />
          <Area
            type='monotone'
            dataKey='total'
            stackId='2'
            stroke='#ffdd00'
            fill='#ffdd00'
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryBreakdownChart() {
  return (
    <ChartCard title='Goals by Category' variant='citrus'>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey='value'
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function WeeklyStatsChart() {
  return (
    <ChartCard title='Weekly Achievements' variant='mint'>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={weeklyStatsData}>
          <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
          <XAxis
            dataKey='name'
            className='text-gray-600 dark:text-gray-400'
            fontSize={12}
          />
          <YAxis className='text-gray-600 dark:text-gray-400' fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar
            dataKey='goals'
            fill='#01befe'
            name='Goals Set'
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey='achievements'
            fill='#adff02'
            name='Achievements'
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Stats cards component
export function StatsCards() {
  const stats = [
    {
      name: 'Total Goals',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: '🎯',
      bg: 'from-[#ff758c] to-[#ff7eb3]',
    },
    {
      name: 'Completed',
      value: '18',
      change: '+8%',
      changeType: 'positive',
      icon: '✅',
      bg: 'from-[#43cea2] to-[#185a9d]',
    },
    {
      name: 'Success Rate',
      value: '75%',
      change: '+5%',
      changeType: 'positive',
      icon: '📈',
      bg: 'from-[#4776e6] to-[#8e54e9]',
    },
    {
      name: 'Streak',
      value: '7 days',
      change: '+2 days',
      changeType: 'positive',
      icon: '🔥',
      bg: 'from-[#f7971e] to-[#ffd200]',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {stats.map((stat) => (
        <div
          key={stat.name}
          className={`rounded-2xl p-6 text-white shadow-xl border border-white/10 bg-gradient-to-br ${stat.bg}`}
        >
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <span className='text-2xl'>{stat.icon}</span>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium opacity-80'>{stat.name}</p>
              <p className='text-2xl font-semibold'>{stat.value}</p>
              <p className='text-sm text-white/80'>
                {stat.change} from last week
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
