import React, { useEffect, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

// Local API URL handling (mirrors other routes)
let API_URL = "https://algo-api.evoqins.dev";
API_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : "https://algo-api.evoqins.dev";

export const meta: MetaFunction = () => {
  return [{ title: "Algo 2 Backtest (5-min breakout) | Admin Dashboard" }];
};

interface SymbolItem {
  instrument_token: number;
  tradingsymbol: string;
  name: string;
  exchange: string;
  lot_size?: number;
  instrument_type?: string;
}

interface DayTrades {
  pos: "LONG" | "SHORT";
  entry: number;
  exit: number;
  lots: number;
}

interface Algo2ResultItem {
  date: string;
  first_high: number;
  first_low: number;
  fourth_high: number;
  fourth_low: number;
  range: number;
  trades: DayTrades[];
  profit_loss: number;
}

interface Algo2Summary {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit_loss: number;
  avg_profit_loss: number;
  max_profit: number;
  max_loss: number;
}

interface Algo2Params {
  start_date: string;
  end_date?: string;
  instrument: number;
  lot_size: number;
  multiplier: number;
  min_move: number;
  exchange: string;
  y_time: string; // Square-off
}

interface Algo2Response {
  summary: Algo2Summary;
  parameters: Algo2Params;
  results: Algo2ResultItem[];
}

export default function BacktestFiveMin() {
  // Form state
  const [instrument, setInstrument] = useState(256265); // NIFTY 50 default
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [yTime, setYTime] = useState("15:15");
  const [lotSize, setLotSize] = useState(1);
  const [multiplier, setMultiplier] = useState(1.3);
  const [minMove, setMinMove] = useState(30);
  const [exchange, setExchange] = useState("NFO");

  // Symbol search
  const [searchTerm, setSearchTerm] = useState("");
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null);

  // Results state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Algo2Response | null>(null);

  // Initialize API URL and default date
  useEffect(() => {
    if (typeof window !== "undefined") {
      API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://algo-api.evoqins.dev";
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setStartDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm.trim()) searchSymbols(searchTerm);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, exchange]);

  const searchSymbols = async (query: string) => {
    try {
      setIsSearching(true);
      const res = await fetch(`${API_URL}/symbols?search=${encodeURIComponent(query)}&exchange=${exchange}`);
      if (!res.ok) throw new Error("Failed symbol search");
      const data = await res.json();
      setSymbols(data);
    } catch (e) {
      console.error(e);
      setError("Failed to search symbols");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSymbol = (s: SymbolItem) => {
    setSelectedSymbol(s);
    setInstrument(s.instrument_token);
    setSearchTerm("");
    setSymbols([]);
  };

  const runBacktest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(`${API_URL}/backtest_5min`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate || startDate,
          instrument,
          lot_size: lotSize,
          multiplier: Number(multiplier),
          min_move: Number(minMove),
          exchange,
          y_time: yTime,
        } as Algo2Params),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as Algo2Response;
      setResponse(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to run backtest");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Algo 2 Backtest (5-min breakout)</h1>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="exchange">Exchange</Label>
          <select
            id="exchange"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          >
            <option value="NFO">NSE Futures & Options</option>
            <option value="NSE">NSE Cash</option>
            <option value="BFO">BSE Futures & Options</option>
            <option value="BSE">BSE Cash</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yTime">Square-off Time (Y)</Label>
          <input
            id="yTime"
            type="time"
            value={yTime}
            onChange={(e) => setYTime(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lotSize">Lot Size</Label>
          <input
            id="lotSize"
            type="number"
            value={lotSize}
            onChange={(e) => setLotSize(Number(e.target.value))}
            className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="multiplier">Target Multiplier</Label>
          <input
            id="multiplier"
            type="number"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minMove">Minimum Move (points)</Label>
          <input
            id="minMove"
            type="number"
            value={minMove}
            onChange={(e) => setMinMove(Number(e.target.value))}
            className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md mt-4">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Backtest Parameters</h2>

        {/* Symbol search */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-slate-700">Instrument / Symbol</label>
          <div className="relative">
            <input
              type="text"
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
                {symbols.map((s) => (
                  <div key={s.instrument_token} className="px-4 py-2 cursor-pointer hover:bg-slate-100" onClick={() => handleSelectSymbol(s)}>
                    <div className="font-medium">{s.tradingsymbol}</div>
                    <div className="text-xs text-slate-500">
                      {s.exchange} • {s.instrument_type || "Index"} • Token: {s.instrument_token}
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

        <div className="mb-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-xs text-slate-500">Leave empty to backtest only the start date</p>
          </div>
        </div>

        <div className="flex mt-6">
          <Button type="button" onClick={runBacktest} disabled={isLoading || !startDate} className="w-full">
            {isLoading ? "Running..." : "Run Backtest"}
          </Button>
        </div>

        {error && <div className="p-3 mt-4 text-sm text-red-800 bg-red-100 rounded">{error}</div>}
      </div>

      {/* Results */}
      <div className="p-6 bg-white rounded-xl shadow-md lg:col-span-2 mt-4">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Backtest Results</h2>
        {!response ? (
          <div className="flex items-center justify-center h-40 bg-slate-50 rounded-lg">
            <p className="text-slate-400">Run a backtest to see results</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="mb-2 text-md font-medium text-slate-800">Parameters</h3>
              <div className="p-4 bg-slate-50 rounded-lg grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Date Range:</span>
                  <span className="ml-2 font-medium text-slate-900">
                    {formatDate(response.parameters.start_date)}
                    {response.parameters.end_date && response.parameters.end_date !== response.parameters.start_date && ` - ${formatDate(response.parameters.end_date)}`}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Square-off Time:</span>
                  <span className="ml-2 font-medium text-slate-900">{response.parameters.y_time}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Min Move:</span>
                  <span className="ml-2 font-medium text-slate-900">{response.parameters.min_move}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Target Multiplier:</span>
                  <span className="ml-2 font-medium text-slate-900">{response.parameters.multiplier}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Total Trades</div>
                <div className="text-xl font-medium text-slate-900">{response.summary.total_trades}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Win Rate</div>
                <div className="text-xl font-medium text-slate-900">{(response.summary.win_rate * 100).toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Total P&L</div>
                <div className={`text-xl font-medium ${response.summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {response.summary.total_profit_loss.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Avg P&L</div>
                <div className={`text-xl font-medium ${response.summary.avg_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {response.summary.avg_profit_loss.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-md font-medium text-slate-800">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">First H/L</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fourth H/L</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Range</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trades</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">PnL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {response.results.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{formatDate(r.date)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{r.first_high} / {r.first_low}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{r.fourth_high} / {r.fourth_low}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">{r.range.toFixed(2)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {r.trades && r.trades.length > 0 ? (
                            <div className="space-y-1">
                              {r.trades.map((t, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${t.pos === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.pos}</span>
                                  <span className="text-xs text-slate-600">{t.entry} → {t.exit}</span>
                                  <span className="text-xs text-slate-500">x{t.lots}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No trades</span>
                          )}
                        </td>
                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${r.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.profit_loss.toFixed(2)}</td>
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


