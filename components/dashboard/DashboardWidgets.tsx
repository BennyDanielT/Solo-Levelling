'use client';

import React, { useState } from 'react';
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

// Data will be fetched from database
const goalProgressData = [
  { name: 'Mon', completed: 0, total: 0 },
  { name: 'Tue', completed: 0, total: 0 },
  { name: 'Wed', completed: 0, total: 0 },
  { name: 'Thu', completed: 0, total: 0 },
  { name: 'Fri', completed: 0, total: 0 },
  { name: 'Sat', completed: 0, total: 0 },
  { name: 'Sun', completed: 0, total: 0 },
];

const categoryData = [
  { name: 'Work', value: 0, color: '#3b82f6' },      // Modern blue
  { name: 'Health', value: 0, color: '#10b981' },    // Emerald
  { name: 'Personal', value: 0, color: '#a855f7' },  // Violet
  { name: 'Learning', value: 0, color: '#f59e0b' },  // Amber
];

const weeklyStatsData = [
  { name: 'Week 1', goals: 0, achievements: 0 },
  { name: 'Week 2', goals: 0, achievements: 0 },
  { name: 'Week 3', goals: 0, achievements: 0 },
  { name: 'Week 4', goals: 0, achievements: 0 },
];

const chartVariants: Record<string, string> = {
  aurora: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border-gray-200/50 dark:border-gray-700/50',
  citrus: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border-gray-200/50 dark:border-gray-700/50',
  mint: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border-gray-200/50 dark:border-gray-700/50',
};

interface ChartCardProps {
  title: string;
  variant?: keyof typeof chartVariants;
  children: React.ReactNode;
}

function ChartCard({ title, variant = 'aurora', children }: ChartCardProps) {
  return (
    <div
      className={`rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${chartVariants[variant]}`}
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
            stroke='#f97316'
            fill='#f97316'
            fillOpacity={0.6}
          />
          <Area
            type='monotone'
            dataKey='total'
            stackId='2'
            stroke='#06b6d4'
            fill='#06b6d4'
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
            fill='#10b981'
            name='Goals Set'
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey='achievements'
            fill='#facc15'
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
  const [activeTab, setActiveTab] = useState<
    | 'hero'
    | 'goals'
    | 'productivity'
    | 'relationships'
    | 'learning'
    | 'career'
    | 'finance'
    | 'habits'
  >('hero');

  // Key Metrics (4-8 key metrics shown on landing)
  const heroMetrics = [
    {
      name: "Today's Focus Time",
      value: '0h 0m',
      subtext: 'Deep work minutes',
      icon: '⏱️',
      bgColor: '#3b82f6', // modern blue
    },
    {
      name: 'Goals Progress',
      value: '0%',
      subtext: 'Weekly milestones hit',
      icon: '🎯',
      bgColor: '#a855f7', // violet
    },
    {
      name: 'Streak',
      value: '0 days',
      subtext: 'Consecutive action days',
      icon: '🔥',
      bgColor: '#f97316', // orange
    },
    {
      name: 'Content Switches',
      value: '0',
      subtext: 'interactions today',
      icon: '🎨',
      bgColor: '#10b981', // emerald
    },
  ];
  // Goals & Progress Metrics
  const goalsMetrics = [
    {
      name: 'Completed Today',
      value: '0',
      subtext: 'goals finished',
      icon: '✅',
      bgColor: '#10b981', // emerald
    },
    {
      name: 'Completed This Week',
      value: '0',
      subtext: 'weekly total',
      icon: '📊',
      bgColor: '#3b82f6', // blue
    },
    {
      name: 'Active Goals',
      value: '0',
      subtext: 'in progress',
      icon: '🎯',
      bgColor: '#a855f7', // violet
    },
    {
      name: 'Stalled Goals',
      value: '0',
      subtext: 'no progress in 5+ days',
      icon: '⏸️',
      bgColor: '#f43f5e', // rose
    },
  ];

  // Productivity Metrics
  const productivityMetrics = [
    {
      name: 'Deep Work Today',
      value: '0h 0m',
      subtext: 'uninterrupted blocks',
      icon: '💼',
      bgColor: '#3b82f6', // blue
    },
    {
      name: 'Planned vs Reactive',
      value: '0% / 0%',
      subtext: 'time allocation',
      icon: '⚙️',
      bgColor: '#10b981', // emerald
    },
    {
      name: 'Flow Time',
      value: '0h 0m',
      subtext: 'high focus periods',
      icon: '✨',
      bgColor: '#a855f7', // violet
    },
    {
      name: 'Top Tasks Done',
      value: '0',
      subtext: 'completed by impact',
      icon: '📝',
      bgColor: '#f59e0b', // amber
    },
  ];

  // Relationships Metrics
  const relationshipsMetrics = [
    {
      name: 'Quality Time',
      value: '0h 0m',
      subtext: 'with loved ones today',
      icon: '❤️',
      bgColor: '#f43f5e', // rose
    },
    {
      name: 'Social Connections',
      value: '0',
      subtext: 'messages/calls this week',
      icon: '💬',
      bgColor: '#f97316', // orange
    },
    {
      name: 'Social Energy',
      value: '0/10',
      subtext: 'after interactions',
      icon: '⚡',
      bgColor: '#06b6d4', // cyan
    },
  ];

  // Learning Metrics
  const learningMetrics = [
    {
      name: 'Learning Time',
      value: '0h 0m',
      subtext: 'focused study today',
      icon: '📚',
      bgColor: '#a855f7', // violet
    },
    {
      name: 'Pages Read',
      value: '0',
      subtext: 'this week',
      icon: '📖',
      bgColor: '#3b82f6', // blue
    },
    {
      name: 'Practice Sessions',
      value: '0',
      subtext: 'across 0 skills',
      icon: '🎸',
      bgColor: '#10b981', // emerald
    },
  ];

  // Career Metrics
  const careerMetrics = [
    {
      name: 'Career Tasks',
      value: '0/0',
      subtext: 'completed this week',
      icon: '💡',
      bgColor: '#3b82f6',
    },
    {
      name: 'Impact Score',
      value: '0/10',
      subtext: 'weekly career impact',
      icon: '🚀',
      bgColor: '#f59e0b',
    },
    {
      name: 'Learning Progress',
      value: '0%',
      subtext: 'certification course',
      icon: '🏆',
      bgColor: '#10b981',
    },
  ];

  // Finance Metrics
  const financeMetrics = [
    {
      name: 'Weekly Spending',
      value: '$0',
      subtext: 'of $0 budget',
      icon: '💰',
      bgColor: '#10b981',
    },
    {
      name: 'Savings Rate',
      value: '0%',
      subtext: 'of monthly income',
      icon: '🏦',
      bgColor: '#3b82f6',
    },
  ];

  // Habits Metrics
  const habitsMetrics = [
    {
      name: 'Sleep Streak',
      value: '0 days',
      subtext: '7+ hours each night',
      icon: '😴',
      bgColor: '#a855f7',
    },
    {
      name: 'Workout Streak',
      value: '0 days',
      subtext: 'consecutive workouts',
      icon: '💪',
      bgColor: '#f43f5e',
    },
    {
      name: 'Planning Consistency',
      value: '0/10',
      subtext: 'days with daily planning',
      icon: '📋',
      bgColor: '#f59e0b',
    },
  ];

  const MetricCard = ({ name, value, subtext, icon, bgColor }: any) => (
    <div
      className='rounded-2xl p-5 text-white shadow-xl border border-white/10'
      style={{ backgroundColor: bgColor }}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-xs font-medium opacity-90 uppercase tracking-wide'>
            {name}
          </p>
          <p className='text-3xl font-bold mt-2'>{value}</p>
          <p className='text-xs text-white/80 mt-1'>{subtext}</p>
        </div>
        <div className='text-3xl ml-2'>{icon}</div>
      </div>
    </div>
  );

  const getMetricsByTab = () => {
    switch (activeTab) {
      case 'goals':
        return goalsMetrics;
      case 'productivity':
        return productivityMetrics;
      case 'relationships':
        return relationshipsMetrics;
      case 'learning':
        return learningMetrics;
      case 'career':
        return careerMetrics;
      case 'finance':
        return financeMetrics;
      case 'habits':
        return habitsMetrics;
      default:
        return heroMetrics;
    }
  };

  const tabs = [
    { id: 'hero', label: '🎯 Key Metrics' },
    { id: 'goals', label: '📊 Goals' },
    { id: 'productivity', label: '⚙️ Productivity' },
    { id: 'relationships', label: '❤️ Relationships' },
    { id: 'learning', label: '📚 Learning' },
    { id: 'career', label: '💼 Career' },
    { id: 'finance', label: '💰 Finance' },
    { id: 'habits', label: '📋 Habits' },
  ];

  const metrics = getMetricsByTab();

  return (
    <div className='space-y-6'>
      {/* Tab Navigation */}
      <div className='flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700/50 pb-4'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {metrics.map((metric) => (
          <MetricCard key={metric.name} {...metric} />
        ))}
      </div>
    </div>
  );
}
