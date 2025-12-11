'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StockData {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number;
}

interface StockHistoryChartProps {
  symbol: string;
}

export default function StockHistoryChart({ symbol }: StockHistoryChartProps) {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'>('1mo');

  const periods: Array<{ label: string; value: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' }> = [
    { label: 'Today', value: '1d' },
    { label: '5 Days', value: '5d' },
    { label: '1 Month', value: '1mo' },
    { label: '3 Months', value: '3mo' },
    { label: '6 Months', value: '6mo' },
    { label: '1 Year', value: '1y' },
  ];

  useEffect(() => {
    fetchHistory();
  }, [symbol, period]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stocks/history/${symbol.toUpperCase()}?period=${period}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view stock data');
        }
        throw new Error('Failed to fetch stock history');
      }
      
      const result = await response.json();
      
      if (result.success && result.data?.history) {
        setData(result.data.history);
      } else {
        setError('No data available for this stock');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Stock history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-lg p-6 space-y-4">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {periods.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              period === value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading {symbol} price data...</div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => value !== null ? `$${Number(value).toFixed(2)}` : 'N/A'}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            <Line 
              type="monotone" 
              dataKey="open" 
              stroke="#60a5fa" 
              dot={false}
              isAnimationActive={false}
              name="Open"
            />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#34d399" 
              dot={false}
              isAnimationActive={false}
              name="Close"
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#fbbf24" 
              dot={false}
              isAnimationActive={false}
              name="High"
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="#f87171" 
              dot={false}
              isAnimationActive={false}
              name="Low"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">No data available</div>
        </div>
      )}
    </div>
  );
}
