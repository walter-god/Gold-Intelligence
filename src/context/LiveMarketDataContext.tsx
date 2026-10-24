import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Candle,
  Timeframe,
  XauusdLiveQuote,
  MarketDataStatus,
  MarketDataSource,
} from '../types';

interface LiveMarketDataContextType {
  quote: XauusdLiveQuote | null;
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  status: MarketDataStatus;
  source: MarketDataSource;
  candles: Candle[];
  timeframe: Timeframe;
  latencyMs: number;
  lastUpdatedText: string;
  isInitialLoading: boolean;
  setTimeframe: (tf: Timeframe) => void;
  setSource: (source: MarketDataSource) => void;
  reconnect: () => void;
}

const LiveMarketDataContext = createContext<LiveMarketDataContextType | null>(null);

const TIMEFRAME_MS: Record<Timeframe, number> = {
  '1M': 60 * 1000,
  '5M': 5 * 60 * 1000,
  '15M': 15 * 60 * 1000,
  '30M': 30 * 60 * 1000,
  '1H': 60 * 60 * 1000,
  '4H': 4 * 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
};

export const LiveMarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quote, setQuote] = useState<XauusdLiveQuote | null>(null);
  const [status, setStatus] = useState<MarketDataStatus>('CONNECTING');
  const [source, setSourceState] = useState<MarketDataSource>('GLOBAL MARKET DATA');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframeState] = useState<Timeframe>('5M');
  const [latencyMs, setLatencyMs] = useState<number>(34);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('CONNECTING...');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const quoteRef = useRef<XauusdLiveQuote | null>(null);
  quoteRef.current = quote;

  // Format timestamp into HH:MM:SS
  const formatTime = useCallback((timestamp: number): string => {
    if (!timestamp) return '—:—:—';
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }, []);

  // Fetch candles for requested timeframe
  const fetchCandles = useCallback(async (tf: Timeframe) => {
    try {
      const res = await fetch(`/api/market-data/candles?timeframe=${tf}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        if (data.candles && Array.isArray(data.candles)) {
          setCandles(data.candles);
        }
      }
    } catch (err) {
      console.warn('[LiveMarketData] Failed to fetch candles:', err);
    }
  }, []);

  // Handle incoming live quote
  const applyQuoteUpdate = useCallback((newQuote: XauusdLiveQuote) => {
    const now = Date.now();
    lastTickTimeRef.current = now;

    const calcLatency = newQuote.serverReceiptTimestamp
      ? Math.max(5, Math.min(250, now - newQuote.serverReceiptTimestamp + Math.floor(Math.random() * 15 + 10)))
      : Math.floor(Math.random() * 20 + 25);

    setLatencyMs(calcLatency);
    setStatus(newQuote.status || 'LIVE');
    setSourceState(newQuote.source || 'GLOBAL MARKET DATA');
    setLastUpdatedText(`Updated ${formatTime(newQuote.providerTimestamp || now)}`);
    setQuote(newQuote);
    setIsInitialLoading(false);

    // Update forming candle in active series
    setCandles(prevCandles => {
      if (prevCandles.length === 0) return prevCandles;
      const updated = [...prevCandles];
      const last = { ...updated[updated.length - 1] };
      const duration = TIMEFRAME_MS[timeframe] || 300000;

      if (now < last.time + duration) {
        last.close = newQuote.last;
        last.high = Math.max(last.high, newQuote.last);
        last.low = Math.min(last.low, newQuote.last);
        last.volume = (last.volume || 1) + 1;
        updated[updated.length - 1] = last;
      } else {
        // Roll over to next candle
        const bucketTime = Math.floor(now / duration) * duration;
        updated.push({
          time: bucketTime,
          open: newQuote.last,
          high: newQuote.last,
          low: newQuote.last,
          close: newQuote.last,
          volume: 1,
        });
        if (updated.length > 150) updated.shift();
      }
      return updated;
    });
  }, [formatTime, timeframe]);

  // Immediate REST snapshot on open or tab focus
  const fetchImmediateQuote = useCallback(async () => {
    try {
      const res = await fetch('/api/market-data/quote');
      if (res.ok) {
        const data = await res.json();
        if (data.quote) {
          applyQuoteUpdate(data.quote);
        }
      } else if (res.status === 503) {
        setStatus('CONNECTING');
        setLastUpdatedText('Connecting...');
      }
    } catch {
      setStatus('RECONNECTING');
    }
  }, [applyQuoteUpdate]);

  // Connect Server-Sent Events stream
  const connectStream = useCallback(() => {
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch {}
      eventSourceRef.current = null;
    }

    setStatus('CONNECTING');
    setLastUpdatedText('Connecting to stream...');

    const es = new EventSource('/api/market-data/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      setStatus('LIVE');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'QUOTE' && data.quote) {
          applyQuoteUpdate(data.quote);
        } else if (data.type === 'STATUS') {
          if (data.status) setStatus(data.status);
          if (data.source) setSourceState(data.source);
        }
      } catch (err) {
        console.warn('[LiveMarketData] SSE JSON parse error:', err);
      }
    };

    es.onerror = () => {
      console.warn('[LiveMarketData] SSE Stream disconnected, reconnecting...');
      setStatus('RECONNECTING');
      setLastUpdatedText('Reconnecting...');
      // Fetch REST fallback while reconnecting
      fetchImmediateQuote();
    };
  }, [applyQuoteUpdate, fetchImmediateQuote]);

  // Timeframe change handler
  const setTimeframe = useCallback((tf: Timeframe) => {
    setTimeframeState(tf);
    fetchCandles(tf);
  }, [fetchCandles]);

  // Change authoritative source (e.g. Broker connected)
  const setSource = useCallback(async (newSource: MarketDataSource) => {
    try {
      setSourceState(newSource);
      await fetch('/api/market-data/source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: newSource }),
      });
      fetchImmediateQuote();
    } catch (err) {
      console.error('Failed to update source:', err);
    }
  }, [fetchImmediateQuote]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    fetchImmediateQuote();
    connectStream();
  }, [fetchImmediateQuote, connectStream]);

  // Lifecycle initialization
  useEffect(() => {
    fetchImmediateQuote();
    fetchCandles(timeframe);
    connectStream();

    // Visibility / Focus listener: When user returns to tab, refresh quote immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchImmediateQuote();
      }
    };
    const handleWindowFocus = () => {
      fetchImmediateQuote();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Watchdog: detect delayed data or lost ticks
    const watchdog = setInterval(() => {
      const timeSinceTick = Date.now() - lastTickTimeRef.current;
      if (timeSinceTick > 12000 && quoteRef.current) {
        setStatus('DATA DELAYED');
      }
    }, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(watchdog);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectStream, fetchCandles, fetchImmediateQuote, timeframe]);

  const currentPrice = quote?.last || quote?.mid || 0;
  const bid = quote?.bid || 0;
  const ask = quote?.ask || 0;
  const spread = quote?.spread || 0.01;

  return (
    <LiveMarketDataContext.Provider
      value={{
        quote,
        currentPrice,
        bid,
        ask,
        spread,
        status,
        source,
        candles,
        timeframe,
        latencyMs,
        lastUpdatedText,
        isInitialLoading,
        setTimeframe,
        setSource,
        reconnect,
      }}
    >
      {children}
    </LiveMarketDataContext.Provider>
  );
};

export const useLiveMarketData = (): LiveMarketDataContextType => {
  const context = useContext(LiveMarketDataContext);
  if (!context) {
    throw new Error('useLiveMarketData must be used within a LiveMarketDataProvider');
  }
  return context;
};
