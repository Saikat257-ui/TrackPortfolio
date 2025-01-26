import React, { useState, useEffect } from 'react';
import { Stock } from '../types/stock';

interface StockFormProps {
  stock?: Stock;
  onSubmit: (stock: Partial<Stock>) => void;
  onCancel: () => void;
}

export const StockForm: React.FC<StockFormProps> = ({ stock, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: 0,
    buyPrice: 0,
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol,
        name: stock.name,
        quantity: stock.quantity,
        buyPrice: stock.buyPrice / stock.quantity,
      });
    }
  }, [stock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      buyPrice: formData.buyPrice * formData.quantity,
    });
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(onCancel, 500); // Wait for the animation to complete before calling onCancel
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-500 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } animate-fadeIn`}
    >
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
        {stock ? 'Edit Stock' : 'Add Stock'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="transition-all duration-300">
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Symbol
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            autoComplete="off"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2"
            placeholder="e.g., AAPL"
            required
          />
        </div>
        <div className="transition-all duration-300">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="off"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2"
            placeholder="e.g., Apple Inc."
            required
          />
        </div>
        <div className="transition-all duration-300">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            autoComplete="off"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2"
            min="1"
            required
          />
        </div>
        <div className="transition-all duration-300">
          <label htmlFor="buyPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Buy Price
          </label>
          <input
            type="number"
            id="buyPrice"
            name="buyPrice"
            autoComplete="off"
            value={formData.buyPrice}
            onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105"
          >
            {stock ? 'Update' : 'Add'} Stock
          </button>
        </div>
      </form>
    </div>
  );
};