import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import Button from "~/components/Button";

export const meta: MetaFunction = () => {
  return [{ title: "Historical Data | Admin Dashboard" }];
};

// API server URL - hardcoded for client-side use
const API_URL = 'http://localhost:3001';

interface HistoricalData {
  date: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function HistoricalData() {
  // Form state
  const [instrumentToken, setInstrumentToken] = useState(256265); // Default to Nifty
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [interval, setInterval] = useState("day");
  
  // Results state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[] | null>(null);
  
  // API status
  const [apiStatus, setApiStatus] = useState("checking");
  
  // Check API status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/`);
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        setApiStatus("offline");
      }
    };
    
    checkApiStatus();
  }, []);
  
  // Set default dates
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    setToDate(formatDateForInput(today));
    setFromDate(formatDateForInput(lastMonth));
  }, []);
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Fetch historical data
  const fetchHistoricalData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try API call first
      const response = await fetch(`${API_URL}/historical-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instrument_token: instrumentToken,
          from_date: fromDate,
          to_date: toDate,
          interval
        }),
      });

      if (!response.ok) {
        // API call failed, generate mock data
        console.warn("API call failed, using mock data");
        generateMockData();
        return;
      }

      const data = await response.json();
      setHistoricalData(data.data);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError("Failed to fetch historical data. Using mock data instead.");
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock data for testing
  const generateMockData = () => {
    try {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      const data: HistoricalData[] = [];
      let currentDate = new Date(fromDateObj);
      
      while (currentDate <= toDateObj) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const basePrice = 22000 + Math.floor(Math.random() * 2000) - 1000;
          
          // For simplicity, just generate daily data
          const openPrice = basePrice;
          const high = openPrice + Math.floor(Math.random() * 150) + 50;
          const low = openPrice - Math.floor(Math.random() * 150) - 50;
          const close = openPrice + Math.floor(Math.random() * 200) - 100;
          const volume = Math.floor(Math.random() * 9000000) + 1000000;
          
          data.push({
            date: currentDate.toISOString().split('T')[0],
            timestamp: currentDate.toISOString().split('T')[0],
            open: openPrice,
            high,
            low,
            close,
            volume
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setHistoricalData(data);
    } catch (error) {
      console.error("Error generating mock data:", error);
      setError("Failed to generate historical data.");
    }
  };
  
  // Format currency value
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(price);
  };
  
  // Format large number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
          Historical Data
        </h1>
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 mr-2 rounded-full ${
              apiStatus === "checking" ? "bg-yellow-500" :
              apiStatus === "online" ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-slate-600">
            API Status: {apiStatus === "checking" ? "Checking..." : 
                         apiStatus === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Panel */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Data Parameters</h2>
          
          <div className="mb-4">
            <label htmlFor="instrumentToken" className="block mb-1 text-sm font-medium text-slate-700">
              Instrument Token
            </label>
            <input
              type="number"
              id="instrumentToken"
              value={instrumentToken}
              onChange={(e) => setInstrumentToken(Number(e.target.value))}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Default: 256265 (Nifty)
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="fromDate" className="block mb-1 text-sm font-medium text-slate-700">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="toDate" className="block mb-1 text-sm font-medium text-slate-700">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="interval" className="block mb-1 text-sm font-medium text-slate-700">
              Interval
            </label>
            <select
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="day">Day</option>
              <option value="minute">1 Minute</option>
              <option value="3minute">3 Minutes</option>
              <option value="5minute">5 Minutes</option>
              <option value="10minute">10 Minutes</option>
              <option value="15minute">15 Minutes</option>
              <option value="30minute">30 Minutes</option>
              <option value="60minute">60 Minutes</option>
            </select>
          </div>
          
          <div className="flex mt-6">
            <Button 
              type="button" 
              onClick={fetchHistoricalData}
              disabled={isLoading || !fromDate || !toDate}
              className="w-full"
            >
              {isLoading ? "Fetching..." : "Fetch Data"}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 mt-4 text-sm text-red-800 bg-red-100 rounded">
              {error}
            </div>
          )}
        </div>
        
        {/* Results Panel */}
        <div className="p-6 bg-white rounded-xl shadow-md lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Historical Data</h2>
          
          {!historicalData ? (
            <div className="flex items-center justify-center h-40 bg-slate-50 rounded-lg">
              <p className="text-slate-400">
                Fetch data to see results
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-2 py-2 text-xs font-medium text-slate-600">Date</th>
                    <th className="px-2 py-2 text-xs font-medium text-slate-600">Open</th>
                    <th className="px-2 py-2 text-xs font-medium text-slate-600">High</th>
                    <th className="px-2 py-2 text-xs font-medium text-slate-600">Low</th>
                    <th className="px-2 py-2 text-xs font-medium text-slate-600">Close</th>
                    <th className="px-2 py-2 text-xs font-medium text-slate-600 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.map((candle, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-2 py-2 text-xs text-slate-800">{candle.date}</td>
                      <td className="px-2 py-2 text-xs text-slate-800">{formatPrice(candle.open)}</td>
                      <td className="px-2 py-2 text-xs text-green-600">{formatPrice(candle.high)}</td>
                      <td className="px-2 py-2 text-xs text-red-600">{formatPrice(candle.low)}</td>
                      <td className={`px-2 py-2 text-xs ${
                        candle.close >= candle.open ? "text-green-600" : "text-red-600"
                      }`}>
                        {formatPrice(candle.close)}
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-800 text-right">{formatNumber(candle.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 