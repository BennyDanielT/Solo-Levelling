'use client';

import { useState } from 'react';
import StockHistoryChart from '@/components/StockHistoryChart';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function StocksPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [inputSymbol, setInputSymbol] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.toUpperCase());
      setInputSymbol('');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Stock Market Analysis</h1>

          {/* Search Bar */}
          <div className="mb-8 max-w-md">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                placeholder="Enter ticker (e.g., AAPL)"
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Search
              </button>
            </form>
            <p className="text-slate-400 text-sm mt-2">Current: {symbol.toUpperCase()}</p>
          </div>

          {/* Stock Chart */}
          <div className="mb-8">
            <StockHistoryChart symbol={symbol} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

