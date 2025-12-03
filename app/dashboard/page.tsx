'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  StatsCards,
  GoalProgressChart,
  CategoryBreakdownChart,
  WeeklyStatsChart,
  GoalsMetrics,
  ProductivityMetrics,
  RelationshipsMetrics,
  LearningMetrics,
  CareerMetrics,
  FinanceMetrics,
  HabitsMetrics,
} from '@/components/dashboard/DashboardWidgets';
import { AddGoalModal } from '@/components/dashboard/AddGoalModal';
import { useToast } from '@/components/dashboard/ToastSystem';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import { Goal } from '@/types';

// Goals will be fetched from database
const sampleGoals: Goal[] = [];

// Main dashboard content component
function DashboardContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'goals' | 'productivity' | 'relationships' | 'learning' | 'career' | 'finance' | 'habits'>('overview');
  const [stocks, setStocks] = useState<any[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
  const { showSuccess } = useToast();

  // Fetch latest news on component mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using gnews.io API (free, no API key required for basic usage)
        const response = await fetch(
          'https://gnews.io/api/v4/top-headlines?lang=en&max=3&apikey=demo' // Using demo key, replace with real key
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback news if API fails
        setNews([
          {
            title: 'Global Markets Show Strong Recovery',
            description: 'Stock markets worldwide continue upward trend...',
            url: '#',
          },
          {
            title: 'Tech Innovation Reaches New Heights',
            description: 'AI and machine learning reshape industries...',
            url: '#',
          },
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch stock data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setStocksLoading(true);
        const stockPromises = watchlist.map(async (symbol) => {
          try {
            // Try Yahoo Finance API with no-cors (will use mock data due to CORS restrictions)
            // In production, you should use a backend proxy or paid API service
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
              { mode: 'no-cors' }
            );
            
            // Since no-cors blocks reading response, we'll throw to use mock data
            throw new Error('Using mock data due to CORS');
          } catch (error) {
            // Mock data (Yahoo Finance API blocked by CORS)
            // To use real data, implement a backend proxy or use services like:
            // - Alpha Vantage (free tier available)
            // - Finnhub.io (free tier available)
            // - IEX Cloud (free tier available)
            const mockPrices: any = {
              AAPL: { name: 'Apple Inc.', price: 195.71, change: 2.34, changePercent: 1.21 },
              GOOGL: { name: 'Alphabet Inc.', price: 142.68, change: 1.23, changePercent: 0.87 },
              MSFT: { name: 'Microsoft Corp.', price: 384.47, change: 3.56, changePercent: 0.93 },
              TSLA: { name: 'Tesla Inc.', price: 248.98, change: -2.15, changePercent: -0.86 },
              AMZN: { name: 'Amazon.com Inc.', price: 151.94, change: 1.87, changePercent: 1.24 },
              META: { name: 'Meta Platforms', price: 338.12, change: 4.23, changePercent: 1.27 },
              NVDA: { name: 'NVIDIA Corp.', price: 495.22, change: 8.45, changePercent: 1.74 },
              NFLX: { name: 'Netflix Inc.', price: 438.65, change: -3.21, changePercent: -0.73 },
            };
            
            const mock = mockPrices[symbol] || { name: symbol, price: 0, change: 0, changePercent: 0 };
            return {
              symbol,
              name: mock.name,
              price: mock.price.toFixed(2),
              change: mock.change.toFixed(2),
              changePercent: mock.changePercent.toFixed(2),
              currency: 'USD',
            };
          }
        });
        
        const stockData = await Promise.all(stockPromises);
        setStocks(stockData);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setStocksLoading(false);
      }
    };

    fetchStocks();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleAddStock = () => {
    const symbol = searchSymbol.toUpperCase().trim();
    if (symbol && !watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      setSearchSymbol('');
      showSuccess('Stock Added', `${symbol} added to your watchlist`);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    showSuccess('Stock Removed', `${symbol} removed from watchlist`);
  };

  const handleAddGoal = (
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => [...prev, newGoal]);
    showSuccess(
      'Goal Created!',
      `Successfully added "${newGoal.title}" to your goals.`,
    );
  };

  const handleEditGoal = (goal: Goal) => {
    // TODO: Implement edit functionality
    showSuccess('Edit Goal', 'Edit functionality coming soon!');
  };

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showSuccess(
      'Goal Deleted',
      `"${goal?.title}" has been removed from your goals.`,
    );
  };

  const handleToggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newStatus =
            goal.status === 'completed' ? 'active' : 'completed';
          const updates: Partial<Goal> = {
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : goal.progress,
            updatedAt: new Date().toISOString(),
          };

          if (newStatus === 'completed') {
            updates.completedAt = new Date().toISOString();
          }

          return { ...goal, ...updates };
        }
        return goal;
      }),
    );

    const goal = goals.find((g) => g.id === goalId);
    if (goal?.status !== 'completed') {
      showSuccess(
        'Goal Completed! 🎉',
        `Congratulations on completing "${goal?.title}"!`,
      );
    }
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, progress, updatedAt: new Date().toISOString() }
          : goal,
      ),
    );
  };

  return (
    <DashboardLayout onAddGoal={() => setIsAddGoalModalOpen(true)}>
      <div className='space-y-8'>
        {/* Section Navigation */}
        <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg p-2'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              🎯 Overview
            </button>
            <button
              onClick={() => setActiveSection('goals')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'goals'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              📊 Goals
            </button>
            <button
              onClick={() => setActiveSection('productivity')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'productivity'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              ⚙️ Productivity
            </button>
            <button
              onClick={() => setActiveSection('relationships')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'relationships'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              ❤️ Relationships
            </button>
            <button
              onClick={() => setActiveSection('learning')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'learning'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              📚 Learning
            </button>
            <button
              onClick={() => setActiveSection('career')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'career'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              💼 Career
            </button>
            <button
              onClick={() => setActiveSection('finance')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'finance'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              💰 Finance
            </button>
            <button
              onClick={() => setActiveSection('habits')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'habits'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              📋 Habits
            </button>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
        {/* Welcome Section */}
        <div className='group relative overflow-hidden rounded-3xl p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500'>
          {/* Animated background elements */}
          <div className='absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
          <div className='absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
          
          {/* Content */}
          <div className='relative z-10'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl'>📰</span>
                </div>
                <div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent'>
                    Today's Headlines
                  </h1>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {newsLoading ? 'Loading latest news...' : 'Stay informed with global updates'}
                  </p>
                </div>
              </div>
            </div>
              
            {/* News Headlines Carousel */}
            {!newsLoading && news.length > 0 && (
              <div className='mt-4 space-y-2'>
                {news.slice(0, 2).map((article, idx) => (
                  <a
                    key={idx}
                    href={article.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group/news'
                  >
                    <div className='flex items-start gap-2'>
                      <span className='text-lg mt-0.5'>🔥</span>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-semibold text-gray-900 dark:text-white truncate group-hover/news:text-emerald-600 dark:group-hover/news:text-emerald-400 transition-colors'>
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1'>
                            {article.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {/* Stock Market Tracker */}
            <div className='mt-6 space-y-4'>
              {/* Add Stock Search */}
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
                  placeholder='Enter stock symbol (e.g., AAPL, GOOGL)'
                  className='flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                />
                <button
                  onClick={handleAddStock}
                  className='px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  + Add Stock
                </button>
              </div>
              
              {/* Stock Cards */}
              {stocksLoading ? (
                <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
                  <div>Loading stock data...</div>
                  <div className='text-xs mt-2'>Using demo data (Yahoo Finance blocked by CORS)</div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {stocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className='bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 hover:scale-105 transition-transform duration-300 relative group'
                    >
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 text-xs font-bold'
                      >
                        ✕
                      </button>
                      <div className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase'>
                        {stock.symbol}
                      </div>
                      <div className='text-xl font-bold text-gray-900 dark:text-white mt-1'>
                        ${stock.price}
                      </div>
                      <div className={`text-sm font-semibold mt-1 flex items-center gap-1 ${
                        parseFloat(stock.change) >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        <span>{parseFloat(stock.change) >= 0 ? '↑' : '↓'}</span>
                        <span>{stock.change} ({stock.changePercent}%)</span>
                      </div>
                      <div className='text-xs text-gray-600 dark:text-gray-400 mt-1 truncate'>
                        {stock.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsCards />

        {/* Charts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <GoalProgressChart />
          <CategoryBreakdownChart />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-1 gap-6'>
          <WeeklyStatsChart />
        </div>
          </>
        )}

        {/* Goals Section */}
        {activeSection === 'goals' && (
          <>
            <GoalsMetrics />
          </>
        )}

        {/* Productivity Section */}
        {activeSection === 'productivity' && (
          <>
            <ProductivityMetrics />
          </>
        )}

        {/* Relationships Section */}
        {activeSection === 'relationships' && (
          <>
            <RelationshipsMetrics />
          </>
        )}

        {/* Learning Section */}
        {activeSection === 'learning' && (
          <>
            <LearningMetrics />
          </>
        )}

        {/* Career Section */}
        {activeSection === 'career' && (
          <>
            <CareerMetrics />
          </>
        )}

        {/* Finance Section */}
        {activeSection === 'finance' && (
          <>
            <FinanceMetrics />
          </>
        )}

        {/* Habits Section */}
        {activeSection === 'habits' && (
          <>
            <HabitsMetrics />
          </>
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onAdd={handleAddGoal}
        existingGoals={goals}
      />
    </DashboardLayout>
  );
}

// Main page component
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/landing');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl animate-pulse'>
            <span className='text-3xl'>⚡</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <DashboardContent />;
}
