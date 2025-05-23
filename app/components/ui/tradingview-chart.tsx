import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  height?: number;
  width?: number;
}

export function TradingViewChart({
  symbol,
  interval = '1',
  theme = 'light',
  autosize = true,
  height = 400,
  width = 600,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: containerRef.current?.id,
          symbol: symbol,
          interval: interval,
          theme: theme,
          autosize: autosize,
          height: height,
          width: width,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          studies: [
            'MAExp@tv-basicstudies',
            'RSI@tv-basicstudies',
            'BB@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          locale: 'en',
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, interval, theme, autosize, height, width]);

  return (
    <div
      ref={containerRef}
      id={`tradingview_${symbol}`}
      className="w-full h-full"
      style={{ height: `${height}px`, width: `auto` }}
    />
  );
} 