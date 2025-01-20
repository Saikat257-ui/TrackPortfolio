import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Stock, PortfolioMetrics } from '../types/stock';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  stocks: Stock[];
  metrics: PortfolioMetrics;
}

export const Dashboard: React.FC<DashboardProps> = ({ stocks, metrics }) => {
  const chartData = stocks.map(stock => ({
    name: stock.symbol,
    currentValue: stock.currentPrice * stock.quantity,
    investedValue: stock.buyPrice * stock.quantity,
  }));

  const priceData = stocks.map(stock => ({
    name: stock.symbol,
    price: stock.currentPrice,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 transition-all">
          ${metrics.totalValue.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Total Investment</h3>
          <PieChart className="h-8 w-8 text-blue-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 transition-all">
          ${metrics.totalInvestment.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Top Performer</h3>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
        <p className="mt-2 text-xl font-bold text-gray-900">
          {metrics.topPerformer.symbol}
        </p>
        <p className="text-sm text-green-600">
          {((metrics.topPerformer.currentPrice - metrics.topPerformer.buyPrice) / metrics.topPerformer.buyPrice * 100).toFixed(2)}%
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Worst Performer</h3>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
        <p className="mt-2 text-xl font-bold text-gray-900">
          {metrics.worstPerformer.symbol}
        </p>
        <p className="text-sm text-red-600">
          {((metrics.worstPerformer.currentPrice - metrics.worstPerformer.buyPrice) / metrics.worstPerformer.buyPrice * 100).toFixed(2)}%
        </p>
      </div>

      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:translate-y-1">
        <h3 className="text-lg font-semibold mb-4">
          Portfolio Value Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="currentValue"
              fill="#10B981"
              name="Current Value"
              animationDuration={1000}
            />
            <Bar
              dataKey="investedValue"
              fill="#3B82F6"
              name="Invested Value"
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:translate-y-1">
        <h3 className="text-lg font-semibold mb-4">Real-time Stock Prices</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              isAnimationActive={true}
              animationDuration={1000}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};