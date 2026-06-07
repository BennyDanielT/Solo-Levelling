# Stock History Function - Setup Guide

## ✅ What We've Created

### 1. **Backend Function** (`simple_agent_tools.py`)
- Single async function: `get_stock_history(symbol, period)`
- Uses existing `StockService` from `stocks.py`
- Supports time periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
- Returns structured JSON with open/close/high/low prices and dates

### 2. **API Route** (Already exists in `app.py`)
- Endpoint: `GET /stocks/history/{symbol}?period=1mo`
- Returns: `{ success: true, data: { symbol, period, history: [...] } }`

### 3. **Frontend Component** (`StockHistoryChart.tsx`)
- Interactive chart using Recharts
- Period selector buttons (1d, 5d, 1mo, 3mo, 6mo, 1y)
- Shows Open, Close, High, Low prices on line chart
- Error handling and loading states

### 4. **Stocks Page** (`app/stocks/page.tsx`)
- Search bar for custom symbols
- Popular stocks quick-select buttons (AAPL, MSFT, GOOGL, etc.)
- Full-page stock analysis view
- Navigation integration

## 🚀 How to Test

### 1. **Frontend Test**
```bash
# Navigate to http://localhost:3000/stocks
# Select a stock (AAPL pre-selected)
# Click "Load Price History"
# See the interactive chart
```

### 2. **API Test**
```bash
# Get 1-month history for Apple
curl http://localhost:3000/api/stocks/history/AAPL?period=1mo

# Get 1-year history for Tesla
curl http://localhost:3000/api/stocks/history/TSLA?period=1y

# Get 5-day history for Microsoft
curl http://localhost:3000/api/stocks/history/MSFT?period=5d
```

## 🤖 Next: Add to AI Agent

Once we verify everything works, we'll:

1. Import `SimpleAgentTools` in `llm_service.py`
2. Create a single sync wrapper function: `get_stock_history(symbol, period)`
3. Register it with Azure agent: `agent.enable_auto_function_calls(tools=[get_stock_history])`
4. Test by asking: "What was Apple's stock price for the last month?"

## 📊 Data Structure Example

```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "period": "1mo",
    "history": [
      {
        "date": "2024-12-01",
        "open": 245.50,
        "high": 248.75,
        "low": 244.20,
        "close": 247.80,
        "volume": 52000000
      },
      // ... more daily data points
    ]
  }
}
```

## 🔧 Key Files

- Backend: `ai-agent-service/simple_agent_tools.py` (NEW)
- Component: `components/StockHistoryChart.tsx` (NEW)
- Page: `app/stocks/page.tsx` (NEW)
- Navigation: `components/Navigation.tsx` (UPDATED)
- Existing Routes: `ai-agent-service/app.py` (already has `/stocks/history/{symbol}`)
- Existing Service: `ai-agent-service/stocks.py` (already has `get_stock_history()`)

## ✨ Why This Approach Works

1. **Simple**: One function at a time = less complexity
2. **Reusable**: Leverages existing `StockService`
3. **Testable**: Can test frontend independently
4. **Clean**: Separation of concerns (tools, routes, components)
5. **Scalable**: Easy to add more functions following same pattern

---

Ready to deploy and test! 🚀
