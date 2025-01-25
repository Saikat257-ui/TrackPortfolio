import React from 'react';
import { Stock } from '../types/stock';
import { Pencil, Trash2 } from 'lucide-react';

interface StockListProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
}

export const StockList: React.FC<StockListProps> = ({ stocks, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buy Price</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Price</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gain/Loss</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {stocks.map((stock) => {
              const gainLoss = ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
              const isPositive = gainLoss >= 0;
              return (
                <tr
                  key={stock.id}
                  className="transition-transform duration-300 hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700 overflow-hidden"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">{stock.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{stock.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{stock.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">${stock.buyPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center transition-all">
                    <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                      ${stock.currentPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-all ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {gainLoss.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => onEdit(stock)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 transition-all duration-300 hover:scale-110"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(stock.id)}
                      className="text-red-600 hover:text-red-900 transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};