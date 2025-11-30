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
  aurora: 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white',
  citrus: 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white',
  mint: 'bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white',
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

  // Hero Metrics (4-8 key metrics shown on landing)
  const heroMetrics = [
    {
      name: "Today's Focus Time",
      value: '3h 45m',
      subtext: 'Deep work minutes',
      icon: '⏱️',
      bgColor: '#01befe', // deep_sky_blue
    },
    {
      name: 'Goals Progress',
      value: '68%',
      subtext: 'Weekly milestones hit',
      icon: '🎯',
      bgColor: '#ffdd00', // bright_gold
    },
    {
      name: 'Streak',
      value: '12 days',
      subtext: 'Consecutive action days',
      icon: '🔥',
      bgColor: '#ff7d00', // vivid_tangerine
    },
    {
      name: 'Context Switches',
      value: '4',
      subtext: 'Task interruptions today',
      icon: '🔄',
      bgColor: '#adff02', // slime_lime
    },
  ];

  // Goals & Progress Metrics
  const goalsMetrics = [
    {
      name: 'Completed Today',
      value: '3',
      subtext: 'goals finished',
      icon: '✅',
      bgColor: '#90be6d', // willow_green
    },
    {
      name: 'Completed This Week',
      value: '12',
      subtext: 'weekly total',
      icon: '📊',
      bgColor: '#01befe',
    },
    {
      name: 'Active Goals',
      value: '8',
      subtext: 'in progress',
      icon: '🎯',
      bgColor: '#ffdd00',
    },
    {
      name: 'Stalled Goals',
      value: '2',
      subtext: 'no progress in 5+ days',
      icon: '⏸️',
      bgColor: '#f94144', // strawberry_red
    },
  ];

  // Productivity Metrics
  const productivityMetrics = [
    {
      name: 'Deep Work Today',
      value: '3h 45m',
      subtext: 'uninterrupted blocks',
      icon: '💼',
      bgColor: '#01befe',
    },
    {
      name: 'Planned vs Reactive',
      value: '75% / 25%',
      subtext: 'time allocation',
      icon: '⚙️',
      bgColor: '#adff02',
    },
    {
      name: 'Flow Time',
      value: '2h 30m',
      subtext: 'high focus periods',
      icon: '✨',
      bgColor: '#90be6d',
    },
    {
      name: 'Top Tasks Done',
      value: '5',
      subtext: 'completed by impact',
      icon: '📝',
      bgColor: '#ffdd00',
    },
  ];

  // Relationships Metrics
  const relationshipsMetrics = [
    {
      name: 'Quality Time',
      value: '2h 15m',
      subtext: 'with loved ones today',
      icon: '❤️',
      bgColor: '#f94144',
    },
    {
      name: 'Social Connections',
      value: '4',
      subtext: 'messages/calls this week',
      icon: '💬',
      bgColor: '#ff7d00',
    },
    {
      name: 'Social Energy',
      value: '8/10',
      subtext: 'after interactions',
      icon: '⚡',
      bgColor: '#01befe',
    },
  ];

  // Learning Metrics
  const learningMetrics = [
    {
      name: 'Learning Time',
      value: '1h 20m',
      subtext: 'focused study today',
      icon: '📚',
      bgColor: '#8f00ff', // violet_ray
    },
    {
      name: 'Pages Read',
      value: '28',
      subtext: 'this week',
      icon: '📖',
      bgColor: '#01befe',
    },
    {
      name: 'Practice Sessions',
      value: '3',
      subtext: 'across 2 skills',
      icon: '🎸',
      bgColor: '#adff02',
    },
  ];

  // Career Metrics
  const careerMetrics = [
    {
      name: 'Career Tasks',
      value: '6/8',
      subtext: 'completed this week',
      icon: '💡',
      bgColor: '#ffdd00',
    },
    {
      name: 'Impact Score',
      value: '8/10',
      subtext: 'weekly career impact',
      icon: '🚀',
      bgColor: '#ff7d00',
    },
    {
      name: 'Learning Progress',
      value: '45%',
      subtext: 'certification course',
      icon: '🏆',
      bgColor: '#90be6d',
    },
  ];

  // Finance Metrics
  const financeMetrics = [
    {
      name: 'Weekly Spending',
      value: '$248',
      subtext: 'of $400 budget',
      icon: '💰',
      bgColor: '#90be6d',
    },
    {
      name: 'Savings Rate',
      value: '32%',
      subtext: 'of monthly income',
      icon: '🏦',
      bgColor: '#01befe',
    },
  ];

  // Habits Metrics
  const habitsMetrics = [
    {
      name: 'Sleep Streak',
      value: '8 days',
      subtext: '7+ hours each night',
      icon: '😴',
      bgColor: '#8f00ff',
    },
    {
      name: 'Workout Streak',
      value: '5 days',
      subtext: 'consecutive workouts',
      icon: '💪',
      bgColor: '#f94144',
    },
    {
      name: 'Planning Consistency',
      value: '9/10',
      subtext: 'days with daily planning',
      icon: '📋',
      bgColor: '#ffdd00',
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
    { id: 'hero', label: '🎯 Hero Metrics' },
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
      <div className='flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10 pb-4'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#01befe] text-white shadow-lg'
                : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20'
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
