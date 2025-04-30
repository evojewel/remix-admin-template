import React, { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useToast } from "~/components/ui/use-toast";

export const meta: MetaFunction = () => {
  return [{ title: "Historical Data | Admin Dashboard" }];
};

// Define API URL based on environment
let API_URL = "http://localhost:8000";

API_URL = process.env.API_BASE_URL
  ? process.env.API_BASE_URL
  : "http://localhost:8000";

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

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function HistoricalData() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { toast } = useToast();
  
  // Form state
  const [instrument, setInstrument] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interval, setInterval] = useState("day");
  
  // Exchange state
  const [selectedExchange, setSelectedExchange] = useState("NFO");
  const [exchanges, setExchanges] = useState<Array<{code: string, name: string}>>([
    { code: "NFO", name: "NSE Futures & Options" },
    { code: "NSE", name: "NSE Cash" },
    { code: "BFO", name: "BSE Futures & Options" },
    { code: "BSE", name: "BSE Cash" },
  ]);
  
  // Symbol search state
  const [searchTerm, setSearchTerm] = useState('');
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  
  // Data state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  
  // API status
  const [apiStatus, setApiStatus] = useState("checking");
  
  // Set API URL based on environment
  useEffect(() => {
    API_URL = window.location.hostname === "localhost" 
      ? "http://localhost:3001"
      : "https://your-production-api.com";
      
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
  
  // Symbol search function
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
  }, [searchTerm, selectedExchange]);

  // Select symbol and update instrument token
  const handleSelectSymbol = (symbol: Symbol) => {
    setSelectedSymbol(symbol);
    setInstrument(symbol.instrument_token);
    setSearchTerm('');
    setSymbols([]);
  };
  
  // Exchange selection handler
  const handleExchangeChange = (value: string) => {
    setSelectedExchange(value);
    setSymbols([]);
    setSelectedSymbol(null);
    setInstrument(null);
  };
  
  // Fetch historical data
  const fetchHistoricalData = async () => {
    if (!instrument) {
      toast({
        title: "Error",
        description: "Please select a symbol first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/historical-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instrument,
          start_date: startDate,
          end_date: endDate || startDate,
          interval,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch historical data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to fetch historical data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check API status
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api-status`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status);
      } else {
        setApiStatus("offline");
      }
    } catch (error) {
      setApiStatus("offline");
      console.error('API status check failed:', error);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Historical Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Exchange Selection */}
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
        
        {/* Symbol Search */}
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <div className="relative">
            <Input
              type="text"
              id="symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol..."
            />
            {isSearching && (
              <div className="absolute right-2 top-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          {symbols.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              {symbols.map((symbol) => (
                <div
                  key={symbol.instrument_token}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => handleSelectSymbol(symbol)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{symbol.tradingsymbol}</div>
                      <div className="text-sm text-gray-500">{symbol.name}</div>
                    </div>
                    <div className="text-right">
                      {symbol.expiry && (
                        <div className="text-sm text-gray-500">Expiry: {symbol.expiry}</div>
                      )}
                      {symbol.strike && (
                        <div className="text-sm text-gray-500">Strike: {symbol.strike}</div>
                      )}
                      {symbol.lot_size && (
                        <div className="text-sm text-gray-500">Lot Size: {symbol.lot_size}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {symbol.instrument_type} • {symbol.segment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        {/* Interval Selection */}
        <div className="space-y-2">
          <Label htmlFor="interval">Interval</Label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minute">1 Minute</SelectItem>
              <SelectItem value="day">1 Day</SelectItem>
              <SelectItem value="week">1 Week</SelectItem>
              <SelectItem value="month">1 Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button
          onClick={fetchHistoricalData}
          disabled={isLoading || !instrument}
        >
          {isLoading ? "Loading..." : "Fetch Data"}
        </Button>
      </div>
      
      {/* Display historical data */}
      {historicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicalData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.open}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.high}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.low}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.close}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 