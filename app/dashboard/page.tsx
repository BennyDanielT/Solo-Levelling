'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  StatsCards,
  ProductivityMetrics,
  RelationshipsMetrics,
  LearningMetrics,
  CareerMetrics,
  FinanceMetrics,
  HabitsMetrics,
} from '@/components/dashboard/DashboardWidgets';
import { useToast } from '@/components/dashboard/ToastSystem';
import { ThemeButton } from '@/lib/theme/ThemeButton';

// Main dashboard content component
function DashboardContent() {
  const { data: session } = useSession();
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsCategories, setNewsCategories] = useState<string[]>([]);
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([]);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('feed'); // 'feed' or specific category
  const [activeSection, setActiveSection] = useState<'overview' | 'productivity' | 'relationships' | 'learning' | 'career' | 'finance' | 'habits' | 'news'>('overview');
  const [stocks, setStocks] = useState<any[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const { showSuccess } = useToast();

  // Helper to get auth token
  const getAuthToken = () => {
    // Try localStorage first (for email/password login)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('✅ Using token from localStorage');
      return localToken;
    }
    
    // Try session accessToken (for OAuth login)
    if (session && (session as any).accessToken) {
      console.log('✅ Using token from session');
      return (session as any).accessToken;
    }
    
    // If no token but session exists, need to login via credentials to get JWT
    if (session?.user?.email && !localToken) {
      console.warn('⚠️ Session exists but no JWT token. You may need to sign in again with email/password to get API token.');
    }
    
    return null;
  };

  // Sync session access token to localStorage
  useEffect(() => {
    if (session && (session as any).accessToken) {
      const token = (session as any).accessToken;
      console.log('💾 Syncing session token to localStorage');
      localStorage.setItem('token', token);
    } else if (session?.user?.email) {
      console.log('📧 Session user:', session.user.email);
      console.log('🔍 Full session object:', JSON.stringify(session, null, 2));
      console.log('⚠️ No accessToken in session - OAuth login may not have returned a JWT token');
    }
  }, [session]);

  // Fetch news from backend API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          console.log('⚠️ No auth token - skipping news fetch');
          setNewsLoading(false);
          return;
        }
        
        console.log('📰 Fetching news with token');

        // Fetch available categories
        const categoriesResponse = await fetch('http://localhost:8000/news/categories', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setNewsCategories(categoriesData.data.categories || []);
        }

        // Fetch user's news preferences
        const preferencesResponse = await fetch('http://localhost:8000/news/preferences', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const preferencesData = await preferencesResponse.json();
        if (preferencesData.success) {
          setSubscribedCategories(preferencesData.data.subscribedCategories || []);
        }

        // Fetch personalized news feed
        const feedResponse = await fetch('http://localhost:8000/news/feed', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const feedData = await feedResponse.json();
        
        if (feedData.success) {
          setNews(feedData.data.articles || []);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch stock data from backend API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setStocksLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          console.log('⚠️ No auth token - skipping stocks fetch');
          setStocksLoading(false);
          return;
        }
        
        console.log('📈 Fetching stocks with token');

        // Fetch watchlist from backend
        const response = await fetch('http://localhost:8000/stocks/watchlist', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch watchlist');
        }

        const data = await response.json();
        
        if (data.success) {
          setWatchlist(data.data.watchlist || []);
          setStocks(data.data.quotes || []);
        }
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
  }, []);

  // Search stocks as user types
  useEffect(() => {
    const searchStocks = async () => {
      if (searchSymbol.length < 1) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) return;

        console.log('🔍 Searching for:', searchSymbol);
        const response = await fetch(`http://localhost:8000/stocks/search/${searchSymbol}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
      }
    };

    const timer = setTimeout(searchStocks, 300); // Debounce
    return () => clearTimeout(timer);
  }, [searchSymbol]);

  const handleAddStock = async (symbolToAdd?: string) => {
    const symbol = (symbolToAdd || searchSymbol).toUpperCase().trim();
    if (!symbol) return;

    try {
      const token = getAuthToken();
      if (!token) {
        showSuccess('Error', 'Please log in to add stocks');
        return;
      }

      console.log('➕ Adding stock:', symbol);

      const response = await fetch('http://localhost:8000/stocks/watchlist/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Refresh stocks to get updated watchlist and quotes
        const watchlistResponse = await fetch('http://localhost:8000/stocks/watchlist', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const watchlistData = await watchlistResponse.json();
        
        if (watchlistData.success) {
          setWatchlist(watchlistData.data.watchlist || []);
          setStocks(watchlistData.data.quotes || []);
        }
        
        setSearchSymbol('');
        setShowSearchResults(false);
        showSuccess('Stock Added', `${symbol} added to your watchlist`);
      } else {
        showSuccess('Error', data.message || data.detail || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      showSuccess('Error', 'Failed to add stock. Please try again.');
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      console.log('➖ Removing stock:', symbol);

      const response = await fetch(`http://localhost:8000/stocks/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setWatchlist(data.data.watchlist || []);
        setStocks(stocks.filter(s => s.symbol !== symbol));
        showSuccess('Stock Removed', `${symbol} removed from watchlist`);
      }
    } catch (error) {
      console.error('Error removing stock:', error);
      showSuccess('Error', 'Failed to remove stock');
    }
  };

  const handleSubscribeToCategory = async (category: string) => {
    try {
      const token = getAuthToken();
      console.log('📰 Subscribing to category:', category);
      if (!token) return;

      const response = await fetch(`http://localhost:8000/news/subscribe/${category}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSubscribedCategories(data.data.subscribedCategories || []);
        showSuccess('Subscribed', `You are now subscribed to ${category} news`);
        
        // Refresh news feed
        const feedResponse = await fetch('http://localhost:8000/news/feed', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const feedData = await feedResponse.json();
        if (feedData.success) {
          setNews(feedData.data.articles || []);
        }
      }
    } catch (error) {
      console.error('Error subscribing to category:', error);
    }
  };

  const handleUnsubscribeFromCategory = async (category: string) => {
    try {
      const token = getAuthToken();
      console.log('📰 Unsubscribing from category:', category);
      if (!token) return;

      const response = await fetch(`http://localhost:8000/news/unsubscribe/${category}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSubscribedCategories(data.data.subscribedCategories || []);
        showSuccess('Unsubscribed', `You have unsubscribed from ${category} news`);
        
        // Refresh news feed
        const feedResponse = await fetch('http://localhost:8000/news/feed', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const feedData = await feedResponse.json();
        if (feedData.success) {
          setNews(feedData.data.articles || []);
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from category:', error);
    }
  };

  const handleFetchNewsByCategory = async (category: string) => {
    try {
      setNewsLoading(true);
      setSelectedNewsCategory(category);
      const token = localStorage.getItem('token');
      if (!token) return;

      let response;
      if (category === 'feed') {
        // Fetch personalized feed
        response = await fetch('http://localhost:8000/news/feed', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } else {
        // Fetch specific category
        response = await fetch(`http://localhost:8000/news/category/${category}?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }

      const data = await response.json();
      if (data.success) {
        setNews(data.data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching news by category:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <DashboardLayout onAddGoal={() => {}}>
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
            <button
              onClick={() => setActiveSection('news')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeSection === 'news'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
              }`}
            >
              📰 News
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
                    News Headlines
                  </h1>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {newsLoading ? 'Loading latest news...' : 'Stay informed with global updates'}
                  </p>
                </div>
              </div>
              
              {/* Category Selector */}
              {newsCategories.length > 0 && (
                <div className='flex items-center gap-2'>
                  <label className='text-sm text-gray-600 dark:text-gray-400'>Category:</label>
                  <select
                    value={selectedNewsCategory}
                    onChange={(e) => handleFetchNewsByCategory(e.target.value)}
                    className='px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value="feed">My Feed</option>
                    {newsCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              <div className='relative'>
                <div className='flex gap-2'>
                  <div className='flex-1 relative'>
                    <input
                      type='text'
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
                      onFocus={() => searchSymbol && setShowSearchResults(true)}
                      onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                      placeholder='Search stocks (e.g., AAPL, Apple, Microsoft)'
                      className='w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className='absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50'>
                        {searchResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddStock(result.symbol)}
                            className='w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0'
                          >
                            <div className='font-semibold text-gray-900 dark:text-white'>
                              {result.symbol}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                              {result.name}
                            </div>
                            {result.exchange && (
                              <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                                {result.exchange}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddStock()}
                    className='px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                  >
                    + Add
                  </button>
                </div>
              </div>
              
              {/* Stock Cards */}
              {stocksLoading ? (
                <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
                  <div>Loading stock data from backend...</div>
                </div>
              ) : stocks.length === 0 ? (
                <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
                  <div>No stocks in watchlist</div>
                  <div className='text-xs mt-2'>Add stocks using the search above</div>
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

        {/* News Section */}
        {activeSection === 'news' && (
          <>
            <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg p-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>📰 News Feed</h2>
              
              {/* Category Selector for Viewing */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>Browse By Category</h3>
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() => handleFetchNewsByCategory('feed')}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      selectedNewsCategory === 'feed'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    📌 My Feed
                  </button>
                  {newsCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFetchNewsByCategory(category)}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        selectedNewsCategory === category
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                  Click a category to view latest news from that category
                </p>
              </div>

              <div className='h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-6'></div>
              
              {/* Subscription Management */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>My Subscriptions</h3>
                <div className='flex flex-wrap gap-2'>
                  {newsCategories.map((category) => {
                    const isSubscribed = subscribedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => isSubscribed ? handleUnsubscribeFromCategory(category) : handleSubscribeToCategory(category)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                          isSubscribed
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {isSubscribed ? '✓ ' : '+ '}{category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                  Subscribe to categories to include them in "My Feed". Your personalized feed combines all subscribed categories.
                </p>
              </div>

              {/* News Articles */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                    {selectedNewsCategory === 'feed' 
                      ? '📌 Your Personalized Feed' 
                      : `📰 ${selectedNewsCategory.charAt(0).toUpperCase() + selectedNewsCategory.slice(1)} News`
                    }
                  </h3>
                  <button
                    onClick={() => handleFetchNewsByCategory(selectedNewsCategory)}
                    className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {newsLoading ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    Loading news...
                  </div>
                ) : news.length === 0 ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    <p>No news articles available.</p>
                    <p className='text-xs mt-2'>Subscribe to categories above to see articles.</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {news.map((article, index) => (
                      <a
                        key={article.id || index}
                        href={article.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group bg-gray-50 dark:bg-gray-800/80 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105'
                      >
                        {article.imageUrl && (
                          <div className='w-full h-40 mb-3 rounded-lg overflow-hidden'>
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                            />
                          </div>
                        )}
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase'>
                            {article.category}
                          </span>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            {article.source}
                          </span>
                        </div>
                        <h3 className='font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-3'>
                            {article.description}
                          </p>
                        )}
                        <div className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
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
