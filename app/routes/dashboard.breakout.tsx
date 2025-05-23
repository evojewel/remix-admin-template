import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { api, getWebSocketUrl } from "~/lib/api-client";
import { TradingViewChart } from "~/app/components/ui/tradingview-chart";

export const meta: MetaFunction = () => {
  return [{ title: "Nifty Breakout Strategy | Admin Dashboard" }];
};

export default function BreakoutStrategy() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // Strategy parameters
  const [xTime, setXTime] = useState("11:00");
  const [yTime, setYTime] = useState("14:30");
  const [entryTime, setEntryTime] = useState("09:15");
  const [stopLoss, setStopLoss] = useState(50);
  const [target, setTarget] = useState(100);
  const [lotSize, setLotSize] = useState(1);
  
  // Strategy status
  const [isRunning, setIsRunning] = useState(false);
  const [marketStatus, setMarketStatus] = useState("CLOSED");
  const [highestHigh, setHighestHigh] = useState<number | null>(null);
  const [lowestLow, setLowestLow] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState("NONE");
  
  // Trading history
  const [trades, setTrades] = useState<any[]>([]);
  
  // API status
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [tradingState, setTradingState] = useState({
    highest_high: null,
    lowest_low: null,
    current_price: null,
    current_position: "NONE",
    market_status: "CLOSED"
  });
  const [strategyConfig, setStrategyConfig] = useState({
    x_time: "11:00",
    y_time: "14:30",
    entry_time: "09:15",
    stop_loss: 50.0,
    target: 100.0,
    lot_size: 1,
    is_running: false,
  });
  
  // Add exchange state
  const [selectedExchange, setSelectedExchange] = useState("NFO");
  const [exchanges, setExchanges] = useState<Array<{code: string, name: string}>>([
    { code: "NFO", name: "NFO - Futures & Options" },
    { code: "NSE", name: "NSE - Equity" },
    { code: "BSE", name: "BSE - Equity" }
  ]);
  
  const { toast } = useToast();
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Modify the WebSocket setup effect
  useEffect(() => {
    // Set up WebSocket connection
    try {
      const wsUrl = getWebSocketUrl();
      console.log("Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnection(ws);
        // When WebSocket connects, update API status
        setApiStatus("online");
        toast({
          title: "Connected",
          description: "WebSocket connection established",
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message:", data);
          if (data.type === "initial_state" || data.type === "status_update") {
            const { strategy, trading, market_status } = data.data;
            setIsRunning(strategy.is_running);
            setMarketStatus(market_status);
            setHighestHigh(trading.highest_high);
            setLowestLow(trading.lowest_low);
            setCurrentPrice(trading.current_price);
            setCurrentPosition(trading.current_position);
            setTradingState(trading);
            setStrategyConfig(strategy);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setApiStatus("offline");
        toast({
          title: "Connection Error",
          description: "Failed to connect to WebSocket. Is the API server running?",
          variant: "destructive",
        });
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setApiStatus("offline");
        setWsConnection(null);
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      setApiStatus("offline");
      toast({
        title: "Connection Error",
        description: "Failed to set up WebSocket. Is the API server running?",
        variant: "destructive",
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Separate API status check effect
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        console.log("Checking API status...");
        const data = await api.checkStatus();
        console.log("API status response:", data);
        setApiStatus(data.status);
      } catch (error) {
        console.error('API status check failed:', error);
        setApiStatus("offline");
        toast({
          title: "API Error",
          description: "Cannot connect to API server. Is it running?",
          variant: "destructive",
        });
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  // Separate initial data fetch effect
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isLoading || apiStatus !== 'online') return;
      
      setIsLoading(true);
      try {
        console.log("Fetching initial data...");
        // Fetch status
        const statusData = await api.getStrategyStatus();
        console.log("Strategy status:", statusData);
        
        // Update UI with status data
        const { strategy, trading } = statusData;
        
        setXTime(strategy.x_time);
        setYTime(strategy.y_time);
        setEntryTime(strategy.entry_time);
        setStopLoss(strategy.stop_loss);
        setTarget(strategy.target);
        setLotSize(strategy.lot_size);
        setIsRunning(strategy.is_running);
        
        setHighestHigh(trading.highest_high);
        setLowestLow(trading.lowest_low);
        setCurrentPrice(trading.current_price);
        setCurrentPosition(trading.current_position);
        setMarketStatus(trading.market_status);
        
        // Fetch trade history
        const tradesData = await api.getTrades();
        console.log("Trade history:", tradesData);
        setTrades(tradesData.trades || []);  // Extract the trades array from the response
        
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch initial data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (apiStatus === 'online') {
      fetchInitialData();
    }
  }, [apiStatus]); // Run when API status changes

  // Add exchange selection to the form
  const handleExchangeChange = async (value: string) => {
    setSelectedExchange(value);
    // Update strategy with new exchange
    try {
      await api.updateConfig({ exchange: value });
    } catch (error) {
      console.error('Error updating exchange:', error);
      toast({
        title: "Error",
        description: "Failed to update exchange",
        variant: "destructive",
      });
    }
  };
  
  // Add back the missing functions
  const applyParameters = async () => {
    try {
      await api.updateConfig({
        x_time: xTime,
        y_time: yTime,
        entry_time: entryTime,
        stop_loss: stopLoss,
        target: target,
        lot_size: lotSize,
        exchange: selectedExchange,
      });
      
      toast({
        title: "Success",
        description: "Strategy parameters updated successfully",
      });
    } catch (error) {
      console.error("Error updating strategy parameters:", error);
      toast({
        title: "Error",
        description: "Failed to update strategy parameters",
        variant: "destructive",
      });
    }
  };

  const toggleTrading = async () => {
    try {
      await api.updateStatus(!isRunning, selectedExchange);
      
      toast({
        title: "Success",
        description: `Trading ${!isRunning ? 'started' : 'stopped'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling trading status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle trading status",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Breakout Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label>API Status</Label>
                <div className={`mt-1 p-2 rounded ${
                  apiStatus === 'online' ? 'bg-green-100 text-green-800' :
                  apiStatus === 'offline' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {apiStatus.toUpperCase()}
                </div>
              </div>
              
              <div>
                <Label htmlFor="exchange">Exchange</Label>
                <Select
                  value={selectedExchange}
                  onValueChange={handleExchangeChange}
                >
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

              <div>
                <Label>Market Status</Label>
                <div className="mt-1 p-2 rounded bg-gray-100">
                  {marketStatus}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Current Position</Label>
                <div className="mt-1 p-2 rounded bg-gray-100">
                  {currentPosition}
                </div>
              </div>

              <div>
                <Label>Current Price</Label>
                <div className="mt-1 p-2 rounded bg-gray-100">
                  {currentPrice ?? 'N/A'}
                </div>
              </div>

              <div>
                <Label>Strategy Status</Label>
                <div className="mt-1 p-2 rounded bg-gray-100">
                  {isRunning ? 'Running' : 'Stopped'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strategy Configuration Panel */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Strategy Configuration</h2>
          
          <div className="mb-4">
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
            <p className="mt-1 text-xs text-slate-500">
              Time when high/low range is finalized
            </p>
          </div>
          
          <div className="mb-4">
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
            <p className="mt-1 text-xs text-slate-500">
              Time when all positions are closed
            </p>
          </div>
          
          <div className="mb-4">
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
            <p className="mt-1 text-xs text-slate-500">
              Time when tracking starts (market open)
            </p>
          </div>
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <div className="mb-4">
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
          
          <div className="flex gap-3 mt-6">
            <Button 
              type="button" 
              onClick={applyParameters}
              disabled={isSubmitting || apiStatus !== "online"}
              className="w-full"
            >
              Apply Parameters
            </Button>
          </div>
        </div>
        
        {/* Live Trading Status Panel */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-900">Trading Status</h2>
            <Button 
              type="button" 
              onClick={toggleTrading}
              disabled={apiStatus !== "online"}
              className={isRunning ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isRunning ? "Stop Trading" : "Start Trading"}
            </Button>
          </div>
          
          <div className="p-4 mb-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Current Price:</span>
              <span className="font-medium text-slate-900">{currentPrice ?? "—"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Highest High:</span>
              <span className="font-medium text-slate-900">{highestHigh ?? "—"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Lowest Low:</span>
              <span className="font-medium text-slate-900">{lowestLow ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Current Position:</span>
              <span 
                className={`font-medium ${
                  currentPosition === "LONG" ? "text-green-600" : 
                  currentPosition === "SHORT" ? "text-red-600" : 
                  "text-slate-900"
                }`}
              >
                {currentPosition}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Entry Conditions</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Buy Above:</span>
              <span className="font-medium text-green-600">{highestHigh ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Sell Below:</span>
              <span className="font-medium text-red-600">{lowestLow ?? "—"}</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Trading {isRunning ? "active" : "inactive"}
              {isRunning && (
                <span className="inline-block w-2 h-2 ml-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </p>
          </div>
        </div>       
        
      </div>
      
      {/* Trading History */}
      <div className="p-6 mt-6 bg-white rounded-xl shadow-md">
        <h2 className="mb-4 text-lg font-medium text-slate-900">Trading History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-medium text-slate-600">Entry Time</th>
                <th className="pb-3 text-sm font-medium text-slate-600">Entry Price</th>
                <th className="pb-3 text-sm font-medium text-slate-600">Exit Time</th>
                <th className="pb-3 text-sm font-medium text-slate-600">Exit Price</th>
                <th className="pb-3 text-sm font-medium text-slate-600">Position</th>
                <th className="pb-3 text-sm font-medium text-slate-600 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No trades recorded yet
                  </td>
                </tr>
              ) : (
                trades.map(trade => (
                  <tr key={trade.id} className="border-b border-slate-100">
                    <td className="py-3 text-sm text-slate-800">{trade.entryTime}</td>
                    <td className="py-3 text-sm text-slate-800">{trade.entryPrice}</td>
                    <td className="py-3 text-sm text-slate-800">{trade.exitTime}</td>
                    <td className="py-3 text-sm text-slate-800">{trade.exitPrice}</td>
                    <td className="py-3 text-sm text-slate-800">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trade.positionType === "LONG" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {trade.positionType}
                      </span>
                    </td>
                    <td className={`py-3 text-sm font-medium text-right ${
                      trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {trade.profitLoss >= 0 ? "+" : ""}{trade.profitLoss}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Chart Panel */}
        <div className="bg-white rounded-lg shadow p-4 mt-5">
          <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
          <div className="h-[400px] w-full">
            <TradingViewChart 
              symbol="NSE:NIFTY" 
              interval="1"
              theme="light"
              height={400}
              // autosize={true}
            />
          </div>
        </div>
    </div>
  );
} 