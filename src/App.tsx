import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StockList } from './components/StockList';
import { StockForm } from './components/StockForm';
import { Stock, PortfolioMetrics } from './types/stock';
import { finnhubAPI } from './api/finnhub';
import { Layout } from 'lucide-react';

// Sample initial stocks with different buy prices
const initialStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 1, buyPrice: 120, currentPrice: 0 },
  { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 1, buyPrice: 1600, currentPrice: 0 },
  { id: '3', symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 1, buyPrice: 150, currentPrice: 0 },
  { id: '4', symbol: 'AMZN', name: 'Amazon.com Inc.', quantity: 1, buyPrice: 2000, currentPrice: 0 },
  { id: '5', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 1, buyPrice: 500, currentPrice: 0 },
];

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalInvestment: 0,
    topPerformer: initialStocks[0],
    worstPerformer: initialStocks[0],
  });

  // Dark Mode State with System Default
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode !== null) {
      return JSON.parse(storedMode);
    }
    // If no user preference, use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle Dark Mode Handler
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply Dark Mode Class to HTML Element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Update localStorage whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('darkMode')) { // Only update if user hasn't set a preference
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates for each stock
    stocks.forEach(stock => {
      finnhubAPI.watchStock(stock.symbol, (price) => {
        setStocks(prevStocks => 
          prevStocks.map(s => 
            s.symbol === stock.symbol ? { ...s, currentPrice: price } : s
          )
        );
      });
    });

    // Cleanup subscriptions
    return () => {
      stocks.forEach(stock => {
        finnhubAPI.unwatchStock(stock.symbol);
      });
    };
  }, [stocks]);

  useEffect(() => {
    // Calculate metrics whenever stock prices update
    const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.buyPrice * stock.quantity, 0);
    
    const performances = stocks.map(stock => ({
      stock,
      performance: ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100
    }));
    
    const sortedPerformances = [...performances].sort((a, b) => b.performance - a.performance);
    const topPerformer = sortedPerformances[0].stock;
    const worstPerformer = sortedPerformances[sortedPerformances.length - 1].stock;

    setMetrics({
      totalValue,
      totalInvestment,
      topPerformer,
      worstPerformer,
    });
  }, [stocks]);

  const handleAddStock = (stockData: Partial<Stock>) => {
    const newStock: Stock = {
      id: Date.now().toString(),
      symbol: stockData.symbol!,
      name: stockData.name!,
      quantity: stockData.quantity!,
      buyPrice: stockData.buyPrice!,
      currentPrice: stockData.buyPrice!,
    };
    setStocks([...stocks, newStock]);
    setShowForm(false);
  };

  const handleAddStockClick = () => {
    setShowForm(true);
    setEditingStock(null); // Ensure no stock is being edited
    setTimeout(() => {
      const stockForm = document.querySelector('.stock-form-section');
      if (stockForm) {
        stockForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setShowForm(true);
    setTimeout(() => {
      const stockForm = document.querySelector('.stock-form-section');
      if (stockForm) {
        stockForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // Delay to ensure the form is rendered before scrolling
  };

  const handleUpdateStock = (stockData: Partial<Stock>) => {
    setStocks(stocks.map(stock => 
      stock.id === editingStock?.id 
        ? { ...stock, ...stockData }
        : stock
    ));
    setEditingStock(null);
    setShowForm(false);
  };

  const handleDeleteStock = (id: string) => {
    const stockToDelete = stocks.find(s => s.id === id);
    if (stockToDelete) {
      finnhubAPI.unwatchStock(stockToDelete.symbol);
    }
    setStocks(stocks.filter(stock => stock.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Layout className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Portfolio Tracker</h1>
          </div>
          <div className="flex space-x-4 items-center">
            {/* Dark Mode Toggle */}
            <label htmlFor="toggleDarkMode" className="flex items-center cursor-pointer">
              <div className="mr-3 text-gray-700 dark:text-gray-300 font-medium">
                {darkMode ? '🌙 Dark' : '☀️ Light'} Mode
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  id="toggleDarkMode"
                  className="sr-only"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-10 h-4 bg-gray-400 dark:bg-gray-600 rounded-full shadow-inner"></div>
                <div
                  className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${
                    darkMode ? 'transform translate-x-full bg-indigo-600' : ''
                  }`}
                ></div>
              </div>
            </label>

            {/* Add Stock Button */}
            <button
              onClick={handleAddStockClick}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              Add Stock
            </button>
          </div>
        </div>

        <div className="transition-all duration-500 transform">
          <Dashboard stocks={stocks} metrics={metrics} />
        </div>

        <div className={`stock-form-section transition-all duration-500 transform ${showForm ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none h-0'}`}>
          {showForm && (
            <div className="mb-8">
              <StockForm
                stock={editingStock || undefined}
                onSubmit={editingStock ? handleUpdateStock : handleAddStock}
                onCancel={() => {
                  setShowForm(false);
                  setEditingStock(null);
                }}
              />
            </div>
          )}
        </div>

        <div className="transition-all duration-500 transform">
          <StockList
            stocks={stocks}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
          />
        </div>
      </div>
    </div>
  );
}