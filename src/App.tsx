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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Layout className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Tracker</h1>
          </div>
          <button
            onClick={handleAddStockClick}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            Add Stock
          </button>
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