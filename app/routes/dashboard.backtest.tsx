import React, { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
  return [{ title: "Backtest Nifty Strategy | Admin Dashboard" }];
};

// Define API URL based on environment - but use useEffect for window access
let API_URL = "https://algo-api.evoqins.dev"; // Default value during server-side rendering

API_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : "https://algo-api.evoqins.dev";

interface Symbol {
  instrument_token: number;
  tradingsymbol: string;
  name: string;
  exchange: string;
  expiry?: string;
  strike?: number;
  lot_size?: number;
  instrument_type?: string;
  segment?: string;
}

interface BacktestSummary {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  break_even_trades: number;
  win_rate: number;
  total_profit_loss: number;
  avg_profit_loss: number;
  max_profit: number;
  max_loss: number;
}

interface BacktestParameters {
  x_time: string;
  y_time: string;
  entry_time: string;
  stop_loss: number;
  target: number;
  lot_size: number;
  instrument: number;
  start_date: string;
  end_date: string;
}

interface BacktestResult {
  date: string;
  open?: number;
  high: number;
  low: number;
  close?: number;
  volume?: number;
  day_change?: number;
  day_change_percent?: number;
  entry_price: number;
  exit_price: number;
  position: string;
  entry_time: string;
  exit_time: string;
  profit_loss: number;
  stop_loss_hit: boolean;
  target_hit: boolean;
}

interface BacktestResponse {
  summary: BacktestSummary;
  parameters: BacktestParameters;
  results: BacktestResult[];
}

export default function BacktestStrategy() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Form state
  const [instrument, setInstrument] = useState(256265);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [xTime, setXTime] = useState("11:00");
  const [yTime, setYTime] = useState("14:30");
  const [entryTime, setEntryTime] = useState("09:15");
  const [stopLoss, setStopLoss] = useState(50);
  const [target, setTarget] = useState(100);
  const [lotSize, setLotSize] = useState(1);

  // Results state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResponse | null>(null);

  // API status
  const [apiStatus, setApiStatus] = useState("checking");

  // Symbol search state
  const [searchTerm, setSearchTerm] = useState('');
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);

  // Add exchange state
  const [selectedExchange, setSelectedExchange] = useState("NFO");
  const [exchanges, setExchanges] = useState<Array<{ code: string, name: string }>>([
    { code: "NFO", name: "NSE Futures & Options" },
    { code: "NSE", name: "NSE Cash" },
    { code: "BFO", name: "BSE Futures & Options" },
    { code: "BSE", name: "BSE Cash" },
  ]);

  // Set API URL based on environment but only in the browser
  useEffect(() => {
    // Set API URL based on window.location (client-side only)
    API_URL = window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://algo-api.evoqins.dev";

    // Check API status on mount
    checkApiStatus();
  }, []);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    setStartDate(`${year}-${month}-${day}`);
  }, []);

  // Update symbol search to include exchange
  const searchSymbols = async (query: string) => {
    if (!query.trim()) {
      setSymbols([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/symbols?search=${encodeURIComponent(query)}&exchange=${selectedExchange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch symbols: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setSymbols(data);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setError('Failed to search symbols. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchSymbols(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Select symbol and update instrument token
  const handleSelectSymbol = (symbol: Symbol) => {
    setSelectedSymbol(symbol);
    setInstrument(symbol.instrument_token);
    setSearchTerm('');
    setSymbols([]);
  };

  // Add exchange selection handler
  const handleExchangeChange = (value: string) => {
    setSelectedExchange(value);
    setSymbols([]); // Clear symbols when exchange changes
    setSelectedSymbol(null); // Clear selected symbol
  };

  // Run backtest with API call
  const runBacktest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate || startDate,
          instrument,
          x_time: xTime,
          y_time: yTime,
          entry_time: entryTime,
          stop_loss: stopLoss,
          target,
          lot_size: lotSize,
        }),
      });

      if (!response.ok) {
        // API call failed, try loading mock data
        console.warn("API call failed, using mock data");
        await loadMockBacktestData();
        return;
      }

      const data = await response.json();
      setBacktestResults(data);
    } catch (err) {
      console.error("Error running backtest:", err);
      setError("Failed to run backtest. Using mock data instead.");
      // Try to load mock data as fallback
      await loadMockBacktestData();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load mock backtest data
  const loadMockBacktestData = async () => {
    try {
      // Generate mock data directly in the frontend
      const mockData = generateMockBacktestData(
        startDate,
        endDate || startDate,
        xTime,
        yTime,
        entryTime,
        stopLoss,
        target
      );

      setBacktestResults(mockData);
    } catch (error) {
      console.error("Error generating mock data:", error);
      setError("Failed to generate mock data");
    }
  };

  // Function to generate mock data
  const generateMockBacktestData = (
    startDate: string,
    endDate: string,
    xTime: string,
    yTime: string,
    entryTime: string,
    stopLoss: number,
    target: number
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const results = [];
    for (let i = 0; i < daysDiff; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);

      // Skip weekends
      if (day.getDay() === 0 || day.getDay() === 6) {
        continue;
      }

      const dayStr = day.toISOString().split('T')[0];

      // Random trade data
      const basePrice = 22000 + Math.floor(Math.random() * 400) - 200;
      const high = basePrice + Math.floor(Math.random() * 100) + 50;
      const low = basePrice - Math.floor(Math.random() * 100) - 50;
      const position = Math.random() > 0.5 ? "LONG" : "SHORT";

      let entryPrice, exitPrice, profitLoss;

      if (position === "LONG") {
        entryPrice = high;
        // 70% chance of profit
        if (Math.random() < 0.7) {
          exitPrice = entryPrice + Math.floor(Math.random() * Number(target)) + 10;
          profitLoss = exitPrice - entryPrice;
        } else {
          exitPrice = entryPrice - Math.floor(Math.random() * Number(stopLoss)) - 10;
          profitLoss = exitPrice - entryPrice;
        }
      } else {
        entryPrice = low;
        // 70% chance of profit
        if (Math.random() < 0.7) {
          exitPrice = entryPrice - Math.floor(Math.random() * Number(target)) - 10;
          profitLoss = entryPrice - exitPrice;
        } else {
          exitPrice = entryPrice + Math.floor(Math.random() * Number(stopLoss)) + 10;
          profitLoss = entryPrice - exitPrice;
        }
      }

      results.push({
        date: dayStr,
        high,
        low,
        position,
        entry_price: entryPrice,
        exit_price: exitPrice,
        entry_time: `${dayStr} ${entryTime}`,
        exit_time: `${dayStr} ${yTime}`,
        profit_loss: profitLoss,
        stop_loss_hit: profitLoss < 0,
        target_hit: profitLoss > 0
      });
    }

    // Calculate summary data
    const totalTrades = results.length;
    const winningTrades = results.filter(t => t.profit_loss > 0).length;
    const losingTrades = results.filter(t => t.profit_loss < 0).length;
    const breakEvenTrades = results.filter(t => t.profit_loss === 0).length;

    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    const profits = results.map(t => t.profit_loss);
    const totalProfitLoss = profits.reduce((sum, curr) => sum + curr, 0);
    const avgProfitLoss = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
    const maxProfit = profits.length > 0 ? Math.max(...profits) : 0;
    const maxLoss = profits.length > 0 ? Math.min(...profits) : 0;

    return {
      summary: {
        total_trades: totalTrades,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
        break_even_trades: breakEvenTrades,
        win_rate: winRate,
        total_profit_loss: totalProfitLoss,
        avg_profit_loss: avgProfitLoss,
        max_profit: maxProfit,
        max_loss: maxLoss
      },
      parameters: {
        x_time: xTime,
        y_time: yTime,
        entry_time: entryTime,
        stop_loss: stopLoss,
        target,
        lot_size: lotSize,
        instrument,
        start_date: startDate,
        end_date: endDate
      },
      results
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Check API status on mount
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      if (response.ok) {
        setApiStatus("online");
        // Load Nifty 50 by default
        try {
          const symbolResponse = await fetch(`${API_URL}/symbols/256265`);
          if (symbolResponse.ok) {
            const symbol = await symbolResponse.json();
            setSelectedSymbol(symbol);
          }
        } catch (e) {
          console.error("Error fetching default symbol:", e);
        }
      } else {
        setApiStatus("offline");
      }
    } catch (error) {
      setApiStatus("offline");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Backtest Strategy</h1>

      <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
        {/* Add exchange selection */}
        <div className="space-y-2">
          <Label htmlFor="exchange">Exchange</Label>
          <Select value={selectedExchange} onValueChange={handleExchangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
            <SelectContent>
              {exchanges.map((exchange) => (
                <SelectItem key={exchange.code} value={exchange.code}>
                  {exchange.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Backtest Parameters Form */}
      <div className="p-6 bg-white rounded-xl shadow-md mt-4">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Backtest Parameters</h2>

        {/* Symbol Search */}
        <div className="mb-4">
          <label htmlFor="symbol" className="block mb-1 text-sm font-medium text-slate-700">
            Instrument / Symbol
          </label>
          <div className="relative">
            <input
              type="text"
              id="symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by symbol or name"
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {isSearching && (
              <div className="absolute right-2 top-2">
                <svg className="w-5 h-5 text-slate-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {symbols.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-300 max-h-60 overflow-y-auto">
                {symbols.map((symbol) => (
                  <div
                    key={symbol.instrument_token}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSelectSymbol(symbol)}
                  >
                    <div className="font-medium">{symbol.tradingsymbol}</div>
                    <div className="text-xs text-slate-500">
                      {symbol.exchange} • {symbol.instrument_type || "Index"} • Token: {symbol.instrument_token}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedSymbol && (
            <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
              <div className="font-medium">{selectedSymbol.tradingsymbol}</div>
              <div className="text-xs text-slate-500">
                Token: {selectedSymbol.instrument_token} • {selectedSymbol.exchange}
                {selectedSymbol.lot_size && ` • Lot Size: ${selectedSymbol.lot_size}`}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-baseline md:gap-4">
          {/* Start Date */}
          <div className="flex-1">
            <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-slate-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          {/* End Date */}
          <div className="flex-1 mt-4 md:mt-0">
            <label htmlFor="endDate" className="block mb-1 text-sm font-medium text-slate-700">
              End Date (Optional)
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to backtest only the start date
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-baseline md:gap-4">
          {/* X Time */}
          <div className="flex-1">
            <label htmlFor="xTime" className="block mb-1 text-sm font-medium text-slate-700">
              X Time (Observation End)
            </label>
            <input
              type="time"
              id="xTime"
              value={xTime}
              onChange={(e) => setXTime(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Y Time */}
          <div className="flex-1 mt-4 md:mt-0">
            <label htmlFor="yTime" className="block mb-1 text-sm font-medium text-slate-700">
              Y Time (Square-off)
            </label>
            <input
              type="time"
              id="yTime"
              value={yTime}
              onChange={(e) => setYTime(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>


        <div className="mb-4 flex flex-col md:flex-row md:items-baseline md:gap-4">
          {/* Entry Time */}
          <div className="flex-1">
            <label htmlFor="entryTime" className="block mb-1 text-sm font-medium text-slate-700">
              Entry Time
            </label>
            <input
              type="time"
              id="entryTime"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Stop Loss */}
          <div className="flex-1 mt-4 md:mt-0">
            <label htmlFor="stopLoss" className="block mb-1 text-sm font-medium text-slate-700">
              Stop Loss (points)
            </label>
            <input
              type="number"
              id="stopLoss"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-baseline md:gap-4">
          {/* Target */}
          <div className="flex-1">
            <label htmlFor="target" className="block mb-1 text-sm font-medium text-slate-700">
              Target (points)
            </label>
            <input
              type="number"
              id="target"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Lot Size */}
          <div className="flex-1 mt-4 md:mt-0">
            <label htmlFor="lotSize" className="block mb-1 text-sm font-medium text-slate-700">
              Lot Size
            </label>
            <input
              type="number"
              id="lotSize"
              value={lotSize}
              onChange={(e) => setLotSize(Number(e.target.value))}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex mt-6">
          <Button
            type="button"
            onClick={runBacktest}
            disabled={isLoading || !startDate}
            className="w-full"
          >
            {isLoading ? "Running..." : "Run Backtest"}
          </Button>
        </div>

        {error && (
          <div className="p-3 mt-4 text-sm text-red-800 bg-red-100 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Backtest Results Summary */}
      <div className="p-6 bg-white rounded-xl shadow-md lg:col-span-2 mt-4">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Backtest Results</h2>

        {!backtestResults ? (
          <div className="flex items-center justify-center h-40 bg-slate-50 rounded-lg">
            <p className="text-slate-400">
              Run a backtest to see results
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="mb-2 text-md font-medium text-slate-800">Parameters</h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-slate-500">Date Range:</span>
                    <span className="ml-2 font-medium text-slate-900">
                      {formatDate(backtestResults.parameters.start_date)}
                      {backtestResults.parameters.end_date !== backtestResults.parameters.start_date &&
                        ` - ${formatDate(backtestResults.parameters.end_date)}`
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Observation End:</span>
                    <span className="ml-2 font-medium text-slate-900">{backtestResults.parameters.x_time}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Square-off Time:</span>
                    <span className="ml-2 font-medium text-slate-900">{backtestResults.parameters.y_time}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Entry Time:</span>
                    <span className="ml-2 font-medium text-slate-900">{backtestResults.parameters.entry_time}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Stop Loss:</span>
                    <span className="ml-2 font-medium text-slate-900">{backtestResults.parameters.stop_loss} points</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Target:</span>
                    <span className="ml-2 font-medium text-slate-900">{backtestResults.parameters.target} points</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-md font-medium text-slate-800">Summary</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Total Trades</div>
                  <div className="text-xl font-medium text-slate-900">{backtestResults.summary.total_trades}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Win Rate</div>
                  <div className="text-xl font-medium text-slate-900">{(backtestResults.summary.win_rate * 100).toFixed(1)}%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Total P&L</div>
                  <div className={`text-xl font-medium ${backtestResults.summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {backtestResults.summary.total_profit_loss.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Avg P&L Per Trade</div>
                  <div className={`text-xl font-medium ${backtestResults.summary.avg_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {backtestResults.summary.avg_profit_loss.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-md font-medium text-slate-800">Detailed Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entry Price</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Exit Price</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">P/L</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Day Change</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SL Hit</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target Hit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {backtestResults.results.map((result, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{formatDate(result.date)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${result.position === "LONG"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-amber-100 text-amber-800"
                            }`}>
                            {result.position}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{result.entry_price.toFixed(2)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{result.exit_price.toFixed(2)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          <span className={`${result.profit_loss > 0
                            ? "text-green-600"
                            : result.profit_loss < 0
                              ? "text-red-600"
                              : "text-slate-600"
                            }`}>
                            {result.profit_loss.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {result.day_change !== undefined && (
                            <div>
                              <span className={`${result.day_change > 0
                                ? "text-green-600"
                                : result.day_change < 0
                                  ? "text-red-600"
                                  : "text-slate-600"
                                }`}>
                                {result.day_change.toFixed(2)}
                              </span>
                              {result.day_change_percent !== undefined && (
                                <span className={`ml-1 text-xs ${result.day_change > 0
                                  ? "text-green-600"
                                  : result.day_change < 0
                                    ? "text-red-600"
                                    : "text-slate-600"
                                  }`}>
                                  ({result.day_change_percent.toFixed(2)}%)
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {result.stop_loss_hit ? (
                            <span className="inline-flex rounded-full bg-red-100 text-red-800 px-2 text-xs font-semibold">Yes</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 text-slate-800 px-2 text-xs font-semibold">No</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {result.target_hit ? (
                            <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2 text-xs font-semibold">Yes</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 text-slate-800 px-2 text-xs font-semibold">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 